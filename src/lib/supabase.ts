import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { Difficulty, QuizModule } from "@/types/quiz";

let _client: SupabaseClient | null = null;

function getClient(): SupabaseClient | null {
  if (_client) return _client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key || url === "your_supabase_project_url") return null;
  _client = createClient(url, key);
  return _client;
}

export async function fetchQuizModules(): Promise<QuizModule[]> {
  const client = getClient();
  if (!client) throw new Error("Supabase is not configured");
  const [mods, qs] = await Promise.all([
    client.from("quiz_modules").select("*").order("order_index", { ascending: true }),
    client.from("quiz_questions").select("*").order("order_index", { ascending: true }),
  ]);
  if (mods.error) throw mods.error;
  if (qs.error) throw qs.error;

  return (mods.data ?? []).map((m) => ({
    id: m.id,
    title: m.title,
    description: m.description,
    locked: m.locked,
    questions: (qs.data ?? [])
      .filter((q) => q.module_id === m.id)
      .map((q) => ({
        id: q.id,
        section: q.section,
        difficulty: q.difficulty as Difficulty,
        question: q.question,
        options: [
          { label: "A" as const, text: q.option_a },
          { label: "B" as const, text: q.option_b },
          { label: "C" as const, text: q.option_c },
          { label: "D" as const, text: q.option_d },
        ],
        answer: q.answer,
      })),
  }));
}

export async function saveLead(email: string) {
  const client = getClient();
  if (!client) return null;
  const { error } = await client
    .from("quiz_leads")
    .upsert({ email }, { onConflict: "email" });
  return error;
}

export async function updateCallScript({
  email,
  moduleId,
  callScript,
}: {
  email: string;
  moduleId: number;
  callScript: string;
}) {
  const client = getClient();
  if (!client) return null;
  const { error } = await client
    .from("quiz_results")
    .update({ call_script: callScript })
    .eq("email", email)
    .eq("module_id", moduleId)
    .order("completed_at", { ascending: false })
    .limit(1);
  return error;
}

export async function saveResult({
  email,
  moduleId,
  moduleTitle,
  answers,
  score,
  total,
}: {
  email: string;
  moduleId: number;
  moduleTitle: string;
  answers: string;
  score: number;
  total: number;
}) {
  const client = getClient();
  if (!client) return null;
  const pct = Math.round((score / total) * 100);
  const { error } = await client.from("quiz_results").insert({
    email,
    module_id: moduleId,
    module_title: moduleTitle,
    answers,
    score,
    total,
    pct,
  });
  return error;
}