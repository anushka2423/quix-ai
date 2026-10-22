import { DEMO_SIZE } from "@/lib/blueprint";

/** Pure checks used by the admin server actions, kept apart so they can be unit tested. */

export interface TopicInput {
  id?: number;
  courseTitle: string;
  lessonTitle: string;
  url: string;
}

const isHttpUrl = (u: string) => /^https?:\/\/\S+$/i.test(u.trim());

/** Returns the first problem with a submodule form, or null when it can be saved. */
export function validateSubmodule(input: { title: string; topics: TopicInput[] }): string | null {
  if (!input.title.trim()) return "Submodule name is required";
  for (const [i, t] of input.topics.entries()) {
    const n = i + 1;
    if (!t.courseTitle.trim()) return `Skill Jar topic ${n} needs a course name`;
    if (!isHttpUrl(t.url)) return `Skill Jar topic ${n} needs a full http(s) link`;
  }
  return null;
}

/** null means "not in the demo"; otherwise a whole position from 1 to DEMO_SIZE. */
export function validateDemoOrder(value: number | null | undefined): string | null {
  if (value === null || value === undefined) return null;
  if (!Number.isInteger(value) || value < 1 || value > DEMO_SIZE) return `Demo position must be a whole number from 1 to ${DEMO_SIZE}`;
  return null;
}

/** Moves `id` one place up or down. Returns the new order, or null when it cannot move (missing or already at the end). */
export function moveId(ids: number[], id: number, direction: "up" | "down"): number[] | null {
  const from = ids.indexOf(id);
  const to = direction === "up" ? from - 1 : from + 1;
  if (from < 0 || to < 0 || to >= ids.length) return null;
  const next = [...ids];
  [next[from], next[to]] = [next[to], next[from]];
  return next;
}

/** True when `ordered` lists exactly the same ids as `existing`, once each. Guards reorder requests. */
export function sameIdSet(existing: number[], ordered: number[]): boolean {
  return ordered.length === existing.length && new Set(ordered).size === ordered.length && ordered.every((id) => existing.includes(id));
}

/** Place in the track's module list: a whole number from 1 up, or null for none. */
export function validatePosition(value: number | null | undefined): string | null {
  if (value === null || value === undefined) return null;
  if (!Number.isInteger(value) || value < 1 || value > 999) return "Module list position must be a whole number from 1 to 999";
  return null;
}

/** The checks every saved question must pass, shared by the question editor and the module quiz page. Null means it can be saved. */
export function validateQuestionFields(q: { section: string; difficulty: string; question: string; options: readonly string[]; answer: string; explanation: string }): string | null {
  if (!q.section.trim()) return "Sub-skill is required";
  if (!q.question.trim()) return "Question text is required";
  if (q.options.length !== 4 || q.options.some((o) => !o.trim())) return "All four options are required";
  if (!/^[ABCD](,[ABCD])*$/.test(q.answer)) return "Select at least one correct answer";
  if (!["Easy", "Medium", "Hard"].includes(q.difficulty)) return "Choose a difficulty";
  if (/\b(option|answer)\s+[ABCD]\b/i.test(q.explanation)) return "The explanation refers to option letters, but options are shuffled for each learner. Describe the option instead.";
  return null;
}

/**
 * The sub-skill a module-quiz-only question gets when the admin does not choose one: the domain's first sub-skill, else the
 * domain's name. Such a question is kept out of the exam-weighted modes, so the value only labels it in module quiz results.
 */
export function pickDefaultSection(subSkillNames: string[], domainTitle: string): string {
  return subSkillNames.map((n) => n.trim()).find(Boolean) ?? domainTitle.trim();
}

/** Question text compared the way an admin would: ignoring case and runs of spaces or line breaks at the edges and in between. */
export const normalizeQuestionText = (t: string): string => t.replace(/\s+/g, " ").trim().toLowerCase();

/**
 * The stored question whose text is exactly `text`, other than `exceptId` (the question being edited). Returns its id, or null.
 * Callers pass the questions of one domain: the same wording in another domain is a different question.
 */
export function findSameQuestion(existing: { id: number; question: string }[], text: string, exceptId?: number): number | null {
  const wanted = normalizeQuestionText(text);
  if (!wanted) return null;
  return existing.find((x) => x.id !== exceptId && normalizeQuestionText(x.question) === wanted)?.id ?? null;
}

export interface QuestionFieldErrors {
  section?: string;
  question?: string;
  /** One entry per option A..D; undefined when that option is fine */
  options: (string | undefined)[];
  answer?: string;
  explanation?: string;
}

/**
 * Field-by-field problems of a question form, so the form can mark each empty field and say what to fill in. Null when it can be
 * saved. `needSection` is false for a module-quiz-only question, whose sub-skill is filled in from the domain.
 */
export function questionFieldErrors(q: { section: string; question: string; options: readonly string[]; answer: readonly string[]; explanation: string }, needSection: boolean): QuestionFieldErrors | null {
  const out: QuestionFieldErrors = {
    options: ["A", "B", "C", "D"].map((l, i) => (q.options[i]?.trim() ? undefined : `Option ${l} is empty. Enter the option text.`)),
  };
  if (needSection && !q.section.trim()) out.section = "Enter a sub-skill.";
  if (!q.question.trim()) out.question = "The question is empty. Enter the question text.";
  if (q.answer.length === 0) out.answer = "Tick at least one correct option.";
  if (/\b(option|answer)\s+[ABCD]\b/i.test(q.explanation)) out.explanation = "The explanation refers to option letters, but options are shuffled for each learner. Describe the option instead.";
  const bad = out.section || out.question || out.answer || out.explanation || out.options.some(Boolean);
  return bad ? out : null;
}
