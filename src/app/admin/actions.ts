"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/server/db";
import { invalidateBank } from "@/lib/bank";
import { TRACK_IDS } from "@/lib/blueprint";
import { moveId, pickDefaultSection, sameIdSet, validateDemoOrder, validatePosition, validateQuestionFields, validateSubmodule, type TopicInput } from "@/lib/admin-validate";

const ADMIN_EMAIL = "admin123@gmail.com";
const ADMIN_PASSWORD = "admin123@#";
const SESSION_VALUE = "quix_admin_v1";

// ── Auth ──────────────────────────────────────────────────────────────────────

export async function loginAction(_: unknown, formData: FormData) {
  const email = (formData.get("email") as string | null)?.trim() ?? "";
  const password = (formData.get("password") as string | null) ?? "";

  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    const cookieStore = await cookies();
    cookieStore.set("admin_session", SESSION_VALUE, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 8,
      path: "/",
    });
    redirect("/admin");
  }

  return { error: "Invalid email or password" };
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");
  redirect("/admin/login");
}

// ── Domains (quiz_modules + quiz_sub_skills) and questions (quiz_questions) ────

type Result = { error?: string; id?: number };

/** The sub-skill given to a module-quiz-only question when none is chosen (see pickDefaultSection). */
async function defaultSection(c: NonNullable<ReturnType<typeof db>>, moduleId: number): Promise<string> {
  const [{ data: skills }, { data: mod }] = await Promise.all([
    c.from("quiz_sub_skills").select("name").eq("module_id", moduleId).order("order_index", { ascending: true }),
    c.from("quiz_modules").select("title").eq("id", moduleId).maybeSingle(),
  ]);
  return pickDefaultSection((skills ?? []).map((r) => String(r.name)), String(mod?.title ?? ""));
}

function afterWrite() {
  invalidateBank();
  for (const path of ["/", "/associate", "/developer", "/admin", "/admin/questions", "/admin/module-quizzes"]) revalidatePath(path);
}

export interface DomainInput {
  id?: number;
  track: string;
  title: string;
  weight: number;
  courseModule: number | null;
  objective: string;
  docLinks: { title: string; url: string }[];
  subSkills: { name: string; weight: number | null }[];
}

