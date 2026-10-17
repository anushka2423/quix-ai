import { NextRequest } from "next/server";
import { db } from "@/lib/server/db";
import { requireAdminAuth, unauthorizedJson, badRequestJson, notFoundJson } from "@/lib/liveq/auth";
import { getQuizWithModulesAndQuestions } from "@/lib/liveq/db";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  try { await requireAdminAuth(); } catch { return unauthorizedJson(); }
  const { id } = await params;
  const result = await getQuizWithModulesAndQuestions(id);
  if (!result) return notFoundJson("Quiz not found");
  return Response.json(result);
}

export async function PUT(request: NextRequest, { params }: Ctx) {
  try { await requireAdminAuth(); } catch { return unauthorizedJson(); }
  const { id } = await params;
  const c = db();
  if (!c) return Response.json({ error: "Database not configured" }, { status: 503 });

  const body = await request.json().catch(() => null);
  if (!body) return badRequestJson("Invalid JSON");

  // Cannot edit a published quiz body (only config changes allowed post-publish)
  const { data: existing } = await c.from("lq_quizzes").select("status").eq("id", id).single();
  if (!existing) return notFoundJson("Quiz not found");
  if (existing.status === "published" && body.modules) {
    return badRequestJson("Cannot modify modules/questions of a published quiz. Create a new quiz instead.");
  }

  // Update quiz metadata and config
  const updates: Record<string, unknown> = {};
  if (body.title !== undefined) updates.title = (body.title as string).trim();
  if (body.description !== undefined) updates.description = body.description || null;
  if (body.instructions !== undefined) updates.instructions = body.instructions || null;
  if (body.config !== undefined) updates.config = body.config;

  if (Object.keys(updates).length > 0) {
    const { error } = await c.from("lq_quizzes").update(updates).eq("id", id);
    if (error) return Response.json({ error: error.message }, { status: 500 });
  }

  // Update modules if provided (only for draft quizzes)
  if (body.modules && existing.status === "draft") {
    // Delete existing modules (cascade deletes questions)
    await c.from("lq_modules").delete().eq("quiz_id", id);

    const modules = body.modules as Array<{
      title: string;
      description?: string;
      order_index: number;
      questions: Array<{
        type: string;
        question: string;
        options: Array<{ label: string; text: string }>;
        correct_answer: string;
        explanation?: string;
        concept: string;
        points?: number;
        timer_secs?: number;
        order_index: number;
      }>;
    }>;

    for (const mod of modules) {
      const { data: modRow, error: modErr } = await c
        .from("lq_modules")
        .insert({ quiz_id: id, title: mod.title.trim(), description: mod.description || null, order_index: mod.order_index })
        .select("id")
        .single();
      if (modErr) return Response.json({ error: modErr.message }, { status: 500 });

      if (mod.questions?.length) {
        const qRows = mod.questions.map((q) => ({
          quiz_id: id,
          module_id: modRow.id,
          type: q.type ?? "single",
          question: q.question.trim(),
          options: q.options,
          correct_answer: q.correct_answer.trim(),
          explanation: q.explanation?.trim() || null,
          concept: (q.concept ?? "General").trim(),
          points: q.points ?? 100,
          timer_secs: q.timer_secs ?? 60,
          order_index: q.order_index,
        }));
        const { error: qErr } = await c.from("lq_questions").insert(qRows);
        if (qErr) return Response.json({ error: qErr.message }, { status: 500 });
      }
    }
  }

  const result = await getQuizWithModulesAndQuestions(id);
  return Response.json(result);
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  try { await requireAdminAuth(); } catch { return unauthorizedJson(); }
  const { id } = await params;
  const c = db();
  if (!c) return Response.json({ error: "Database not configured" }, { status: 503 });

  const { data: existing } = await c.from("lq_quizzes").select("id").eq("id", id).single();
  if (!existing) return notFoundJson("Quiz not found");

  // Cascade-delete sessions and all their data first
  const { data: sessions } = await c.from("lq_sessions").select("id").eq("quiz_id", id);
  for (const s of sessions ?? []) {
    await c.from("lq_participant_results").delete().eq("session_id", s.id);
    await c.from("lq_responses").delete().eq("session_id", s.id);
    await c.from("lq_session_events").delete().eq("session_id", s.id);
    await c.from("lq_participants").delete().eq("session_id", s.id);
    await c.from("lq_sessions").delete().eq("id", s.id);
  }

  // Delete quiz data
  await c.from("lq_quiz_versions").delete().eq("quiz_id", id);
  await c.from("lq_questions").delete().eq("quiz_id", id);
  await c.from("lq_modules").delete().eq("quiz_id", id);
  const { error } = await c.from("lq_quizzes").delete().eq("id", id);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}
