-- Seed: Module 1 Quiz — MSO Foundations (15 questions)
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
  'Module 1 Quiz — MSO Foundations',
  'Tests understanding of Claude API fundamentals: tokens, context windows, sampling controls, and usage patterns.',
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

-- 2. Insert 3 modules (questions split: 5 + 5 + 5)
INSERT INTO lq_modules (quiz_id, title, description, order_index)
VALUES (v_quiz_id, 'Tokens & Context', 'Context windows, token counting, and request lifecycle', 1)
RETURNING id INTO v_module1_id;

INSERT INTO lq_modules (quiz_id, title, description, order_index)
VALUES (v_quiz_id, 'Sampling & Models', 'Temperature, top-p, model selection, and reasoning mode', 2)
RETURNING id INTO v_module2_id;

INSERT INTO lq_modules (quiz_id, title, description, order_index)
VALUES (v_quiz_id, 'SDK, Streaming & Batching', 'SDKs, streaming vs sync, and batch API patterns', 3)
RETURNING id INTO v_module3_id;

-- ──────────────────────────────────────────────────────────────────────────────
-- Module 1: Tokens & Context (Q1–Q5)
-- ──────────────────────────────────────────────────────────────────────────────

INSERT INTO lq_questions (quiz_id, module_id, type, question, options, correct_answer, concept, points, timer_secs, order_index)
VALUES
(v_quiz_id, v_module1_id, 'single',
  'What is the unit in which Claude reads text, and in which the API bills and measures the context window?',
  '[{"label":"A","text":"Characters"},{"label":"B","text":"Words"},{"label":"C","text":"Sentences"},{"label":"D","text":"Tokens"}]',
  'D', 'Tokens & Context Windows', 100, 60, 1),

(v_quiz_id, v_module1_id, 'single',
  'Which of these counts toward the context window of a single request?',
  '[{"label":"A","text":"Only the user''s latest message"},{"label":"B","text":"The system prompt, conversation history, injected documents, tool results, and the model''s output"},{"label":"C","text":"Only the input, because output tokens are tracked separately"},{"label":"D","text":"Only the system prompt and tool definitions"}]',
  'B', 'Tokens & Context Windows', 100, 60, 2),

(v_quiz_id, v_module1_id, 'single',
  'A request''s input is already larger than the model''s context window. What happens?',
  '[{"label":"A","text":"The request is rejected with a validation error before generation begins"},{"label":"B","text":"The oldest content is silently truncated and generation proceeds"},{"label":"C","text":"The model generates a partial answer and stops"},{"label":"D","text":"The API automatically summarizes the input"}]',
  'A', 'Tokens & Context Windows', 100, 60, 3),

(v_quiz_id, v_module1_id, 'single',
  'On current models, a request fits on input but reaches the context ceiling during generation. What do you get?',
  '[{"label":"A","text":"An error, and no output"},{"label":"B","text":"The model restarts generation from the beginning with a shorter answer"},{"label":"C","text":"The output generated so far, with a model_context_window_exceeded stop reason"},{"label":"D","text":"The oldest part of the output is dropped"}]',
  'C', 'Tokens & Context Windows', 100, 60, 4),

(v_quiz_id, v_module1_id, 'single',
  'What does lowering temperature do?',
  '[{"label":"A","text":"It makes the model reason longer before answering"},{"label":"B","text":"It limits the number of tokens in the response"},{"label":"C","text":"It guarantees the same output every time"},{"label":"D","text":"It concentrates probability on the most likely tokens, making output more repeatable"}]',
  'D', 'Sampling Controls', 100, 60, 5);

-- ──────────────────────────────────────────────────────────────────────────────
-- Module 2: Sampling & Models (Q6–Q10)
-- ──────────────────────────────────────────────────────────────────────────────

INSERT INTO lq_questions (quiz_id, module_id, type, question, options, correct_answer, concept, points, timer_secs, order_index)
VALUES
(v_quiz_id, v_module2_id, 'single',
  'You run the same prompt twice and get two differently worded answers that are both correct. What is this called, and why does it happen?',
  '[{"label":"A","text":"A bug; the model has a memory leak between calls"},{"label":"B","text":"Hallucination; one of the two answers must be wrong"},{"label":"C","text":"Non-determinism; the model samples the next token from a probability distribution"},{"label":"D","text":"Caching; the first answer was stored and the second was recomputed"}]',
  'C', 'Sampling Controls', 100, 60, 1),

(v_quiz_id, v_module2_id, 'single',
  'What is the right way to test a Claude-powered feature whose wording varies from run to run?',
  '[{"label":"A","text":"Assert on properties that must hold (field present, value in range, output parses), and use a model-graded eval to judge meaning"},{"label":"B","text":"Assert that the response text exactly equals a stored string"},{"label":"C","text":"Set temperature to 0 and then use exact-match assertions"},{"label":"D","text":"Don''t test it; LLM output can''t be tested"}]',
  'A', 'Sampling Controls', 100, 60, 2),

