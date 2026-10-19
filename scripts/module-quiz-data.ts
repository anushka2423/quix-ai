import type { Difficulty, TrackId } from "../src/types/quiz";
import { LESSON_MAP } from "./submodule-seed-data";

/**
 * Starting content for the module quizzes: which questions belong to which lesson of a course.
 *
 *  - Every question already mapped to a lesson (LESSON_MAP) is a member of that lesson.
 *  - REUSED adds existing bank questions to a lesson they also fit, where the lesson would otherwise have none.
 *  - NEW_QUESTIONS are written for lessons that still had no question. They are "module quiz only": they appear in
 *    module quizzes but not in the diagnostic, sprint, drill or full mock, so the exam-weighted practice is unchanged.
 *
 * Once loaded, the database is the source of truth and the admin edits everything in Admin > Module quizzes.
 * A question belongs to at most one lesson of a course (the same question can sit in lessons of different courses).
 */

export interface NewQuestion {
  track: TrackId;
  /** Domain the question is filed under; the course needs a submodule row there */
  domain: string;
  /** An existing sub-skill of that domain, so no new sub-skill (and no scoring weight) is created */
  section: string;
  difficulty: Difficulty;
  question: string;
  /** Four options in storage order; the app shuffles them for each learner */
  options: [string, string, string, string];
  /** Letter of the correct option in storage order */
  answer: "A" | "B" | "C" | "D";
  /** Never mentions option letters: options are shuffled */
  explanation: string;
  course: string;
  lesson: string;
}

const PLAT = "Claude Platform & Model Foundations";
const GOV = "Governance, Risk & Responsible Use";
const MSO = "MSO Foundations";
const PROD = "Production-Grade Prompting, Agents & Tool Use";
const EVALS = "Production Engineering, Evals & Security";
const ACCEL = "Accelerators & IP Contribution";

const PLAT_DOMAIN = "Product and Model Selection";
const FEATURES = "Select appropriate Claude product features (Projects, research mode, chat, artifacts)";
const CONTEXT = "Understand and manage context limitations and memory considerations (when to restart, summarize, or persist)";

