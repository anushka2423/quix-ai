import type { BankQuestion, ModuleQuiz, TrackId } from "@/types/quiz";
import { DEMO_SIZE, MODULE_SIZE, TRACKS, type DomainDef } from "@/lib/blueprint";

export type Rng = () => number;

export const SEEN_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

export function shuffle<T>(items: readonly T[], rng: Rng): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export interface Group<K> {
  key: K;
  weight: number;
  /** Max items that can be drawn */
  cap: number;
  /** Minimum items (when cap allows) */
  min?: number;
}

/**
 * Proportional allocation (Sainte-Lague divisor method) of n items across weighted groups,
 * honouring caps and minimums. If the groups cannot hold n items, as many as exist are allocated.
 */
export function allocate<K>(groups: Group<K>[], n: number): Map<K, number> {
  const out = new Map<K, number>(groups.map((g) => [g.key, 0]));
  let remaining = n;
  for (const g of groups) {
    const take = Math.min(g.min ?? 0, g.cap, remaining);
    out.set(g.key, take);
    remaining -= take;
  }
  while (remaining > 0) {
    let best: Group<K> | null = null;
    let bestScore = -1;
    for (const g of groups) {
      const have = out.get(g.key) as number;
      if (have >= g.cap || g.weight <= 0) continue;
      const score = g.weight / (2 * have + 1);
      if (score > bestScore) {
        best = g;
        bestScore = score;
      }
    }
    if (!best) break;
    out.set(best.key, (out.get(best.key) as number) + 1);
    remaining--;
  }
  return out;
}

function bySubSkill(pool: BankQuestion[]): Map<string, BankQuestion[]> {
  const m = new Map<string, BankQuestion[]>();
  for (const q of pool) {
    const k = `${q.domain}|${q.subSkill}`;
    m.set(k, [...(m.get(k) ?? []), q]);
  }
  return m;
}

/** True when every sub-skill of the domain has a published weight (Developer). */
export function hasSubSkillWeights(d: DomainDef): boolean {
  return d.subSkills.length > 0 && d.subSkills.every((s) => s.weight != null) && d.subSkills.some((s) => (s.weight as number) > 0);
}

/**
 * Draw n questions from the pool. Domains whose sub-skills are weighted are drawn at those weights.
 * Domains with no published sub-skill weights (Associate) are drawn as one group at the domain weight,
 * so no weight is ever invented.
 */
function drawBySubSkill(domainDefs: DomainDef[], pool: BankQuestion[], n: number, rng: Rng, domain?: string): BankQuestion[] {
  const groups = bySubSkill(pool);
  const keys: Group<string>[] = [];
  const members = new Map<string, BankQuestion[]>();
  for (const d of domainDefs) {
    if (domain && d.name !== domain) continue;
    if (hasSubSkillWeights(d)) {
      for (const s of d.subSkills) {
        const items = groups.get(`${d.name}|${s.name}`) ?? [];
        if (items.length) {
          keys.push({ key: `${d.name}|${s.name}`, weight: s.weight as number, cap: items.length });
          members.set(`${d.name}|${s.name}`, items);
        }
      }
    } else {
      const items = pool.filter((q) => q.domain === d.name);
      if (items.length) {
        keys.push({ key: `${d.name}|*`, weight: d.weight, cap: items.length });
        members.set(`${d.name}|*`, items);
      }
    }
  }
  const alloc = allocate(keys, n);
  return [...alloc.entries()].flatMap(([k, count]) => shuffle(members.get(k) ?? [], rng).slice(0, count));
}

/** A full mock: official item count, drawn at the official weights. Never adaptive. */
export function buildFullMock(track: TrackId, domainDefs: DomainDef[], pool: BankQuestion[], rng: Rng): BankQuestion[] {
  return shuffle(drawBySubSkill(domainDefs, pool, TRACKS[track].items, rng), rng);
}

/** Diagnostic: 20 items across every domain at the domain weights, at least one per domain. */
export function buildDiagnostic(domainDefs: DomainDef[], pool: BankQuestion[], rng: Rng, n = 20): BankQuestion[] {
  const domains = domainDefs.map((d) => ({
    key: d.name,
    weight: d.weight,
    cap: pool.filter((q) => q.domain === d.name).length,
    min: 1,
  }));
  const alloc = allocate(domains, n);
  const out = [...alloc.entries()].flatMap(([domain, count]) =>
    drawBySubSkill(domainDefs, pool.filter((q) => q.domain === domain), count, rng, domain)
  );
  return shuffle(out, rng);
}

/** Review mode: every previously missed item that still exists in the track. */
export function buildReview(pool: BankQuestion[], wrongIds: number[], rng: Rng): BankQuestion[] {
  const ids = new Set(wrongIds);
  return shuffle(pool.filter((q) => ids.has(q.id)), rng);
}

