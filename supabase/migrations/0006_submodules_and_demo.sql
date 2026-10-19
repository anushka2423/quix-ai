-- Submodules, Skill Jar links and the per-domain demo. Additive: creates tables and columns, deletes no data.
-- Safe to re-run. Part of this was applied by hand earlier; this file is the complete record.
-- Written for Supabase (the app reads it through the Supabase client with the service-role key).
--
--   quiz_submodules        Skill Jar courses under a domain (navigation and content only; never scored)
--   quiz_skilljar_topics   the links shown with the explanation of a question in that submodule
--   quiz_questions.submodule_id   which submodule a question belongs to (optional)
--   quiz_questions.demo_order     1..5 = position in its domain's demo; null = not in the demo
--
-- Sub-skills (quiz_sub_skills, quiz_questions.section) are untouched: they keep their exam-guide weights and drive scoring.

create table if not exists quiz_submodules (
  id           serial primary key,
  module_id    integer not null references quiz_modules(id) on delete cascade,
  title        text not null,
  description  text,
  order_index  integer not null default 0,
  unique (module_id, title)
);

create table if not exists quiz_skilljar_topics (
  id            serial primary key,
  submodule_id  integer not null references quiz_submodules(id) on delete cascade,
  course_title  text not null,
  lesson_title  text,
  url           text,
  order_index   integer not null default 0
);

alter table quiz_questions
  add column if not exists submodule_id integer references quiz_submodules(id),
  add column if not exists demo_order   integer;

-- Supabase serves tables over a public API. The app only reads and writes through the server with the service-role key
-- (which bypasses row-level security), so enabling it, with no policies, keeps the public anon key out. Same as the
-- other quiz tables in 0001_cert_readiness.sql. Skill Jar links are shown to learners, so they must not be writable.
alter table quiz_submodules      enable row level security;
alter table quiz_skilljar_topics enable row level security;

-- A domain's demo has at most one question per position
create unique index if not exists quiz_questions_demo_idx
  on quiz_questions (module_id, demo_order) where demo_order is not null;

begin;

-- Deleting a submodule that still has questions is refused. NO ACTION (not RESTRICT) is checked at the end of the
-- statement, so deleting a whole domain, which cascades to its submodules and its questions together, still works.
alter table quiz_questions drop constraint if exists quiz_questions_submodule_id_fkey;
alter table quiz_questions add constraint quiz_questions_submodule_id_fkey
  foreign key (submodule_id) references quiz_submodules(id) on delete no action;

-- With the unique index above, this caps a domain's demo at 5 questions
alter table quiz_questions drop constraint if exists quiz_questions_demo_order_chk;
alter table quiz_questions add constraint quiz_questions_demo_order_chk
  check (demo_order is null or demo_order between 1 and 5);

commit;
