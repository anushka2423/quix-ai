-- ContractIQ / quix-ai: complete schema for plain PostgreSQL (Azure Database for PostgreSQL Flexible Server, v13+).
-- Schema ONLY (no data). Safe to re-run (IF NOT EXISTS everywhere). No Supabase features: no RLS, no auth.*, no roles.
--
-- Reconstructed from: migrations 0002-0016, scripts/generate-seed-sql.ts (the old 0001), and the columns the app reads
-- and writes. quiz_modules / quiz_questions base definitions were never in the repo, so they are inferred from code.
--
-- Run this whole file once in the `quixai` database. Then load data (optional): 0003-0005 (live quiz seeds) and
-- 0007-0016 / supabase/seed/questions.sql (question bank), in that order, skipping any ALTER/RLS lines that error.

begin;

-- ═══ Core quiz bank ═════════════════════════════════════════════════════════

-- One row per exam domain
create table if not exists quiz_modules (
  id             serial primary key,
  title          text not null,
  description    text,
  locked         boolean not null default false,
  order_index    integer not null default 0,
  track          text check (track in ('associate', 'developer')),
  weight         numeric(5,2),
  objective      text,
  course_module  integer,
  doc_links      jsonb not null default '[]'::jsonb
);

-- Weighted sub-skills of a domain (weight null where the exam guide publishes none)
create table if not exists quiz_sub_skills (
  id           serial primary key,
  module_id    integer not null references quiz_modules(id) on delete cascade,
  name         text not null,
  weight       numeric(5,2),
  order_index  integer not null default 0,
  unique (module_id, name)
);

-- Skill Jar courses under a domain (navigation/content only; never scored)
create table if not exists quiz_submodules (
  id               serial primary key,
  module_id        integer not null references quiz_modules(id) on delete cascade,
  title            text not null,
  description      text,
  order_index      integer not null default 0,
  course_position  integer,
  unique (module_id, title)
);

-- Lessons / links shown with an answer explanation
create table if not exists quiz_skilljar_topics (
  id            serial primary key,
  submodule_id  integer not null references quiz_submodules(id) on delete cascade,
  course_title  text not null,
  lesson_title  text,
  url           text,
  order_index   integer not null default 0
);

-- Questions (section = sub-skill name; multi-answer keys look like 'A,C')
create table if not exists quiz_questions (
  id            serial primary key,
  module_id     integer not null references quiz_modules(id) on delete cascade,
  section       text not null,
  difficulty    text not null,
  question      text not null,
  option_a      text not null,
  option_b      text not null,
  option_c      text not null,
  option_d      text not null,
  answer        text not null,
  explanation   text,
  order_index   integer not null default 0,
  -- 0006: submodule (NO ACTION: refuses deleting a submodule that still has questions) + per-domain demo slot
  submodule_id  integer references quiz_submodules(id) on delete no action,
  demo_order    integer check (demo_order is null or demo_order between 1 and 5),
  -- 0012: the lesson a question belongs to
  topic_id      integer references quiz_skilljar_topics(id) on delete set null,
  -- 0013: module-quiz-only questions
  module_only   boolean not null default false,
  -- 0015: 1 = standard, 2 / 3 = Level 2 / Level 3
  level         integer not null default 1
);
create unique index if not exists quiz_questions_demo_idx
  on quiz_questions (module_id, demo_order) where demo_order is not null;

-- 0013: which questions belong to which lesson
create table if not exists quiz_lesson_questions (
  id           serial primary key,
  topic_id     integer not null references quiz_skilljar_topics(id) on delete cascade,
  question_id  integer not null references quiz_questions(id) on delete cascade,
  unique (topic_id, question_id)
);
create index if not exists quiz_lesson_questions_question_idx on quiz_lesson_questions (question_id);

-- ═══ Learners, attempts, analytics ══════════════════════════════════════════

create table if not exists quiz_leads (
  id                 serial primary key,
  email              text not null unique,
  created_at         timestamptz not null default now(),
  name               text,
  exam_date          date,
  marketing_consent  boolean not null default false,
  track              text,
  source             text
);

create table if not exists quiz_attempts (
  id          uuid primary key,
  email       text,
  name        text,
  exam_date   date,
  track       text not null,
  mode        text not null,
  correct     integer not null,
  total       integer not null,
  readiness   integer,
  result      jsonb not null,
  plan        jsonb,
  created_at  timestamptz not null default now()
);
create index if not exists quiz_attempts_email_idx on quiz_attempts (email);

create table if not exists reported_questions (
  id           bigserial primary key,
  question_id  integer not null,
  track        text not null,
  reason       text,
  email        text,
  status       text not null default 'open',  -- open | upheld | dismissed
  created_at   timestamptz not null default now(),
  resolved_at  timestamptz
);

create table if not exists analytics_events (
  id          bigserial primary key,
  event       text not null,
  props       jsonb not null default '{}'::jsonb,
  session_id  text,
  email       text,
  created_at  timestamptz not null default now()
);
create index if not exists analytics_events_event_idx on analytics_events (event, created_at);

create table if not exists learner_missed (
  learner_key     text not null,
  question_id     integer not null,
  track           text not null,
  missed_count    integer not null default 1,
  last_missed_at  timestamptz not null default now(),
  resolved_at     timestamptz,
  primary key (learner_key, question_id)
);
create index if not exists learner_missed_open_idx on learner_missed (learner_key, track) where resolved_at is null;

