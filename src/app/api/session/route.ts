import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { MODES, isTrack } from "@/lib/blueprint";
import { allTrackBank, getBlueprint, getModuleQuizzes, mulberry32, toPublic, trackBank } from "@/lib/bank";
import { buildDemo, buildDiagnostic, buildFullMock, buildModulePractice, buildReview, chooseNext } from "@/lib/sampling";
import { bad, readJson } from "@/lib/server/http";
import { parseLearner, unresolvedIds } from "@/lib/server/missed";
import type { ModeId, ModuleQuiz } from "@/types/quiz";

interface Body {
  track: string;
  mode: ModeId;
  domain?: string;
  /** Practice by module: the module (Skill Jar course) name */
  module?: string;
  wrongIds?: number[];
  learner?: unknown;
  history?: Record<string, { correct: number; total: number }>;
  seen?: Record<number, number>;
}

/** Starts an attempt: returns the question set (no keys) or, for adaptive modes, the first item. */
export async function POST(req: Request) {
  const body = await readJson<Body>(req);
  if (!body || !isTrack(body.track) || !(body.mode in MODES)) return bad("Invalid session request");
  const track = body.track;
  const mode = MODES[body.mode];
  const pool = await trackBank(track);
  const domains = (await getBlueprint())[track];
  const seed = randomUUID();
  const rng = mulberry32(parseInt(seed.slice(0, 8), 16));

  if ((body.mode === "drill" || body.mode === "demo") && !domains.some((d) => d.name === body.domain)) return bad("Choose a domain");
  const moduleQuiz = body.mode === "module" ? (await getModuleQuizzes())[track].find((m) => m.name === body.module) : undefined;
  if (body.mode === "module" && !moduleQuiz) return bad("Choose a module");

  if (mode.adaptive) {
    const total = body.mode === "drill" ? Math.min(20, pool.filter((q) => q.domain === body.domain).length) : Math.min(10, pool.length);
    const first = chooseNext(
      { domains, pool, domain: body.domain, askedIds: [], answered: [], history: body.history ?? {}, seen: body.seen ?? {}, now: Date.now() },
      rng
    );
    if (!first) return bad("No questions available", 404);
    return NextResponse.json({ seed, adaptive: true, total, questions: [toPublic(first, seed)] });
  }

  let items;
  if (body.mode === "module") items = buildModulePractice(moduleQuiz as ModuleQuiz, rng);
  else if (body.mode === "demo") items = buildDemo(pool, body.domain as string);
  else if (body.mode === "full") items = buildFullMock(track, domains, pool, rng);
  else if (body.mode === "diagnostic") items = buildDiagnostic(domains, pool, rng);
  else {
    // Review mistakes: the learner's unresolved misses from the database, else the list the browser kept
    const stored = await unresolvedIds(parseLearner(body.learner), track);
    items = buildReview(await allTrackBank(track), stored.stored ? stored.ids : (body.wrongIds ?? []).map(Number), rng);
  }
  if (!items.length) return bad(body.mode === "review" ? "No missed questions to review yet" : body.mode === "demo" ? "No demo is set up for this domain yet" : "No questions available", 404);

  return NextResponse.json({ seed, adaptive: false, total: items.length, questions: items.map((q) => toPublic(q, seed)) });
}
