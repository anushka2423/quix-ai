# Quiz Questions — All Modules

All 45 questions across 3 quizzes. Correct answer marked with ✓.

---

## Module 1 Quiz — MSO Foundations

> Tokens, context windows, sampling controls, SDK, streaming & batching.
> 60 seconds per question · 100 pts for correct · 0 for incorrect/unanswered

---

### Section 1: Tokens & Context

**Q1.** What is the unit in which Claude reads text, and in which the API bills and measures the context window?

- A. Characters
- B. Words
- C. Sentences
- **D. Tokens ✓**

---

**Q2.** Which of these counts toward the context window of a single request?

- A. Only the user's latest message
- **B. The system prompt, conversation history, injected documents, tool results, and the model's output ✓**
- C. Only the input, because output tokens are tracked separately
- D. Only the system prompt and tool definitions

---

**Q3.** A request's input is already larger than the model's context window. What happens?

- **A. The request is rejected with a validation error before generation begins ✓**
- B. The oldest content is silently truncated and generation proceeds
- C. The model generates a partial answer and stops
- D. The API automatically summarizes the input

---

**Q4.** On current models, a request fits on input but reaches the context ceiling during generation. What do you get?

- A. An error, and no output
- B. The model restarts generation from the beginning with a shorter answer
- **C. The output generated so far, with a model_context_window_exceeded stop reason ✓**
- D. The oldest part of the output is dropped

---

**Q5.** What does lowering temperature do?

- A. It makes the model reason longer before answering
- B. It limits the number of tokens in the response
- C. It guarantees the same output every time
- **D. It concentrates probability on the most likely tokens, making output more repeatable ✓**

---

### Section 2: Sampling & Models

**Q6.** You run the same prompt twice and get two differently worded answers that are both correct. What is this called, and why does it happen?

- A. A bug; the model has a memory leak between calls
- B. Hallucination; one of the two answers must be wrong
- **C. Non-determinism; the model samples the next token from a probability distribution ✓**
- D. Caching; the first answer was stored and the second was recomputed

---

**Q7.** What is the right way to test a Claude-powered feature whose wording varies from run to run?

- **A. Assert on properties that must hold (field present, value in range, output parses), and use a model-graded eval to judge meaning ✓**
- B. Assert that the response text exactly equals a stored string
- C. Set temperature to 0 and then use exact-match assertions
- D. Don't test it; LLM output can't be tested

---

**Q8.** Which statement about sampling controls is correct?

- A. Every Claude model accepts temperature, top_p and top_k
- B. Temperature 0 guarantees identical outputs across calls
- C. Sampling controls only affect the length of the response
- **D. The newest Claude models reject non-default temperature, top_p or top_k with a 400 error, so you steer behavior through prompting ✓**

---

**Q9.** What is the recommended default model choice and how do you move away from it?

- A. Always start with the most capable tier to be safe
- **B. Start with Sonnet; move up a tier only when an eval shows it misses your quality bar, and down to Haiku only when an eval shows the drop is acceptable ✓**
- C. Start with Haiku for everything and upgrade when users complain
- D. Choose based on which model has the largest context window

---

**Q10.** How do model choice and reasoning mode relate?

- A. They are the same setting
- B. Enabling reasoning automatically selects a larger model
- C. Reasoning mode can only be used with the smallest tier
- **D. They are independent levers: you pick the model family member, and configure reasoning per request ✓**

---

### Section 3: SDK, Streaming & Batching

**Q11.** On current models, how do you tune how deeply the model thinks?

- A. Set a fixed budget_tokens value on every request
- **B. Use adaptive thinking and tune depth with the effort setting; budget_tokens is deprecated and errors on the newest models ✓**
- C. Increase max_tokens until the model thinks more
- D. Repeat the prompt several times in the same message

---

**Q12.** A task has a specific output structure, casing, or edge case that a written description keeps missing. Which prompting mode is the best next step?

- **A. One-shot or multi-shot: add one or two correct examples, keeping the prompt as small as possible ✓**
- B. Zero-shot with a longer description
- C. Fine-tune the model on the examples
- D. Add as many examples as will fit in the context window

---

**Q13.** How do the official Claude SDKs relate to the raw REST API?

