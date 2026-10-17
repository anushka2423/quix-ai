import { db } from "@/lib/server/db";
import {
  getSession,
  getPrivateSnapshot,
  flattenQuestions,
  getAllSessionResponses,
  getSessionParticipants,
  logSessionEvent,
} from "./db";
import type {
  LQSession,
  PrivateQuizSnapshot,
  ConceptResult,
  ModuleResult,
  LQParticipantResult,
  LQParticipant,
} from "@/types/liveq";

// ── Concept thresholds ────────────────────────────────────────────────────────

export const CONCEPT_STRONG = 0.8;
export const CONCEPT_DEVELOPING = 0.6;

export function conceptStatus(accuracy: number): ConceptResult["status"] {
  if (accuracy >= CONCEPT_STRONG) return "strong";
  if (accuracy >= CONCEPT_DEVELOPING) return "developing";
  return "needs_improvement";
}

// ── Tick: advance quiz if the current question deadline has passed ─────────────

/**
 * Atomically advances the session to the next question if the current deadline
 * has passed. Returns the updated session (or the unchanged session if no advance
 * was needed). Safe to call concurrently — uses a conditional DB update.
 */
export async function tick(sessionId: string): Promise<LQSession | null> {
  const c = db();
  if (!c) return null;

  // Only advance when the session is active and the deadline has passed.
  // We use a conditional update: affected rows = 0 means someone else already advanced.
  const now = new Date().toISOString();

  const session = await getSession(sessionId);
  if (!session || session.status !== "active") return session;

  // Not yet expired
  if (!session.question_deadline || session.question_deadline > now) return session;

  // Deadline has passed → mark any unanswered submissions and advance
  const snapshot = await getPrivateSnapshot(session.quiz_version_id);
  if (!snapshot) return session;

  const allQuestions = flattenQuestions(snapshot);
  const currentIndex = session.current_question_index ?? 0;
  const currentQuestion = allQuestions[currentIndex];

  if (!currentQuestion) return session;

  // Persist unanswered records for participants who didn't submit
  await markUnanswered(sessionId, currentQuestion.id, snapshot.config.points_unanswered);

  const nextIndex = currentIndex + 1;
  const isLast = nextIndex >= allQuestions.length;

  if (isLast) {
    // Quiz complete — auto-publish results immediately
    await c
      .from("lq_sessions")
      .update({ status: "completed", completed_at: now, current_question_index: currentIndex, results_published: true })
      .eq("id", sessionId)
      .eq("status", "active")
      .lt("question_deadline", now);

    await generateFinalResults(sessionId, snapshot);
    await logSessionEvent(sessionId, "quiz_completed", { completed_at: now });

    return getSession(sessionId);
  }

  // Advance to the next question
  const nextQuestion = allQuestions[nextIndex];
  const timerSecs = (nextQuestion as { timer_secs: number }).timer_secs;
  const startedAt = now;
  const deadline = new Date(Date.now() + timerSecs * 1000).toISOString();

  await c
    .from("lq_sessions")
    .update({
      current_question_index: nextIndex,
      question_started_at: startedAt,
      question_deadline: deadline,
      question_remaining_secs: null,
    })
    .eq("id", sessionId)
    .eq("status", "active")
    .lt("question_deadline", now);

  await logSessionEvent(sessionId, "question_started", {
    question_index: nextIndex,
    question_id: nextQuestion.id,
    deadline,
  });

  return getSession(sessionId);
}

// ── Mark unanswered questions for participants who didn't submit ───────────────

async function markUnanswered(
  sessionId: string,
  questionId: string,
  pointsUnanswered: number
): Promise<void> {
  const c = db();
  if (!c) return;

  const participants = await getSessionParticipants(sessionId);
  const { data: existing } = await c
    .from("lq_responses")
    .select("participant_id")
    .eq("session_id", sessionId)
    .eq("question_id", questionId);

  const answeredIds = new Set((existing ?? []).map((r) => r.participant_id));
  const unanswered = participants.filter((p) => !answeredIds.has(p.id));

  if (unanswered.length === 0) return;

  await c.from("lq_responses").insert(
    unanswered.map((p) => ({
      session_id: sessionId,
      participant_id: p.id,
      question_id: questionId,
      selected_answer: null,
      is_correct: false,
      points_awarded: pointsUnanswered,
      response_time_ms: null,
    }))
  );

  // Award unanswered points to score (usually 0)
  if (pointsUnanswered !== 0) {
    for (const p of unanswered) {
      await c
        .from("lq_participants")
        .update({ score: p.score + pointsUnanswered })
        .eq("id", p.id);
    }
  }
}

