import type { Question, QuizModule } from "@/types/quiz";

/** Questions shown per quiz attempt, drawn from every module. */
export const QUIZ_LENGTH = 12;

/** Unbiased random integer in [0, max) from the browser's CSPRNG. */
function randomInt(max: number): number {
  const limit = Math.floor(0x100000000 / max) * max; // reject values that would bias the modulo
  const buf = new Uint32Array(1);
  do crypto.getRandomValues(buf);
  while (buf[0] >= limit);
  return buf[0] % max;
}

/** A fresh random set of questions from all modules, in random order. */
export function drawQuizQuestions(modules: QuizModule[], count = QUIZ_LENGTH): Question[] {
  const pool = modules.flatMap((m) => m.questions);
  // Partial Fisher–Yates: only the first `count` positions need shuffling
  const n = Math.min(count, pool.length);
  for (let i = 0; i < n; i++) {
    const j = i + randomInt(pool.length - i);
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, n);
}