(v_quiz_id, v_module2_id, 'single',
  'Which statement about sampling controls is correct?',
  '[{"label":"A","text":"Every Claude model accepts temperature, top_p and top_k"},{"label":"B","text":"Temperature 0 guarantees identical outputs across calls"},{"label":"C","text":"Sampling controls only affect the length of the response"},{"label":"D","text":"The newest Claude models reject non-default temperature, top_p or top_k with a 400 error, so you steer behavior through prompting"}]',
  'D', 'Sampling Controls', 100, 60, 3),

(v_quiz_id, v_module2_id, 'single',
  'What is the recommended default model choice and how do you move away from it?',
  '[{"label":"A","text":"Always start with the most capable tier to be safe"},{"label":"B","text":"Start with Sonnet; move up a tier only when an eval shows it misses your quality bar, and down to Haiku only when an eval shows the drop is acceptable"},{"label":"C","text":"Start with Haiku for everything and upgrade when users complain"},{"label":"D","text":"Choose based on which model has the largest context window"}]',
  'B', 'Model Selection', 100, 60, 4),

(v_quiz_id, v_module2_id, 'single',
  'How do model choice and reasoning mode relate?',
  '[{"label":"A","text":"They are the same setting"},{"label":"B","text":"Enabling reasoning automatically selects a larger model"},{"label":"C","text":"Reasoning mode can only be used with the smallest tier"},{"label":"D","text":"They are independent levers: you pick the model family member, and configure reasoning per request"}]',
  'D', 'Model Selection', 100, 60, 5);

-- ──────────────────────────────────────────────────────────────────────────────
-- Module 3: SDK, Streaming & Batching (Q11–Q15)
-- ──────────────────────────────────────────────────────────────────────────────

INSERT INTO lq_questions (quiz_id, module_id, type, question, options, correct_answer, concept, points, timer_secs, order_index)
VALUES
(v_quiz_id, v_module3_id, 'single',
  'On current models, how do you tune how deeply the model thinks?',
  '[{"label":"A","text":"Set a fixed budget_tokens value on every request"},{"label":"B","text":"Use adaptive thinking and tune depth with the effort setting; budget_tokens is deprecated and errors on the newest models"},{"label":"C","text":"Increase max_tokens until the model thinks more"},{"label":"D","text":"Repeat the prompt several times in the same message"}]',
  'B', 'Model Selection', 100, 60, 1),

(v_quiz_id, v_module3_id, 'single',
  'A task has a specific output structure, casing, or edge case that a written description keeps missing. Which prompting mode is the best next step?',
  '[{"label":"A","text":"One-shot or multi-shot: add one or two correct examples, keeping the prompt as small as possible"},{"label":"B","text":"Zero-shot with a longer description"},{"label":"C","text":"Fine-tune the model on the examples"},{"label":"D","text":"Add as many examples as will fit in the context window"}]',
  'A', 'Prompting Techniques', 100, 60, 2),

(v_quiz_id, v_module3_id, 'single',
  'How do the official Claude SDKs relate to the raw REST API?',
  '[{"label":"A","text":"The SDK uses a different, faster model"},{"label":"B","text":"The SDK is a thin convenience layer over the same REST API and the same model, handling auth, request building, retries and parsing"},{"label":"C","text":"The SDK is required; the REST API cannot be called directly"},{"label":"D","text":"REST is only for streaming and the SDK is only for synchronous calls"}]',
  'B', 'SDK & API', 100, 60, 3),

(v_quiz_id, v_module3_id, 'single',
  'When is streaming the right choice over a synchronous request?',
  '[{"label":"A","text":"For short backend jobs where no one is waiting"},{"label":"B","text":"When you want to reduce the per-token price"},{"label":"C","text":"When a response is long or a user is watching, so output can appear immediately instead of after a blank-screen wait"},{"label":"D","text":"When you need exactly the same output on every run"}]',
  'C', 'SDK & API', 100, 60, 4),

(v_quiz_id, v_module3_id, 'single',
  'You need to classify 50,000 records overnight and nobody is waiting on any individual result. Which pattern fits best?',
  '[{"label":"A","text":"The Message Batches API: submit many requests in one call, poll for completion, accept up to 24 h of latency for a lower per-token cost"},{"label":"B","text":"A loop of synchronous calls"},{"label":"C","text":"AsyncAnthropic with thousands of concurrent requests"},{"label":"D","text":"Streaming each response"}]',
  'A', 'SDK & API', 100, 60, 5);

-- ──────────────────────────────────────────────────────────────────────────────
-- 3. Build and store the quiz version snapshot
-- ──────────────────────────────────────────────────────────────────────────────

SELECT jsonb_build_object(
  'quiz_id',      v_quiz_id,
  'title',        'Module 1 Quiz — MSO Foundations',
  'description',  'Tests understanding of Claude API fundamentals: tokens, context windows, sampling controls, and usage patterns.',
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
  'title',        'Module 1 Quiz — MSO Foundations',
  'description',  'Tests understanding of Claude API fundamentals: tokens, context windows, sampling controls, and usage patterns.',
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
