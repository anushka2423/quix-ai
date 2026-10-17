-- Seed: Module 2 Quiz — Production-Grade Prompting, Agents & Tool Use (15 questions)
-- Run AFTER 0002_liveq.sql

DO $$
DECLARE
  v_quiz_id    uuid;
  v_version_id uuid;
  v_module1_id uuid;
  v_module2_id uuid;
  v_module3_id uuid;
  v_public_snap  jsonb;
  v_private_snap jsonb;
BEGIN

-- 1. Insert quiz
INSERT INTO lq_quizzes (title, description, instructions, status, config, published_at)
VALUES (
  'Module 2 Quiz — Production-Grade Prompting, Agents & Tool Use',
  'Tests understanding of structured outputs, tool-use loops, agent design, context management, and advanced patterns.',
  'Choose the single best answer for each question. You have 60 seconds per question.',
  'published',
  '{
    "timer_secs": 60,
    "points_correct": 100,
    "points_incorrect": 0,
    "points_unanswered": 0,
    "allow_late_join": false,
    "show_leaderboard_live": true,
    "results_released_by_admin": false,
    "allow_pause": true,
    "allow_early_end": true
  }',
  now()
)
RETURNING id INTO v_quiz_id;

-- 2. Insert 3 modules (5 + 5 + 5)
INSERT INTO lq_modules (quiz_id, title, description, order_index)
VALUES (v_quiz_id, 'Structured Outputs & Tool Use', 'Output constraints, tool-use loop rules, and streaming handling', 1)
RETURNING id INTO v_module1_id;

INSERT INTO lq_modules (quiz_id, title, description, order_index)
VALUES (v_quiz_id, 'Agents & Context Management', 'Agent vs workflow, context overflow, compaction, and human-in-the-loop', 2)
RETURNING id INTO v_module2_id;

INSERT INTO lq_modules (quiz_id, title, description, order_index)
VALUES (v_quiz_id, 'Skills, Memory & Advanced Patterns', 'Skills, memory scopes, ZDR, vision token costs, and batching', 3)
RETURNING id INTO v_module3_id;

-- ──────────────────────────────────────────────────────────────────────────────
-- Module 1: Structured Outputs & Tool Use (Q1–Q5)
-- ──────────────────────────────────────────────────────────────────────────────

INSERT INTO lq_questions (quiz_id, module_id, type, question, options, correct_answer, concept, points, timer_secs, order_index)
VALUES
(v_quiz_id, v_module1_id, 'single',
  'A ticket classifier returns "Billing", "billing", or "This looks like a billing issue" on different runs, and the router breaks. What is the prompt missing, and what is the right fix?',
  '[{"label":"A","text":"A longer description of each category"},{"label":"B","text":"An output constraint: exactly one label from a fixed set, nothing else, ideally with few-shot examples showing the format"},{"label":"C","text":"Extended thinking at high effort"},{"label":"D","text":"A higher max_tokens value"}]',
  'B', 'Structured Outputs', 100, 60, 1),

(v_quiz_id, v_module1_id, 'single',
  'What do structured outputs (output_config.format with a JSON schema) give you that a prompt instruction does not?',
  '[{"label":"A","text":"A guarantee that the response is always correct"},{"label":"B","text":"Lower latency on the first request with any new schema"},{"label":"C","text":"Compatibility with message prefilling"},{"label":"D","text":"Constrained decoding: the API only allows tokens that keep the output valid against your schema (you still check stop_reason for refusals and truncation)"}]',
  'D', 'Structured Outputs', 100, 60, 2),

(v_quiz_id, v_module1_id, 'single',
  'Extended thinking is on and you use tools. What must you do with the thinking blocks Claude returns?',
  '[{"label":"A","text":"Send them back to the API exactly as received (signature intact), including redacted ones"},{"label":"B","text":"Strip them out of history to save context"},{"label":"C","text":"Summarize them before the next turn"},{"label":"D","text":"Convert them into text blocks"}]',
  'A', 'Tool Use', 100, 60, 3),

(v_quiz_id, v_module1_id, 'single',
  'In a tool-use loop, which rule about tool_use and tool_result blocks is correct?',
  '[{"label":"A","text":"Claude executes your tools and returns the results to you"},{"label":"B","text":"Results can be sent in any later turn as long as the order is preserved"},{"label":"C","text":"tool_result blocks go in the assistant role"},{"label":"D","text":"Every tool_use block must be answered by a tool_result with the same id in the immediately following user turn"}]',
  'D', 'Tool Use', 100, 60, 4),

(v_quiz_id, v_module1_id, 'single',
  'Claude keeps calling search_docs when the answer is already in context. Both tool descriptions say "Use this to find information." What is the most targeted fix?',
  '[{"label":"A","text":"Add an exclusion condition to each description naming when not to call it"},{"label":"B","text":"Rename the tools"},{"label":"C","text":"Mark every parameter as required"},{"label":"D","text":"Add more tools so Claude has more options"}]',
  'A', 'Tool Use', 100, 60, 5);

