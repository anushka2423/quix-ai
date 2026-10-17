import { NextRequest } from "next/server";
import { db } from "@/lib/server/db";
import { requireAdminAuth, unauthorizedJson, notFoundJson } from "@/lib/liveq/auth";
import { getSession, getPublicSnapshot, getSessionParticipants, countSubmissions, flattenQuestions } from "@/lib/liveq/db";
import type { AdminSessionState, AdminQuestionState } from "@/types/liveq";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  try { await requireAdminAuth(); } catch { return unauthorizedJson(); }
  const { id } = await params;
  const c = db();
  if (!c) return Response.json({ error: "Database not configured" }, { status: 503 });

  const [session, participants] = await Promise.all([
    getSession(id),
    getSessionParticipants(id),
  ]);

  if (!session) return notFoundJson("Session not found");

  const snapshot = await getPublicSnapshot(session.quiz_version_id);
  if (!snapshot) return notFoundJson("Quiz snapshot not found");

  const allQuestions = flattenQuestions(snapshot);

  let currentQuestion: AdminQuestionState | null = null;
  if (session.status !== "lobby" && session.current_question_index !== null) {
    const q = allQuestions[session.current_question_index];
    if (q) {
      const moduleTitle = snapshot.modules.find((m) => m.questions.some((mq) => mq.id === q.id))?.title ?? "";
      const subCount = await countSubmissions(session.id, q.id);
      currentQuestion = {
        id: q.id,
        index: session.current_question_index,
        module_title: moduleTitle,
        question: (q as { question: string }).question,
        options: (q as { options: { label: string; text: string }[] }).options,
        timer_secs: q.timer_secs,
        started_at: session.question_started_at ?? "",
        deadline: session.question_deadline ?? "",
        paused_remaining_secs: session.question_remaining_secs,
        submission_count: subCount,
        total_participants: participants.length,
      };
    }
  }

  let submissionCount = 0;
  if (currentQuestion) submissionCount = currentQuestion.submission_count;

  const state: AdminSessionState = {
    session,
    quiz_snapshot: snapshot,
    participants: participants.map((p) => ({
      id: p.id,
      display_name: p.display_name,
      joined_at: p.joined_at,
      last_seen_at: p.last_seen_at,
      score: p.score,
      rank: p.rank,
    })),
    submission_count: submissionCount,
    current_question: currentQuestion,
  };

  return Response.json(state);
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  try { await requireAdminAuth(); } catch { return unauthorizedJson(); }
  const { id } = await params;
  const c = db();
  if (!c) return Response.json({ error: "Database not configured" }, { status: 503 });

  const session = await getSession(id);
  if (!session) return notFoundJson("Session not found");

  // Delete in FK-safe order
  await c.from("lq_participant_results").delete().eq("session_id", id);
  await c.from("lq_responses").delete().eq("session_id", id);
  await c.from("lq_session_events").delete().eq("session_id", id);
  await c.from("lq_participants").delete().eq("session_id", id);
  await c.from("lq_sessions").delete().eq("id", id);

  return Response.json({ ok: true });
}