create table if not exists call_bookings (
  id           bigserial primary key,
  invitee_uri  text unique,
  email        text not null,
  name         text,
  start_time   timestamptz,
  track        text,
  readiness    integer,
  report_url   text,
  status       text not null default 'booked',  -- booked | attended | no_show | canceled
  outcome      text,
  offer_made   boolean,
  created_at   timestamptz not null default now()
);

-- ═══ Live Quiz (lq_*) ═══════════════════════════════════════════════════════

create table if not exists lq_quizzes (
  id            uuid default gen_random_uuid() primary key,
  title         text not null,
  description   text,
  instructions  text,
  status        text not null default 'draft' check (status in ('draft','published','archived')),
  config        jsonb not null default '{
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
  published_at  timestamptz,
  created_at    timestamptz default now()
);

create table if not exists lq_modules (
  id           uuid default gen_random_uuid() primary key,
  quiz_id      uuid not null references lq_quizzes(id) on delete cascade,
  title        text not null,
  description  text,
  order_index  int not null default 1
);

create table if not exists lq_questions (
  id              uuid default gen_random_uuid() primary key,
  quiz_id         uuid not null references lq_quizzes(id) on delete cascade,
  module_id       uuid not null references lq_modules(id) on delete cascade,
  type            text not null default 'single' check (type in ('single','truefalse')),
  question        text not null,
  options         jsonb not null,
  correct_answer  text not null,
  explanation     text,
  concept         text not null default 'General',
  points          int not null default 100,
  timer_secs      int not null default 60,
  order_index     int not null default 1
);

create table if not exists lq_quiz_versions (
  id                  uuid default gen_random_uuid() primary key,
  quiz_id             uuid not null references lq_quizzes(id),
  snapshot            jsonb not null,
  snapshot_with_keys  jsonb not null,
  created_at          timestamptz default now()
);

create table if not exists lq_sessions (
  id                       uuid default gen_random_uuid() primary key,
  quiz_id                  uuid not null references lq_quizzes(id),
  quiz_version_id          uuid not null references lq_quiz_versions(id),
  join_code                text not null unique,
  status                   text not null default 'lobby' check (status in ('lobby','active','paused','completed')),
  current_question_index   int,
  question_deadline        timestamptz,
  question_started_at      timestamptz,
  question_remaining_secs  int,
  results_published        boolean not null default false,
  started_at               timestamptz,
  completed_at             timestamptz,
  created_at               timestamptz default now()
);

create table if not exists lq_participants (
  id            uuid default gen_random_uuid() primary key,
  session_id    uuid not null references lq_sessions(id) on delete cascade,
  display_name  text not null,
  token         text not null unique,
  joined_at     timestamptz default now(),
  last_seen_at  timestamptz default now(),
  score         int not null default 0,
  rank          int,
  unique (session_id, display_name)
);

create table if not exists lq_responses (
  id                uuid default gen_random_uuid() primary key,
  session_id        uuid not null references lq_sessions(id) on delete cascade,
  participant_id    uuid not null references lq_participants(id) on delete cascade,
  question_id       uuid not null references lq_questions(id),
  selected_answer   text,
  is_correct        boolean,
  points_awarded    int not null default 0,
  response_time_ms  int,
  submitted_at      timestamptz default now(),
  unique (session_id, participant_id, question_id)
);

create table if not exists lq_participant_results (
  id                 uuid default gen_random_uuid() primary key,
  session_id         uuid not null references lq_sessions(id) on delete cascade,
  participant_id     uuid not null references lq_participants(id) on delete cascade,
  score              int not null default 0,
  rank               int,
  correct_count      int not null default 0,
  incorrect_count    int not null default 0,
  unanswered_count   int not null default 0,
  accuracy           numeric(5,4),
  total_response_ms  bigint not null default 0,
  module_results     jsonb,
  concept_results    jsonb,
  unique (session_id, participant_id)
);

create table if not exists lq_session_events (
  id          uuid default gen_random_uuid() primary key,
  session_id  uuid not null references lq_sessions(id) on delete cascade,
  event       text not null,
  payload     jsonb,
  created_at  timestamptz default now()
);

create index if not exists lq_modules_quiz         on lq_modules(quiz_id);
create index if not exists lq_questions_quiz       on lq_questions(quiz_id);
create index if not exists lq_questions_module     on lq_questions(module_id);
create index if not exists lq_sessions_code        on lq_sessions(join_code) where status in ('lobby','active','paused');
create index if not exists lq_sessions_quiz        on lq_sessions(quiz_id);
create index if not exists lq_participants_session on lq_participants(session_id);
create index if not exists lq_participants_token   on lq_participants(token);
create index if not exists lq_responses_session    on lq_responses(session_id);
create index if not exists lq_responses_participant on lq_responses(session_id, participant_id);
create index if not exists lq_results_session      on lq_participant_results(session_id);
create index if not exists lq_events_session       on lq_session_events(session_id);

commit;

-- Sanity check: should list 21 tables
select count(*) as tables from information_schema.tables
where table_schema = 'public' and table_name ~ '^(quiz_|lq_|reported_|analytics_|learner_|call_)';
