export interface DomainInfo {
  exercise: string;
  relatedTopics: string[];
}

export const domainData: Record<string, DomainInfo> = {
  "LLM Fundamentals": {
    exercise:
      "Build a test harness for a summariser that asserts on key facts and structure rather than exact string match. Run the same prompt ten times at temperature 0 and observe how outputs differ.",
    relatedTopics: [
      "Temperature and sampling",
      "Non-determinism in generation",
      "Eval frameworks for open-ended output",
    ],
  },
  "API Mechanics": {
    exercise:
      "Implement a sliding-window context manager for a multi-turn app. Observe how truncation affects continuity, then add a summarisation step that compresses older turns before they'd overflow.",
    relatedTopics: [
      "Context window management",
      "Streaming and stop reasons",
      "Conversation history patterns",
    ],
  },
  "Model Selection": {
    exercise:
      "Design a routing layer for a mixed-workload app: trivial FAQ calls go to a fast model, complex reasoning calls go to a capable model. Measure cost and latency at each tier.",
    relatedTopics: [
      "Adaptive vs extended thinking",
      "Model tiers and cost-latency tradeoffs",
      "When reasoning adds value",
    ],
  },
  "Cost & Tokens": {
    exercise:
      "Audit a sample app's prompt structure. Identify the stable prefix, move it before dynamic content, enable prompt caching, and compare hit rates before and after.",
    relatedTopics: [
      "Prompt caching mechanics",
      "Token attribution per feature",
      "Cache TTL and prefix ordering",
    ],
  },
  "Configuration Management": {
    exercise:
      "Replace a floating model alias in a staging deployment with a pinned version string. Set up a checklist: run evals → review changelog → update pin → deploy. Track any behaviour changes.",
    relatedTopics: [
      "Model versioning and aliases",
      "Eval-gated upgrade promotion",
      "Production stability patterns",
    ],
  },
  "Output Handling": {
    exercise:
      "Take a prompt that returns prose and constrain it with a JSON schema via the API. Write a validator that rejects malformed output and surfaces the failure to the caller rather than passing it downstream.",
    relatedTopics: [
      "Structured output and JSON schemas",
      "Output validation patterns",
      "Failure surface and error design",
    ],
  },
  "Tools & MCPs": {
    exercise:
      "Write two tools with overlapping purposes. Draft clear descriptions stating what each does AND when NOT to use it. Observe how Claude's tool-selection accuracy improves.",
    relatedTopics: [
      "Tool description best practices",
      "Overlapping tool disambiguation",
      "Schema design for tool inputs",
    ],
  },
  "Agents & Workflows": {
    exercise:
      "Map a three-step business process. Decide whether each step is deterministic (use a workflow) or variable (use an agent). Wire a human checkpoint before any irreversible action.",
    relatedTopics: [
      "Workflow vs agent decision criteria",
      "Human-in-the-loop design",
      "Memory models for multi-turn sessions",
    ],
  },
  "Prompt Engineering": {
    exercise:
      "Take a long conversation where the model's output format has drifted. Add a durable format rule to the system prompt, run the same conversation, and compare output consistency across 20 turns.",
    relatedTopics: [
      "System prompt durability",
      "Format drift and context length",
      "Few-shot vs instruction prompting",
    ],
  },
  "Security & Safety": {
    exercise:
      "Design a trust-boundary diagram for an agent that fetches web pages. Mark each input source as trusted or untrusted, then apply least privilege so the agent has no action it doesn't strictly need.",
    relatedTopics: [
      "Prompt injection and untrusted content",
      "Least-privilege tool scoping",
      "Guardrail layering strategies",
    ],
  },
  Skills: {
    exercise:
      "Write a SKILL.md with a description that matches your team's most common review task. Test it in the Claude Code terminal by triggering the task and verifying the skill loads automatically.",
    relatedTopics: [
      "Skill description matching",
      "settingSources for Agent SDK",
      "Skills in API vs terminal contexts",
    ],
  },
  "MCP Server Development": {
    exercise:
      "Decide the right transport and scope for a tool that your whole org needs. Write the deployment plan: who installs it, how it's configured, and where credentials are managed.",
    relatedTopics: [
      "stdio vs HTTP transport",
      "Local, project, and enterprise scopes",
      "MCP credential management",
    ],
  },
  "Claude Code": {
    exercise:
      "Open an unfamiliar repo in plan mode. Propose changes without executing any edits. Review the plan, identify the riskiest file, and add a manual review gate before that specific write.",
    relatedTopics: [
      "Plan mode and permission postures",
      "bypassPermissions risk management",
      "Headless CI invocation patterns",
    ],
  },
  "Failure Handling": {
    exercise:
      "Map every external call in a feature to retriable or terminal. For each terminal failure, define the user-facing message. Implement a retry policy with exponential backoff for retriable calls.",
    relatedTopics: [
      "Failure taxonomy and retry policy",
      "User-facing error design",
      "Circuit breakers for external dependencies",
    ],
  },
  "System Design": {
    exercise:
      "Write a cost-and-latency section for a design doc. Define the reliability floor, hard cost ceiling, and p95 latency target before choosing the model tier or architecture.",
    relatedTopics: [
      "Cost and latency budgets",
      "Reliability floor and SLA",
      "Pre-architecture constraint setting",
    ],
  },
  "Eval & Debugging": {
    exercise:
      "Build a lightweight eval suite for an existing prompt. Use an LLM-as-judge with explicit criteria, validate against five human-labelled examples, then run the suite on a prompt change.",
    relatedTopics: [
      "LLM-as-judge eval design",
      "Prompt change gating",
      "Trace-based debugging",
    ],
  },
  "Platform Selection": {
    exercise:
      "Given a client's data-residency requirement (e.g. data must stay in AWS us-east-1), map each Claude deployment option — first-party API, Bedrock, Vertex, self-hosted — against the constraint.",
    relatedTopics: [
      "Cloud-native Claude deployment",
      "Data residency and compliance",
      "Bedrock vs Vertex feature parity",
    ],
  },
  Architecture: {
    exercise:
      "Take a hard-coded workflow that breaks on a new input type. Identify the decision point where a human would need judgement. Refactor that step to an agent sub-call while keeping the rest as a deterministic workflow.",
    relatedTopics: [
      "Workflow-to-agent refactoring",
      "Manager/subagent decomposition",
      "Input variability and agent triggers",
    ],
  },
  "Understanding Requirements": {
    exercise:
      "Take a vague stakeholder requirement (e.g. 'the system should be smart'). Translate it into three concrete, testable functional requirements with explicit acceptance criteria.",
    relatedTopics: [
      "Requirement specificity and testability",
      "Acceptance criteria design",
      "Stakeholder-to-engineering translation",
    ],
  },
  "Systems Life Cycle": {
    exercise:
      "Map a shipped Claude feature to each life-cycle phase. Identify which monitoring, cost, and regression checks belong in operate-and-maintain and set up at least one alert that fires on quality degradation.",
    relatedTopics: [
      "Post-launch monitoring",
      "Quality regression detection",
      "Cost and usage trend tracking",
    ],
  },
  "Claude Application Design": {
    exercise:
      "Take one prompt and test it across claude.ai, the API with a system prompt, and a Claude Code terminal. Document where behaviour diverges and explain why each surface wraps the prompt differently.",
    relatedTopics: [
      "Surface-specific context injection",
      "System prompt placement",
      "Cross-surface behaviour consistency",
    ],
  },
  "Model Selection and Tradeoffs": {
    exercise:
      "Profile two tasks in a production-like app: one requiring subtle reasoning, one requiring fast retrieval. Run both on two model tiers and measure cost, latency, and accuracy. Assign each to the right tier.",
    relatedTopics: [
      "Capability vs speed tradeoffs",
      "Task-complexity routing",
      "Cost optimisation without quality loss",
    ],
  },
  "Claude API Mechanics": {
    exercise:
      "Identify one synchronous and one batch-compatible workload in your app. Migrate the batch workload to the Batches API, measure cost reduction, and document the async polling or webhook pattern.",
    relatedTopics: [
      "Batches API for offline workloads",
      "Synchronous vs async API patterns",
      "Streaming for latency-sensitive paths",
    ],
  },
};
