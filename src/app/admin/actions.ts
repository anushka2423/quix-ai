"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import { modules as staticModules } from "@/lib/quiz-data";

const ADMIN_EMAIL = "admin123@gmail.com";
const ADMIN_PASSWORD = "admin123@#";
const SESSION_VALUE = "quix_admin_v1";

function getAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, key);
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export async function loginAction(_: unknown, formData: FormData) {
  const email = (formData.get("email") as string | null)?.trim() ?? "";
  const password = (formData.get("password") as string | null) ?? "";

  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    const cookieStore = await cookies();
    cookieStore.set("admin_session", SESSION_VALUE, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 8,
      path: "/",
    });
    redirect("/admin");
  }

  return { error: "Invalid email or password" };
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");
  redirect("/admin/login");
}

// ── Modules ───────────────────────────────────────────────────────────────────

export async function createModuleAction(data: {
  title: string;
  description: string;
  locked: boolean;
}): Promise<{ error?: string }> {
  const sb = getAdminSupabase();
  const { data: maxRow } = await sb
    .from("quiz_modules")
    .select("order_index")
    .order("order_index", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { error } = await sb.from("quiz_modules").insert({
    title: data.title.trim(),
    description: data.description.trim(),
    locked: data.locked,
    order_index: (maxRow?.order_index ?? 0) + 1,
  });

  if (error) return { error: error.message };
  revalidatePath("/admin");
  return {};
}

export async function updateModuleAction(data: {
  id: number;
  title: string;
  description: string;
  locked: boolean;
}): Promise<{ error?: string }> {
  const sb = getAdminSupabase();
  const { error } = await sb
    .from("quiz_modules")
    .update({
      title: data.title.trim(),
      description: data.description.trim(),
      locked: data.locked,
    })
    .eq("id", data.id);

  if (error) return { error: error.message };
  revalidatePath("/admin");
  revalidatePath(`/admin/modules/${data.id}`);
  return {};
}

export async function deleteModuleAction(id: number): Promise<{ error?: string }> {
  const sb = getAdminSupabase();
  const { error } = await sb.from("quiz_modules").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin");
  return {};
}

// ── Questions ─────────────────────────────────────────────────────────────────

export async function createQuestionAction(data: {
  moduleId: number;
  section: string;
  difficulty: string;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  answer: string;
}): Promise<{ error?: string }> {
  const sb = getAdminSupabase();
  const { data: maxRow } = await sb
    .from("quiz_questions")
    .select("order_index")
    .eq("module_id", data.moduleId)
    .order("order_index", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { error } = await sb.from("quiz_questions").insert({
    module_id: data.moduleId,
    section: data.section.trim(),
    difficulty: data.difficulty,
    question: data.question.trim(),
    option_a: data.optionA.trim(),
    option_b: data.optionB.trim(),
    option_c: data.optionC.trim(),
    option_d: data.optionD.trim(),
    answer: data.answer,
    order_index: (maxRow?.order_index ?? 0) + 1,
  });

  if (error) return { error: error.message };
  revalidatePath(`/admin/modules/${data.moduleId}`);
  return {};
}

export async function updateQuestionAction(data: {
  id: number;
  moduleId: number;
  section: string;
  difficulty: string;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  answer: string;
}): Promise<{ error?: string }> {
  const sb = getAdminSupabase();
  const { error } = await sb
    .from("quiz_questions")
    .update({
      section: data.section.trim(),
      difficulty: data.difficulty,
      question: data.question.trim(),
      option_a: data.optionA.trim(),
      option_b: data.optionB.trim(),
      option_c: data.optionC.trim(),
      option_d: data.optionD.trim(),
      answer: data.answer,
    })
    .eq("id", data.id);

  if (error) return { error: error.message };
  revalidatePath(`/admin/modules/${data.moduleId}`);
  return {};
}

export async function deleteQuestionAction(
  id: number,
  moduleId: number
): Promise<{ error?: string }> {
  const sb = getAdminSupabase();
  const { error } = await sb.from("quiz_questions").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath(`/admin/modules/${moduleId}`);
  return {};
}

// ── Seed ──────────────────────────────────────────────────────────────────────

export async function seedStaticDataAction(): Promise<{ error?: string; seeded?: number }> {
  const sb = getAdminSupabase();

  let seeded = 0;

  for (const mod of staticModules) {
    const { data: inserted, error: modErr } = await sb
      .from("quiz_modules")
      .insert({
        title: mod.title,
        description: mod.description,
        locked: mod.locked ?? false,
        order_index: mod.id,
      })
      .select("id")
      .single();

    if (modErr) return { error: `Module "${mod.title}": ${modErr.message}` };

    const dbModuleId = inserted.id;

    for (let i = 0; i < mod.questions.length; i++) {
      const q = mod.questions[i];
      const { error: qErr } = await sb.from("quiz_questions").insert({
        module_id: dbModuleId,
        section: q.section,
        difficulty: q.difficulty,
        question: q.question,
        option_a: q.options.find((o) => o.label === "A")?.text ?? "",
        option_b: q.options.find((o) => o.label === "B")?.text ?? "",
        option_c: q.options.find((o) => o.label === "C")?.text ?? "",
        option_d: q.options.find((o) => o.label === "D")?.text ?? "",
        answer: q.answer,
        order_index: i + 1,
      });
      if (qErr) return { error: `Question in "${mod.title}": ${qErr.message}` };
      seeded++;
    }
  }

  revalidatePath("/admin");
  return { seeded };
}
