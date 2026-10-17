import { NextRequest } from "next/server";
import { db } from "@/lib/server/db";
import {
  getSession,
  getParticipantByToken,
  getPrivateSnapshot,
  getParticipantResponse,
  flattenQuestions,
} from "@/lib/liveq/db";
import { scoreAnswer } from "@/lib/liveq/engine";
import { badRequestJson } from "@/lib/liveq/auth";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const c = db();
  if (!c) return Response.json({ error: "Database not configured" }, { status: 503 });

  const body = await request.json().catch(() => null);
  if (!body) return badRequestJson("Invalid JSON");

  const token = (body.token as string | undefined)?.trim();
  const questionId = (body.question_id as string | undefined)?.trim();
  const selectedAnswer = (body.selected_answer as string | undefined)?.trim();

  if (!token) return badRequestJson("token is required");
  if (!questionId) return badRequestJson("question_id is required");
  if (!selectedAnswer) return badRequestJson("selected_answer is required");

  const participant = await getParticipantByToken(token);
  if (!participant) return Response.json({ error: "Invalid token" }, { status: 401 });

  const session = await getSession(participant.session_id);
  if (!session) return Response.json({ error: "Session not found" }, { status: 404 });

  // Security checks
  if (session.status !== "active") {
    return Response.json({ error: "Quiz is not active" }, { status: 409 });
  }

  if (session.current_question_index === null) {
    return Response.json({ error: "No active question" }, { status: 409 });
  }

  const snapshot = await getPrivateSnapshot(session.quiz_version_id);
  if (!snapshot) return Response.json({ error: "Snapshot not found" }, { status: 500 });

  const allQuestions = flattenQuestions(snapshot);
  const currentQ = allQuestions[session.current_question_index];

  if (!currentQ || currentQ.id !== questionId) {
    return Response.json({ error: "This is not the active question" }, { status: 409 });
  }

  // Deadline check (server-side)
  if (session.question_deadline && new Date() > new Date(session.question_deadline)) {
    return Response.json({ error: "Time has expired for this question" }, { status: 409 });
  }

  // Duplicate submission check
  const existing = await getParticipantResponse(session.id, participant.id, questionId);
  if (existing) {
    return Response.json({ error: "Answer already submitted for this question" }, { status: 409 });
  }

  const privateQ = currentQ as { correct_answer: string };
  const config = snapshot.config;

  const { is_correct, points_awarded } = scoreAnswer(
    selectedAnswer,
    privateQ.correct_answer,
    config.points_correct,
    config.points_incorrect
  );

  const responseTimeMs = session.question_started_at
    ? Date.now() - new Date(session.question_started_at).getTime()
    : null;

  // Insert response
  const { error: rErr } = await c.from("lq_responses").insert({
    session_id: session.id,
    participant_id: participant.id,
    question_id: questionId,
    selected_answer: selectedAnswer,
    is_correct,
    points_awarded,
    response_time_ms: responseTimeMs,
  });

  if (rErr) {
    if (rErr.code === "23505") return Response.json({ error: "Answer already submitted" }, { status: 409 });
    return Response.json({ error: rErr.message }, { status: 500 });
  }

  // Update running score on participant
  if (points_awarded !== 0) {
    await c
      .from("lq_participants")
      .update({ score: participant.score + points_awarded })
      .eq("id", participant.id);
  }

  return Response.json({ ok: true, is_correct, points_awarded, correct_answer: privateQ.correct_answer });
}