- A. The SDK uses a different, faster model
- **B. The SDK is a thin convenience layer over the same REST API and the same model, handling auth, request building, retries and parsing ✓**
- C. The SDK is required; the REST API cannot be called directly
- D. REST is only for streaming and the SDK is only for synchronous calls

---

**Q14.** When is streaming the right choice over a synchronous request?

- A. For short backend jobs where no one is waiting
- B. When you want to reduce the per-token price
- **C. When a response is long or a user is watching, so output can appear immediately instead of after a blank-screen wait ✓**
- D. When you need exactly the same output on every run

---

**Q15.** You need to classify 50,000 records overnight and nobody is waiting on any individual result. Which pattern fits best?

- **A. The Message Batches API: submit many requests in one call, poll for completion, accept up to 24 h of latency for a lower per-token cost ✓**
- B. A loop of synchronous calls
- C. AsyncAnthropic with thousands of concurrent requests
- D. Streaming each response

---

## Module 2 Quiz — Production-Grade Prompting, Agents & Tool Use

> Structured outputs, tool-use loops, agent design, context management, and advanced patterns.
> 60 seconds per question · 100 pts for correct · 0 for incorrect/unanswered

---

### Section 1: Structured Outputs & Tool Use

**Q1.** A ticket classifier returns "Billing", "billing", or "This looks like a billing issue" on different runs, and the router breaks. What is the prompt missing, and what is the right fix?

- A. A longer description of each category
- **B. An output constraint: exactly one label from a fixed set, nothing else, ideally with few-shot examples showing the format ✓**
- C. Extended thinking at high effort
- D. A higher max_tokens value

---

**Q2.** What do structured outputs (output_config.format with a JSON schema) give you that a prompt instruction does not?

- A. A guarantee that the response is always correct
- B. Lower latency on the first request with any new schema
- C. Compatibility with message prefilling
- **D. Constrained decoding: the API only allows tokens that keep the output valid against your schema (you still check stop_reason for refusals and truncation) ✓**

---

**Q3.** Extended thinking is on and you use tools. What must you do with the thinking blocks Claude returns?

- **A. Send them back to the API exactly as received (signature intact), including redacted ones ✓**
- B. Strip them out of history to save context
- C. Summarize them before the next turn
- D. Convert them into text blocks

---

**Q4.** In a tool-use loop, which rule about tool_use and tool_result blocks is correct?

- A. Claude executes your tools and returns the results to you
- B. Results can be sent in any later turn as long as the order is preserved
- C. tool_result blocks go in the assistant role
- **D. Every tool_use block must be answered by a tool_result with the same id in the immediately following user turn ✓**

---

**Q5.** Claude keeps calling search_docs when the answer is already in context. Both tool descriptions say "Use this to find information." What is the most targeted fix?

- **A. Add an exclusion condition to each description naming when not to call it ✓**
- B. Rename the tools
- C. Mark every parameter as required
- D. Add more tools so Claude has more options

---

### Section 2: Agents & Context Management

**Q6.** When handling a streamed response, which approach is correct?

- A. Parse a tool_use block's input as soon as the first delta arrives
- **B. Act on a block only after content_block_stop, append the turn only after message_stop, and discard the partial turn if the stream is interrupted ✓**
- C. Append the assistant turn to history whenever the read loop ends
- D. Keep partial blocks in history so the next request can continue them

---

**Q7.** An agent selects the right tool for the first four turns, then starts picking wrong tools and giving incomplete answers at turn 8. Tool outputs in production are 3–5× longer than in testing. What is the most likely cause?

- A. A bug in the tool schemas
- B. The model's quality degrades after eight turns
- **C. The context window (budget) is filling with accumulated tool results, crowding out instructions ✓**
- D. Streaming was left on

---

**Q8.** You write a manual compaction step. Which summarizer instruction best preserves task continuity?

- A. "Summarize the conversation so far."
- **B. "Summarize the conversation, preserving all file paths modified, all decisions made, and any errors encountered and how they were resolved." ✓**
- C. "Shorten the conversation as much as possible."
- D. "Keep only the last three messages."

---

**Q9.** When is a workflow the better choice than an agent?

