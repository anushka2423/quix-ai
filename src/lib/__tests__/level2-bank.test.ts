import { describe, expect, it } from "vitest";
import { levelFromCode, MODULE_BANK } from "@/lib/bank/module-bank";
import { isCorrectAnswer, parseAnswer, requiredPicks } from "@/lib/answers";
import { cleanPicks } from "@/lib/server/attempt";
import { buildModulePractice } from "@/lib/sampling";
import { mulberry32 } from "@/lib/bank";

describe("built-in Level 2 (level-2/*.md)", () => {
  const { bank, quizzes } = levelFromCode();

  it("holds the 60 captured questions across the five modules, all module-only at level 2", () => {
    expect(bank).toHaveLength(60);
    expect(quizzes.map((q) => q.name)).toEqual(["Module 1", "Module 2", "Module 3", "Module 4", "Module 5"]);
    expect(quizzes.map((q) => q.extras.length)).toEqual([16, 17, 11, 12, 4]);
    expect(bank.every((q) => q.level === 2 && q.moduleOnly && q.track === "developer")).toBe(true);
  });

  it("never reuses an id of the Level 1 bank", () => {
    const ids = new Set([...MODULE_BANK, ...bank].map((q) => q.id));
    expect(ids.size).toBe(MODULE_BANK.length + bank.length);
  });

  it("keeps every answer inside its own options, with 4 to 6 options", () => {
    for (const q of bank) {
      const labels = q.options.map((o) => o.label);
      expect(labels.length).toBeGreaterThanOrEqual(4);
      expect(labels.join("")).toBe("ABCDEF".slice(0, labels.length));
      const keys = parseAnswer(q.answer);
      expect(keys.length).toBeGreaterThan(0);
      expect(keys.every((k) => labels.includes(k))).toBe(true);
      expect((q.explanation ?? "").length).toBeGreaterThan(20);
    }
  });

  it("scores a multi-answer question that includes option F", () => {
    const q = bank.find((x) => parseAnswer(x.answer).includes("F"));
    expect(q).toBeDefined();
    const keys = parseAnswer(q!.answer);
    expect(requiredPicks(q!.answer)).toBe(keys.length);
    expect(isCorrectAnswer(keys, q!.answer)).toBe(true);
    expect(cleanPicks(["F", "A"])).toEqual(["A", "F"]);
  });

  it("builds a module practice from a module that holds fewer than 15 questions", () => {
    const five = quizzes[4];
    const items = buildModulePractice(five, mulberry32(1));
    expect(items).toHaveLength(4);
  });
});
