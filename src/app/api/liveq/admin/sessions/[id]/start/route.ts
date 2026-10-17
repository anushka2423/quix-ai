import { NextRequest } from "next/server";
import { db } from "@/lib/server/db";
import { requireAdminAuth, unauthorizedJson, badRequestJson, notFoundJson } from "@/lib/liveq/auth";
import { getSession, getPrivateSnapshot, flattenQuestions, logSessionEvent } from "@/lib/liveq/db";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(_req: NextRequest, { params }: Ctx) {
  try { await requireAdminAuth(); } catch { return unauthorizedJson(); }
  const { id } = await params;
  const c = db();
  if (!c) return Response.json({ error: "Database not configured" }, { status: 503 });

  const session = await getSession(id);
  if (!session) return notFoundJson("Session not found");
  if (session.status !== "lobby") return badRequestJson(`Session is already ${session.status}`);

  const snapshot = await getPrivateSnapshot(session.quiz_version_id);
  if (!snapshot) return badRequestJson("Quiz snapshot not found");

  const allQuestions = flattenQuestions(snapshot);
  if (allQuestions.length === 0) return badRequestJson("Quiz has no questions");

  const firstQuestion = allQuestions[0];
  const now = new Date().toISOString();
  const deadline = new Date(Date.now() + firstQuestion.timer_secs * 1000).toISOString();

  // Idempotent: only update if still in lobby status
  const { data: updated, error } = await c
    .from("lq_sessions")
    .update({
      status: "active",
      started_at: now,
      current_question_index: 0,
      question_started_at: now,
      question_deadline: deadline,
      question_remaining_secs: null,
    })
    .eq("id", id)
    .eq("status", "lobby")
    .select("*")
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  if (!updated) return badRequestJson("Session could not be started (may have already started)");

  await logSessionEvent(id, "quiz_started", {
    started_at: now,
    first_question_id: firstQuestion.id,
    deadline,
  });

  return Response.json({ session: updated });
}
