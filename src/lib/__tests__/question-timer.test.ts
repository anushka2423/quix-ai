import { describe, expect, it } from "vitest";
import { MODULE_QUESTION_SECONDS, MODULE_SIZE } from "@/lib/blueprint";
import { remainingMs } from "@/lib/question-timer";

const LIMIT = MODULE_QUESTION_SECONDS * 1000;

describe("module quiz clock", () => {
  it("is 15 questions at 40 seconds each", () => {
    expect(MODULE_SIZE).toBe(15);
    expect(MODULE_QUESTION_SECONDS).toBe(40);
  });
  it("gives a question not shown yet all of its time", () => {
    expect(remainingMs(undefined, 1_000_000, LIMIT)).toBe(LIMIT);
  });
  it("counts down from the moment the question was shown", () => {
    expect(remainingMs({ startedAt: 1000 }, 1000, LIMIT)).toBe(40_000);
    expect(remainingMs({ startedAt: 1000 }, 11_000, LIMIT)).toBe(30_000);
    expect(remainingMs({ startedAt: 1000 }, 41_000, LIMIT)).toBe(0);
    expect(remainingMs({ startedAt: 1000 }, 99_000, LIMIT)).toBe(0); // never negative
  });
  it("stops when the learner answers: later ticks do not change it", () => {
    const t = { startedAt: 1000, stoppedAt: 14_000 };
    expect(remainingMs(t, 14_000, LIMIT)).toBe(27_000);
    expect(remainingMs(t, 60_000, LIMIT)).toBe(27_000);
  });
  it("shows zero for a question that timed out", () => {
    expect(remainingMs({ startedAt: 1000, timedOut: true }, 5000, LIMIT)).toBe(0);
  });
});
