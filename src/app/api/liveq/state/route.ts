import { NextRequest } from "next/server";
import { db } from "@/lib/server/db";
import {
  getSession,
  getParticipantByToken,
  getPublicSnapshot,
  getParticipantResponse,
  getParticipantResult,
  getSessionParticipants,
  touchParticipant,
  flattenQuestions,
} from "@/lib/liveq/db";
import { tick } from "@/lib/liveq/engine";
import {
  getCachedParticipants,
  setCachedParticipants,
  shouldSkipTouch,
  recordTouch,
} from "@/lib/liveq/cache";
import type { ParticipantState, PublicQuestionState, ParticipantResultPayload, LiveLeaderboardEntry } from "@/types/liveq";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const c = db();
  if (!c) return Response.json({ error: "Database not configured" }, { status: 503 });

  const token = request.nextUrl.searchParams.get("token");
  if (!token) return Response.json({ error: "token param required" }, { status: 400 });

  const participant = await getParticipantByToken(token);
  if (!participant) return Response.json({ error: "Invalid token" }, { status: 401 });

  // Update last_seen (debounced — skip if touched within the last 10s)
  if (!shouldSkipTouch(participant.id)) {
    recordTouch(participant.id);
    touchParticipant(participant.id); // fire-and-forget
  }

  // Trigger tick (advance quiz if deadline passed)
  let session = await tick(participant.session_id);
  if (!session) return Response.json({ error: "Session not found" }, { status: 404 });

  const snapshot = await getPublicSnapshot(session.quiz_version_id);
  if (!snapshot) return Response.json({ error: "Snapshot not found" }, { status: 500 });

  const allQuestions = flattenQuestions(snapshot);
  const totalQuestions = allQuestions.length;

  let currentQuestion: PublicQuestionState | null = null;
  let answered = false;

  if ((session.status === "active" || session.status === "paused") && session.current_question_index !== null) {
    const q = allQuestions[session.current_question_index];
    if (q) {
      const moduleTitle = snapshot.modules.find((m) => m.questions.some((mq) => mq.id === q.id))?.title ?? "";
      const qFull = q as { id: string; question: string; options: { label: string; text: string }[]; timer_secs: number; type: string };
      currentQuestion = {
        id: q.id,
        index: session.current_question_index,
        module_title: moduleTitle,
        question: qFull.question,
        options: qFull.options,
        timer_secs: q.timer_secs,
        started_at: session.question_started_at ?? "",
        deadline: session.question_deadline ?? "",
        paused_remaining_secs: session.question_remaining_secs,
        question_type: qFull.type as "single" | "truefalse",
      };

      const response = await getParticipantResponse(session.id, participant.id, q.id);
      answered = response !== null;
    }
  }

  // Live leaderboard — shown after participant answers the current question
  let leaderboard: LiveLeaderboardEntry[] | null = null;
  if (
    (session.status === "active" || session.status === "paused") &&
    answered &&
    snapshot.config.show_leaderboard_live
  ) {
    let cached = getCachedParticipants(session.id);
    if (!cached) {
      cached = await getSessionParticipants(session.id);
      setCachedParticipants(session.id, cached);
    }
    const sorted = [...cached].sort((a, b) => b.score - a.score);
    const myIdx = sorted.findIndex((p) => p.id === participant.id);
    const myRank = myIdx + 1;

    // Build ranked list and pick top-3 + me (if outside top 3)
    const ranked = sorted.map((p, i) => ({
      rank: i + 1,
      display_name: p.display_name,
      score: p.score,
      is_me: p.id === participant.id,
    }));

    const top3 = ranked.slice(0, 3);
    const meEntry = ranked[myIdx];
    const showMe = meEntry && myRank > 3;

    leaderboard = showMe ? [...top3, meEntry] : top3;
  }

  // Results
  let results: ParticipantResultPayload | null = null;
  if (session.status === "completed") {
    // Re-read participant to get updated score/rank
    const [updatedParticipant, result, allParticipants] = await Promise.all([
      getParticipantByToken(token),
      getParticipantResult(session.id, participant.id),
      getSessionParticipants(session.id),
    ]);

    const shouldShowResults = session.results_published || !snapshot.config.results_released_by_admin;
    if (shouldShowResults && result) {
      results = {
        score: result.score,
        rank: result.rank,
        total_participants: allParticipants.length,
        correct_count: result.correct_count,
        incorrect_count: result.incorrect_count,
        unanswered_count: result.unanswered_count,
        accuracy: result.accuracy,
        module_results: result.module_results,
        concept_results: result.concept_results,
      };
    }

    // Update local participant from fresh read
    if (updatedParticipant) {
      participant.score = updatedParticipant.score;
      participant.rank = updatedParticipant.rank;
    }
  }

  const state: ParticipantState = {
    session_id: session.id,
    status: session.status,
    quiz_title: snapshot.title,
    instructions: snapshot.instructions,
    participant_id: participant.id,
    display_name: participant.display_name,
    score: participant.score,
    rank: participant.rank,
    current_question: currentQuestion,
    total_questions: totalQuestions,
    current_question_index: session.current_question_index,
    answered,
    results,
    session_started_at: session.started_at,
    session_duration_mins: snapshot.config.session_duration_mins ?? 40,
    leaderboard,
  };

  return Response.json(state);
}