/** A domain's demo: the questions the admin marked, in their fixed order. Never random, never more than DEMO_SIZE. */
export function buildDemo(pool: BankQuestion[], domain: string): BankQuestion[] {
  return pool
    .filter((q) => q.domain === domain && q.demoOrder != null)
    .sort((a, b) => (a.demoOrder as number) - (b.demoOrder as number) || a.id - b.id)
    .slice(0, DEMO_SIZE);
}

/**
 * Practice by module: a random draw from the module's questions, spread across its lessons. Each lesson gives one
 * question before any lesson gives a second, so a session covers as many lessons as it has room for. When the module has
 * more lessons than questions in a session, which lessons appear changes from session to session. The course's questions
 * that belong to no lesson are used only after the lessons run out. The order of the questions is random.
 *
 * Nobody chooses the questions: every session is a fresh random draw from everything assigned to the lessons. When the
 * learner's browser says which questions they answered before (`seen`, id to time), questions they have not seen come
 * first and the longest-ago ones next, so a returning learner gets new questions until the module's pool runs out.
 */
export function buildModulePractice(module: ModuleQuiz, rng: Rng, n = MODULE_SIZE, seen: Record<number, number> = {}): BankQuestion[] {
  // Shuffle first so ties (all unseen, or never-seen-together) stay random, then a stable sort puts the least recently seen first
  const freshFirst = (qs: BankQuestion[]) => shuffle(qs, rng).sort((x, y) => (seen[x.id] ?? 0) - (seen[y.id] ?? 0));
  const queues = shuffle(module.lessons.filter((l) => l.questions.length), rng).map((l) => freshFirst(l.questions));
  const picked: BankQuestion[] = [];
  const taken = new Set<number>();
  const take = (q: BankQuestion) => {
    if (picked.length < n && !taken.has(q.id)) {
      taken.add(q.id);
      picked.push(q);
    }
  };
  for (let round = 0; picked.length < n && queues.some((qs) => qs.length > round); round++) {
    for (const qs of queues) if (qs.length > round) take(qs[round]);
  }
  for (const q of freshFirst(module.extras)) take(q);
  return shuffle(picked, rng);
}

// ── Adaptive selection (sprints and drills) ───────────────────────────────

export interface SkillHistory {
  /** key: `${domain}|${subSkill}` */
  [key: string]: { correct: number; total: number };
}

export interface AdaptiveInput {
  domains: DomainDef[];
  pool: BankQuestion[];
  /** Restrict to one domain (drills) */
  domain?: string;
  /** Items already asked in this attempt */
  askedIds: number[];
  /** Answers so far in this attempt */
  answered: { id: number; correct: boolean }[];
  /** Past per-skill accuracy from earlier attempts */
  history: SkillHistory;
  /** Seen-at timestamps (ms) for earlier attempts */
  seen: Record<number, number>;
  now: number;
}

/**
 * Pick the next item for the learner's weakest sub-skill. Accuracy is smoothed (Laplace) so one
 * miss does not dominate. Items asked this attempt are never repeated, and items seen in the last
 * 7 days are skipped unless nothing else is left in any sub-skill.
 */
export function chooseNext(input: AdaptiveInput, rng: Rng): BankQuestion | null {
  const { domains: domainDefs, pool, domain, askedIds, answered, history, seen, now } = input;
  const asked = new Set(askedIds);
  const candidates = pool.filter((q) => (!domain || q.domain === domain) && !asked.has(q.id));
  if (!candidates.length) return null;

  const stats = new Map<string, { correct: number; total: number }>();
  for (const [k, v] of Object.entries(history)) stats.set(k, { ...v });
  const byId = new Map(pool.map((q) => [q.id, q]));
  for (const a of answered) {
    const q = byId.get(a.id);
    if (!q) continue;
    const k = `${q.domain}|${q.subSkill}`;
    const s = stats.get(k) ?? { correct: 0, total: 0 };
    s.total++;
    if (a.correct) s.correct++;
    stats.set(k, s);
  }

  const weightOf = new Map<string, number>();
  for (const d of domainDefs) for (const s of d.subSkills) weightOf.set(`${d.name}|${s.name}`, s.weight ?? 0);

  const fresh = candidates.filter((q) => !(seen[q.id] && now - seen[q.id] < SEEN_WINDOW_MS));
  const tiers = fresh.length ? [fresh] : [[...candidates].sort((a, b) => (seen[a.id] ?? 0) - (seen[b.id] ?? 0))];

  for (const tier of tiers) {
    const groups = bySubSkill(tier);
    const ranked = [...groups.keys()]
      .map((k) => {
        const s = stats.get(k) ?? { correct: 0, total: 0 };
        return { k, acc: (s.correct + 1) / (s.total + 2), w: weightOf.get(k) ?? 0, tie: rng() };
      })
      .sort((a, b) => a.acc - b.acc || b.w - a.w || a.tie - b.tie);
    if (ranked.length) {
      const items = groups.get(ranked[0].k) as BankQuestion[];
      // In the fallback tier items are sorted oldest-seen first; otherwise pick at random
      return tier === fresh ? items[Math.floor(rng() * items.length)] : items[0];
    }
  }
  return null;
}