- **A. When you can enumerate the exact steps in code, error cost is real, and step-level guardrails matter ✓**
- B. When you can specify the goal and tools but not the path
- C. When user inputs vary unpredictably
- D. When the task needs creative sequencing of tools

---

**Q10.** Where should a human-in-the-loop checkpoint go?

- A. After every tool call, regardless of risk
- B. Only after the agent finishes
- **C. Before any tool that can take an irreversible action (write, delete, send) — decided by asking "what is the worst outcome if this runs unchecked?" ✓**
- D. Nowhere, if the loop has an iteration cap

---

### Section 3: Skills, Memory & Advanced Patterns

**Q11.** A workload handles PHI and requires Zero Data Retention. Which wiring path is ruled out?

- A. A raw Messages API loop on a covered configuration
- **B. Claude Managed Agents, because sessions are stateful and stored server-side ✓**
- C. The Agent SDK on a covered configuration
- D. All three are ruled out

---

**Q12.** A support agent helps the same user across daily check-ins for two weeks, and each session starts where the last ended. Which memory scope fits?

- A. In-context only, by keeping one ever-growing messages array
- B. Stateless, because each session is a new API call
- **C. External storage (or summarized memory) read back at session start ✓**
- D. A larger context window

---

**Q13.** What is true about Skills?

- A. Their full instructions load into every session, like CLAUDE.md
- B. They only work in Claude Code, never on the API
- C. Subagents always inherit the parent's skills
- **D. Only the name and description load up front; the body loads when a request matches the description, and subagents do not inherit them automatically ✓**

---

**Q14.** How many visual tokens does a 1,000 × 1,000 pixel image cost under the module's formula (each 28×28 patch is one token, before any model-specific downscaling)?

- A. About 1,000
- B. About 36
- **C. About 1,296 ✓**
- D. About 10,000

---

**Q15.** A nightly job classifies 5,000 records and hits rate limits even after splitting the list into chunks and looping over the synchronous API. What is the fix, and how do you match results to inputs?

- **A. Use the Message Batches API; results come back in arbitrary order, so match them with custom_id ✓**
- B. Use smaller chunks; match results by position
- C. Use streaming; results arrive in order
- D. Use extended thinking; it avoids rate limits

---

## Module 3 Quiz — Claude Code, MCP & Integration

> Permission modes, hooks, CLAUDE.md, MCP primitives, OAuth, and secure integration patterns.
> 60 seconds per question · 100 pts for correct · 0 for incorrect/unanswered

---

### Section 1: Permission Modes & Safety

**Q1.** What does plan permission mode do?

- A. Auto-approves all edits and commands after showing a plan
- B. Denies every tool call that is not on an allow list
- C. Skips the explore phase and goes straight to coding
- **D. Holds Claude Code in read-only exploration: no edits or shell commands until you approve a plan ✓**

---

**Q2.** What does acceptEdits auto-approve?

- A. Everything, with a classifier reviewing each action
- **B. Reads, file edits and common filesystem commands inside the working directory; other shell commands and protected paths still prompt ✓**
- C. Only reads
- D. All tool calls, with no safety checks

---

**Q3.** A developer wants fewer prompts and switches to bypassPermissions on a workstation. What is the correct assessment?

- **A. Only appropriate in an isolated, disposable container or VM; it removes every prompt including the protected-path guard, so use deny rules first, or auto for fewer prompts with a safety net ✓**
- B. Fine, as long as the task feels routine
- C. Acceptable on any machine if the repo is backed up
- D. It still prompts for all shell scripts

---

**Q4.** An allow rule at project level and a deny rule at enterprise level conflict. What happens?

- A. The project allow wins because it is more specific
- **B. The deny wins; a deny rule always beats an allow rule, and enterprise managed settings can't be overridden by users or projects ✓**
- C. The most recently edited file wins
- D. Claude asks the user to choose

---

**Q5.** How do you decide where a human review gate belongs?

- **A. Ask what the worst outcome is if this action runs unchecked: let reversible low-cost actions through, gate hard-to-undo or sensitive-path actions, and never let the agent be the only gate on code your team marked sensitive ✓**
- B. Gate every action equally
- C. Gate only actions that take a long time
- D. Gate only shell commands

