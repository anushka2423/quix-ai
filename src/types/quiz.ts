export type Difficulty = "Easy" | "Medium" | "Hard";
export type OptionLabel = "A" | "B" | "C" | "D";
export type AnswerLabel = OptionLabel | "?";

export type TrackId = "associate" | "developer";

/** "demo" is the fixed 5-question taster of one domain. It is stored and reported separately from the practice modes. */
export type ModeId = "diagnostic" | "sprint" | "drill" | "full" | "review" | "demo" | "module";

export interface Option {
  label: OptionLabel;
  text: string;
}

/** A link to where the learner can read about a topic (a Skill Jar course). Shown with the explanation. */
export interface Resource {
  title: string;
  url: string;
}

/** A question as stored in the bank (server side only: carries the key). */
export interface BankQuestion {
  id: number;
  track: TrackId;
  domain: string;
  subSkill: string;
  difficulty: Difficulty;
  question: string;
  options: Option[];
  /** Correct label(s): "B" for single-answer, "A,C" for multi-answer questions */
  answer: string;
  explanation?: string;
  /** Exam guide the item was written against, e.g. "v1.0" */
  guideVersion: string;
  /** Submodule (Skill Jar course) the question belongs to, when the admin has assigned one */
  submoduleId?: number | null;
  /** That submodule's name. Practice by module groups questions by it, so a course shared by several domains is one module. */
  submoduleName?: string | null;
  /** The Skill Jar lesson (a topic of its submodule) the question belongs to, when the admin has picked one */
  topicId?: number | null;
  /** That lesson's name. The same lesson under several domains has the same name, so practice by module groups by it. */
  lessonName?: string | null;
  /** True for questions written for module quizzes: they appear there but not in the exam-weighted practice modes */
  moduleOnly?: boolean;
  /** 1..5 when the question is part of its domain's demo, else null */
  demoOrder?: number | null;
  /** Where to read about the topic; derived from the submodule's Skill Jar topics */
  resources?: Resource[];
}

/** One lesson of a module (a Skill Jar course) and the questions that belong to it. Server only: carries answer keys. */
export interface ModuleLesson {
  name: string;
  /** Opens the course; named after the lesson, e.g. "Technical Substrate (MSO Foundations)" */
  link: Resource;
  questions: BankQuestion[];
}

/** The module quiz of one course. Its questions are the lessons' questions, plus any assigned to the course but to no lesson. */
export interface ModuleQuiz {
  name: string;
  description: string;
  /** Place in the track's module list; null when not set */
  position: number | null;
  lessons: ModuleLesson[];
  /** Questions of the course that belong to no lesson: used only after every lesson's questions */
  extras: BankQuestion[];
}

/** A question as sent to the browser: no key, no explanation. */
export interface PublicQuestion {
  id: number;
  track: TrackId;
  domain: string;
  subSkill: string;
  difficulty: Difficulty;
  question: string;
  options: Option[];
  /** How many options must be selected ("Select N") */
  picks: number;
}

export interface CheckResult {
  correct: boolean;
  keys: OptionLabel[];
  explanation: string;
  resources?: Resource[];
}

export interface AttemptAnswer {
  id: number;
  picks: OptionLabel[];
  /** Milliseconds spent on the question */
  ms: number;
}

export interface DomainStat {
  domain: string;
  weight: number;
  /** Course module that covers the domain (from the database) */
  courseModule?: number;
  correct: number;
  total: number;
  /** 0..1, null when no item from the domain was asked */
  pct: number | null;
}

export interface SubSkillStat {
  domain: string;
  subSkill: string;
  /** null when the exam guide gives this sub-skill no weight */
  weight: number | null;
  correct: number;
  total: number;
  pct: number | null;
}

export interface MissedItem {
  id: number;
  domain: string;
  subSkill: string;
  question: string;
  options: Option[];
  userPicks: OptionLabel[];
  keys: OptionLabel[];
  explanation: string;
  resources?: Resource[];
  multi: boolean;
  ms: number;
}

export interface LiftItem {
  kind: "domain" | "subSkill";
  name: string;
  domain: string;
  pct: number;
  weight: number;
  /** Readiness points gained by reaching the "ready" accuracy level */
  lift: number;
}

export interface ResultSummary {
  track: TrackId;
  mode: ModeId;
  domainFilter?: string;
  correct: number;
  total: number;
  pct: number;
  /** 100-1000 estimate; null for modes that do not produce one */
  readiness: number | null;
  passLine: number;
  gap: number;
  passed: boolean | null;
  lowConfidence: boolean;
  domains: DomainStat[];
  subSkills: SubSkillStat[];
  weakestDomain: string | null;
  lifts: LiftItem[];
  missed: MissedItem[];
  patterns: string[];
  avgSecondsPerQuestion: number;
  paceSeconds: number;
  totalSeconds: number;
  unansweredCount: number;
}
