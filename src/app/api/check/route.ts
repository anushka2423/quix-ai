import { NextResponse } from "next/server";
import { displayKeys, getQuestion, moduleResourcesFor } from "@/lib/bank";
import { isCorrectAnswer } from "@/lib/answers";
import { bad, readJson } from "@/lib/server/http";
import { cleanPicks, explanationFor } from "@/lib/server/attempt";
import { parseLearner, recordOutcomes } from "@/lib/server/missed";
import type { CheckResult } from "@/types/quiz";

/** Instant feedback: the key and explanation only leave the server after the learner has answered. */
export async function POST(req: Request) {
  const b = await readJson<{ seed: string; id: number; picks: unknown; learner?: unknown; mode?: string; module?: string; timedOut?: boolean }>(req);
  if (!b || typeof b.seed !== "string") return bad("Invalid request");
  const q = await getQuestion(Number(b.id));
  if (!q) return bad("Unknown question", 404);
  const picks = cleanPicks(b.picks);
  const keys = displayKeys(q, b.seed);
  // A module quiz question whose 40 seconds ran out is revealed without an answer and counts as missed
  const timedOut = b.timedOut === true && b.mode === "module";
  if (!timedOut && picks.length !== keys.length) return bad(`Select ${keys.length}`);
  const out: CheckResult = {
    correct: !timedOut && isCorrectAnswer(picks, keys.join(",")),
    keys,
    explanation: explanationFor(q),
    // In a module quiz the link names the lesson of that module the question belongs to
    resources: b.mode === "module" ? await moduleResourcesFor(q, typeof b.module === "string" ? b.module : undefined) : (q.resources ?? []),
  };
  // Wrong answers join the learner's review list; a later correct answer takes the item off it.
  // Demo answers are kept separate from the learner's practice history.
  if (b.mode !== "demo") await recordOutcomes(parseLearner(b.learner), q.track, [{ id: q.id, correct: out.correct }]);
  return NextResponse.json(out);
}