// ── Final results ─────────────────────────────────────────────────────────────

export async function generateFinalResults(
  sessionId: string,
  snapshot: PrivateQuizSnapshot
): Promise<void> {
  const c = db();
  if (!c) return;

  const [participants, responses] = await Promise.all([
    getSessionParticipants(sessionId),
    getAllSessionResponses(sessionId),
  ]);

  const allQuestions = flattenQuestions(snapshot);
  const totalQuestions = allQuestions.length;

  const responsesByParticipant = new Map<string, typeof responses>();
  for (const r of responses) {
    const list = responsesByParticipant.get(r.participant_id) ?? [];
    list.push(r);
    responsesByParticipant.set(r.participant_id, list);
  }

  // Build module and concept maps
  const questionModuleMap = new Map<string, string>(); // questionId → moduleId
  const questionConceptMap = new Map<string, string>(); // questionId → concept
  const moduleIdToTitle = new Map<string, string>();
  const allQuestionIds = new Set<string>();

  for (const m of snapshot.modules) {
    moduleIdToTitle.set(m.id, m.title);
    for (const q of m.questions) {
      questionModuleMap.set(q.id, m.id);
      questionConceptMap.set(q.id, q.concept);
      allQuestionIds.add(q.id);
    }
  }

  // Compute per-participant results
  const results: Omit<LQParticipantResult, "id">[] = participants.map((p) => {
    const pResponses = responsesByParticipant.get(p.id) ?? [];
    const responseMap = new Map(pResponses.map((r) => [r.question_id, r]));

    let correct = 0;
    let incorrect = 0;
    let unanswered = 0;
    let totalScore = 0;
    let totalMs = 0;

    const moduleAccMap = new Map<string, { score: number; correct: number; total: number }>();
    const conceptAccMap = new Map<string, { correct: number; incorrect: number; unanswered: number; total: number }>();

    for (const qId of allQuestionIds) {
      const r = responseMap.get(qId);
      const moduleId = questionModuleMap.get(qId)!;
      const concept = questionConceptMap.get(qId)!;

      const mAcc = moduleAccMap.get(moduleId) ?? { score: 0, correct: 0, total: 0 };
      const cAcc = conceptAccMap.get(concept) ?? { correct: 0, incorrect: 0, unanswered: 0, total: 0 };
      cAcc.total++;
      mAcc.total++;

      if (!r || r.selected_answer === null) {
        unanswered++;
        cAcc.unanswered++;
      } else if (r.is_correct) {
        correct++;
        totalScore += r.points_awarded;
        totalMs += r.response_time_ms ?? 0;
        mAcc.score += r.points_awarded;
        mAcc.correct++;
        cAcc.correct++;
      } else {
        incorrect++;
        cAcc.incorrect++;
      }

      moduleAccMap.set(moduleId, mAcc);
      conceptAccMap.set(concept, cAcc);
    }

    const accuracy = totalQuestions > 0 ? correct / totalQuestions : 0;

    const moduleResults: ModuleResult[] = snapshot.modules.map((m) => {
      const ma = moduleAccMap.get(m.id) ?? { score: 0, correct: 0, total: 0 };
      return {
        module_id: m.id,
        title: m.title,
        score: ma.score,
        correct: ma.correct,
        total: ma.total,
        accuracy: ma.total > 0 ? ma.correct / ma.total : 0,
      };
    });

    const conceptResults: ConceptResult[] = Array.from(conceptAccMap.entries()).map(([concept, ca]) => {
      const acc = ca.total > 0 ? ca.correct / ca.total : 0;
      return {
        concept,
        correct: ca.correct,
        incorrect: ca.incorrect,
        unanswered: ca.unanswered,
        total: ca.total,
        accuracy: acc,
        status: conceptStatus(acc),
      };
    });

    return {
      session_id: sessionId,
      participant_id: p.id,
      score: totalScore,
      rank: null,
      correct_count: correct,
      incorrect_count: incorrect,
      unanswered_count: unanswered,
      accuracy,
      total_response_ms: totalMs,
      module_results: moduleResults,
      concept_results: conceptResults,
    };
  });

  // Rank: descending score, then ascending total_response_ms for correct answers
  const ranked = [...results].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.total_response_ms - b.total_response_ms;
  });

  let rank = 1;
  for (let i = 0; i < ranked.length; i++) {
    if (i > 0 && ranked[i].score === ranked[i - 1].score && ranked[i].total_response_ms === ranked[i - 1].total_response_ms) {
      ranked[i].rank = ranked[i - 1].rank;
    } else {
      ranked[i].rank = rank;
    }
    rank++;
  }

  // Upsert results
  const { error } = await c.from("lq_participant_results").upsert(
    ranked.map((r) => ({
      ...r,
      // Use upsert on (session_id, participant_id)
    })),
    { onConflict: "session_id,participant_id" }
  );
  if (error) console.error("[liveq] failed to upsert results:", error.message);

  // Update rank on participants table
  for (const r of ranked) {
    await c
      .from("lq_participants")
      .update({ score: r.score, rank: r.rank })
      .eq("id", r.participant_id);
  }
}

