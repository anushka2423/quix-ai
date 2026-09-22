import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;

function getClient(): SupabaseClient | null {
  if (_client) return _client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key || url === "your_supabase_project_url") return null;
  _client = createClient(url, key);
  return _client;
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