-- ──────────────────────────────────────────────────────────────────────────────
-- Module 2: Agents & Context Management (Q6–Q10)
-- ──────────────────────────────────────────────────────────────────────────────

INSERT INTO lq_questions (quiz_id, module_id, type, question, options, correct_answer, concept, points, timer_secs, order_index)
VALUES
(v_quiz_id, v_module2_id, 'single',
  'When handling a streamed response, which approach is correct?',
  '[{"label":"A","text":"Parse a tool_use block''s input as soon as the first delta arrives"},{"label":"B","text":"Act on a block only after content_block_stop, append the turn only after message_stop, and discard the partial turn if the stream is interrupted"},{"label":"C","text":"Append the assistant turn to history whenever the read loop ends"},{"label":"D","text":"Keep partial blocks in history so the next request can continue them"}]',
  'B', 'Streaming', 100, 60, 1),

(v_quiz_id, v_module2_id, 'single',
  'An agent selects the right tool for the first four turns, then starts picking wrong tools and giving incomplete answers at turn 8. Tool outputs in production are 3–5× longer than in testing. What is the most likely cause?',
  '[{"label":"A","text":"A bug in the tool schemas"},{"label":"B","text":"The model''s quality degrades after eight turns"},{"label":"C","text":"The context window (budget) is filling with accumulated tool results, crowding out instructions"},{"label":"D","text":"Streaming was left on"}]',
  'C', 'Context Management', 100, 60, 2),

(v_quiz_id, v_module2_id, 'single',
  'You write a manual compaction step. Which summarizer instruction best preserves task continuity?',
  '[{"label":"A","text":"\"Summarize the conversation so far.\""},{"label":"B","text":"\"Summarize the conversation, preserving all file paths modified, all decisions made, and any errors encountered and how they were resolved.\""},{"label":"C","text":"\"Shorten the conversation as much as possible.\""},{"label":"D","text":"\"Keep only the last three messages.\""}]',
  'B', 'Context Management', 100, 60, 3),

(v_quiz_id, v_module2_id, 'single',
  'When is a workflow the better choice than an agent?',
  '[{"label":"A","text":"When you can enumerate the exact steps in code, error cost is real, and step-level guardrails matter"},{"label":"B","text":"When you can specify the goal and tools but not the path"},{"label":"C","text":"When user inputs vary unpredictably"},{"label":"D","text":"When the task needs creative sequencing of tools"}]',
  'A', 'Agent Design', 100, 60, 4),

(v_quiz_id, v_module2_id, 'single',
  'Where should a human-in-the-loop checkpoint go?',
  '[{"label":"A","text":"After every tool call, regardless of risk"},{"label":"B","text":"Only after the agent finishes"},{"label":"C","text":"Before any tool that can take an irreversible action (write, delete, send) — decided by asking \"what is the worst outcome if this runs unchecked?\""},{"label":"D","text":"Nowhere, if the loop has an iteration cap"}]',
  'C', 'Agent Design', 100, 60, 5);

-- ──────────────────────────────────────────────────────────────────────────────
-- Module 3: Skills, Memory & Advanced Patterns (Q11–Q15)
-- ──────────────────────────────────────────────────────────────────────────────

INSERT INTO lq_questions (quiz_id, module_id, type, question, options, correct_answer, concept, points, timer_secs, order_index)
VALUES
(v_quiz_id, v_module3_id, 'single',
  'A workload handles PHI and requires Zero Data Retention. Which wiring path is ruled out?',
  '[{"label":"A","text":"A raw Messages API loop on a covered configuration"},{"label":"B","text":"Claude Managed Agents, because sessions are stateful and stored server-side"},{"label":"C","text":"The Agent SDK on a covered configuration"},{"label":"D","text":"All three are ruled out"}]',
  'B', 'Compliance & Security', 100, 60, 1),

(v_quiz_id, v_module3_id, 'single',
  'A support agent helps the same user across daily check-ins for two weeks, and each session starts where the last ended. Which memory scope fits?',
  '[{"label":"A","text":"In-context only, by keeping one ever-growing messages array"},{"label":"B","text":"Stateless, because each session is a new API call"},{"label":"C","text":"External storage (or summarized memory) read back at session start"},{"label":"D","text":"A larger context window"}]',
  'C', 'Memory & State', 100, 60, 2),

(v_quiz_id, v_module3_id, 'single',
  'What is true about Skills?',
  '[{"label":"A","text":"Their full instructions load into every session, like CLAUDE.md"},{"label":"B","text":"They only work in Claude Code, never on the API"},{"label":"C","text":"Subagents always inherit the parent''s skills"},{"label":"D","text":"Only the name and description load up front; the body loads when a request matches the description, and subagents do not inherit them automatically"}]',
  'D', 'Skills', 100, 60, 3),

