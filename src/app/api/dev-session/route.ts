import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { FULL_MOCK_MAX_MINUTES, FULL_MOCK_MAX_QUESTIONS, FULL_MOCK_MIN_MINUTES, FULL_MOCK_MIN_QUESTIONS, isLevelOpen } from "@/lib/blueprint";
import { MODULE_BANK, MODULE_QUIZZES, moduleName } from "@/lib/bank/module-bank";
import { mulberry32, toPublic } from "@/lib/bank";
import { bad, readJson } from "@/lib/server/http";
import type { BankQuestion } from "@/types/quiz";

interface Body {
  mode: "full";
  level?: number;
  questionCount: number;
  timerMinutes: number;
}

/** Fisher-Yates shuffle with the provided RNG */
function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Distribute N picks across 5 modules proportionally to their size.
 * Returns a map of module number → count.
 */
function distribute(total: number, sizes: Map<number, number>, n: number): Map<number, number> {
  const poolTotal = [...sizes.values()].reduce((a, b) => a + b, 0);
  const alloc = new Map<number, number>();
  let allocated = 0;
  for (const [mod, size] of sizes) {
    const share = Math.floor((n * size) / poolTotal);
    alloc.set(mod, share);
    allocated += share;
  }
  // Distribute remaining picks to modules with the largest remainder, capped by module size
  const remainders = [...sizes.entries()]
    .map(([mod, size]) => ({ mod, rem: (n * size) / poolTotal - Math.floor((n * size) / poolTotal), size }))
    .sort((a, b) => b.rem - a.rem || b.size - a.size);
  let extra = n - allocated;
  for (const { mod, size } of remainders) {
    if (extra <= 0) break;
    const current = alloc.get(mod) ?? 0;
    if (current < size) {
      alloc.set(mod, current + 1);
      extra--;
    }
  }
  return alloc;
}

/** Developer Full Mock session: questions drawn from the 5-module course bank, distributed across all modules. */
export async function POST(req: Request) {
  const body = await readJson<Body>(req);
  if (!body || body.mode !== "full") return bad("Invalid request");

  const level = body.level ?? 1;
  if (!isLevelOpen(level)) return bad(`Level ${level} is locked`, 403);

  const count = Number(body.questionCount);
  const minutes = Number(body.timerMinutes);
  const maxQ = MODULE_BANK.length;
  if (!Number.isInteger(count) || count < Math.min(FULL_MOCK_MIN_QUESTIONS, maxQ) || count > Math.min(FULL_MOCK_MAX_QUESTIONS, maxQ)) {
    return bad(`Choose between ${Math.min(FULL_MOCK_MIN_QUESTIONS, maxQ)} and ${Math.min(FULL_MOCK_MAX_QUESTIONS, maxQ)} questions`);
  }
  if (!Number.isInteger(minutes) || minutes < FULL_MOCK_MIN_MINUTES || minutes > FULL_MOCK_MAX_MINUTES) {
    return bad("Choose a valid time limit");
  }

  const seed = randomUUID();
  const rng = mulberry32(parseInt(seed.slice(0, 8), 16));

  // Group MODULE_BANK by module number
  const byModule = new Map<number, BankQuestion[]>();
  for (const q of MODULE_BANK) {
    // Module questions have submoduleName = "Module N"
    const match = q.submoduleName?.match(/^Module (\d+)$/);
    const n = match ? Number(match[1]) : undefined;
    if (n == null) continue;
    if (!byModule.has(n)) byModule.set(n, []);
    byModule.get(n)!.push(q);
  }

  // Determine per-module allocation
  const sizes = new Map([...byModule.entries()].map(([mod, qs]) => [mod, qs.length]));
  const alloc = distribute(MODULE_BANK.length, sizes, Math.min(count, maxQ));

  // Pick from each module
  const picked: BankQuestion[] = [];
  for (const [mod, questions] of byModule) {
    const take = Math.min(alloc.get(mod) ?? 0, questions.length);
    const shuffled = shuffle(questions, rng);
    picked.push(...shuffled.slice(0, take));
  }

  // Final shuffle so questions aren't grouped by module
  const items = shuffle(picked, rng);

  return NextResponse.json({
    seed,
    adaptive: false,
    total: items.length,
    minutes,
    questions: items.map((q) => toPublic(q, seed)),
  });
}
