import { db } from "@/lib/server/db";
import { bankSource } from "@/lib/bank";
import { TRACKS, TRACK_IDS, type DocLink } from "@/lib/blueprint";
import type { TrackId } from "@/types/quiz";

/** Read helpers for the admin pages. Everything comes from the database; nothing is hard-coded here. */

export interface AdminSubSkill { id?: number; name: string; weight: number | null }
export interface AdminTopic { id?: number; courseTitle: string; lessonTitle: string; url: string }
export interface AdminSubmodule {
  id: number;
  moduleId: number;
  title: string;
  description: string;
  order: number;
  /** Place in the track's practice-by-module list; null when not set */
  coursePosition: number | null;
  /** Questions currently assigned to it: deleting is blocked while this is above zero */
  questionCount: number;
  topics: AdminTopic[];
}
export interface AdminDomain {
  id: number;
  title: string;
  track: TrackId | null;
  weight: number | null;
  courseModule: number | null;
  objective: string;
  docLinks: DocLink[];
  order: number;
  questionCount: number;
  subSkills: AdminSubSkill[];
  submodules: AdminSubmodule[];
  /** Questions marked as part of the demo (the demo shows at most 5) */
  demoCount: number;
}
export interface AdminQuestion {
  id: number;
  moduleId: number;
  section: string;
  difficulty: string;
  question: string;
  options: [string, string, string, string];
  answer: string;
  explanation: string;
  order: number;
  submoduleId: number | null;
  /** The Skill Jar lesson (a topic of the submodule) it belongs to */
  topicId: number | null;
  /** Module quiz only: kept out of the diagnostic, sprint, drill and full mock */
  moduleOnly: boolean;
  /** 1..5 when part of the domain's demo */
  demoOrder: number | null;
}

export interface SchemaStatus {
  configured: boolean;
  /** Human-readable list of what the database still lacks */
  missing: string[];
  source: "database" | "code";
}

const MODULE_COLS = ["track", "weight", "objective", "course_module", "doc_links"];

export async function adminSchema(): Promise<SchemaStatus> {
  const c = db();
  if (!c) return { configured: false, missing: [], source: "code" };
  const missing: string[] = [];
  const mod = await c.from("quiz_modules").select("*").limit(1);
  if (mod.error) missing.push(`quiz_modules is unreadable: ${mod.error.message}`);
  else if (mod.data?.length) {
    const absent = MODULE_COLS.filter((k) => !(k in mod.data[0]));
    if (absent.length) missing.push(`quiz_modules is missing columns: ${absent.join(", ")}`);
  }
  const q = await c.from("quiz_questions").select("*").limit(1);
  if (!q.error && q.data?.length && !("explanation" in q.data[0])) missing.push("quiz_questions is missing the explanation column");
  if (!q.error && q.data?.length) {
    const absentQ = ["submodule_id", "demo_order"].filter((k) => !(k in q.data![0]));
    if (absentQ.length) missing.push(`quiz_questions is missing columns: ${absentQ.join(", ")} (run 0006_submodules_and_demo.sql)`);
    if (!("topic_id" in q.data[0])) missing.push("quiz_questions is missing the topic_id column (run 0012_lesson_topics.sql)");
    if (!("module_only" in q.data[0])) missing.push("quiz_questions is missing the module_only column (run 0013_module_quizzes.sql)");
  }
  for (const t of ["quiz_submodules", "quiz_skilljar_topics", "quiz_lesson_questions"]) {
    const r = await c.from(t).select("id").limit(1);
    if (r.error) missing.push(`table ${t} does not exist (run ${t === "quiz_lesson_questions" ? "0013_module_quizzes.sql" : "0006_submodules_and_demo.sql"})`);
  }
  const sm = await c.from("quiz_submodules").select("*").limit(1);
  if (!sm.error && sm.data?.length && !("course_position" in sm.data[0])) missing.push("quiz_submodules is missing the course_position column (run 0010_module_order.sql)");
  const sub = await c.from("quiz_sub_skills").select("id").limit(1);
  if (sub.error) missing.push("table quiz_sub_skills does not exist");
  return { configured: true, missing, source: await bankSource() };
}

/** Track of a module row; falls back to the track that owns a domain of that name. */
function trackOf(row: Record<string, unknown>): TrackId | null {
  if (row.track === "associate" || row.track === "developer") return row.track;
  const title = String(row.title ?? "").trim();
  return TRACK_IDS.find((t) => TRACKS[t].domains.some((d) => d.name === title)) ?? null;
}

