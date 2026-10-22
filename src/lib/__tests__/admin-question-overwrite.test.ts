import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { findSameQuestion, normalizeQuestionText, questionFieldErrors } from "@/lib/admin-validate";

type Row = Record<string, unknown> & { id: number };

/** A tiny in-memory stand-in for the Supabase client: just the calls the question actions make. */
const store = vi.hoisted(() => ({ tables: {} as Record<string, Row[]> }));

vi.mock("@/lib/server/db", () => {
  class Query {
    private filters: [string, unknown][] = [];
    private op: "select" | "insert" | "update" = "select";
    private payload: Record<string, unknown> = {};
    constructor(private name: string) {}
    select() { return this; }
    insert(p: Record<string, unknown>) { this.op = "insert"; this.payload = p; return this; }
    update(p: Record<string, unknown>) { this.op = "update"; this.payload = p; return this; }
    eq(c: string, v: unknown) { this.filters.push([c, v]); return this; }
    order() { return this; }
    limit() { return this; }
    maybeSingle() { return this.run(true); }
    single() { return this.run(true); }
    then<T>(ok: (v: unknown) => T) { return Promise.resolve(this.run(false)).then(ok); }
    private run(one: boolean) {
      const rows = (store.tables[this.name] ??= []);
      if (this.op === "insert") {
        const row = { ...this.payload, id: Math.max(0, ...rows.map((r) => r.id)) + 1 } as Row;
        rows.push(row);
        return { data: one ? row : [row], error: null };
      }
      const hit = rows.filter((r) => this.filters.every(([c, v]) => r[c] === v));
      if (this.op === "update") {
        for (const r of hit) Object.assign(r, this.payload);
        return { data: null, error: null };
      }
      return { data: one ? (hit[0] ?? null) : hit, error: null };
    }
  }
  return { db: () => ({ from: (name: string) => new Query(name) }) };
});
vi.mock("next/headers", () => ({ cookies: async () => ({ get: () => ({ value: "quix_admin_v1" }) }) }));
vi.mock("next/cache", () => ({ revalidatePath: () => {} }));
vi.mock("next/navigation", () => ({ redirect: () => {} }));
vi.mock("@/lib/bank", () => ({ invalidateBank: () => {} }));

const { saveQuestionAction, createLessonQuestionAction } = await import("@/app/admin/actions");

const fields = { difficulty: "Medium", options: ["a", "b", "c", "d"] as [string, string, string, string], answer: "B", explanation: "Because." };
const rows = (t: string) => store.tables[t] ?? [];

beforeEach(() => {
  store.tables = {
    quiz_modules: [{ id: 1, title: "Domain One", track: "developer" }, { id: 2, title: "Domain Two", track: "developer" }],
    quiz_sub_skills: [],
    quiz_questions: [
      { id: 5, module_id: 1, section: "Skill", difficulty: "Easy", question: "Which tier fits best?", option_a: "old a", option_b: "old b", option_c: "old c", option_d: "old d", answer: "A", explanation: "old", order_index: 1, submodule_id: 10, topic_id: 100, module_only: false, demo_order: 3 },
      { id: 6, module_id: 1, section: "Skill", difficulty: "Easy", question: "A different question", option_a: "a", option_b: "b", option_c: "c", option_d: "d", answer: "A", explanation: "x", order_index: 2, submodule_id: null, topic_id: null, module_only: false, demo_order: null },
      { id: 7, module_id: 2, section: "Skill", difficulty: "Easy", question: "Another domain", option_a: "a", option_b: "b", option_c: "c", option_d: "d", answer: "A", explanation: "x", order_index: 1, submodule_id: null, topic_id: null, module_only: false, demo_order: null },
    ],
    quiz_submodules: [{ id: 10, module_id: 1, title: "Course" }],
    quiz_skilljar_topics: [
      { id: 100, submodule_id: 10, course_title: "Course", lesson_title: "Lesson A" },
      { id: 101, submodule_id: 10, course_title: "Course", lesson_title: "Lesson B" },
    ],
    quiz_lesson_questions: [],
  };
});

describe("matching an existing question by its text", () => {
  it("ignores case, extra spaces and line breaks, but nothing else", () => {
    expect(normalizeQuestionText("  Which  TIER\nfits best? ")).toBe("which tier fits best?");
    const existing = [{ id: 1, question: "Which tier fits best?" }, { id: 2, question: "Another" }];
    expect(findSameQuestion(existing, "which   tier fits best?")).toBe(1);
    expect(findSameQuestion(existing, "Which tier fits best")).toBeNull(); // a missing character is a different question
    expect(findSameQuestion(existing, "Which tier fits best?", 1)).toBeNull(); // a question is not its own twin
    expect(findSameQuestion(existing, "   ")).toBeNull();
  });
});

