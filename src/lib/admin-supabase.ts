import { createClient } from "@supabase/supabase-js";

/*
  Run this SQL in your Supabase SQL editor before using the admin dashboard:

  create table if not exists quiz_modules (
    id           serial primary key,
    title        text not null,
    description  text not null default '',
    locked       boolean not null default false,
    order_index  integer not null default 0,
    created_at   timestamptz not null default now()
  );

  create table if not exists quiz_questions (
    id           serial primary key,
    module_id    integer not null references quiz_modules(id) on delete cascade,
    section      text not null default '',
    difficulty   text not null default 'Easy',
    question     text not null,
    option_a     text not null default '',
    option_b     text not null default '',
    option_c     text not null default '',
    option_d     text not null default '',
    answer       text not null default 'A',
    order_index  integer not null default 0,
    created_at   timestamptz not null default now()
  );

  create table if not exists quiz_leads (
    id           serial primary key,
    email        text not null unique,
    created_at   timestamptz not null default now()
  );

  -- answers stores a JSON array of per-question results:
  -- [{ questionId, question, section, difficulty, userAnswer, correctAnswer, isCorrect }, ...]
  create table if not exists quiz_results (
    id             serial primary key,
    email          text not null,
    module_id      integer not null,
    module_title   text not null default '',
    answers        text not null default '[]',
    score          integer not null default 0,
    total          integer not null default 0,
    pct            integer not null default 0,
    completed_at   timestamptz not null default now()
  );

  alter table quiz_modules disable row level security;
  alter table quiz_questions disable row level security;
  alter table quiz_leads disable row level security;
  alter table quiz_results disable row level security;
*/

function getClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, key);
}

export type DbModule = {
  id: number;
  title: string;
  description: string;
  locked: boolean;
  order_index: number;
  created_at: string;
};

export type DbQuestion = {
  id: number;
  module_id: number;
  section: string;
  difficulty: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  answer: string;
  order_index: number;
};

export async function adminFetchModules(): Promise<DbModule[]> {
  const sb = getClient();
  const { data } = await sb
    .from("quiz_modules")
    .select("*")
    .order("order_index", { ascending: true });
  return data ?? [];
}

export async function adminFetchModule(id: number): Promise<DbModule | null> {
  const sb = getClient();
  const { data } = await sb
    .from("quiz_modules")
    .select("*")
    .eq("id", id)
    .single();
  return data ?? null;
}

export async function adminFetchQuestions(moduleId: number): Promise<DbQuestion[]> {
  const sb = getClient();
  const { data } = await sb
    .from("quiz_questions")
    .select("*")
    .eq("module_id", moduleId)
    .order("order_index", { ascending: true });
  return data ?? [];
}

/** Every question across all modules, ordered by module then position. */
export async function adminFetchAllQuestions(): Promise<DbQuestion[]> {
  const sb = getClient();
  const { data } = await sb
    .from("quiz_questions")
    .select("*")
    .order("module_id", { ascending: true })
    .order("order_index", { ascending: true });
  return data ?? [];
}

export type DbResponse = {
  id: number;
  email: string;
  module_id: number;
  module_title: string;
  answers: string;
  score: number;
  total: number;
  pct: number;
  completed_at: string;
};

export type DetailedAnswer = {
  questionId: number;
  question: string;
  section: string;
  difficulty: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
};

export async function adminFetchResponses(): Promise<DbResponse[]> {
  const sb = getClient();
  const { data } = await sb
    .from("quiz_results")
    .select("*")
    .order("completed_at", { ascending: false });
  return data ?? [];
}