export const NEW_QUESTIONS: NewQuestion[] = [
  // ── Claude Platform & Model Foundations ───────────────────────────────────
  {
    track: "associate", domain: PLAT_DOMAIN, section: CONTEXT, difficulty: "Easy", course: PLAT, lesson: "How Claude Behaves",
    question: "A user asks Claude the same question in two separate new conversations and receives answers that are worded differently but say the same thing. What best explains this?",
    options: [
      "Claude generates each response afresh, so the wording can vary from one run to the next even when the meaning is the same",
      "Claude remembers the first conversation and deliberately rewords its answer to avoid repeating itself",
      "One of the two answers must be a malfunction and should be reported",
      "Claude can only give one fixed answer to a question unless it is reset",
    ],
    answer: "A",
    explanation: "Claude composes each response as it goes, so the exact wording can differ between runs even when the substance matches. That is normal behaviour, not a fault. It is a reason to judge an output by whether it meets your criteria rather than by whether it repeats an earlier phrasing.",
  },
  {
    track: "associate", domain: PLAT_DOMAIN, section: CONTEXT, difficulty: "Easy", course: PLAT, lesson: "How Claude Behaves",
    question: "A colleague opens a brand-new conversation and expects Claude to remember what they discussed yesterday. What should they know?",
    options: [
      "A new conversation starts without the earlier one unless the information is provided again or kept through a feature designed to persist it, such as a Project",
      "Claude automatically recalls every past conversation and will bring it up on request",
      "Claude remembers earlier chats only when a more expensive model is selected",
      "Claude shares what each person says with every other user, so earlier chats are always available",
    ],
    answer: "A",
    explanation: "Each new conversation begins with only the context you give it. To carry background forward, restate the key points or keep them somewhere Claude is configured to read, such as a Project's instructions and knowledge. Claude does not pass one user's conversations to other users.",
  },
  {
    track: "associate", domain: PLAT_DOMAIN, section: FEATURES, difficulty: "Medium", course: PLAT, lesson: "Core Entry Points",
    question: "A team member wants Claude to work alongside them on the real files and folders on their computer, for example to organise and update a set of documents. Which entry point is designed for that?",
    options: [
      "Claude Cowork, which works with a person on their own files and projects",
      "A plain chat conversation in which the user retypes each file's contents by hand",
      "The Claude Developer Platform, which is aimed at building applications rather than everyday file work",
      "A system prompt, which is a setting rather than a place to work",
    ],
    answer: "A",
    explanation: "Different entry points suit different work. Cowork is built for collaborating on a person's own files and projects. A chat conversation can help with pasted content but is not set up to work on files in place, and the Developer Platform is for building applications.",
  },
  {
    track: "associate", domain: PLAT_DOMAIN, section: FEATURES, difficulty: "Medium", course: PLAT, lesson: "Core Entry Points",
    question: "A developer wants Claude to help build, change and run code inside their local project from the terminal. Which entry point fits best?",
    options: [
      "Claude Code, which works on a codebase directly from the command line",
      "A chat conversation in a browser with the code pasted in each time",
      "An Artifact, which renders a single standalone document",
      "A Project's custom instructions, which store background but cannot run anything",
    ],
    answer: "A",
    explanation: "Claude Code is the entry point for working on a codebase from the terminal, where it can read the project and run commands. A browser chat, an Artifact or Project instructions can each help with code in some way, but none of them works directly inside the local project.",
  },

  // ── Governance, Risk & Responsible Use ────────────────────────────────────
  {
    track: "associate", domain: "Governance, Risk, and Responsible Use", section: "Follow organizational AI policies and governance standards", difficulty: "Medium", course: GOV, lesson: "Skill Trust & Feature-Level Risk",
    question: "A colleague shares a Skill they found online and suggests everyone add it to their Claude setup. What is the most sensible first step?",
    options: [
      "Review what the Skill tells Claude to do and which tools or data it can reach, and check it against organisational policy before adding it",
      "Add it straight away, because a Skill only changes how answers are formatted",
      "Roll it out to the whole team at once so everyone benefits together",
      "Ask Claude to confirm that the Skill is safe and rely on that reply",
    ],
    answer: "A",
    explanation: "A Skill carries instructions and can influence what Claude does with the access it has, so it deserves the same scrutiny as any other software you add. Review it, understand what it can touch, and check it against your policy before anyone relies on it. Claude's own assurance is not a substitute for a review.",
  },
  {
    track: "associate", domain: "Governance, Risk, and Responsible Use", section: "Follow organizational AI policies and governance standards", difficulty: "Hard", course: GOV, lesson: "Skill Trust & Feature-Level Risk",
    question: "A team plans to switch on web search and a connector to a shared drive for a pilot. How should the risk be judged?",
    options: [
      "Feature by feature: each added capability or connection widens what Claude can see or do, so assess the data and actions each one exposes",
      "Once Claude itself is approved, every feature carries the same risk and needs no further review",
      "By the size of the model alone, since larger models are always riskier",
      "Only for features that cost extra, because free features cannot expose anything",
    ],
    answer: "A",
    explanation: "Risk comes from what Claude can reach and do, and each feature or connector changes that. Approving the tool in general does not approve every capability. Look at the data a connector exposes and the actions a feature allows, then decide whether to enable it and for whom.",
  },

  // ── MSO Foundations ───────────────────────────────────────────────────────
  {
    track: "developer", domain: "Model Selection and Optimization", section: "LLM Fundamentals", difficulty: "Easy", course: MSO, lesson: "How LLMs Behave",
    question: "A developer sends an identical prompt twice at the default settings and receives two differently worded but equivalent answers. What does this show?",
    options: [
      "Output is sampled, so identical inputs can produce different outputs unless sampling is constrained",
      "The first response was cached incorrectly and should be discarded",
      "The model's weights changed between the two requests",
      "The prompt must contain an error that makes the model unstable",
    ],
    answer: "A",
    explanation: "A language model picks each next token from a probability distribution, so results can vary from run to run. Lowering the sampling randomness makes outputs more consistent, but exact repeatability is not guaranteed, so applications should be built to tolerate variation.",
  },
  {
    track: "developer", domain: "Model Selection and Optimization", section: "LLM Fundamentals", difficulty: "Medium", course: MSO, lesson: "How LLMs Behave",
    question: "A model states a detailed fact with complete confidence, and the fact turns out to be wrong. Which explanation fits how language models work?",
    options: [
      "The model produces fluent text from learned patterns and does not look facts up, so a confident tone is not evidence of accuracy",
      "The model always knows when it is wrong and chooses to mislead the user",
      "Confident wording only appears when the underlying fact has been verified",
      "The error shows the request was sent to the wrong model tier",
    ],
    answer: "A",
    explanation: "Models generate plausible text from patterns learned in training, and they can state incorrect details fluently. Confidence of tone is therefore no guarantee of accuracy, which is why applications that matter should verify important claims against a trusted source.",
  },

  // ── Production-Grade Prompting, Agents & Tool Use ─────────────────────────
  {
    track: "developer", domain: "Prompt and Context Engineering", section: "Prompt Engineering", difficulty: "Medium", course: PROD, lesson: "Extended Thinking",
    question: "A team needs Claude to work through a hard, multi-step problem and also handles many simple lookups. How should extended thinking be used?",
    options: [
      "Enable it with a reasoning budget sized to the difficulty for the hard problems, and leave simple requests without it",
      "Always enable the largest possible budget for every request",
      "Disable it everywhere, because reasoning only adds cost",
      "Raise the temperature to its maximum so the model explores more options",
    ],
    answer: "A",
    explanation: "Extended thinking lets the model reason before answering, which helps on hard problems but adds latency and cost. Match the budget to the task: give difficult work room to think and keep simple requests fast and cheap. Temperature is a separate sampling control and is not a substitute for reasoning.",
  },

  // ── Accelerators & IP Contribution ────────────────────────────────────────
  {
    track: "developer", domain: "Applications and Integration", section: "Software Engineering Foundations", difficulty: "Medium", course: ACCEL, lesson: "Packaging for Reuse",
    question: "A team built a working Claude integration for one client and wants another team to reuse it on a different project. Which preparation makes reuse most likely to succeed?",
    options: [
      "Separate project-specific settings from the code, document setup and configuration, and include tests and examples",
      "Hard-code the first client's settings so the code is ready to run as it is",
      "Share the finished output only, with no documentation, to protect the work",
      "Rely on the original author being available to explain how it works",
    ],
    answer: "A",
    explanation: "Reuse depends on someone else being able to set the code up and trust it without the author. Keeping settings outside the code, documenting how to configure it, and shipping tests and examples lets another team adapt it safely. Hard-coded values and missing documentation force every user to rediscover how it works.",
  },
  {
    track: "developer", domain: "Applications and Integration", section: "Software Engineering Foundations", difficulty: "Medium", course: ACCEL, lesson: "Contributing Back",
    question: "A developer fixes a bug in an open-source library used in their Claude project and wants the maintainers to accept the fix. What most improves the chance of acceptance?",
    options: [
      "A small, focused change with a clear description, tests that cover it, and respect for the project's contribution guidelines",
      "Bundling the fix with unrelated refactors so the maintainers get more value at once",
      "Submitting the change with no description, since the code speaks for itself",
      "Asking the maintainers to merge it quickly because the developer has a deadline",
    ],
    answer: "A",
    explanation: "Maintainers have to review and support whatever they accept. A narrow change that explains what it fixes, comes with tests and follows the project's guidelines is easy to review and low risk to merge. Mixing in unrelated work or leaving out the explanation makes review harder.",
  },
  {
    track: "developer", domain: "Applications and Integration", section: "Software Engineering Foundations", difficulty: "Hard", course: ACCEL, lesson: "Contributing Back",
    question: "A team wants to publish a reusable component it built during a client engagement. What must be checked first?",
    options: [
      "That the organisation and the client agreements allow the work to be shared, and that it contains no client data or secrets",
      "Only that the code compiles and the tests pass",
      "That the component is large enough to be worth sharing",
      "Nothing, because code written by your own team is always free to publish",
    ],
    answer: "A",
    explanation: "Who owns the work, and what may be shared, is set by agreements and policy, not by who wrote the code. Check those first, and make sure the component carries no client data, credentials or confidential detail. Passing tests or being useful does not give anyone the right to publish it.",
  },
  {
    track: "developer", domain: "Applications and Integration", section: "Understanding Requirements", difficulty: "Medium", course: ACCEL, lesson: "Requirements & Lifecycle",
    question: "A team is about to build a Claude-based feature. Which question belongs in requirements gathering?",
    options: [
      "What does a successful result look like, who will use it, and what limits such as data sensitivity, speed and cost apply?",
      "Which model has the largest context window, whatever the use case?",
      "How soon can it be released before the requirements are agreed?",
      "Which prompt wording looks best in one demonstration?",
    ],
    answer: "A",
    explanation: "Requirements say what the feature must achieve and under what constraints, so that design and testing have something to be measured against. Picking a model, a release date or a demo prompt before the goal and limits are known risks building the wrong thing.",
  },
  {
    track: "developer", domain: "Applications and Integration", section: "Claude Application Design", difficulty: "Medium", course: ACCEL, lesson: "Comparing Platforms",
    question: "A security team requires Claude usage to stay inside the company's existing cloud provider account and governance. What should the team compare?",
    options: [
      "Which platforms offer Claude within that provider, and how their features, pricing and data handling measure up against the requirements",
      "Only which platform has the lowest list price per token, ignoring governance",
      "Which platform the team happened to use on an unrelated project last year",
      "Nothing, because every platform exposes identical Claude features at the same time",
    ],
    answer: "A",
    explanation: "Where Claude runs affects governance, data handling, available features and cost. Start from the requirements, then check what each option offers within the provider you must use. Price alone ignores governance, and platforms do not always offer the same features at the same time.",
  },
  {
    track: "developer", domain: "Applications and Integration", section: "Claude Application Design", difficulty: "Hard", course: ACCEL, lesson: "Comparing Platforms",
    question: "An integration runs on one platform today and may need to move to another later. Which design choice makes a move easiest?",
    options: [
      "Keep platform-specific calls behind a thin internal interface and keep configuration outside the code",
      "Spread platform-specific calls throughout the codebase wherever they are needed",
      "Keep prompts only in each platform's console and nowhere else",
      "Avoid tests, so that nothing is tied to a particular platform",
    ],
    answer: "A",
    explanation: "Isolating the platform-specific parts behind one internal interface, and keeping configuration separate from code, means a move changes a small, known area instead of the whole application. Scattering platform calls or leaving prompts in a console makes every change expensive, and skipping tests only hides the problem.",
  },
];

