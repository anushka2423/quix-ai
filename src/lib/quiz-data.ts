import type { QuizModule } from "@/types/quiz";

export const modules: QuizModule[] = [
  {
    id: 1,
    title: "MSO Foundations",
    description:
      "Test your grasp of core AI and multi-step orchestration concepts — how agents work, where AI creates product value, and when to apply AI in products.",
    questions: [
      {
        id: 1,
        section: "LLM Fundamentals",
        difficulty: "Medium",
        question:
          "Two runs of the same prompt at temperature 0 return slightly different wording. Which explanation is correct?",
        options: [
          {
            label: "A",
            text: "This is impossible at temperature 0, so one of the two calls must have silently used a different model version or returned a cached response from an earlier request",
          },
          {
            label: "B",
            text: "Sampling can still introduce variation; temperature 0 favours the likeliest tokens but does not hard-guarantee identical output",
          },
          { label: "C", text: "Streaming was left on for one of the calls" },
          {
            label: "D",
            text: "The two calls used different context windows",
          },
        ],
        answer: "B",
      },
      {
        id: 2,
        section: "API Mechanics",
        difficulty: "Medium",
        question:
          "A multi-turn session grows until a request exceeds the context window mid-generation. What happens?",
        options: [
          {
            label: "A",
            text: "The output is truncated and the response carries a context-window-exceeded stop reason",
          },
          {
            label: "B",
            text: "The request is silently accepted and the model drops whichever earlier turns it judges least relevant to make room",
          },
          { label: "C", text: "The window auto-expands for that call" },
          {
            label: "D",
            text: "The call returns a 200 with empty content",
          },
        ],
        answer: "A",
      },
      {
        id: 3,
        section: "Model Selection",
        difficulty: "Medium",
        question:
          "You have many trivial calls and occasional hard ones, and want to pay for deep reasoning only when it helps. Which fits?",
        options: [
          {
            label: "A",
            text: "Extended thinking pinned to maximum effort on every call, so quality is never at risk on the genuinely hard ones",
          },
          { label: "B", text: "Fast mode on every call" },
          {
            label: "C",
            text: "Adaptive thinking, with effort scaled to the task",
          },
          { label: "D", text: "A larger model tier for all calls" },
        ],
        answer: "C",
      },
      {
        id: 4,
        section: "Cost & Tokens",
        difficulty: "Medium",
        question:
          "A large, stable system prompt is sent on every call in a high-volume app. What does prompt caching do, and what is its key limit?",
        options: [
          {
            label: "A",
            text: "It makes all later calls free regardless of what changes in the prompt",
          },
          {
            label: "B",
            text: "It reduces output-token cost specifically",
          },
          { label: "C", text: "It only works in batch mode" },
          {
            label: "D",
            text: "It reuses the stable prefix at reduced cost, but the cache expires and must be refreshed, and only the unchanged prefix benefits",
          },
        ],
        answer: "D",
      },
      {
        id: 5,
        section: "LLM Fundamentals",
        difficulty: "Easy",
        question:
          "A regression test flakes because it compares the model's output to a fixed expected string. Best fix?",
        options: [
          {
            label: "A",
            text: "Assert on the structure or key facts of the output rather than an exact string, since generation is non-deterministic",
          },
          {
            label: "B",
            text: "Pin temperature to 0 and assume output is now byte-identical every run, keeping the exact-string assertion in place",
          },
          { label: "C", text: "Retry the test until it happens to pass" },
          { label: "D", text: "Move the test to the largest model tier" },
        ],
        answer: "A",
      },
      {
        id: 6,
        section: "Model Selection",
        difficulty: "Easy",
        question:
          "A workload is simple and latency-sensitive and does not need step-by-step reasoning. Which setting fits?",
        options: [
          {
            label: "A",
            text: "Turn on maximum-effort extended thinking so even the simple answers are extra reliable",
          },
          {
            label: "B",
            text: "Skip extended thinking, enabling it only where a reasoning pass changes the answer",
          },
          { label: "C", text: "Always route to the largest model" },
          {
            label: "D",
            text: "Pin adaptive thinking to its highest effort permanently",
          },
        ],
        answer: "B",
      },
      {
        id: 7,
        section: "Cost & Tokens",
        difficulty: "Easy",
        question:
          "In a long agent session the same instruction prefix is re-sent every turn. What reduces the repeated input cost?",
        options: [
          {
            label: "A",
            text: "Lowering max_tokens each turn so responses are shorter, which brings the per-turn input cost down",
          },
          { label: "B", text: "Switching the session to batch mode" },
          { label: "C", text: "Adding more few-shot examples" },
          { label: "D", text: "Cache checkpoints on the stable prefix" },
        ],
        answer: "D",
      },
      {
        id: 8,
        section: "LLM Fundamentals",
        difficulty: "Medium",
        question:
          "A CI check re-runs the same summariser twice and asserts the two outputs are byte-identical. It fails at random. Best fix?",
        options: [
          {
            label: "A",
            text: "Assert on structure and key facts instead of an exact match, since generation is non-deterministic",
          },
          {
            label: "B",
            text: "Set temperature to 0 and keep the byte-identical assertion, treating the output as fully reproducible now",
          },
          { label: "C", text: "Loop the check until it passes" },
          {
            label: "D",
            text: "Run the check on the biggest model tier",
          },
        ],
        answer: "A",
      },
      {
        id: 9,
        section: "Model Selection",
        difficulty: "Easy",
        question:
          "A high-volume endpoint answers trivial FAQ-style questions and must feel snappy. Which reasoning setting fits?",
        options: [
          {
            label: "A",
            text: "Run maximum-effort extended thinking everywhere so even trivial answers are extra safe",
          },
          { label: "B", text: "Send every call to the largest model" },
          {
            label: "C",
            text: "Leave extended thinking off, enabling it only where a reasoning pass would change the answer",
          },
          {
            label: "D",
            text: "Keep adaptive thinking pinned to its highest effort at all times",
          },
        ],
        answer: "C",
      },
      {
        id: 10,
        section: "Configuration Management",
        difficulty: "Medium",
        question:
          "A production assistant's behaviour changed overnight with no deploy. The config references the model by a floating alias rather than a dated version string. What happened, and what is the fix?",
        options: [
          {
            label: "A",
            text: "The API silently retrained the model on your traffic; opt out of training in the console",
          },
          {
            label: "B",
            text: "The alias moved to a newer model release; pin a dated version and promote upgrades deliberately after evals",
          },
          {
            label: "C",
            text: "A cache served stale completions; clear the prompt cache",
          },
          {
            label: "D",
            text: "Temperature drifted upward over time; reset it to the configured value",
          },
        ],
        answer: "B",
      },
      {
        id: 11,
        section: "Cost & Tokens",
        difficulty: "Easy",
        question:
          "Finance asks for per-feature Claude spend, but you currently have no numbers at all. What is the first practical step?",
        options: [
          {
            label: "A",
            text: "Read the usage field returned on each API response and record input/output tokens per feature",
          },
          {
            label: "B",
            text: "Estimate from character counts, since tokens are roughly four characters each and the approximation is close enough for accounting",
          },
          {
            label: "C",
            text: "Divide the monthly invoice evenly across features",
          },
          {
            label: "D",
            text: "Enable extended thinking to get more detailed billing",
          },
        ],
        answer: "A",
      },
      {
        id: 12,
        section: "Cost & Tokens",
        difficulty: "Medium",
        question:
          "You enabled prompt caching but the hit rate is near zero. The prompt is assembled as: [today's date] + [user profile] + [20k-token policy manual] + [question]. Why?",
        options: [
          {
            label: "A",
            text: "Caching needs the Batches API and cannot work on synchronous calls",
          },
          {
            label: "B",
            text: "20k tokens exceeds the maximum cacheable prefix size",
          },
          {
            label: "C",
            text: "Caching only applies to output tokens, so input assembly is irrelevant",
          },
          {
            label: "D",
            text: "The dynamic date and profile sit before the manual, so the prefix is never identical between calls; move stable content first and dynamic content after it",
          },
        ],
        answer: "D",
      },
    ],
  },
  {
    id: 2,
    title: "Production-Grade Prompting, Agents and Tool Use",
    description:
      "Test your ability to manage agent context, craft production-grade prompts, scope AI roadmaps, and wire up tools in multi-step agent workflows.",
    questions: [
      {
        id: 1,
        section: "Output Handling",
        difficulty: "Medium",
        question:
          "Prompt-only formatting keeps failing on untested inputs that break your parser. Best next step?",
        options: [
          {
            label: "A",
            text: "Constrain output in the API: JSON schema for the response and strict tool use for arguments",
          },
          {
            label: "B",
            text: "Expand the prompt with an exhaustive set of formatting rules and several reminders, then retry any input whose output fails to parse until it eventually conforms",
          },
          {
            label: "C",
            text: "Lower temperature to 0 and trust the output",
          },
          { label: "D", text: "Switch to a bigger model" },
        ],
        answer: "A",
      },
      {
        id: 2,
        section: "API Mechanics",
        difficulty: "Medium",
        question:
          "When should a streamed turn be written into conversation history?",
        options: [
          {
            label: "A",
            text: "Once the first content_block_start event arrives, so the stored history stays current with the model in real time",
          },
          { label: "B", text: "After the first token" },
          {
            label: "C",
            text: "Whenever the socket closes for any reason",
          },
          { label: "D", text: "Only after message_stop" },
        ],
        answer: "D",
      },
      {
        id: 3,
        section: "Tools & MCPs",
        difficulty: "Medium",
        question:
          "Two tools are both described as retrieving information and Claude often calls the wrong one. Best single fix?",
        options: [
          {
            label: "A",
            text: "Give each tool a richer, strongly-typed input schema with distinctive parameter names so the model has more signal to tell them apart",
          },
          {
            label: "B",
            text: "Add to each description a clear statement of when NOT to use it",
          },
          { label: "C", text: "Delete one of the tools" },
          { label: "D", text: "Increase the model tier" },
        ],
        answer: "B",
      },
      {
        id: 4,
        section: "Agents & Workflows",
        difficulty: "Medium",
        question:
          "You're wiring an agent whose tool can irreversibly modify a customer system. Where does the human checkpoint belong?",
        options: [
          {
            label: "A",
            text: "After the first production write, added once you have watched the agent behave on real traffic and can place the gate precisely",
          },
          { label: "B", text: "Only in the retry handler" },
          {
            label: "C",
            text: "In the design, gating the irreversible action before the loop is built",
          },
          { label: "D", text: "It can be skipped if tests passed" },
        ],
        answer: "C",
      },
      {
        id: 5,
        section: "Agents & Workflows",
        difficulty: "Medium",
        question:
          "Production sessions turn out short and numerous, unlike the long dev sessions, and in-context memory now fails early. Which memory model most likely fits?",
        options: [
          {
            label: "A",
            text: "External storage that persists state across the many short sessions",
          },
          {
            label: "B",
            text: "Keep in-context memory but raise max_tokens each session so history has more room to accumulate before it fails",
          },
          { label: "C", text: "Stateless for every session" },
          { label: "D", text: "Summarised in-context memory" },
        ],
        answer: "A",
      },
      {
        id: 6,
        section: "API Mechanics",
        difficulty: "Medium",
        question:
          "Across a multi-turn exchange using extended thinking, what must happen to thinking blocks?",
        options: [
          {
            label: "A",
            text: "They should be summarised and re-sent so history stays compact while preserving the reasoning for later turns",
          },
          {
            label: "B",
            text: "They must be returned unchanged",
          },
          {
            label: "C",
            text: "They should be deleted before the next call",
          },
          { label: "D", text: "They belong in the system prompt" },
        ],
        answer: "B",
      },
      {
        id: 7,
        section: "Prompt Engineering",
        difficulty: "Easy",
        question:
          "Over a long conversation the model's output format slowly drifts from what you asked. Which technique addresses this failure type?",
        options: [
          {
            label: "A",
            text: "Complete and tighten the system prompt so the format rule is stated durably",
          },
          {
            label: "B",
            text: "Add three few-shot examples of the desired reasoning steps to every user message so the model re-anchors on structure each turn",
          },
          { label: "C", text: "Raise the temperature" },
          { label: "D", text: "Switch models partway through" },
        ],
        answer: "A",
      },
      {
        id: 8,
        section: "Prompt Engineering",
        difficulty: "Easy",
        question:
          "Where do durable role and safety rules hold most reliably against later user turns?",
        options: [
          {
            label: "A",
            text: "Repeated verbatim inside every assistant response, so the model is continually reminded of them throughout the conversation",
          },
          { label: "B", text: "The final user message" },
          { label: "C", text: "The system prompt" },
          { label: "D", text: "A tool result" },
        ],
        answer: "C",
      },
      {
        id: 9,
        section: "Output Handling",
        difficulty: "Medium",
        question:
          "Your parser occasionally breaks on output that is valid JSON but includes a prose preamble. Most robust production handling?",
        options: [
          {
            label: "A",
            text: "Constrain to JSON-only and validate against a schema, repairing or rejecting malformed output before it flows downstream",
          },
          {
            label: "B",
            text: "Set temperature to 0, which removes formatting variation entirely so a preamble can never appear again",
          },
          { label: "C", text: "Trust the output and parse it directly" },
          { label: "D", text: "Increase max_tokens" },
        ],
        answer: "A",
      },
      {
        id: 10,
        section: "Tools & MCPs",
        difficulty: "Easy",
        question:
          "An agent calls a search tool far more often than a create tool, even when creation is intended. Their descriptions overlap. Best first fix?",
        options: [
          {
            label: "A",
            text: "Reorder the tools so the create tool is listed first, since the model tends to prefer whichever tool appears earlier in the list",
          },
          { label: "B", text: "Remove the search tool" },
          { label: "C", text: "Raise the temperature" },
          {
            label: "D",
            text: "Rewrite the descriptions so each states its distinct purpose and when not to use it",
          },
        ],
        answer: "D",
      },
      {
        id: 11,
        section: "Agents & Workflows",
        difficulty: "Easy",
        question:
          "You can write out the exact fixed sequence of steps a task always follows. Which architecture is right, and why?",
        options: [
          {
            label: "A",
            text: "An agent, because agents are more capable and future-proof and you can always constrain it later if the extra latency and cost become a problem",
          },
          {
            label: "B",
            text: "A workflow, because the path is known and coding it avoids the cost and nondeterminism of an agent",
          },
          {
            label: "C",
            text: "A single mega-prompt containing all steps",
          },
          { label: "D", text: "Independent, unordered calls" },
        ],
        answer: "B",
      },
      {
        id: 12,
        section: "Agents & Workflows",
        difficulty: "Medium",
        question:
          "An agent that can issue refunds is going to production, and refunds are irreversible. Correct design choice?",
        options: [
          {
            label: "A",
            text: "A human approval gate before the refund executes, wired in at design time",
          },
          {
            label: "B",
            text: "Detailed logging and alerting, so if a wrong refund goes out the on-call engineer is notified within minutes and can begin the reversal",
          },
          {
            label: "C",
            text: "A low temperature to reduce risky behaviour",
          },
          {
            label: "D",
            text: "A polite system-prompt reminder to be careful",
          },
        ],
        answer: "A",
      },
    ],
  },
  {
    id: 3,
    title: "Claude Code, MCP and Integration",
    description:
      "Evaluate your knowledge of Claude Code, the Model Context Protocol, and integrating external tools and systems into agent workflows.",
    questions: [
      {
        id: 1,
        section: "Security & Safety",
        difficulty: "Medium",
        question:
          "Your settings auto-approve edits. Mid-refactor the agent proposes editing a deployment-config file that several production services read. Where should a human gate sit for this one action?",
        options: [
          {
            label: "A",
            text: "A human reviews and approves this specific change before the write executes, because a wrong value is hard to undo and reaches systems beyond the file",
          },
          {
            label: "B",
            text: "Nowhere; the settings already auto-approve edits",
          },
          {
            label: "C",
            text: "Add bypassPermissions so the agent never pauses",
          },
          {
            label: "D",
            text: "Review it after the write, in the next pull request",
          },
        ],
        answer: "A",
      },
      {
        id: 2,
        section: "Skills",
        difficulty: "Medium",
        question:
          "A developer wants a review-checklist Skill to load when they ask for a review in the Claude Code terminal. What must be configured?",
        options: [
          {
            label: "A",
            text: "Define the agent as an API resource that lists the skill and set the managed-agents beta header on the calls",
          },
          {
            label: "B",
            text: "Send the code-execution and skills beta headers on every request",
          },
          {
            label: "C",
            text: "Place SKILL.md in .claude/skills with a description that matches review requests",
          },
          {
            label: "D",
            text: "Set settingSources explicitly for the Agent SDK",
          },
        ],
        answer: "C",
      },
      {
        id: 3,
        section: "Skills",
        difficulty: "Medium",
        question:
          "A scheduled headless job uses the Agent SDK and expects the Skill to load from the repo. What must be configured?",
        options: [
          {
            label: "A",
            text: "Place SKILL.md in .claude/skills and rely on the terminal default",
          },
          {
            label: "B",
            text: "Enable filesystem sources by setting settingSources explicitly so the agent loads skills from the project, rather than relying on a default, and confirm the current default against the Agent SDK reference",
          },
          {
            label: "C",
            text: "Set the managed-agents beta header",
          },
          {
            label: "D",
            text: "Send the code-execution and skills beta headers",
          },
        ],
        answer: "B",
      },
      {
        id: 4,
        section: "Configuration Management",
        difficulty: "Easy",
        question:
          "A SKILL.md runs on the author's machine but breaks when a teammate clones the repo, because step 1 calls /Users/alexmorgan/projects/deploy-utils/validate.sh. Correct fix?",
        options: [
          {
            label: "A",
            text: "Replace it with another absolute path that points to a shared network drive everyone can reach",
          },
          {
            label: "B",
            text: "Use a home-directory shortcut like ~/projects/deploy-utils/validate.sh",
          },
          {
            label: "C",
            text: "Remove the step so the skill no longer calls an external script",
          },
          {
            label: "D",
            text: "Reference the script from the project root via CLAUDE_PROJECT_DIR so it resolves wherever the repo is cloned",
          },
        ],
        answer: "D",
      },
      {
        id: 5,
        section: "MCP Server Development",
        difficulty: "Medium",
        question:
          "A security-scanning MCP server must be deployed to every developer's Claude Code installation across the org. Which transport and scope fit?",
        options: [
          {
            label: "A",
            text: "HTTP + Enterprise (managed settings)",
          },
          {
            label: "B",
            text: "stdio + Local, installed once on each machine and shared informally so each developer keeps control of their own copy",
          },
          { label: "C", text: "HTTP + Project (.mcp.json)" },
          { label: "D", text: "stdio or HTTP + Local" },
        ],
        answer: "A",
      },
      {
        id: 6,
        section: "Claude Code",
        difficulty: "Easy",
        question:
          "You point Claude Code at an unfamiliar third-party repo you don't fully trust. What permission posture fits the first pass?",
        options: [
          {
            label: "A",
            text: "bypassPermissions, so exploration is fast and uninterrupted, on the reasoning that you'll review everything in the final diff before merging anyway",
          },
          {
            label: "B",
            text: "Approve every file read manually",
          },
          {
            label: "C",
            text: "Read-only plan mode to explore and propose before any edits",
          },
          { label: "D", text: "Disable all tools" },
        ],
        answer: "C",
      },
      {
        id: 7,
        section: "Skills",
        difficulty: "Medium",
        question:
          "A service calls the Messages API and wants a Skill to run as part of the request. What must be configured?",
        options: [
          {
            label: "A",
            text: "Send the code-execution and skills beta headers, and write the skill so its steps don't depend on local files or tools",
          },
          {
            label: "B",
            text: "Place SKILL.md in .claude/skills and let the terminal pick it up",
          },
          {
            label: "C",
            text: "Set settingSources explicitly for the Agent SDK",
          },
          {
            label: "D",
            text: "Set the managed-agents beta header and list the skill on an agent resource",
          },
        ],
        answer: "A",
      },
      {
        id: 8,
        section: "Skills",
        difficulty: "Medium",
        question:
          "A product team wants one Skill to run inside a long-running agent that Anthropic hosts, reachable by an agent ID across sessions. What's required?",
        options: [
          {
            label: "A",
            text: "Place SKILL.md in .claude/skills",
          },
          {
            label: "B",
            text: "Define the agent as an API resource that lists the skill and set the managed-agents beta header, writing the skill to avoid local-file dependencies since it runs in Anthropic's sandbox",
          },
          {
            label: "C",
            text: "Set settingSources explicitly",
          },
          {
            label: "D",
            text: "Send only the code-execution header",
          },
        ],
        answer: "B",
      },
      {
        id: 9,
        section: "Configuration Management",
        difficulty: "Easy",
        question:
          "A plugin's SKILL.md hardcodes a tool at /Users/dev/tools/lint.sh and fails for teammates. Best fix?",
        options: [
          {
            label: "A",
            text: "Point every teammate's machine at a shared network mount at that same absolute path and document the mount in the README",
          },
          {
            label: "B",
            text: "Use a home-directory shortcut like ~/tools/lint.sh",
          },
          {
            label: "C",
            text: "Delete the step so the skill no longer calls the script",
          },
          {
            label: "D",
            text: "Reference it from the project root via CLAUDE_PROJECT_DIR",
          },
        ],
        answer: "D",
      },
      {
        id: 10,
        section: "MCP Server Development",
        difficulty: "Easy",
        question:
          "A local SQLite inspection tool you use only on your own machine. Which transport and scope fit?",
        options: [
          { label: "A", text: "stdio + Local" },
          {
            label: "B",
            text: "HTTP + Enterprise via managed settings, so it is centrally governed and consistently available to you across every environment",
          },
          { label: "C", text: "HTTP + Project (.mcp.json)" },
          { label: "D", text: "HTTP + Local" },
        ],
        answer: "A",
      },
      {
        id: 11,
        section: "Skills",
        difficulty: "Easy",
        question:
          "You wrote a formatting Skill but Claude rarely loads it, even on obviously relevant tasks. First thing to check?",
        options: [
          {
            label: "A",
            text: "The skill's file size, since larger SKILL.md files rank higher in the loader and small ones are skipped",
          },
          {
            label: "B",
            text: "Whether the skill is written in YAML rather than markdown",
          },
          {
            label: "C",
            text: "The skill's description, since Claude loads a skill by matching the description against the task",
          },
          { label: "D", text: "The model's temperature" },
        ],
        answer: "C",
      },
      {
        id: 12,
        section: "Claude Code",
        difficulty: "Medium",
        question:
          "A CI pipeline must run Claude Code on every pull request with no human attached. Which invocation fits?",
        options: [
          {
            label: "A",
            text: "Interactive mode with an expect-script that answers the confirmation prompts the way a human operator would",
          },
          {
            label: "B",
            text: "Headless print mode with the prompt passed non-interactively",
          },
          { label: "C", text: "The desktop app on a virtual display" },
          {
            label: "D",
            text: "Streaming mode in an attached terminal session",
          },
        ],
        answer: "B",
      },
    ],
  },
  {
    id: 4,
    title: "Production Engineering, Evals and Security",
    description:
      "Go deep on AI agent evaluation, KPIs, observability, security guardrails, and the launch criteria that keep production agents reliable.",
    locked: true,
    questions: [
      {
        id: 1,
        section: "Failure Handling",
        difficulty: "Easy",
        question:
          "In the failure-handling section of a design doc, what is the core task?",
        options: [
          {
            label: "A",
            text: "Enumerate the errors production will throw, mark each retriable or terminal, and define the user-facing outcome when recovery fails",
          },
          {
            label: "B",
            text: "Wrap every external call in an automatic retry loop that keeps trying until it succeeds, since most production failures are transient and clear on their own",
          },
          { label: "C", text: "Raise the request timeout" },
          { label: "D", text: "Switch to a larger model for resilience" },
        ],
        answer: "A",
      },
      {
        id: 2,
        section: "System Design",
        difficulty: "Medium",
        question:
          "When should hard cost and latency budgets be set?",
        options: [
          {
            label: "A",
            text: "After the system is built and profiled under real traffic, when you finally have accurate numbers to base the ceilings on",
          },
          { label: "B", text: "Only once costs exceed forecast" },
          { label: "C", text: "At the first incident review" },
          { label: "D", text: "Before the architecture is decided" },
        ],
        answer: "D",
      },
      {
        id: 3,
        section: "Security & Safety",
        difficulty: "Medium",
        question:
          "Naming the trust boundary on paper turns least privilege into something you can…?",
        options: [
          {
            label: "A",
            text: "Guarantee automatically, because documenting the boundary is itself what applies the restriction at runtime across every tool the agent can reach",
          },
          {
            label: "B",
            text: "Enforce with a hook, rather than a setting you remember to add later",
          },
          {
            label: "C",
            text: "Skip, if the model is well-behaved",
          },
          {
            label: "D",
            text: "Defer entirely to the security team",
          },
        ],
        answer: "B",
      },
      {
        id: 4,
        section: "Eval & Debugging",
        difficulty: "Medium",
        question:
          "You must grade thousands of open-ended summaries where exact-match won't work. Sound approach?",
        options: [
          {
            label: "A",
            text: "An LLM-as-judge scoring against explicit criteria, validated against a human-labelled sample",
          },
          {
            label: "B",
            text: "Trust each summary's own stated confidence and grade on that, since the model has the most context on whether it succeeded",
          },
          { label: "C", text: "Exact-string match to a reference" },
          { label: "D", text: "Eyeball a handful and extrapolate" },
        ],
        answer: "A",
      },
      {
        id: 5,
        section: "Eval & Debugging",
        difficulty: "Easy",
        question:
          "An agent returns a wrong answer. What most directly isolates whether the tool, the model, or the orchestration failed?",
        options: [
          {
            label: "A",
            text: "Re-reading the final answer closely to infer from its wording where the reasoning must have gone wrong",
          },
          { label: "B", text: "Rerunning it a few times" },
          { label: "C", text: "A trace of the run" },
          { label: "D", text: "Swapping in a bigger model" },
        ],
        answer: "C",
      },
      {
        id: 6,
        section: "Security & Safety",
        difficulty: "Medium",
        question:
          "An MCP connection trace shows 401 on both the first attempt and the retry, with the credential read as a plaintext value from a file at a known path. Correct fix?",
        options: [
          {
            label: "A",
            text: "Rotate the rejected key so the connection can authenticate, and move the credential out of the file into a runtime environment variable so it is never stored in plaintext again",
          },
          {
            label: "B",
            text: "Rotate the key and write the new value back into the same credentials file, since a fresh key is what the service will accept",
          },
          {
            label: "C",
            text: "Switch this service from API-key auth to OAuth",
          },
          {
            label: "D",
            text: "Add a retry with backoff so a third attempt can succeed",
          },
        ],
        answer: "A",
      },
      {
        id: 7,
        section: "System Design",
        difficulty: "Easy",
        question:
          "In the cost-and-latency section of a design doc, what is the 'reliability floor'?",
        options: [
          {
            label: "A",
            text: "The lowest cost reachable if you are willing to accept as many dropped requests and timeouts as that price requires",
          },
          { label: "B", text: "The cheapest model available" },
          { label: "C", text: "The p99 latency target" },
          {
            label: "D",
            text: "The minimum reliability the design must hold and cannot trade away for cost or speed",
          },
        ],
        answer: "D",
      },
      {
        id: 8,
        section: "Security & Safety",
        difficulty: "Medium",
        question:
          "In the trust-boundary section, which content should be treated as untrusted?",
        options: [
          {
            label: "A",
            text: "Anything the agent reads that someone else can write, such as fetched web pages and tool output",
          },
          {
            label: "B",
            text: "Only text arriving over an unencrypted connection, since transport security is what determines whether input can be trusted",
          },
          { label: "C", text: "The developer's own system prompt" },
          { label: "D", text: "Compiled application constants" },
        ],
        answer: "A",
      },
      {
        id: 9,
        section: "Security & Safety",
        difficulty: "Medium",
        question:
          "A page fetched by a summariser contains hidden text telling the agent to email a file to an external address. Most effective mitigation?",
        options: [
          {
            label: "A",
            text: "Add a system-prompt line telling the model to ignore instructions embedded in fetched pages",
          },
          {
            label: "B",
            text: "Least privilege: the summariser has no email capability, so injected instructions can't reach a send action, and untrusted content is kept separate from instructions",
          },
          {
            label: "C",
            text: "Scan fetched pages for the word 'ignore'",
          },
          { label: "D", text: "Switch to a larger model" },
        ],
        answer: "B",
      },
      {
        id: 10,
        section: "Security & Safety",
        difficulty: "Medium",
        question:
          "Your safety review asks why you have a content policy in the system prompt AND output filtering AND tool-level least privilege. What principle are you applying?",
        options: [
          {
            label: "A",
            text: "Guardrail layering: no single control is relied on, so a bypass of one layer is caught by another",
          },
          {
            label: "B",
            text: "Redundancy for its own sake, which the review should flag as waste since the strongest single control makes the other two unnecessary",
          },
          { label: "C", text: "Defense by obscurity" },
          { label: "D", text: "Compliance theatre required by the auditor" },
        ],
        answer: "A",
      },
      {
        id: 11,
        section: "Eval & Debugging",
        difficulty: "Medium",
        question:
          "A teammate 'slightly improves' the extraction prompt and ships it directly; accuracy quietly drops for a week. What process change prevents this?",
        options: [
          {
            label: "A",
            text: "Restrict prompt edits to senior engineers, whose judgement makes regressions unlikely enough that a formal gate adds little",
          },
          { label: "B", text: "Freeze the prompt permanently" },
          {
            label: "C",
            text: "Run the eval suite on every prompt change and gate the deploy on the results, treating prompts like code",
          },
          {
            label: "D",
            text: "Have the model self-assess whether the new prompt is better",
          },
        ],
        answer: "C",
      },
      {
        id: 12,
        section: "Security & Safety",
        difficulty: "Medium",
        question:
          "You want a guarantee that a specific shell command can never run, no matter what the agent decides mid-session. Which mechanism actually provides a guarantee?",
        options: [
          {
            label: "A",
            text: "A hook that deterministically intercepts and blocks the command before execution",
          },
          {
            label: "B",
            text: "A detailed system-prompt paragraph forbidding that command",
          },
          {
            label: "C",
            text: "Choosing a model known for being cautious",
          },
          {
            label: "D",
            text: "Setting a lower temperature for that session",
          },
        ],
        answer: "A",
      },
    ],
  },
  {
    id: 5,
    title: "Accelerators and IP Contribution",
    description:
      "Master the responsible AI frameworks, contribution patterns, and org structures needed to accelerate AI adoption and build lasting intellectual property.",
    locked: true,
    questions: [
      {
        id: 1,
        section: "Platform Selection",
        difficulty: "Medium",
        question:
          "A regulated client requires that data never leave their existing cloud. How should this drive platform choice?",
        options: [
          {
            label: "A",
            text: "Default to the first-party API, since it is always cheapest and gets new models first, then layer network controls on top to satisfy the auditors",
          },
          {
            label: "B",
            text: "Only local self-hosting can ever be compliant",
          },
          {
            label: "C",
            text: "Run on the provider (Bedrock or Vertex) that keeps data inside the client's cloud and compliance boundary",
          },
          {
            label: "D",
            text: "Pick whichever platform has the newest model",
          },
        ],
        answer: "C",
      },
      {
        id: 2,
        section: "Platform Selection",
        difficulty: "Easy",
        question:
          "Your team already runs everything on AWS and needs Claude in the same account for governance. How should that shape platform choice?",
        options: [
          {
            label: "A",
            text: "Use Amazon Bedrock so Claude runs within the existing AWS governance and data boundary",
          },
          {
            label: "B",
            text: "Use the first-party API and rebuild your governance tooling around it, since staying on one vendor's native platform is worth the migration regardless of where your data lives today",
          },
          {
            label: "C",
            text: "Self-host only, as that is the sole compliant option",
          },
          {
            label: "D",
            text: "Pick whichever platform shipped the newest model",
          },
        ],
        answer: "A",
      },
      {
        id: 3,
        section: "Platform Selection",
        difficulty: "Easy",
        question:
          "A client mandates that all data stay inside their existing Google Cloud organisation. How should that shape platform choice?",
        options: [
          {
            label: "A",
            text: "Use the first-party API and recreate the client's governance controls around it",
          },
          {
            label: "B",
            text: "Insist on self-hosting as the only compliant path",
          },
          {
            label: "C",
            text: "Choose whichever platform released the newest model",
          },
          {
            label: "D",
            text: "Run Claude through Google Vertex AI so it stays within the client's cloud and governance boundary",
          },
        ],
        answer: "D",
      },
      {
        id: 4,
        section: "Architecture",
        difficulty: "Medium",
        question:
          "A hard-coded five-step workflow handles invoices, but a new supplier's invoices arrive in unpredictable formats and the workflow breaks on them. What does this signal architecturally?",
        options: [
          {
            label: "A",
            text: "Inputs now fall outside the codeable path, so the variable part warrants an agent that can decide steps at runtime",
          },
          {
            label: "B",
            text: "The workflow needs more steps: enumerate every supplier format as its own branch and add a branch each time a new one appears",
          },
          { label: "C", text: "The model tier is too small" },
          {
            label: "D",
            text: "The workflow should be replaced by a single large prompt",
          },
        ],
        answer: "A",
      },
      {
        id: 5,
        section: "Architecture",
        difficulty: "Easy",
        question:
          "In a manager/supervisor hierarchy, what is the manager's job?",
        options: [
          {
            label: "A",
            text: "Decompose the goal, delegate subtasks to specialised subagents, and integrate their results",
          },
          {
            label: "B",
            text: "Execute every subtask itself while the subagents observe and provide feedback on its work at each step",
          },
          {
            label: "C",
            text: "Enforce the API rate limits across the team of agents",
          },
          { label: "D", text: "Cache the subagents' prompts" },
        ],
        answer: "A",
      },
      {
        id: 6,
        section: "Understanding Requirements",
        difficulty: "Easy",
        question:
          "A stakeholder says 'the bot should understand customer intent.' Before building anything, what is the right next step?",
        options: [
          {
            label: "A",
            text: "Start building immediately and let the model's general capability handle whatever 'intent' turns out to mean",
          },
          {
            label: "B",
            text: "Pick the largest model so intent understanding is as strong as possible regardless of scope",
          },
          {
            label: "C",
            text: "Translate this into concrete functional requirements: which intents, what fields to extract, and what counts as a correct classification",
          },
          {
            label: "D",
            text: "Write the system prompt first and derive requirements from what it ends up doing",
          },
        ],
        answer: "C",
      },
      {
        id: 7,
        section: "Systems Life Cycle",
        difficulty: "Easy",
        question:
          "A Claude feature has shipped and is live. Which activity belongs to the operate-and-maintain phase of the life cycle, not an earlier phase?",
        options: [
          {
            label: "A",
            text: "Monitoring production quality and cost, and triaging regressions as the model or usage pattern shifts",
          },
          { label: "B", text: "Writing the initial functional requirements" },
          {
            label: "C",
            text: "Selecting which model tier to prototype with",
          },
          {
            label: "D",
            text: "Designing the eval suite for the first release",
          },
        ],
        answer: "A",
      },
      {
        id: 8,
        section: "Claude Application Design",
        difficulty: "Medium",
        question:
          "The same feature must work inside claude.ai, through the API, and inside Claude Code. A teammate assumes one well-written prompt will behave identically everywhere. What's the flaw?",
        options: [
          {
            label: "A",
            text: "There is no flaw; a single prompt is guaranteed to behave identically across every interface",
          },
          { label: "B", text: "Only the API supports system prompts" },
          { label: "C", text: "Claude Code ignores system prompts entirely" },
          {
            label: "D",
            text: "Each surface wraps the prompt in different default context and instruction placement, so identical wording can still behave differently across them",
          },
        ],
        answer: "D",
      },
      {
        id: 9,
        section: "Model Selection and Tradeoffs",
        difficulty: "Medium",
        question:
          "A legal-document summarizer must catch subtle contractual nuance, and an internal wiki search bot just needs to find the right page fast. How should tiers differ?",
        options: [
          {
            label: "A",
            text: "Use the same tier for both, since consistency across features matters more than matching capability to task difficulty",
          },
          {
            label: "B",
            text: "Use a higher-capability tier for the nuanced legal task and a faster, cheaper tier for the simpler retrieval-style task",
          },
          {
            label: "C",
            text: "Use the cheapest tier for both to control cost uniformly",
          },
          {
            label: "D",
            text: "Use the highest tier for both to avoid any risk of missing something",
          },
        ],
        answer: "B",
      },
      {
        id: 10,
        section: "Architecture",
        difficulty: "Medium",
        question:
          "A capability is purely a set of written instructions and reference examples for how to format a specific report, used only within Claude Code by one team, with no external system to call. Which approach fits, and why not an MCP server?",
        options: [
          {
            label: "A",
            text: "A Skill; there is no external capability or live system to expose, so a server would add operational overhead for no benefit",
          },
          {
            label: "B",
            text: "An MCP server, because any reusable capability should default to a server regardless of whether it calls anything external",
          },
          {
            label: "C",
            text: "A custom tool, since tools are the default choice whenever multiple people will use something",
          },
          {
            label: "D",
            text: "Hard-coded into CLAUDE.md with no other structure, since it's team-specific",
          },
        ],
        answer: "A",
      },
      {
        id: 11,
        section: "Claude API Mechanics",
        difficulty: "Medium",
        question:
          "A moderation feature must flag live chat messages in under a second, and separately re-score the entire message archive once a month for a compliance report. How should these two needs be split?",
        options: [
          {
            label: "A",
            text: "Batches API for both, since consolidating everything onto one API path simplifies the codebase",
          },
          {
            label: "B",
            text: "Synchronous calls for both, accepting the higher cost on the monthly re-score to avoid maintaining two code paths",
          },
          {
            label: "C",
            text: "Synchronous calls for live moderation; the Batches API for the monthly archive re-score",
          },
          {
            label: "D",
            text: "Streaming for the monthly re-score, since streaming is the cheapest option regardless of urgency",
          },
        ],
        answer: "C",
      },
      {
        id: 12,
        section: "Understanding Requirements",
        difficulty: "Easy",
        question:
          "A requirement states 'the system must respond quickly.' What is missing that would make this usable for design and testing?",
        options: [
          {
            label: "A",
            text: "Nothing; 'quickly' is specific enough to design and test against directly",
          },
          {
            label: "B",
            text: "A list of every possible future feature the system might ever need",
          },
          {
            label: "C",
            text: "The name of the engineer responsible for writing the code",
          },
          {
            label: "D",
            text: "A concrete, measurable target, such as a specific latency percentile under a specific load, so it can be checked objectively",
          },
        ],
        answer: "D",
      },
    ],
  },
];