describe("saving a question whose text already exists in the domain", () => {
  it("overwrites the existing question instead of adding a twin", async () => {
    const r = await saveQuestionAction({ moduleId: 1, section: "Skill", question: "  which tier FITS best?  ", ...fields, explanation: "New explanation", submoduleId: null, topicId: undefined, demoOrder: null });
    expect(r).toEqual({ id: 5, replaced: true });
    expect(rows("quiz_questions")).toHaveLength(3);
    const q = rows("quiz_questions").find((x) => x.id === 5)!;
    expect(q.question).toBe("which tier FITS best?");
    expect([q.option_a, q.answer, q.explanation]).toEqual(["a", "B", "New explanation"]);
  });

  it("keeps the lesson, submodule and demo slot of the question it replaces when the form left them blank", async () => {
    await saveQuestionAction({ moduleId: 1, section: "Skill", question: "Which tier fits best?", ...fields, submoduleId: null, topicId: null, demoOrder: null });
    const q = rows("quiz_questions").find((x) => x.id === 5)!;
    expect([q.submodule_id, q.topic_id, q.demo_order]).toEqual([10, 100, 3]);
  });

  it("adds a genuinely new question, and treats the same wording in another domain as a different question", async () => {
    const fresh = await saveQuestionAction({ moduleId: 1, section: "Skill", question: "Brand new?", ...fields });
    expect(fresh.replaced).toBeUndefined();
    expect(fresh.id).toBe(8);
    const other = await saveQuestionAction({ moduleId: 2, section: "Skill", question: "Which tier fits best?", ...fields });
    expect(other.replaced).toBeUndefined();
    expect(rows("quiz_questions")).toHaveLength(5);
  });

  it("refuses an edit that would turn two questions into twins, and changes nothing", async () => {
    const r = await saveQuestionAction({ id: 6, moduleId: 1, section: "Skill", question: "Which tier fits best?", ...fields });
    expect(r.error).toMatch(/#5/);
    expect(rows("quiz_questions").find((x) => x.id === 6)!.question).toBe("A different question");
  });

  it("still lets a question be edited in place", async () => {
    const r = await saveQuestionAction({ id: 6, moduleId: 1, section: "Skill", question: "A different question, reworded", ...fields });
    expect(r).toEqual({ id: 6 });
  });
});

describe("writing a lesson question whose text already exists", () => {
  const input = { topicId: 100, moduleId: 1, section: "Skill", question: "Which tier fits best?", ...fields, explanation: "Rewritten", moduleOnly: true };

  it("overwrites it, attaches it to the lesson, and leaves its practice-mode flag alone", async () => {
    const r = await createLessonQuestionAction(input);
    expect(r).toEqual({ id: 5, replaced: true });
    expect(rows("quiz_questions")).toHaveLength(3);
    const q = rows("quiz_questions").find((x) => x.id === 5)!;
    expect([q.explanation, q.module_only]).toEqual(["Rewritten", false]);
    expect(rows("quiz_lesson_questions")).toEqual([expect.objectContaining({ topic_id: 100, question_id: 5 })]);
  });

  it("is not duplicated in the lesson when saved twice", async () => {
    await createLessonQuestionAction(input);
    const again = await createLessonQuestionAction(input);
    expect(again.replaced).toBe(true);
    expect(rows("quiz_lesson_questions")).toHaveLength(1);
  });

  it("refuses, before overwriting anything, when the question sits in another lesson of the course", async () => {
    store.tables.quiz_lesson_questions = [{ id: 1, topic_id: 101, question_id: 5 }];
    const r = await createLessonQuestionAction(input);
    expect(r.error).toMatch(/Lesson B/);
    expect(rows("quiz_questions").find((x) => x.id === 5)!.explanation).toBe("old");
  });
});

describe("buttons for actions that talk to the server", async () => {
  const { BusyButton } = await import("@/app/admin/(dashboard)/_components/ui");
  it("is blocked and shows a spinner and a working label while busy", () => {
    const html = renderToStaticMarkup(createElement(BusyButton, { busy: true, busyLabel: "Saving…" }, "Save"));
    expect(html).toContain("disabled");
    expect(html).toContain('aria-busy="true"');
    expect(html).toContain("qa-spinner");
    expect(html).toContain("Saving…");
    expect(html).not.toContain(">Save<");
  });
  it("is blocked without a spinner while another action is running", () => {
    const html = renderToStaticMarkup(createElement(BusyButton, { block: true }, "Save"));
    expect(html).toContain("disabled");
    expect(html).not.toContain("qa-spinner");
  });
  it("is a normal button when idle", () => {
    const html = renderToStaticMarkup(createElement(BusyButton, {}, "Save"));
    expect(html).not.toContain("disabled");
    expect(html).toContain("Save");
  });
});

describe("telling the admin which fields to fill in", () => {
  const ok = { section: "Skill", question: "A question?", options: ["a", "b", "c", "d"], answer: ["B"], explanation: "Because." };

  it("has nothing to say about a complete question", () => {
    expect(questionFieldErrors(ok, true)).toBeNull();
  });
  it("names an empty question, each empty option and a missing correct answer", () => {
    const e = questionFieldErrors({ ...ok, question: "  ", options: ["a", "", "c", " "], answer: [] }, true);
    expect(e?.question).toMatch(/question is empty/i);
    expect(e?.options.map(Boolean)).toEqual([false, true, false, true]);
    expect(e?.options[1]).toMatch(/Option B/);
    expect(e?.answer).toMatch(/correct/i);
  });
  it("asks for a sub-skill only when the question is not module-quiz-only", () => {
    expect(questionFieldErrors({ ...ok, section: "" }, true)?.section).toBeTruthy();
    expect(questionFieldErrors({ ...ok, section: "" }, false)).toBeNull();
  });
  it("flags an explanation that names option letters", () => {
    expect(questionFieldErrors({ ...ok, explanation: "Option B is right." }, true)?.explanation).toMatch(/shuffled/);
  });
});