export async function adminDomains(): Promise<AdminDomain[]> {
  const c = db();
  if (!c) return [];
  const [mods, subs, qs, submods, topics, links] = await Promise.all([
    c.from("quiz_modules").select("*").order("order_index", { ascending: true }),
    c.from("quiz_sub_skills").select("*").order("order_index", { ascending: true }),
    c.from("quiz_questions").select("id, module_id"),
    c.from("quiz_submodules").select("*").order("order_index", { ascending: true }), // tolerated when the migration has not run
    c.from("quiz_skilljar_topics").select("*").order("order_index", { ascending: true }),
    c.from("quiz_questions").select("id, submodule_id, demo_order"),
  ]);
  const counts = new Map<number, number>();
  for (const q of qs.data ?? []) counts.set(q.module_id, (counts.get(q.module_id) ?? 0) + 1);

  const perSubmodule = new Map<number, number>();
  const demoPerModule = new Map<number, number>();
  const moduleOfQuestion = new Map<number, number>((qs.data ?? []).map((q) => [q.id as number, q.module_id as number]));
  for (const l of links.error ? [] : (links.data ?? [])) {
    if (l.submodule_id != null) perSubmodule.set(l.submodule_id, (perSubmodule.get(l.submodule_id) ?? 0) + 1);
    if (l.demo_order != null) {
      const mid = moduleOfQuestion.get(l.id);
      if (mid != null) demoPerModule.set(mid, (demoPerModule.get(mid) ?? 0) + 1);
    }
  }
  const topicsBySubmodule = new Map<number, AdminTopic[]>();
  for (const t of topics.error ? [] : (topics.data ?? [])) {
    topicsBySubmodule.set(t.submodule_id, [...(topicsBySubmodule.get(t.submodule_id) ?? []), { id: t.id, courseTitle: t.course_title, lessonTitle: t.lesson_title ?? "", url: t.url ?? "" }]);
  }
  const submodulesOf = (moduleId: number): AdminSubmodule[] =>
    (submods.error ? [] : (submods.data ?? []))
      .filter((x) => x.module_id === moduleId)
      .map((x) => ({
        id: x.id,
        moduleId: x.module_id,
        title: x.title,
        description: x.description ?? "",
        order: x.order_index ?? 0,
        coursePosition: x.course_position ?? null,
        questionCount: perSubmodule.get(x.id) ?? 0,
        topics: topicsBySubmodule.get(x.id) ?? [],
      }));

  return (mods.data ?? []).map((m) => ({
    id: m.id,
    title: m.title,
    track: trackOf(m),
    weight: m.weight != null ? Number(m.weight) : null,
    courseModule: m.course_module ?? null,
    objective: m.objective ?? m.description ?? "",
    docLinks: Array.isArray(m.doc_links) ? (m.doc_links as DocLink[]) : [],
    order: m.order_index ?? 0,
    questionCount: counts.get(m.id) ?? 0,
    subSkills: (subs.data ?? []).filter((s) => s.module_id === m.id).map((s) => ({ id: s.id, name: s.name, weight: s.weight == null ? null : Number(s.weight) })),
    submodules: submodulesOf(m.id),
    demoCount: demoPerModule.get(m.id) ?? 0,
  }));
}

export async function adminQuestions(): Promise<AdminQuestion[]> {
  const c = db();
  if (!c) return [];
  const { data } = await c.from("quiz_questions").select("*").order("module_id", { ascending: true }).order("order_index", { ascending: true });
  return (data ?? []).map((r) => ({
    id: r.id,
    moduleId: r.module_id,
    section: r.section,
    difficulty: r.difficulty,
    question: r.question,
    options: [r.option_a, r.option_b, r.option_c, r.option_d],
    answer: r.answer,
    explanation: r.explanation ?? "",
    order: r.order_index ?? 0,
    submoduleId: r.submodule_id ?? null,
    topicId: r.topic_id ?? null,
    moduleOnly: r.module_only === true,
    demoOrder: r.demo_order ?? null,
  }));
}

// ── Module quizzes ───────────────────────────────────────────────────────────

export interface AdminLessonQuestion { id: number; question: string; domainId: number; domain: string; moduleOnly: boolean }
export interface AdminLesson {
  /** First topic row of the lesson: the one new members are attached to */
  topicId: number;
  name: string;
  questions: AdminLessonQuestion[];
}
export interface AdminCourse {
  track: TrackId;
  name: string;
  position: number | null;
  lessons: AdminLesson[];
  /** Questions assigned to the course but to no lesson: a module quiz uses them only after the lessons' questions */
  looseCount: number;
  /** Domains the course is set up under: a new question for the course is filed under one of them */
  domains: { id: number; title: string; sections: string[] }[];
}
export interface AdminBankQuestion {
  id: number; track: TrackId; domainId: number; domain: string; section: string; question: string; moduleOnly: boolean;
  /** The rest of the question, so the module quiz page can edit it in place */
  difficulty: string; options: [string, string, string, string]; answer: string; explanation: string;
}
export interface AdminModuleQuizzes {
  /** False until 0013_module_quizzes.sql has run */
  ready: boolean;
  courses: AdminCourse[];
  /** Every question of the bank, for "add from the bank" */
  bank: AdminBankQuestion[];
}