(v_quiz_id, v_module3_id, 'single',
  'How many visual tokens does a 1,000 × 1,000 pixel image cost under the module''s formula (each 28×28 patch is one token, before any model-specific downscaling)?',
  '[{"label":"A","text":"About 1,000"},{"label":"B","text":"About 36"},{"label":"C","text":"About 1,296"},{"label":"D","text":"About 10,000"}]',
  'C', 'Vision & Multimodal', 100, 60, 4),

(v_quiz_id, v_module3_id, 'single',
  'A nightly job classifies 5,000 records and hits rate limits even after splitting the list into chunks and looping over the synchronous API. What is the fix, and how do you match results to inputs?',
  '[{"label":"A","text":"Use the Message Batches API; results come back in arbitrary order, so match them with custom_id"},{"label":"B","text":"Use smaller chunks; match results by position"},{"label":"C","text":"Use streaming; results arrive in order"},{"label":"D","text":"Use extended thinking; it avoids rate limits"}]',
  'A', 'Batching & Rate Limits', 100, 60, 5);

-- ──────────────────────────────────────────────────────────────────────────────
-- 3. Build and store the quiz version snapshot
-- ──────────────────────────────────────────────────────────────────────────────

SELECT jsonb_build_object(
  'quiz_id',      v_quiz_id,
  'title',        'Module 2 Quiz — Production-Grade Prompting, Agents & Tool Use',
  'description',  'Tests understanding of structured outputs, tool-use loops, agent design, context management, and advanced patterns.',
  'instructions', 'Choose the single best answer for each question. You have 60 seconds per question.',
  'config', '{
    "timer_secs": 60,
    "points_correct": 100,
    "points_incorrect": 0,
    "points_unanswered": 0,
    "allow_late_join": false,
    "show_leaderboard_live": true,
    "results_released_by_admin": false,
    "allow_pause": true,
    "allow_early_end": true
  }'::jsonb,
  'modules', (
    SELECT jsonb_agg(
      jsonb_build_object(
        'id',          m.id,
        'title',       m.title,
        'description', m.description,
        'order_index', m.order_index,
        'questions', (
          SELECT jsonb_agg(
            jsonb_build_object(
              'id',          q.id,
              'module_id',   q.module_id,
              'type',        q.type,
              'question',    q.question,
              'options',     q.options,
              'concept',     q.concept,
              'points',      q.points,
              'timer_secs',  q.timer_secs,
              'order_index', q.order_index
            ) ORDER BY q.order_index
          )
          FROM lq_questions q WHERE q.module_id = m.id
        )
      ) ORDER BY m.order_index
    )
    FROM lq_modules m WHERE m.quiz_id = v_quiz_id
  )
) INTO v_public_snap;

SELECT jsonb_build_object(
  'quiz_id',      v_quiz_id,
  'title',        'Module 2 Quiz — Production-Grade Prompting, Agents & Tool Use',
  'description',  'Tests understanding of structured outputs, tool-use loops, agent design, context management, and advanced patterns.',
  'instructions', 'Choose the single best answer for each question. You have 60 seconds per question.',
  'config', '{
    "timer_secs": 60,
    "points_correct": 100,
    "points_incorrect": 0,
    "points_unanswered": 0,
    "allow_late_join": false,
    "show_leaderboard_live": true,
    "results_released_by_admin": false,
    "allow_pause": true,
    "allow_early_end": true
  }'::jsonb,
  'modules', (
    SELECT jsonb_agg(
      jsonb_build_object(
        'id',          m.id,
        'title',       m.title,
        'description', m.description,
        'order_index', m.order_index,
        'questions', (
          SELECT jsonb_agg(
            jsonb_build_object(
              'id',             q.id,
              'module_id',      q.module_id,
              'type',           q.type,
              'question',       q.question,
              'options',        q.options,
              'correct_answer', q.correct_answer,
              'concept',        q.concept,
              'points',         q.points,
              'timer_secs',     q.timer_secs,
              'order_index',    q.order_index,
              'explanation',    q.explanation
            ) ORDER BY q.order_index
          )
          FROM lq_questions q WHERE q.module_id = m.id
        )
      ) ORDER BY m.order_index
    )
    FROM lq_modules m WHERE m.quiz_id = v_quiz_id
  )
) INTO v_private_snap;

INSERT INTO lq_quiz_versions (quiz_id, snapshot, snapshot_with_keys)
VALUES (v_quiz_id, v_public_snap, v_private_snap)
RETURNING id INTO v_version_id;

RAISE NOTICE 'Quiz created: % | Version: %', v_quiz_id, v_version_id;

END $$;