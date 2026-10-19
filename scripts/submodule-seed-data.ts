import type { TrackId } from "../src/types/quiz";

/**
 * Starting content for submodules, Skill Jar links and demo quizzes. It is only the seed: once loaded, the
 * database is the source of truth and the admin edits everything. Used by scripts/generate-submodule-seed-sql.ts.
 */

const SKILLJAR_PATH_BASE = "https://anthropic-partners.skilljar.com/path";
const PATH_SLUG: Record<TrackId, string> = {
  associate: "claude-certified-associate-foundations",
  developer: "claude-certified-developer-foundations",
};

/** A submodule is a Skill Jar course of the track's exam-prep path. A course can sit under several domains. */
export interface SubmoduleSeed {
  track: TrackId;
  domain: string;
  title: string;
  /** Course slug on Skill Jar; the course URL is <base>/<exam-prep path>/<slug> */
  slug: string;
}

export const courseUrl = (s: Pick<SubmoduleSeed, "track" | "slug">) => `${SKILLJAR_PATH_BASE}/${PATH_SLUG[s.track]}/${s.slug}`;

const A = (domain: string, title: string, slug: string): SubmoduleSeed => ({ track: "associate", domain, title, slug });
const D = (domain: string, title: string, slug: string): SubmoduleSeed => ({ track: "developer", domain, title, slug });

const PROD_PAIR = ["Production-Grade Prompting, Agents & Tool Use", "production-grade-prompting-agents-tool-use"] as const;
const CODE = ["Claude Code, MCP & Integration", "claude-code-mcp-integration"] as const;
const EVALS = ["Production Engineering, Evals & Security", "production-engineering-evals-security"] as const;

/** Array order is the display order within a domain. */
export const SUBMODULES: SubmoduleSeed[] = [
  A("Product and Model Selection", "Claude Platform & Model Foundations", "claude-platform-model-foundations"),
  A("Prompting and Task Execution", "Prompting & Task Execution", "prompting-task-execution"),
  A("Output Evaluation and Validation", "Evaluating & Validating Claude's Output", "evaluating-validating-claudes-output"),
  A("Workflow Integration and Solution Design", "Workflow Integration & Solution Design", "workflow-integration-solution-design"),
  A("Configuration and Knowledge Management", "Configuration & Knowledge Management", "configuration-knowledge-management"),
  A("Governance, Risk, and Responsible Use", "Governance, Risk & Responsible Use", "governance-risk-responsible-use"),
  A("Troubleshooting and Optimization", "Troubleshooting & Optimization", "troubleshooting-optimization"),

  D("Model Selection and Optimization", "MSO Foundations", "mso-foundations"),
  D("Prompt and Context Engineering", ...PROD_PAIR),
  D("Agents and Workflows", ...PROD_PAIR),
  D("Tools and MCPs", ...PROD_PAIR),
  D("Tools and MCPs", ...CODE),
  D("Claude Code", ...CODE),
  D("Applications and Integration", ...PROD_PAIR),
  D("Applications and Integration", "Accelerators & IP Contribution", "accelerators-ip-contribution"),
  D("Security and Safety", ...EVALS),
  D("Eval, Testing, and Debugging", ...EVALS),
];

/** Fixed demo: 5 question ids of the built-in bank per domain, in the order they are shown (easy to hard). */
export const DEMO_PICKS: { track: TrackId; domain: string; ids: number[] }[] = [
  { track: "associate", domain: "Prompting and Task Execution", ids: [1001, 1003, 1002, 1034, 1032] },
  { track: "associate", domain: "Output Evaluation and Validation", ids: [1037, 1005, 1006, 1010, 1007] },
  { track: "associate", domain: "Product and Model Selection", ids: [1011, 1012, 1014, 1042, 1013] },
  { track: "associate", domain: "Workflow Integration and Solution Design", ids: [1045, 1016, 1049, 1018, 1017] },
  { track: "associate", domain: "Configuration and Knowledge Management", ids: [1020, 1022, 1021, 1052, 1051] },
  { track: "associate", domain: "Governance, Risk, and Responsible Use", ids: [1054, 1053, 1026, 1057, 1027] },
  { track: "associate", domain: "Troubleshooting and Optimization", ids: [1059, 1028, 1029, 1030, 1058] },
  { track: "developer", domain: "Applications and Integration", ids: [201, 210, 202, 208, 206] },
  { track: "developer", domain: "Model Selection and Optimization", ids: [501, 507, 508, 502, 511] },
  { track: "developer", domain: "Agents and Workflows", ids: [110, 102, 107, 109, 106] },
  { track: "developer", domain: "Prompt and Context Engineering", ids: [601, 606, 602, 609, 608] },
  { track: "developer", domain: "Tools and MCPs", ids: [803, 801, 802, 811, 808] },
  { track: "developer", domain: "Security and Safety", ids: [705, 702, 703, 709, 701] },
  { track: "developer", domain: "Claude Code", ids: [301, 305, 307, 306, 312] },
  { track: "developer", domain: "Eval, Testing, and Debugging", ids: [401, 402, 407, 403, 411] },
];

