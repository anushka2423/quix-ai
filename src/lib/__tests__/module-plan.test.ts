import { describe, expect, it } from "vitest";
import { MODULE_QUIZZES } from "@/lib/bank/module-bank";
import { MODULE_SIZE } from "@/lib/blueprint";
import { mulberry32 } from "@/lib/bank";
import { buildModulePractice } from "@/lib/sampling";

const quiz = (n: number) => MODULE_QUIZZES.find((m) => m.position === n)!;

describe("planned Module 1 quiz (MSO Foundations, Level 1)", () => {
  const plan = quiz(1);
  it("is exactly 15 questions", () => {
    expect(plan.plan).toHaveLength(MODULE_SIZE);
    expect(buildModulePractice(plan, mulberry32(1))).toHaveLength(15);
  });
  it("is the same questions in the same order every session", () => {
    const ids = (seed: number) => buildModulePractice(plan, mulberry32(seed)).map((q) => q.id);
    expect(ids(1)).toEqual(ids(999));
    expect(ids(1)).toEqual(plan.plan);
  });
  it("leaves the other modules random", () => {
    expect(quiz(2).plan).toBeUndefined();
  });
});
