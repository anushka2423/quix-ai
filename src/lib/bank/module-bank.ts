import type { BankQuestion, ModuleQuiz, OptionLabel } from "@/types/quiz";
import data from "./module-bank.json";

/**
 * The By Module exams of the Developer track: Modules 1-5, Level 1. Generated from 1.md..5.md by
 * scripts/build-module-bank.ts (npm run bank:modules). These questions are module-only: they never enter the
 * exam-weighted full mock, which keeps drawing from the existing Level 1 bank.
 */

/** Far above any database id, so the two can never collide */
const ID_BASE = 9_000_000;

interface RawModule {
  module: number;
  title: string;
  level: number;
  questions: { n: number; difficulty: BankQuestion["difficulty"]; question: string; options: { label: string; text: string }[]; answer: string; explanation: string }[];
}

const raw = (data as { modules: RawModule[] }).modules;

export const moduleName = (n: number) => `Module ${n}`;

export const MODULE_BANK: BankQuestion[] = raw.flatMap((m) =>
  m.questions.map<BankQuestion>((q) => ({
    id: ID_BASE + m.module * 1000 + q.n,
    track: "developer",
    domain: `${moduleName(m.module)}: ${m.title}`,
    subSkill: m.title,
    difficulty: q.difficulty,
    question: q.question,
    options: q.options.map((o) => ({ label: o.label as OptionLabel, text: o.text })),
    answer: q.answer,
    explanation: q.explanation,
    guideVersion: "v1.0",
    submoduleName: moduleName(m.module),
    moduleOnly: true,
    resources: [],
  }))
);

/** One quiz per module; its questions are drawn together (no lessons) */
export const MODULE_QUIZZES: ModuleQuiz[] = raw.map((m) => ({
  name: moduleName(m.module),
  description: m.title,
  position: m.module,
  lessons: [],
  extras: MODULE_BANK.filter((q) => q.submoduleName === moduleName(m.module)),
}));