/**
 * Which submodule each existing question starts in. Domains with one submodule put every question there.
 * Where a domain has two, the listed sub-skills (a question's `section`) go to the second course and
 * everything else to the first. A starting guess: the admin can reassign any question.
 */
export const SECTION_OVERRIDES: { track: TrackId; domain: string; sections: string[]; submodule: string }[] = [
  { track: "developer", domain: "Tools and MCPs", sections: ["MCP Server Development"], submodule: CODE[0] },
  { track: "developer", domain: "Applications and Integration", sections: ["Configuration Management"], submodule: "Accelerators & IP Contribution" },
];

/**
 * Order of the practice-by-module list: the Skill Jar exam-prep path order of each track. Every submodule title must
 * appear here once. Used for the position of each module (1 = first).
 */
export const COURSE_ORDER: Record<TrackId, string[]> = {
  associate: [
    "Claude Platform & Model Foundations",
    "Prompting & Task Execution",
    "Evaluating & Validating Claude's Output",
    "Workflow Integration & Solution Design",
    "Configuration & Knowledge Management",
    "Governance, Risk & Responsible Use",
    "Troubleshooting & Optimization",
  ],
  developer: [
    "MSO Foundations",
    "Production-Grade Prompting, Agents & Tool Use",
    "Claude Code, MCP & Integration",
    "Production Engineering, Evals & Security",
    "Accelerators & IP Contribution",
  ],
};

/**
 * One-line description of each course, shown on its module card. Short summaries in our own words (the admin can
 * replace any of them in the submodule's Description field). Keyed by submodule title.
 */
export const DESCRIPTIONS: Record<string, string> = {
  "Claude Platform & Model Foundations": "Which entry point, features, model and amount of context to use in a Claude session.",
  "Prompting & Task Execution": "A reusable structure for writing prompts that get clear, usable results.",
  "Evaluating & Validating Claude's Output": "How to check Claude's answers for accuracy before you rely on them in your own work.",
  "Workflow Integration & Solution Design": "Deciding which workflow steps go to Claude and which stay with people.",
  "Configuration & Knowledge Management": "Setting up Claude's context and instructions once so later conversations start well-informed.",
  "Governance, Risk & Responsible Use": "Deciding which uses of Claude are appropriate and low-risk.",
  "Troubleshooting & Optimization": "Working out why a response disappoints and what to change.",
  "MSO Foundations": "Core model and technical concepts that the later Developer courses depend on.",
  "Production-Grade Prompting, Agents & Tool Use": "Writing dependable prompts, wiring up tools and managing context in a first real Claude integration.",
  "Claude Code, MCP & Integration": "Configuring and sharing a Claude integration, and connecting it safely to live systems.",
  "Production Engineering, Evals & Security": "Testing an agent under real-world load, and checking its quality and security.",
  "Accelerators & IP Contribution": "Getting a finished build ready to be reused, reviewed and deployed elsewhere.",
};

// ── Lessons inside each course, and which lesson each question belongs to ───────────────────────────────────────

/**
 * The teaching lessons of each course (introductions, exercises, quizzes and wrap-ups left out), read from the
 * course tables of contents. Lessons have no web address of their own, so each links to its course.
 */
