import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { AdminModuleQuizzes } from "@/lib/server/admin-data";

// The client component calls server actions and the router; neither is needed to render its first screen
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: () => {} }) }));
vi.mock("@/app/admin/actions", () => ({ addLessonQuestionAction: vi.fn(), createLessonQuestionAction: vi.fn(), removeLessonQuestionAction: vi.fn() }));

const q = (id: number, moduleOnly = false) => ({ id, question: `Question ${id}`, domainId: 1, domain: "Domain", moduleOnly });
const data: AdminModuleQuizzes = {
  ready: true,
  bank: [],
  courses: [
    {
      track: "associate", name: "Course One", position: 1, looseCount: 0, domains: [{ id: 1, title: "Domain", sections: [] }],
      lessons: [{ topicId: 10, name: "Covered lesson", questions: [q(1), q(2, true)] }, { topicId: 11, name: "Empty lesson", questions: [] }],
    },
    {
      track: "associate", name: "Course Two", position: 2, looseCount: 3, domains: [{ id: 1, title: "Domain", sections: [] }],
      lessons: [{ topicId: 20, name: "Fine lesson", questions: [q(3)] }],
    },
    { track: "developer", name: "Developer Course", position: 1, looseCount: 0, domains: [], lessons: [] },
  ],
};

describe("module quizzes page", async () => {
  const { default: ModuleQuizzesClient } = await import("@/app/admin/(dashboard)/module-quizzes/ModuleQuizzesClient");
  const html = renderToStaticMarkup(createElement(ModuleQuizzesClient, { data }));

  it("starts with every module folded, so the page is short and easy to scan", () => {
    expect(html).toContain("Course One");
    expect(html).toContain("Course Two");
    expect(html.match(/aria-expanded="false"/g)?.length).toBe(2);
    expect(html).not.toContain('aria-expanded="true"');
    // folded modules do not show their lessons or questions yet
    expect(html).not.toContain("Covered lesson");
    expect(html).not.toContain("Question 1");
  });
  it("shows only the chosen track, with a summary of what needs attention", () => {
    expect(html).not.toContain("Developer Course");
    expect(html).toContain("2</strong> modules");
    expect(html).toContain("3</strong> lessons");
    expect(html).toContain("✗ 1 lesson with no question");
  });
  it("flags a module whose lessons are not all covered, and shows a clean one as covered", () => {
    expect(html).toContain("✗ 1 of 2 lessons covered");
    expect(html).toContain("✓ all 1 lessons covered");
    expect(html).toContain("4 questions · a quiz takes 4"); // Course Two: one lesson question plus three lesson-less ones
    expect(html).toContain("2 questions · a quiz takes 2"); // Course One: two lesson questions
  });
  it("offers a finder, a gap filter and expand all", () => {
    expect(html).toContain("Find a module or lesson");
    expect(html).toContain("Only lessons with no question");
    expect(html).toContain("Expand all");
  });
});