---

### Section 2: CLAUDE.md, Hooks & Subagents

**Q6.** How should you treat an AI code reviewer's findings?

- A. As a verdict to apply directly
- B. Trust claims about runtime behavior and other systems, but verify missing null checks
- **C. Trust what is provable from the diff (and confirm it on the cited lines); treat claims about runtime behavior or other systems as hypotheses to test; keep a human gate where a finding becomes an irreversible action ✓**
- D. Ignore all of it

---

**Q7.** Your CLAUDE.md has grown to 800+ lines and the agent edited a directory it was told not to touch. What is the best fix?

- A. Add the rule again, in capital letters
- B. Increase the context window
- C. Move everything into a subagent
- **D. Trim CLAUDE.md to the rules that change behavior, move path-specific guidance to scoped rules files (paths: frontmatter), move reference material elsewhere, and enforce the can't-fail rule with a hook ✓**

---

**Q8.** Which statement about hooks is correct?

- A. A PostToolUse hook can block the tool call that just ran
- **B. A PreToolUse hook can block a call by exiting with code 2 and writing the reason to stderr; this enforces a guardrail regardless of permission mode, unlike an instruction in CLAUDE.md ✓**
- C. Hooks add their full source to the context window on every turn
- D. Hooks only run in bypassPermissions mode

---

**Q9.** You delegate a task to the built-in Explore subagent and your project's CLAUDE.md rules are not followed. Why?

- A. Subagents are never able to read files
- B. CLAUDE.md only loads in plan mode
- **C. Explore and Plan skip CLAUDE.md and git status for speed; use the general-purpose subagent or a custom subagent when project rules must apply (and list any skills it needs in its frontmatter) ✓**
- D. The subagent inherited an outdated CLAUDE.md

---

**Q10.** A skill worked in Claude Code but does nothing in a headless Agent SDK job. What is the most likely cause?

- **A. settingSources was never set, so filesystem settings and skills never loaded; set it explicitly ✓**
- B. Skills only run in the terminal
- C. The SDK doesn't support Markdown
- D. The skill needs the Messages API beta headers

---

### Section 3: MCP: Primitives, Transport & Security

**Q11.** A plugin installs successfully for every teammate but its skill fails for all of them except the author. The skill calls /Users/alex/projects/deploy-utils/validate.sh. What is the fix?

- A. Switch to a home shortcut such as ~/projects/deploy-utils/validate.sh
- B. Put the script on a shared network drive and use that absolute path
- **C. Reference scripts with $CLAUDE_PROJECT_DIR (project) or ${CLAUDE_PLUGIN_ROOT} (bundled in the plugin), bundle or share every dependency, and test on a clean machine ✓**
- D. Remove the validation step

---

**Q12.** A code-search service hosted on your company's infrastructure must be available to the whole engineering team through the repo. Which transport and scope fit?

- A. stdio + local scope
- B. SSE + user scope
- C. stdio + project scope, because stdio is the most secure
- **D. HTTP (streamable) + project scope (.mcp.json committed to the repo) ✓**

---

**Q13.** An API key was committed inline in .mcp.json. The developer replaces it with ${WAREHOUSE_MCP_TOKEN} in a new commit. Is the problem solved?

- **A. No; the key is still in git history and must be treated as compromised and rotated. Configs should only ever hold variable references (back the convention with a PreToolUse hook) ✓**
- B. Yes, the file no longer contains the key
- C. Yes, as long as the repository is private
- D. No, but rotating is unnecessary if you force-push

---

**Q14.** Which MCP primitive is read-only data the client fetches by URI and places directly into context, rather than the model calling an action?

- A. Tool
- **B. Resource ✓**
- C. Prompt
- D. Transport

---

**Q15.** An OAuth-authenticated MCP integration works in staging but every production sign-in fails with a redirect URI mismatch. What is the cause and the fix?

- A. A code defect in the MCP server; rewrite the sign-in flow
- B. The token expired; refresh it
- **C. Redirect URIs are registered per host (and often per environment); register the production host's redirect URI, and check whether separate OAuth app registrations per environment are required ✓**
- D. OAuth can't be used in production; switch to a hard-coded API key
