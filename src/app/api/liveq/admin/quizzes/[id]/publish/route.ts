import { NextRequest } from "next/server";
import { db } from "@/lib/server/db";
import { requireAdminAuth, unauthorizedJson, badRequestJson, notFoundJson } from "@/lib/liveq/auth";
import { getQuizWithModulesAndQuestions, buildSnapshots } from "@/lib/liveq/db";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(_req: NextRequest, { params }: Ctx) {
  try { await requireAdminAuth(); } catch { return unauthorizedJson(); }
  const { id } = await params;
  const c = db();
  if (!c) return Response.json({ error: "Database not configured" }, { status: 503 });

  const result = await getQuizWithModulesAndQuestions(id);
  if (!result) return notFoundJson("Quiz not found");
  const { quiz, modules, questions } = result;

  if (quiz.status === "published") return badRequestJson("Quiz is already published");

  // Validate
  const errors: string[] = [];
  if (!quiz.title.trim()) errors.push("Quiz title is required");
  if (modules.length !== 3) errors.push(`Quiz must have exactly 3 modules (has ${modules.length})`);
  for (const m of modules) {
    const mqs = questions.filter((q) => q.module_id === m.id);
    if (mqs.length < 1) errors.push(`Module "${m.title}" has no questions`);
    for (const q of mqs) {
      if (!q.question.trim()) errors.push(`A question in "${m.title}" has empty text`);
      if (!q.correct_answer.trim()) errors.push(`A question in "${m.title}" has no correct answer`);
      if (!q.concept.trim()) errors.push(`A question in "${m.title}" has no concept tag`);
      if (!q.options || q.options.length < 2) errors.push(`A question in "${m.title}" has fewer than 2 options`);
      if (q.timer_secs < 5 || q.timer_secs > 300) errors.push(`Timer for a question in "${m.title}" must be 5–300 s`);
    }
  }

  if (errors.length > 0) return Response.json({ errors }, { status: 422 });

  // Build immutable snapshot
  const { publicSnapshot, privateSnapshot } = buildSnapshots(quiz, modules, questions);

  const { data: version, error: vErr } = await c
    .from("lq_quiz_versions")
    .insert({ quiz_id: id, snapshot: publicSnapshot, snapshot_with_keys: privateSnapshot })
    .select("id")
    .single();

  if (vErr) return Response.json({ error: vErr.message }, { status: 500 });

  const { error: qErr } = await c
    .from("lq_quizzes")
    .update({ status: "published", published_at: new Date().toISOString() })
    .eq("id", id);

  if (qErr) return Response.json({ error: qErr.message }, { status: 500 });

  return Response.json({ ok: true, version_id: version.id });
}
