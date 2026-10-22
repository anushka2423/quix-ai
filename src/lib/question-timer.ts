/** Per-question countdown of a module quiz. Stored with the attempt so a refresh cannot restart the clock. */
export interface QuestionTiming {
  /** When the question was first shown */
  startedAt: number;
  /** When the learner finished answering: the clock stops here */
  stoppedAt?: number;
  /** The time ran out before an answer was given */
  timedOut?: boolean;
}

/** Milliseconds left on a question's clock. A question not shown yet has all of its time. */
export function remainingMs(t: QuestionTiming | undefined, now: number, limitMs: number): number {
  if (!t) return limitMs;
  if (t.timedOut) return 0;
  return Math.max(0, limitMs - ((t.stoppedAt ?? now) - t.startedAt));
}
