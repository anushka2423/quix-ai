-- Live Quiz (lq_*) tables
-- Run this in the Supabase SQL editor after 0001_cert_readiness.sql

-- Quiz definitions
CREATE TABLE IF NOT EXISTS lq_quizzes (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title       text NOT NULL,
  description text,
  instructions text,
  status      text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','archived')),
  config      jsonb NOT NULL DEFAULT '{
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
  published_at timestamptz,
  created_at   timestamptz DEFAULT now()
);

-- Modules within a quiz
CREATE TABLE IF NOT EXISTS lq_modules (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id     uuid NOT NULL REFERENCES lq_quizzes(id) ON DELETE CASCADE,
  title       text NOT NULL,
  description text,
  order_index int  NOT NULL DEFAULT 1
);

-- Questions within a quiz (belong to a module)
CREATE TABLE IF NOT EXISTS lq_questions (
  id             uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id        uuid NOT NULL REFERENCES lq_quizzes(id) ON DELETE CASCADE,
  module_id      uuid NOT NULL REFERENCES lq_modules(id) ON DELETE CASCADE,
  type           text NOT NULL DEFAULT 'single' CHECK (type IN ('single','truefalse')),
  question       text NOT NULL,
  options        jsonb NOT NULL,            -- [{"label":"A","text":"..."},...]
  correct_answer text NOT NULL,            -- e.g. "A" or "True"
  explanation    text,
  concept        text NOT NULL DEFAULT 'General',
  points         int  NOT NULL DEFAULT 100,
  timer_secs     int  NOT NULL DEFAULT 60,
  order_index    int  NOT NULL DEFAULT 1
);

-- Immutable snapshot of a published quiz used for sessions
CREATE TABLE IF NOT EXISTS lq_quiz_versions (
  id                   uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id              uuid NOT NULL REFERENCES lq_quizzes(id),
  -- Public snapshot (no answer keys): what participants see
  snapshot             jsonb NOT NULL,
  -- Private snapshot (with answer keys): used by the server engine only
  snapshot_with_keys   jsonb NOT NULL,
  created_at           timestamptz DEFAULT now()
);

-- Live sessions
CREATE TABLE IF NOT EXISTS lq_sessions (
  id                    uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id               uuid NOT NULL REFERENCES lq_quizzes(id),
  quiz_version_id       uuid NOT NULL REFERENCES lq_quiz_versions(id),
  join_code             text NOT NULL UNIQUE,
  status                text NOT NULL DEFAULT 'lobby'
                          CHECK (status IN ('lobby','active','paused','completed')),
  -- Tracks progression through the question sequence
  current_question_index int,                -- 0-based global index into all questions
  question_deadline      timestamptz,        -- when current question expires
  question_started_at    timestamptz,        -- when current question started
  question_remaining_secs int,               -- set on pause; cleared on resume
  results_published      boolean NOT NULL DEFAULT false,
  started_at             timestamptz,
  completed_at           timestamptz,
  created_at             timestamptz DEFAULT now()
);

-- Participants in a session
CREATE TABLE IF NOT EXISTS lq_participants (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id    uuid NOT NULL REFERENCES lq_sessions(id) ON DELETE CASCADE,
  display_name  text NOT NULL,
  token         text NOT NULL UNIQUE,        -- secret; given to client on join
  joined_at     timestamptz DEFAULT now(),
  last_seen_at  timestamptz DEFAULT now(),
  score         int NOT NULL DEFAULT 0,
  rank          int,
  UNIQUE (session_id, display_name)
);

-- One row per participant per question (submitted answers)
CREATE TABLE IF NOT EXISTS lq_responses (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id      uuid NOT NULL REFERENCES lq_sessions(id) ON DELETE CASCADE,
  participant_id  uuid NOT NULL REFERENCES lq_participants(id) ON DELETE CASCADE,
  question_id     uuid NOT NULL REFERENCES lq_questions(id),
  selected_answer text,                    -- null = unanswered
  is_correct      boolean,
  points_awarded  int NOT NULL DEFAULT 0,
  response_time_ms int,                   -- ms from question_started_at
  submitted_at    timestamptz DEFAULT now(),
  UNIQUE (session_id, participant_id, question_id)
);

-- Final aggregated results per participant per session
CREATE TABLE IF NOT EXISTS lq_participant_results (
  id                uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id        uuid NOT NULL REFERENCES lq_sessions(id) ON DELETE CASCADE,
  participant_id    uuid NOT NULL REFERENCES lq_participants(id) ON DELETE CASCADE,
  score             int NOT NULL DEFAULT 0,
  rank              int,
  correct_count     int NOT NULL DEFAULT 0,
  incorrect_count   int NOT NULL DEFAULT 0,
  unanswered_count  int NOT NULL DEFAULT 0,
  accuracy          numeric(5,4),
  total_response_ms bigint NOT NULL DEFAULT 0,
  module_results    jsonb,   -- [{module_id, title, score, correct, total, accuracy}]
  concept_results   jsonb,   -- [{concept, correct, total, accuracy, status}]
  UNIQUE (session_id, participant_id)
);

-- Audit log for session state transitions
CREATE TABLE IF NOT EXISTS lq_session_events (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id  uuid NOT NULL REFERENCES lq_sessions(id) ON DELETE CASCADE,
  event       text NOT NULL,
  payload     jsonb,
  created_at  timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS lq_modules_quiz     ON lq_modules(quiz_id);
CREATE INDEX IF NOT EXISTS lq_questions_quiz   ON lq_questions(quiz_id);
CREATE INDEX IF NOT EXISTS lq_questions_module ON lq_questions(module_id);
CREATE INDEX IF NOT EXISTS lq_sessions_code    ON lq_sessions(join_code) WHERE status IN ('lobby','active','paused');
CREATE INDEX IF NOT EXISTS lq_sessions_quiz    ON lq_sessions(quiz_id);
CREATE INDEX IF NOT EXISTS lq_participants_session ON lq_participants(session_id);
CREATE INDEX IF NOT EXISTS lq_participants_token   ON lq_participants(token);
CREATE INDEX IF NOT EXISTS lq_responses_session    ON lq_responses(session_id);
CREATE INDEX IF NOT EXISTS lq_responses_participant ON lq_responses(session_id, participant_id);
CREATE INDEX IF NOT EXISTS lq_results_session  ON lq_participant_results(session_id);
CREATE INDEX IF NOT EXISTS lq_events_session   ON lq_session_events(session_id);