export async function saveDomainAction(d: DomainInput): Promise<Result> {
  await requireAdmin();
  const c = db();
  if (!c) return { error: "Supabase is not configured" };
  const title = d.title.trim();
  if (!title) return { error: "Domain name is required" };
  if (!(TRACK_IDS as string[]).includes(d.track)) return { error: "Choose a track" };
  if (!(d.weight >= 0 && d.weight <= 100)) return { error: "Weight must be between 0 and 100" };
  const names = d.subSkills.map((s) => s.name.trim()).filter(Boolean);
  if (new Set(names.map((n) => n.toLowerCase())).size !== names.length) return { error: "Sub-skill names must be unique" };
  if (d.docLinks.some((l) => !/^https?:\/\//i.test(l.url))) return { error: "Doc links need a full http(s) URL" };

  const row = {
    title,
    track: d.track,
    weight: d.weight,
    course_module: d.courseModule,
    objective: d.objective.trim() || null,
    doc_links: d.docLinks.filter((l) => l.title.trim() && l.url.trim()),
  };
  let id = d.id;
  if (id) {
    const { error } = await c.from("quiz_modules").update(row).eq("id", id);
    if (error) return { error: error.message };
  } else {
    const { data: max } = await c.from("quiz_modules").select("order_index").order("order_index", { ascending: false }).limit(1).maybeSingle();
    const { data, error } = await c.from("quiz_modules").insert({ ...row, description: "", locked: false, order_index: (max?.order_index ?? 0) + 1 }).select("id").single();
    if (error) return { error: error.message };
    id = data.id as number;
  }

  // Replace the sub-skill list
  const del = await c.from("quiz_sub_skills").delete().eq("module_id", id);
  if (del.error) return { error: `${del.error.message}. Run the SQL in supabase/migrations/0001_cert_readiness.sql.` };
  const subs = d.subSkills
    .filter((s) => s.name.trim())
    .map((s, i) => ({ module_id: id, name: s.name.trim(), weight: s.weight == null ? null : Number(s.weight), order_index: i + 1 }));
  if (subs.length) {
    const ins = await c.from("quiz_sub_skills").insert(subs);
    if (ins.error) return { error: ins.error.message };
  }
  afterWrite();
  return { id };
}

export async function deleteDomainAction(id: number): Promise<Result> {
  await requireAdmin();
  const c = db();
  if (!c) return { error: "Supabase is not configured" };
  const { error } = await c.from("quiz_modules").delete().eq("id", id); // cascades to its sub-skills and questions
  if (error) return { error: error.message };
  afterWrite();
  return {};
}

export interface QuestionInput {
  id?: number;
  moduleId: number;
  section: string;
  difficulty: string;
  question: string;
  options: [string, string, string, string];
  /** "B" or "A,C" */
  answer: string;
  explanation: string;
  /** Submodule of the chosen domain, or null for none */
  submoduleId?: number | null;
  /** A lesson (topic with a lesson name) of that submodule, or null for the course link only. Undefined leaves it as is. */
  topicId?: number | null;
  /** Position 1..5 in the domain's demo, or null for not in the demo */
  demoOrder?: number | null;
  /** Module quiz only: kept out of the exam-weighted modes. Undefined leaves it as is. */
  moduleOnly?: boolean;
}

export async function saveQuestionAction(q: QuestionInput): Promise<Result> {
  await requireAdmin();
  const c = db();
  if (!c) return { error: "Supabase is not configured" };
  if (!q.moduleId) return { error: "Choose a domain" };
  // A module-quiz-only question needs no sub-skill from the admin: it is filled in from the domain
  const section = q.section.trim() || (q.moduleOnly === true ? await defaultSection(c, q.moduleId) : "");
  const fieldProblem = validateQuestionFields({ ...q, section });
  if (fieldProblem) return { error: fieldProblem };

  const demoProblem = validateDemoOrder(q.demoOrder);
  if (demoProblem) return { error: demoProblem };
  if (q.submoduleId != null) {
    const { data: sub } = await c.from("quiz_submodules").select("module_id").eq("id", q.submoduleId).maybeSingle();
    if (!sub || sub.module_id !== q.moduleId) return { error: "That submodule does not belong to the chosen domain" };
  }
  if (q.topicId != null) {
    if (q.submoduleId == null) return { error: "Choose a submodule before choosing a lesson" };
    const { data: topic } = await c.from("quiz_skilljar_topics").select("submodule_id, lesson_title").eq("id", q.topicId).maybeSingle();
    if (!topic || topic.submodule_id !== q.submoduleId || !String(topic.lesson_title ?? "").trim()) return { error: "That lesson does not belong to the chosen submodule" };
  }
  if (q.demoOrder != null) {
    const { data: taken } = await c.from("quiz_questions").select("id").eq("module_id", q.moduleId).eq("demo_order", q.demoOrder).maybeSingle();
    if (taken && taken.id !== q.id) return { error: `Demo position ${q.demoOrder} is already used by question #${taken.id}. Move or clear that one first.` };
  }

  const row = {
    module_id: q.moduleId,
    section,
    difficulty: q.difficulty,
    question: q.question.trim(),
    option_a: q.options[0].trim(),
    option_b: q.options[1].trim(),
    option_c: q.options[2].trim(),
    option_d: q.options[3].trim(),
    answer: q.answer,
    explanation: q.explanation.trim() || null,
    // Only touched when the caller sends them, so older callers cannot wipe the assignment
    ...(q.submoduleId !== undefined ? { submodule_id: q.submoduleId } : {}),
    ...(q.topicId !== undefined ? { topic_id: q.topicId } : {}),
    ...(q.moduleOnly !== undefined ? { module_only: q.moduleOnly } : {}),
    ...(q.demoOrder !== undefined ? { demo_order: q.demoOrder } : {}),
  };
  if (q.id) {
    const { error } = await c.from("quiz_questions").update(row).eq("id", q.id);
    if (error) return { error: error.message };
    afterWrite();
    return { id: q.id };
  }
  const { data: max } = await c.from("quiz_questions").select("order_index").eq("module_id", q.moduleId).order("order_index", { ascending: false }).limit(1).maybeSingle();
  const { data, error } = await c.from("quiz_questions").insert({ ...row, order_index: (max?.order_index ?? 0) + 1 }).select("id").single();
  if (error) return { error: error.message };
  afterWrite();
  return { id: data.id as number };
}

export async function deleteQuestionAction(id: number): Promise<Result> {
  await requireAdmin();
  const c = db();
  if (!c) return { error: "Supabase is not configured" };
  const { error } = await c.from("quiz_questions").delete().eq("id", id);
  if (error) return { error: error.message };
  afterWrite();
  return {};
}

/** Moves a question one place up or down within its domain. Order decides how the bank lists the questions. */
export async function moveQuestionAction(id: number, direction: "up" | "down"): Promise<Result> {
  await requireAdmin();
  const c = db();
  if (!c) return { error: DB_OFF };
  const { data: me } = await c.from("quiz_questions").select("module_id").eq("id", id).maybeSingle();
  if (!me) return { error: "Question not found" };
  const { data: list, error } = await c.from("quiz_questions").select("id, order_index").eq("module_id", me.module_id).order("order_index", { ascending: true }).order("id", { ascending: true });
  if (error) return { error: error.message };
  const ids = (list ?? []).map((r) => r.id as number);
  const next = moveId(ids, id, direction);
  if (!next) return {};
  // Renumber 1..n so rows that shared an order value still end up in the intended order
  const current = new Map((list ?? []).map((r) => [r.id as number, r.order_index as number]));
  for (const [i, qid] of next.entries()) {
    if (current.get(qid) === i + 1) continue;
    const res = await c.from("quiz_questions").update({ order_index: i + 1 }).eq("id", qid);
    if (res.error) return { error: res.error.message };
  }
  afterWrite();
  return {};
}

// ── Submodules (quiz_submodules) and their Skill Jar topics (quiz_skilljar_topics) ──

const DB_OFF = "The database is not configured";

export interface SubmoduleInput {
  id?: number;
  moduleId: number;
  title: string;
  description: string;
  /** Place in the practice-by-module list. Leave undefined to keep it as it is (the column may not exist before 0010). */
  coursePosition?: number | null;
  topics: TopicInput[];
}

export async function saveSubmoduleAction(d: SubmoduleInput): Promise<Result> {
  await requireAdmin();
  const c = db();
  if (!c) return { error: DB_OFF };
  const problem = validateSubmodule(d) ?? validatePosition(d.coursePosition);
  if (problem) return { error: problem };
  const { data: mod } = await c.from("quiz_modules").select("id").eq("id", d.moduleId).maybeSingle();
  if (!mod) return { error: "Domain not found" };

  const row = {
    module_id: d.moduleId,
    title: d.title.trim(),
    description: d.description.trim() || null,
    ...(d.coursePosition !== undefined ? { course_position: d.coursePosition } : {}),
  };
  let id = d.id;
  if (id) {
    const { error } = await c.from("quiz_submodules").update(row).eq("id", id);
    if (error) return { error: error.code === "23505" ? "This domain already has a submodule with that name" : error.message };
  } else {
    const { data: max } = await c.from("quiz_submodules").select("order_index").eq("module_id", d.moduleId).order("order_index", { ascending: false }).limit(1).maybeSingle();
    const { data, error } = await c.from("quiz_submodules").insert({ ...row, order_index: (max?.order_index ?? 0) + 1 }).select("id").single();
    if (error) return { error: error.code === "23505" ? "This domain already has a submodule with that name" : error.message };
    id = data.id as number;
  }

  // Topics: update the ones kept, add the new ones, then remove the ones the admin dropped. Never delete first.
  const { data: existing, error: readErr } = await c.from("quiz_skilljar_topics").select("id").eq("submodule_id", id);
  if (readErr) return { error: readErr.message };
  const existingIds = new Set((existing ?? []).map((r) => r.id as number));
  const keep = new Set<number>();
  for (const [i, t] of d.topics.entries()) {
    const fields = { course_title: t.courseTitle.trim(), lesson_title: t.lessonTitle.trim() || null, url: t.url.trim(), order_index: i + 1 };
    if (t.id && existingIds.has(t.id)) {
      keep.add(t.id);
      const { error } = await c.from("quiz_skilljar_topics").update(fields).eq("id", t.id);
      if (error) return { error: error.message };
    } else {
      const { error } = await c.from("quiz_skilljar_topics").insert({ submodule_id: id, ...fields });
      if (error) return { error: error.message };
    }
  }
  const drop = [...existingIds].filter((x) => !keep.has(x));
  if (drop.length) {
    const { error } = await c.from("quiz_skilljar_topics").delete().in("id", drop);
    if (error) return { error: error.message };
  }
  afterWrite();
  return { id };
}

export async function deleteSubmoduleAction(id: number): Promise<Result> {
  await requireAdmin();
  const c = db();
  if (!c) return { error: DB_OFF };
  // Deleting is blocked while questions are assigned: reassign or clear them first
  const { count, error: countErr } = await c.from("quiz_questions").select("id", { count: "exact", head: true }).eq("submodule_id", id);
  if (countErr) return { error: countErr.message };
  if ((count ?? 0) > 0) return { error: `${count} question${count === 1 ? " is" : "s are"} still assigned to this submodule. Reassign or clear them in the question bank first.` };
  const { error } = await c.from("quiz_submodules").delete().eq("id", id); // its Skill Jar topics go with it
  if (error) return { error: error.code === "23503" ? "Questions are still assigned to this submodule. Reassign or clear them first." : error.message };
  afterWrite();
  return {};
}

/** Saves a new display order for a domain's submodules. `orderedIds` must list every one of them exactly once. */
export async function reorderSubmodulesAction(moduleId: number, orderedIds: number[]): Promise<Result> {
  await requireAdmin();
  const c = db();
  if (!c) return { error: DB_OFF };
  const { data, error } = await c.from("quiz_submodules").select("id").eq("module_id", moduleId);
  if (error) return { error: error.message };
  if (!sameIdSet((data ?? []).map((r) => r.id as number), orderedIds)) return { error: "The list changed. Reload the page and try again." };
  for (const [i, sid] of orderedIds.entries()) {
    const res = await c.from("quiz_submodules").update({ order_index: i + 1 }).eq("id", sid);
    if (res.error) return { error: res.error.message };
  }
  afterWrite();
  return {};
}

// ── Module quizzes (quiz_lesson_questions): the questions of each lesson ──────

/**
 * A lesson is a topic that names a lesson; the same lesson under several domains of a course is one lesson. Returns every
 * topic row of the lesson, the course and the lesson name, and the track of the course. Null when the topic is not a lesson.
 */
async function lessonOf(c: NonNullable<ReturnType<typeof db>>, topicId: number) {
  const { data: t } = await c.from("quiz_skilljar_topics").select("id, submodule_id, course_title, lesson_title").eq("id", topicId).maybeSingle();
  if (!t || !String(t.lesson_title ?? "").trim()) return null;
  const { data: same } = await c.from("quiz_skilljar_topics").select("id, submodule_id").eq("course_title", t.course_title).eq("lesson_title", t.lesson_title);
  const ids = (same ?? []).map((r) => r.id as number);
  const { data: sub } = await c.from("quiz_submodules").select("module_id").eq("id", t.submodule_id).maybeSingle();
  const { data: mod } = sub ? await c.from("quiz_modules").select("track").eq("id", sub.module_id).maybeSingle() : { data: null };
  return { course: String(t.course_title), lesson: String(t.lesson_title), ids, canonical: Math.min(...ids), track: (mod?.track ?? null) as string | null };
}

/** Puts an existing bank question into a lesson. A question is in at most one lesson of a course. */
export async function addLessonQuestionAction(topicId: number, questionId: number): Promise<Result> {
  await requireAdmin();
  const c = db();
  if (!c) return { error: DB_OFF };
  const lesson = await lessonOf(c, topicId);
  if (!lesson) return { error: "Lesson not found" };
  const { data: q } = await c.from("quiz_questions").select("id, module_id").eq("id", questionId).maybeSingle();
  if (!q) return { error: "Question not found" };
  const { data: qmod } = await c.from("quiz_modules").select("track").eq("id", q.module_id).maybeSingle();
  if (!qmod || qmod.track !== lesson.track) return { error: "That question belongs to the other exam track" };

  const { data: courseTopics } = await c.from("quiz_skilljar_topics").select("id, lesson_title").eq("course_title", lesson.course);
  const lessonByTopic = new Map((courseTopics ?? []).filter((t) => String(t.lesson_title ?? "").trim()).map((t) => [t.id as number, String(t.lesson_title)]));
  const { data: existing } = await c.from("quiz_lesson_questions").select("topic_id").eq("question_id", questionId);
  const already = (existing ?? []).map((r) => lessonByTopic.get(r.topic_id as number)).find((name) => name !== undefined);
  if (already !== undefined) return { error: already === lesson.lesson ? "That question is already in this lesson" : `That question is already in the lesson "${already}" of this course. Remove it there first.` };

  const { error } = await c.from("quiz_lesson_questions").insert({ topic_id: lesson.canonical, question_id: questionId });
  if (error) return { error: error.message };
  afterWrite();
  return {};
}

/** Takes a question out of a lesson. The question itself stays in the bank. */
export async function removeLessonQuestionAction(topicId: number, questionId: number): Promise<Result> {
  await requireAdmin();
  const c = db();
  if (!c) return { error: DB_OFF };
  const lesson = await lessonOf(c, topicId);
  if (!lesson) return { error: "Lesson not found" };
  const { error } = await c.from("quiz_lesson_questions").delete().eq("question_id", questionId).in("topic_id", lesson.ids);
  if (error) return { error: error.message };
  afterWrite();
  return {};
}

export interface LessonQuestionInput {
  topicId: number;
  /** Domain the question is filed under: the course needs a submodule row there */
  moduleId: number;
  section: string;
  difficulty: string;
  question: string;
  options: [string, string, string, string];
  answer: string;
  explanation: string;
  /** Keep it out of the diagnostic, sprint, drill and full mock */
  moduleOnly: boolean;
}

/** Writes a new question and puts it straight into a lesson. */
export async function createLessonQuestionAction(d: LessonQuestionInput): Promise<Result> {
  await requireAdmin();
  const c = db();
  if (!c) return { error: DB_OFF };
  const section = d.section.trim() || (d.moduleOnly ? await defaultSection(c, d.moduleId) : "");
  const problem = validateQuestionFields({ ...d, section });
  if (problem) return { error: problem };
  const lesson = await lessonOf(c, d.topicId);
  if (!lesson) return { error: "Lesson not found" };
  const { data: mod } = await c.from("quiz_modules").select("track").eq("id", d.moduleId).maybeSingle();
  if (!mod || mod.track !== lesson.track) return { error: "Choose a domain of the same exam track as the course" };
  const { data: sub } = await c.from("quiz_submodules").select("id").eq("module_id", d.moduleId).eq("title", lesson.course).maybeSingle();
  if (!sub) return { error: `${lesson.course} is not set up under that domain. Add a submodule with that name to the domain first.` };
  const { data: home } = await c.from("quiz_skilljar_topics").select("id").eq("submodule_id", sub.id).eq("lesson_title", lesson.lesson).maybeSingle();

  const { data: max } = await c.from("quiz_questions").select("order_index").eq("module_id", d.moduleId).order("order_index", { ascending: false }).limit(1).maybeSingle();
  const { data, error } = await c.from("quiz_questions").insert({
    module_id: d.moduleId,
    section,
    difficulty: d.difficulty,
    question: d.question.trim(),
    option_a: d.options[0].trim(),
    option_b: d.options[1].trim(),
    option_c: d.options[2].trim(),
    option_d: d.options[3].trim(),
    answer: d.answer,
    explanation: d.explanation.trim() || null,
    order_index: (max?.order_index ?? 0) + 1,
    submodule_id: sub.id,
    topic_id: home?.id ?? null,
    module_only: d.moduleOnly,
  }).select("id").single();
  if (error) return { error: error.message };
  const link = await c.from("quiz_lesson_questions").insert({ topic_id: lesson.canonical, question_id: data.id });
  if (link.error) {
    await c.from("quiz_questions").delete().eq("id", data.id); // do not leave a question that belongs to no lesson
    return { error: link.error.message };
  }
  afterWrite();
  return { id: data.id as number };
}

// ── Reported questions, calls ─────────────────────────────────────────────────

async function requireAdmin() {
  const store = await cookies();
  if (store.get("admin_session")?.value !== SESSION_VALUE) throw new Error("Not authorised");
}

export async function resolveReportAction(id: number, status: "upheld" | "dismissed" | "open"): Promise<{ error?: string }> {
  await requireAdmin();
  const c = db();
  if (!c) return { error: "Supabase is not configured" };
  const { error } = await c
    .from("reported_questions")
    .update({ status, resolved_at: status === "open" ? null : new Date().toISOString() })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/reports");
  return {};
}

/** Advisor logs the call result and whether a course offer was made (call_attended, call_outcome). */
export async function updateCallAction(data: {
  id: number;
  status: "booked" | "attended" | "no_show" | "canceled";
  outcome: string;
  offerMade: boolean;
}): Promise<{ error?: string }> {
  await requireAdmin();
  const c = db();
  if (!c) return { error: "Supabase is not configured" };
  const { data: row, error } = await c
    .from("call_bookings")
    .update({ status: data.status, outcome: data.outcome.slice(0, 2000), offer_made: data.offerMade })
    .eq("id", data.id)
    .select("email")
    .maybeSingle();
  if (error) return { error: error.message };
  const events = [] as { event: string; props: Record<string, unknown>; email: string | null }[];
  if (data.status === "attended") events.push({ event: "call_attended", props: {}, email: row?.email ?? null });
  if (data.outcome || data.offerMade) events.push({ event: "call_outcome", props: { offerMade: data.offerMade, status: data.status }, email: row?.email ?? null });
  if (events.length) await c.from("analytics_events").insert(events);
  revalidatePath("/admin/calls");
  return {};
}
