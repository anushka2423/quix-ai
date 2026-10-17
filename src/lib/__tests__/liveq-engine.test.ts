import { describe, it, expect } from "vitest";
import { scoreAnswer, conceptStatus, CONCEPT_STRONG, CONCEPT_DEVELOPING } from "@/lib/liveq/engine";

describe("scoreAnswer", () => {
  it("awards points_correct on exact match", () => {
    const r = scoreAnswer("A", "A", 100, 0);
    expect(r.is_correct).toBe(true);
    expect(r.points_awarded).toBe(100);
  });

  it("is case-insensitive", () => {
    expect(scoreAnswer("a", "A", 100, 0).is_correct).toBe(true);
    expect(scoreAnswer("A", "a", 100, 0).is_correct).toBe(true);
  });

  it("awards points_incorrect for wrong answer", () => {
    const r = scoreAnswer("B", "A", 100, -20);
    expect(r.is_correct).toBe(false);
    expect(r.points_awarded).toBe(-20);
  });

  it("awards 0 for wrong answer when points_incorrect is 0", () => {
    const r = scoreAnswer("C", "A", 100, 0);
    expect(r.is_correct).toBe(false);
    expect(r.points_awarded).toBe(0);
  });

  it("handles True/False questions", () => {
    expect(scoreAnswer("True", "True", 100, 0).is_correct).toBe(true);
    expect(scoreAnswer("False", "True", 100, 0).is_correct).toBe(false);
  });
});

describe("conceptStatus", () => {
  it("returns strong at or above threshold", () => {
    expect(conceptStatus(CONCEPT_STRONG)).toBe("strong");
    expect(conceptStatus(1)).toBe("strong");
    expect(conceptStatus(0.85)).toBe("strong");
  });

  it("returns developing between thresholds", () => {
    expect(conceptStatus(CONCEPT_DEVELOPING)).toBe("developing");
    expect(conceptStatus(0.7)).toBe("developing");
    expect(conceptStatus(0.79)).toBe("developing");
  });

  it("returns needs_improvement below developing threshold", () => {
    expect(conceptStatus(0)).toBe("needs_improvement");
    expect(conceptStatus(0.5)).toBe("needs_improvement");
    expect(conceptStatus(CONCEPT_DEVELOPING - 0.01)).toBe("needs_improvement");
  });
});