// ── Admin: force-advance to the next question ─────────────────────────────────

/**
 * Immediately advances the quiz to the next question regardless of the deadline.
 * Marks unanswered for the current question, then moves on (or ends the quiz).
 * Called when the admin clicks "Next Question".
 */
export async function advanceToNextQuestion(sessionId: string): Promise<{ ok: boolean; done: boolean; error?: string }> {
  const c = db();
  if (!c) return { ok: false, done: false, error: "Database not configured" };

  const session = await getSession(sessionId);
  if (!session) return { ok: false, done: false, error: "Session not found" };
  if (session.status !== "active" && session.status !== "paused") {
    return { ok: false, done: false, error: "Session is not active" };
  }

  const snapshot = await getPrivateSnapshot(session.quiz_version_id);
  if (!snapshot) return { ok: false, done: false, error: "Snapshot not found" };

  const allQuestions = flattenQuestions(snapshot);
  const currentIndex = session.current_question_index ?? 0;
  const currentQuestion = allQuestions[currentIndex];
  if (!currentQuestion) return { ok: false, done: false, error: "No current question" };

  const now = new Date().toISOString();

  // Mark unanswered for participants who haven't submitted yet
  await markUnanswered(sessionId, currentQuestion.id, snapshot.config.points_unanswered);

  const nextIndex = currentIndex + 1;
  const isLast = nextIndex >= allQuestions.length;

  if (isLast) {
    await c
      .from("lq_sessions")
      .update({ status: "completed", completed_at: now, question_deadline: null, results_published: true })
      .eq("id", sessionId);

    await generateFinalResults(sessionId, snapshot);
    await logSessionEvent(sessionId, "quiz_completed", { completed_at: now, triggered_by: "admin_next" });
    return { ok: true, done: true };
  }

  const nextQuestion = allQuestions[nextIndex];
  const timerSecs = nextQuestion.timer_secs;
  const deadline = new Date(Date.now() + timerSecs * 1000).toISOString();

  await c
    .from("lq_sessions")
    .update({
      status: "active",
      current_question_index: nextIndex,
      question_started_at: now,
      question_deadline: deadline,
      question_remaining_secs: null,
    })
    .eq("id", sessionId);

  await logSessionEvent(sessionId, "question_started", {
    question_index: nextIndex,
    question_id: nextQuestion.id,
    deadline,
    triggered_by: "admin_next",
  });

  return { ok: true, done: false };
}

// ── Score a single answer submission ──────────────────────────────────────────

export function scoreAnswer(
  selectedAnswer: string,
  correctAnswer: string,
  pointsCorrect: number,
  pointsIncorrect: number
): { is_correct: boolean; points_awarded: number } {
  const is_correct = selectedAnswer.trim().toUpperCase() === correctAnswer.trim().toUpperCase();
  return {
    is_correct,
    points_awarded: is_correct ? pointsCorrect : pointsIncorrect,
  };
}
