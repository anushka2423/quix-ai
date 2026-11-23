-- Claude Cert Readiness: one migration for the whole feature set. Safe to re-run; deletes nothing.
-- Run it once in the Supabase SQL editor. It assumes the quiz_modules / quiz_questions tables already exist
-- and have the questions loaded (the app reads them). If you want to start from an empty bank instead, run
-- supabase/seed/questions.sql, which already includes everything below.
--
-- Part 1 changes the schema. Part 2 fills the new columns for the domains already in the database.

begin;

-- ── Part 1: schema ───────────────────────────────────────────────────────────

-- Domains (quiz_modules): which exam they belong to, their weight, and the data the study plan and tutor use
alter table quiz_modules
  add column if not exists track         text check (track in ('associate', 'developer')),
  add column if not exists weight        numeric(5,2),
  add column if not exists objective     text,
  add column if not exists course_module integer,
  add column if not exists doc_links     jsonb not null default '[]'::jsonb;

-- Every answer shows a written explanation
alter table quiz_questions add column if not exists explanation text;

-- Weighted sub-skills of a domain. weight is null where the exam guide publishes none (all Associate sub-skills)
create table if not exists quiz_sub_skills (
  id           serial primary key,
  module_id    integer not null references quiz_modules(id) on delete cascade,
  name         text not null,
  weight       numeric(5,2),
  order_index  integer not null default 0,
  unique (module_id, name)
);
alter table quiz_sub_skills alter column weight drop not null;
alter table quiz_sub_skills alter column weight drop default;

-- Leads: name, exam date and marketing consent captured by the email modal
create table if not exists quiz_leads (
  id          serial primary key,
  email       text not null unique,
  created_at  timestamptz not null default now()
);
alter table quiz_leads
  add column if not exists name               text,
  add column if not exists exam_date          date,
  add column if not exists marketing_consent  boolean not null default false,
  add column if not exists track              text,
  add column if not exists source             text;