export async function adminModuleQuizzes(): Promise<AdminModuleQuizzes> {
  const c = db();
  if (!c) return { ready: false, courses: [], bank: [] };
  const [mods, subs, skills, topics, members, qs] = await Promise.all([
    c.from("quiz_modules").select("*"),
    c.from("quiz_submodules").select("*"),
    c.from("quiz_sub_skills").select("*"),
    c.from("quiz_skilljar_topics").select("*").order("order_index", { ascending: true }),
    c.from("quiz_lesson_questions").select("*"),
    c.from("quiz_questions").select("*").order("order_index", { ascending: true }),
  ]);
  if (mods.error || subs.error || topics.error || qs.error || members.error) return { ready: false, courses: [], bank: [] };

  const moduleById = new Map((mods.data ?? []).map((m) => [m.id as number, { title: String(m.title), track: trackOf(m) }]));
  const bank: AdminBankQuestion[] = (qs.data ?? []).flatMap((r) => {
    const m = moduleById.get(r.module_id);
    return m?.track ? [{
      id: r.id, track: m.track, domainId: r.module_id, domain: m.title, section: String(r.section ?? ""), question: String(r.question), moduleOnly: r.module_only === true,
      difficulty: String(r.difficulty ?? "Medium"), options: [r.option_a, r.option_b, r.option_c, r.option_d].map((o) => String(o ?? "")) as AdminBankQuestion["options"], answer: String(r.answer ?? ""), explanation: String(r.explanation ?? ""),
    }] : [];
  });
  const bankById = new Map(bank.map((b) => [b.id, b]));
  const questionRows = new Map((qs.data ?? []).map((r) => [r.id as number, r]));
  const sectionsOf = (moduleId: number) => (skills.error ? [] : (skills.data ?? [])).filter((x) => x.module_id === moduleId).map((x) => String(x.name));

  const courses: AdminCourse[] = [];
  const byCourse = new Map<string, { track: TrackId; name: string; position: number; subIds: Set<number>; domainIds: Set<number> }>();
  for (const sm of subs.data ?? []) {
    const m = moduleById.get(sm.module_id);
    if (!m?.track) continue;
    const key = `${m.track}|${String(sm.title).trim()}`;
    const e = byCourse.get(key) ?? { track: m.track, name: String(sm.title).trim(), position: Infinity, subIds: new Set<number>(), domainIds: new Set<number>() };
    e.position = Math.min(e.position, sm.course_position ?? Infinity);
    e.subIds.add(sm.id);
    e.domainIds.add(sm.module_id);
    byCourse.set(key, e);
  }
  for (const e of byCourse.values()) {
    const lessonTopics = (topics.data ?? []).filter((t) => e.subIds.has(t.submodule_id) && String(t.lesson_title ?? "").trim());
    const lessons = new Map<string, AdminLesson>();
    for (const t of lessonTopics) {
      const name = String(t.lesson_title).trim();
      if (!lessons.has(name)) lessons.set(name, { topicId: t.id, name, questions: [] });
    }
    const lessonOfTopic = new Map(lessonTopics.map((t) => [t.id as number, String(t.lesson_title).trim()]));
    const claimed = new Set<number>();
    for (const m of members.data ?? []) {
      const lessonName = lessonOfTopic.get(m.topic_id);
      const b = bankById.get(m.question_id);
      if (lessonName === undefined || !b || b.track !== e.track || claimed.has(b.id)) continue;
      claimed.add(b.id);
      (lessons.get(lessonName) as AdminLesson).questions.push({ id: b.id, question: b.question, domainId: b.domainId, domain: b.domain, moduleOnly: b.moduleOnly });
    }
    const loose = [...questionRows.values()].filter((r) => e.subIds.has(r.submodule_id) && !claimed.has(r.id)).length;
    courses.push({
      track: e.track,
      name: e.name,
      position: Number.isFinite(e.position) ? e.position : null,
      lessons: [...lessons.values()],
      looseCount: loose,
      domains: [...e.domainIds].map((id) => ({ id, title: moduleById.get(id)?.title ?? "", sections: sectionsOf(id) })),
    });
  }
  courses.sort((a, b) => a.track.localeCompare(b.track) || (a.position ?? Infinity) - (b.position ?? Infinity) || a.name.localeCompare(b.name));
  return { ready: true, courses, bank };
}