export const LESSONS: Record<string, string[]> = {
  "Claude Platform & Model Foundations": ["How Claude Behaves", "Core Entry Points", "Capability Layer", "Choosing Models", "Context Management"],
  "Prompting & Task Execution": ["Anatomy of an Effective Prompt", "Task Decomposition", "Iterating to Improve Output", "Adapting Strategy by Task Type"],
  "Evaluating & Validating Claude's Output": [
    "Discernment: Accuracy & Completeness", "Hallucinations, Inconsistencies & Bias", "Fact-Checking & Grounding",
    "Diligence: When Review Is Non-Negotiable", "Editing & Adapting for Audience", "Choosing Output Formats",
  ],
  "Workflow Integration & Solution Design": [
    "Analyzing Requirements & Use Cases", "Research, Planning & Process Optimization", "Solution Design, Development & Iteration",
    "Delegation Mapping", "Communicating Value & Limitations",
  ],
  "Configuration & Knowledge Management": ["Configuring Projects", "Connectors & Uploaded Knowledge", "System-Level Instructions That Stick", "Maintaining Configurations"],
  "Governance, Risk & Responsible Use": [
    "Appropriate vs Inappropriate Use Cases", "Skill Trust & Feature-Level Risk", "Data Sensitivity, Privacy & Feature Controls",
    "Organizational Policies & Diligence", "Ethical Implications",
  ],
  "Troubleshooting & Optimization": ["Diagnosing Underperforming Prompts & Outputs", "Adjusting Approach from Feedback", "Optimizing Workflows"],
  "MSO Foundations": ["How LLMs Behave", "Models & Reasoning", "Prompting Modes", "Technical Substrate"],
  "Production-Grade Prompting, Agents & Tool Use": [
    "Prompting Craft", "Extended Thinking", "Tool-use and Schema Design", "Streaming Responses", "Context Engineering",
    "Agent Construction", "Agent Memory", "Multimodal and Batch Ingestion",
  ],
  "Claude Code, MCP & Integration": ["Permission Modes & Human Gates", "Durable Project Context", "Packaging Workflows", "MCP Servers", "Enterprise Integration"],
  "Production Engineering, Evals & Security": ["Evals & Judges", "Testing & Tracing", "Failure Handling & Model Selection", "Cost & Orchestration", "Security"],
  "Accelerators & IP Contribution": ["Packaging for Reuse", "Contributing Back", "Requirements & Lifecycle", "Deployment & Versioning", "Comparing Platforms", "Trust Boundaries"],
};

/** Questions (ids of the built-in bank) that belong to a lesson. A question not listed keeps its course-level link. */
export interface LessonAssignment {
  course: string;
  lesson: string;
  ids: number[];
}

const L = (course: string, lesson: string, ids: number[]): LessonAssignment => ({ course, lesson, ids });
const PLAT = "Claude Platform & Model Foundations";
const PROMPTING = "Prompting & Task Execution";
const EVALUATING = "Evaluating & Validating Claude's Output";
const WORKFLOW = "Workflow Integration & Solution Design";
const CONFIG = "Configuration & Knowledge Management";
const GOV = "Governance, Risk & Responsible Use";
const TROUBLE = "Troubleshooting & Optimization";
const MSO = "MSO Foundations";
const PROD = PROD_PAIR[0];
const ACCEL = "Accelerators & IP Contribution";