-- Finished attempts (feeds the admin Responses page and the advisor's /report/<id> link)
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

-- "Report this question" from learners; upheld items should be taken down within 48 hours
create table if not exists reported_questions (
  id           bigserial primary key,
  question_id  integer not null,
  track        text not null,
  reason       text,
  email        text,
  status       text not null default 'open', -- open | upheld | dismissed
  created_at   timestamptz not null default now(),
  resolved_at  timestamptz
);

-- Product analytics events
create table if not exists analytics_events (
  id          bigserial primary key,
  event       text not null,
  props       jsonb not null default '{}'::jsonb,
  session_id  text,
  email       text,
  created_at  timestamptz not null default now()
);
create index if not exists analytics_events_event_idx on analytics_events (event, created_at);

-- Review mistakes: questions a learner got wrong. learner_key is their email once known, else the anonymous
-- session id. resolved_at is set when they later answer the question correctly.
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

-- Free 1:1 review calls (filled by the scheduling tool's webhook, updated by the advisor)
create table if not exists call_bookings (
  id           bigserial primary key,
  invitee_uri  text unique,
  email        text not null,
  name         text,
  start_time   timestamptz,
  track        text,
  readiness    integer,
  report_url   text,
  status       text not null default 'booked', -- booked | attended | no_show | canceled
  outcome      text,
  offer_made   boolean,
  created_at   timestamptz not null default now()
);

-- All reads and writes go through the server with the service-role key, which bypasses row-level security.
-- Enabling it keeps the public anon key from reading leads, answers or attempts.
alter table if exists quiz_modules         enable row level security;
alter table if exists quiz_questions       enable row level security;
alter table if exists quiz_results         enable row level security;
alter table quiz_sub_skills                enable row level security;
alter table quiz_leads                     enable row level security;
alter table quiz_attempts                  enable row level security;
alter table reported_questions             enable row level security;
alter table analytics_events               enable row level security;
alter table call_bookings                  enable row level security;
alter table learner_missed                 enable row level security;


-- ── Part 2: data for the domains already in the database (matched by title) ─────────────────────────

-- 2a. Associate sub-skill names now use the exam guide's own task wording
with rename (old_name, new_name) as (values
  ($q$Create effective prompts$q$, $q$Create effective prompts for business and technical tasks$q$),
  ($q$Task decomposition$q$, $q$Apply task decomposition techniques to structure complex requests$q$),
  ($q$Iterate prompts$q$, $q$Iterate prompts to improve output quality$q$),
  ($q$Adapt prompting by task type$q$, $q$Adapt prompting strategies based on task type (analysis, research, drafting, brainstorming)$q$),
  ($q$Evaluate accuracy and completeness$q$, $q$Evaluate Claude-generated outputs for accuracy and completeness$q$),
  ($q$Identify hallucinations and bias$q$, $q$Identify hallucinations, inconsistencies, and biases in responses$q$),
  ($q$Fact-checking and validation$q$, $q$Apply fact-checking and validation techniques$q$),
  ($q$Human review decisions$q$, $q$Determine when human review or additional verification is required$q$),
  ($q$Edit and adapt for the audience$q$, $q$Edit, adapt, refine, and compare outputs for the intended audience$q$),
  ($q$Curate and choose output formats$q$, $q$Organize and curate information and select appropriate output formats (artifacts, inline, structured data)$q$),
  ($q$Select product features$q$, $q$Select appropriate Claude product features (Projects, research mode, chat, artifacts)$q$),
  ($q$Differentiate Haiku, Sonnet and Opus$q$, $q$Differentiate between Claude model types (Haiku, Sonnet, Opus)$q$),
  ($q$Align model with cost, speed and quality$q$, $q$Align model selection with task requirements (cost, speed, quality)$q$),
  ($q$Context limits and memory$q$, $q$Understand and manage context limitations and memory considerations (when to restart, summarize, or persist)$q$),
  ($q$Analyse requirements and use cases$q$, $q$Apply Claude to analyze requirements and use cases$q$),
  ($q$Research, planning and process optimisation$q$, $q$Leverage Claude for research, planning, and process optimization$q$),
  ($q$Support solution design$q$, $q$Use Claude to support solution design, development, and iteration$q$),
  ($q$Integrate into existing workflows$q$, $q$Integrate Claude into existing workflows to augment or redesign them$q$),
  ($q$Communicate value and limitations$q$, $q$Communicate Claude's value and limitations to stakeholders$q$),
  ($q$Configure Projects$q$, $q$Configure Claude Projects with instructions and knowledge sources$q$),
  ($q$Manage knowledge and connectors$q$, $q$Manage uploaded knowledge and connectors (e.g., Google Drive, Gmail)$q$),
  ($q$System-level instructions$q$, $q$Create effective system-level instructions$q$),
  ($q$Maintain configurations$q$, $q$Inform, maintain, and update Claude configurations, knowledge sources, and instructions$q$),
  ($q$Appropriate and inappropriate use$q$, $q$Identify appropriate and inappropriate use cases$q$),
  ($q$Data sensitivity and privacy$q$, $q$Apply data sensitivity, regulatory, and privacy considerations$q$),
  ($q$Organisational AI policy$q$, $q$Follow organizational AI policies and governance standards$q$),
  ($q$Ethical implications$q$, $q$Understand the ethical implications of AI usage$q$),
  ($q$Diagnose poor outputs$q$, $q$Identify, diagnose, and resolve issues with underperforming prompts or poor outputs$q$),
  ($q$Adjust from feedback$q$, $q$Adjust approach based on feedback and results$q$),
  ($q$Optimise workflows$q$, $q$Optimize workflows for efficiency and effectiveness$q$)
)
update quiz_questions qq
set section = r.new_name
from rename r, quiz_modules m
where m.id = qq.module_id and m.title in ($q$Prompting and Task Execution$q$, $q$Output Evaluation and Validation$q$, $q$Product and Model Selection$q$, $q$Workflow Integration and Solution Design$q$, $q$Configuration and Knowledge Management$q$, $q$Governance, Risk, and Responsible Use$q$, $q$Troubleshooting and Optimization$q$) and qq.section = r.old_name;

-- 2b. Track, weight, objective, course module and doc links. Only fills what is still empty.
update quiz_modules m
set track         = coalesce(m.track, v.track),
    weight        = coalesce(m.weight, v.weight),
    objective     = coalesce(m.objective, v.objective),
    course_module = coalesce(m.course_module, v.course_module),
    doc_links     = case when m.doc_links = '[]'::jsonb then v.doc_links else m.doc_links end
from (values
  ($q$Prompting and Task Execution$q$, $q$associate$q$, 14::numeric, $q$Write effective prompts, decompose complex tasks, iterate, and adapt the approach to the task type.$q$, 1, $q$[{"title":"Prompt engineering overview","url":"https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview"}]$q$::jsonb),
  ($q$Output Evaluation and Validation$q$, $q$associate$q$, 21::numeric, $q$Judge Claude outputs for accuracy, spot hallucinations and bias, verify, and know when human review is required.$q$, 2, $q$[{"title":"Reduce hallucinations","url":"https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/reduce-hallucinations"}]$q$::jsonb),
  ($q$Product and Model Selection$q$, $q$associate$q$, 12::numeric, $q$Pick the right Claude product feature and model tier, and manage context limits and memory.$q$, 3, $q$[{"title":"Models overview","url":"https://platform.claude.com/docs/en/about-claude/models/overview"},{"title":"Claude help center","url":"https://support.claude.com/en/"}]$q$::jsonb),
  ($q$Workflow Integration and Solution Design$q$, $q$associate$q$, 16::numeric, $q$Use Claude to analyse requirements, plan, design solutions, and fit into existing workflows.$q$, 4, $q$[{"title":"Use cases","url":"https://platform.claude.com/docs/en/about-claude/use-case-guides/overview"}]$q$::jsonb),
  ($q$Configuration and Knowledge Management$q$, $q$associate$q$, 12::numeric, $q$Configure Projects, instructions, knowledge sources and connectors, and keep them current.$q$, 5, $q$[{"title":"Projects in Claude","url":"https://support.claude.com/en/articles/9517075-what-are-projects"}]$q$::jsonb),
  ($q$Governance, Risk, and Responsible Use$q$, $q$associate$q$, 15::numeric, $q$Recognise appropriate use cases, handle sensitive data, follow AI policy and consider ethics.$q$, 6, $q$[{"title":"Privacy and safety","url":"https://support.claude.com/en/collections/4078534-privacy-and-legal"}]$q$::jsonb),
  ($q$Troubleshooting and Optimization$q$, $q$associate$q$, 10::numeric, $q$Diagnose weak prompts or outputs, adjust from feedback, and optimise workflows.$q$, 7, $q$[{"title":"Prompting tips","url":"https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview"}]$q$::jsonb),
  ($q$Applications and Integration$q$, $q$developer$q$, 33.1::numeric, $q$Build Claude applications: requirements, API mechanics, engineering foundations, application design and configuration.$q$, 2, $q$[{"title":"Messages API","url":"https://platform.claude.com/docs/en/api/messages"},{"title":"Batch processing","url":"https://platform.claude.com/docs/en/build-with-claude/batch-processing"},{"title":"Streaming","url":"https://platform.claude.com/docs/en/build-with-claude/streaming"}]$q$::jsonb),
  ($q$Model Selection and Optimization$q$, $q$developer$q$, 16.8::numeric, $q$Understand LLM fundamentals, pick models, and manage cost and tokens.$q$, 5, $q$[{"title":"Models overview","url":"https://platform.claude.com/docs/en/about-claude/models/overview"},{"title":"Prompt caching","url":"https://platform.claude.com/docs/en/build-with-claude/prompt-caching"},{"title":"Extended thinking","url":"https://platform.claude.com/docs/en/build-with-claude/extended-thinking"}]$q$::jsonb),
  ($q$Agents and Workflows$q$, $q$developer$q$, 14.7::numeric, $q$Choose between workflows and agents, construct agents with Claude, and apply agent patterns.$q$, 1, $q$[{"title":"Agent SDK","url":"https://platform.claude.com/docs/en/agent-sdk/overview"},{"title":"Tool use overview","url":"https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview"}]$q$::jsonb),
  ($q$Prompt and Context Engineering$q$, $q$developer$q$, 11::numeric, $q$Manage context, write prompts, and handle Claude output defensively.$q$, 3, $q$[{"title":"Prompt engineering overview","url":"https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview"},{"title":"Structured outputs","url":"https://platform.claude.com/docs/en/build-with-claude/structured-outputs"}]$q$::jsonb),
  ($q$Tools and MCPs$q$, $q$developer$q$, 10.6::numeric, $q$Implement tools, build MCP servers, and choose between tools, Skills and MCP.$q$, 4, $q$[{"title":"Tool use overview","url":"https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview"},{"title":"MCP in Claude Code","url":"https://code.claude.com/docs/en/mcp"}]$q$::jsonb),
  ($q$Security and Safety$q$, $q$developer$q$, 8.1::numeric, $q$Secure Claude applications: injection, guardrails, hooks, secrets and identity.$q$, 6, $q$[{"title":"Mitigate jailbreaks and prompt injections","url":"https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/mitigate-jailbreaks"},{"title":"Hooks","url":"https://code.claude.com/docs/en/hooks"}]$q$::jsonb),
  ($q$Claude Code$q$, $q$developer$q$, 3.1::numeric, $q$Operate Claude Code: rules, skills, commands, agents, memory and settings.$q$, 7, $q$[{"title":"Claude Code overview","url":"https://code.claude.com/docs/en/overview"},{"title":"Memory and CLAUDE.md","url":"https://code.claude.com/docs/en/memory"}]$q$::jsonb),
  ($q$Eval, Testing, and Debugging$q$, $q$developer$q$, 2.6::numeric, $q$Debug Claude applications: error types, recovery, tracing and isolating failures.$q$, 8, $q$[{"title":"Define success and build evals","url":"https://platform.claude.com/docs/en/test-and-evaluate/develop-tests"}]$q$::jsonb)
) as v (title, track, weight, objective, course_module, doc_links)
where m.title = v.title;

-- 2c. Sub-skills with their official weights (blank for Associate). Existing rows are left alone.
insert into quiz_sub_skills (module_id, name, weight, order_index)
select m.id, v.name, v.weight, v.ord
from (values
  ($q$Prompting and Task Execution$q$, $q$Create effective prompts for business and technical tasks$q$, null::numeric, 1),
  ($q$Prompting and Task Execution$q$, $q$Apply task decomposition techniques to structure complex requests$q$, null::numeric, 2),
  ($q$Prompting and Task Execution$q$, $q$Iterate prompts to improve output quality$q$, null::numeric, 3),
  ($q$Prompting and Task Execution$q$, $q$Adapt prompting strategies based on task type (analysis, research, drafting, brainstorming)$q$, null::numeric, 4),
  ($q$Output Evaluation and Validation$q$, $q$Evaluate Claude-generated outputs for accuracy and completeness$q$, null::numeric, 1),
  ($q$Output Evaluation and Validation$q$, $q$Identify hallucinations, inconsistencies, and biases in responses$q$, null::numeric, 2),
  ($q$Output Evaluation and Validation$q$, $q$Apply fact-checking and validation techniques$q$, null::numeric, 3),
  ($q$Output Evaluation and Validation$q$, $q$Determine when human review or additional verification is required$q$, null::numeric, 4),
  ($q$Output Evaluation and Validation$q$, $q$Edit, adapt, refine, and compare outputs for the intended audience$q$, null::numeric, 5),
  ($q$Output Evaluation and Validation$q$, $q$Organize and curate information and select appropriate output formats (artifacts, inline, structured data)$q$, null::numeric, 6),
  ($q$Product and Model Selection$q$, $q$Select appropriate Claude product features (Projects, research mode, chat, artifacts)$q$, null::numeric, 1),
  ($q$Product and Model Selection$q$, $q$Differentiate between Claude model types (Haiku, Sonnet, Opus)$q$, null::numeric, 2),
  ($q$Product and Model Selection$q$, $q$Align model selection with task requirements (cost, speed, quality)$q$, null::numeric, 3),
  ($q$Product and Model Selection$q$, $q$Understand and manage context limitations and memory considerations (when to restart, summarize, or persist)$q$, null::numeric, 4),
  ($q$Workflow Integration and Solution Design$q$, $q$Apply Claude to analyze requirements and use cases$q$, null::numeric, 1),
  ($q$Workflow Integration and Solution Design$q$, $q$Leverage Claude for research, planning, and process optimization$q$, null::numeric, 2),
  ($q$Workflow Integration and Solution Design$q$, $q$Use Claude to support solution design, development, and iteration$q$, null::numeric, 3),
  ($q$Workflow Integration and Solution Design$q$, $q$Integrate Claude into existing workflows to augment or redesign them$q$, null::numeric, 4),
  ($q$Workflow Integration and Solution Design$q$, $q$Communicate Claude's value and limitations to stakeholders$q$, null::numeric, 5),
  ($q$Configuration and Knowledge Management$q$, $q$Configure Claude Projects with instructions and knowledge sources$q$, null::numeric, 1),
  ($q$Configuration and Knowledge Management$q$, $q$Manage uploaded knowledge and connectors (e.g., Google Drive, Gmail)$q$, null::numeric, 2),
  ($q$Configuration and Knowledge Management$q$, $q$Create effective system-level instructions$q$, null::numeric, 3),
  ($q$Configuration and Knowledge Management$q$, $q$Inform, maintain, and update Claude configurations, knowledge sources, and instructions$q$, null::numeric, 4),
  ($q$Governance, Risk, and Responsible Use$q$, $q$Identify appropriate and inappropriate use cases$q$, null::numeric, 1),
  ($q$Governance, Risk, and Responsible Use$q$, $q$Apply data sensitivity, regulatory, and privacy considerations$q$, null::numeric, 2),
  ($q$Governance, Risk, and Responsible Use$q$, $q$Follow organizational AI policies and governance standards$q$, null::numeric, 3),
  ($q$Governance, Risk, and Responsible Use$q$, $q$Understand the ethical implications of AI usage$q$, null::numeric, 4),
  ($q$Troubleshooting and Optimization$q$, $q$Identify, diagnose, and resolve issues with underperforming prompts or poor outputs$q$, null::numeric, 1),
  ($q$Troubleshooting and Optimization$q$, $q$Adjust approach based on feedback and results$q$, null::numeric, 2),
  ($q$Troubleshooting and Optimization$q$, $q$Optimize workflows for efficiency and effectiveness$q$, null::numeric, 3),
  ($q$Applications and Integration$q$, $q$Understanding Requirements$q$, 3.4, 1),
  ($q$Applications and Integration$q$, $q$Systems Life Cycle$q$, 2.8, 2),
  ($q$Applications and Integration$q$, $q$Claude API Mechanics$q$, 6.8, 3),
  ($q$Applications and Integration$q$, $q$Software Engineering Foundations$q$, 7.4, 4),
  ($q$Applications and Integration$q$, $q$Claude Application Design$q$, 8.6, 5),
  ($q$Applications and Integration$q$, $q$Configuration Management$q$, 4.1, 6),
  ($q$Model Selection and Optimization$q$, $q$LLM Fundamentals$q$, 5.2, 1),
  ($q$Model Selection and Optimization$q$, $q$Technical Fundamentals$q$, 6.1, 2),
  ($q$Model Selection and Optimization$q$, $q$Model Selection and Tradeoffs$q$, 2.7, 3),
  ($q$Model Selection and Optimization$q$, $q$Cost and Token Management$q$, 2.8, 4),
  ($q$Agents and Workflows$q$, $q$Agent Architecture$q$, 4.5, 1),
  ($q$Agents and Workflows$q$, $q$Agent Construction with Claude$q$, 5.3, 2),
  ($q$Agents and Workflows$q$, $q$Agent Patterns and Frameworks$q$, 4.9, 3),
  ($q$Prompt and Context Engineering$q$, $q$Context Engineering$q$, 3.8, 1),
  ($q$Prompt and Context Engineering$q$, $q$Prompt Engineering$q$, 4.6, 2),
  ($q$Prompt and Context Engineering$q$, $q$Output Handling$q$, 2.6, 3),
  ($q$Tools and MCPs$q$, $q$Tool Implementation$q$, 4.4, 1),
  ($q$Tools and MCPs$q$, $q$MCP Server Development$q$, 2.1, 2),
  ($q$Tools and MCPs$q$, $q$Agentic Customization$q$, 4.1, 3),
  ($q$Security and Safety$q$, $q$AI Application Security$q$, 3.2, 1),
  ($q$Security and Safety$q$, $q$Guardrails and Safe Deployment$q$, 2.3, 2),
  ($q$Security and Safety$q$, $q$Claude Hooks$q$, 1, 3),
  ($q$Security and Safety$q$, $q$Identity, Secrets, and Key Management$q$, 1.6, 4),
  ($q$Claude Code$q$, $q$Claude Code Operation$q$, 3.1, 1),
  ($q$Eval, Testing, and Debugging$q$, $q$Debugging and Error Handling$q$, 2.6, 1)
) as v (module_title, name, weight, ord)
join quiz_modules m on m.title = v.module_title
on conflict (module_id, name) do nothing;

commit;