/** Existing bank questions (ids of the built-in bank) that also fit a lesson, added to that lesson as well. */
export interface ReusedMembership {
  id: number;
  course: string;
  lesson: string;
}
export const REUSED: ReusedMembership[] = [
  { id: 602, course: MSO, lesson: "Prompting Modes" }, // few-shot examples
  { id: 603, course: MSO, lesson: "Prompting Modes" }, // step-by-step reasoning
  { id: 506, course: PROD, lesson: "Extended Thinking" },
  { id: 106, course: EVALS, lesson: "Cost & Orchestration" }, // budget cap on an agent
  { id: 107, course: EVALS, lesson: "Cost & Orchestration" }, // parallel subagent calls
  { id: 510, course: EVALS, lesson: "Cost & Orchestration" }, // estimating monthly cost
  { id: 305, course: ACCEL, lesson: "Packaging for Reuse" }, // packaging a procedure as a Skill
  { id: 401, course: ACCEL, lesson: "Requirements & Lifecycle" }, // success criteria before building
];

/** Every (question id, course, lesson) membership that comes from the built-in bank: mapped lessons plus reused questions. */
export function bankMemberships(): { id: number; course: string; lesson: string }[] {
  return [...LESSON_MAP.flatMap((a) => a.ids.map((id) => ({ id, course: a.course, lesson: a.lesson }))), ...REUSED];
}