export const LESSON_MAP: LessonAssignment[] = [
  L(PLAT, "Choosing Models", [1011, 1012, 1042]),
  L(PLAT, "Context Management", [1013, 1044]),
  L(PLAT, "Capability Layer", [1014, 1043]),
  L(PROMPTING, "Anatomy of an Effective Prompt", [1001, 1031]),
  L(PROMPTING, "Task Decomposition", [1002, 1032]),
  L(PROMPTING, "Iterating to Improve Output", [1003, 1033]),
  L(PROMPTING, "Adapting Strategy by Task Type", [1004, 1034]),
  L(EVALUATING, "Discernment: Accuracy & Completeness", [1008, 1037]),
  L(EVALUATING, "Hallucinations, Inconsistencies & Bias", [1006, 1035, 1041]),
  L(EVALUATING, "Fact-Checking & Grounding", [1005, 1036]),
  L(EVALUATING, "Diligence: When Review Is Non-Negotiable", [1007, 1038]),
  L(EVALUATING, "Editing & Adapting for Audience", [1009, 1039]),
  L(EVALUATING, "Choosing Output Formats", [1010, 1040]),
  L(WORKFLOW, "Analyzing Requirements & Use Cases", [1015, 1045]),
  L(WORKFLOW, "Research, Planning & Process Optimization", [1018, 1048]),
  L(WORKFLOW, "Solution Design, Development & Iteration", [1019, 1049]),
  L(WORKFLOW, "Delegation Mapping", [1016, 1046]),
  L(WORKFLOW, "Communicating Value & Limitations", [1017, 1047]),
  L(CONFIG, "Configuring Projects", [1020]),
  L(CONFIG, "Connectors & Uploaded Knowledge", [1022, 1050]),
  L(CONFIG, "System-Level Instructions That Stick", [1021, 1051]),
  L(CONFIG, "Maintaining Configurations", [1023, 1052]),
  L(GOV, "Appropriate vs Inappropriate Use Cases", [1025, 1054, 1057]),
  L(GOV, "Data Sensitivity, Privacy & Feature Controls", [1024, 1053]),
  L(GOV, "Organizational Policies & Diligence", [1026, 1055]),
  L(GOV, "Ethical Implications", [1027, 1056]),
  L(TROUBLE, "Diagnosing Underperforming Prompts & Outputs", [1028, 1058]),
  L(TROUBLE, "Adjusting Approach from Feedback", [1029, 1059]),
  L(TROUBLE, "Optimizing Workflows", [1030, 1060]),

  L(MSO, "Models & Reasoning", [501, 506, 509, 512]),
  L(MSO, "Technical Substrate", [502, 503, 504, 505, 507, 508, 510, 511]),
  L(PROD, "Prompting Craft", [601, 602, 603, 604, 606, 607, 608, 610, 611, 612]),
  L(PROD, "Context Engineering", [605, 609, 208]),
  L(PROD, "Tool-use and Schema Design", [801, 802, 806, 807, 808, 812]),
  L(PROD, "Streaming Responses", [203]),
  L(PROD, "Multimodal and Batch Ingestion", [204]),
  L(PROD, "Agent Construction", [101, 102, 103, 106, 107, 108, 109, 110, 112]),
  L(PROD, "Agent Memory", [104, 105, 111]),
  L(CODE[0], "Permission Modes & Human Gates", [302, 308, 312]),
  L(CODE[0], "Durable Project Context", [301, 303, 304, 311]),
  L(CODE[0], "Packaging Workflows", [305, 306]),
  L(CODE[0], "MCP Servers", [307, 803, 804, 805, 809, 811]),
  L(CODE[0], "Enterprise Integration", [309, 310]),
  L(EVALS[0], "Evals & Judges", [401, 402, 403, 407, 408, 409]),
  L(EVALS[0], "Testing & Tracing", [404, 405, 412]),
  L(EVALS[0], "Failure Handling & Model Selection", [406, 410, 411]),
  L(EVALS[0], "Security", [701, 703, 704, 705, 706, 707, 709, 710, 711, 712]),
  L(ACCEL, "Deployment & Versioning", [210, 211, 810]),
  L(ACCEL, "Trust Boundaries", [702, 708]),
];

/**
 * Questions that belong to the Accelerators course by lesson, though their domain's default course is another. The
 * course needs a submodule row under each of these domains. Together with the two questions it already has, this
 * gives Accelerators & IP Contribution 5 questions, so its module session is a full 5.
 */
export const EXTRA_SUBMODULES: SubmoduleSeed[] = [
  D("Tools and MCPs", ACCEL, "accelerators-ip-contribution"),
  D("Security and Safety", ACCEL, "accelerators-ip-contribution"),
];
export const ACCELERATOR_MOVES: { track: TrackId; domain: string; ids: number[] }[] = [
  { track: "developer", domain: "Tools and MCPs", ids: [810] },
  { track: "developer", domain: "Security and Safety", ids: [702, 708] },
];
