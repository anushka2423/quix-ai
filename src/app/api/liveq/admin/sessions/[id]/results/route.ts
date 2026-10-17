import { NextRequest } from "next/server";
import { requireAdminAuth, unauthorizedJson, notFoundJson } from "@/lib/liveq/auth";
import {
  getSession,
  getPublicSnapshot,
  getAllParticipantResults,
  getSessionParticipants,
  getAllSessionResponses,
  flattenQuestions,
} from "@/lib/liveq/db";
import type {
  AdminResultsPayload,
  ConceptCohortRow,
  CohortStats,
  LeaderboardEntry,
  MostMissedQuestion,
} from "@/types/liveq";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  try { await requireAdminAuth(); } catch { return unauthorizedJson(); }
  const { id } = await params;

  const [session, participants, results, responses] = await Promise.all([
    getSession(id),
    getSessionParticipants(id),
    getAllParticipantResults(id),
    getAllSessionResponses(id),
  ]);

  if (!session) return notFoundJson("Session not found");

  const snapshot = await getPublicSnapshot(session.quiz_version_id);
  if (!snapshot) return notFoundJson("Quiz snapshot not found");

  const participantMap = new Map(participants.map((p) => [p.id, p]));

  // Leaderboard
  const leaderboard: LeaderboardEntry[] = results.map((r) => ({
    participant_id: r.participant_id,
    display_name: participantMap.get(r.participant_id)?.display_name ?? "Unknown",
    score: r.score,
    rank: r.rank ?? 0,
    correct_count: r.correct_count,
    incorrect_count: r.incorrect_count,
    unanswered_count: r.unanswered_count,
    accuracy: r.accuracy,
    module_results: r.module_results,
    concept_results: r.concept_results,
  }));

  // Cohort stats
  const totalPart = results.length;
  const completedPart = results.filter((r) => r.correct_count + r.incorrect_count + r.unanswered_count > 0).length;
  const avgScore = totalPart > 0 ? results.reduce((s, r) => s + r.score, 0) / totalPart : 0;
  const highestScore = totalPart > 0 ? Math.max(...results.map((r) => r.score)) : 0;
  const lowestScore = totalPart > 0 ? Math.min(...results.map((r) => r.score)) : 0;
  const avgAccuracy = totalPart > 0 ? results.reduce((s, r) => s + r.accuracy, 0) / totalPart : 0;

  const stats: CohortStats = { total_participants: totalPart, completed_participants: completedPart, avg_score: avgScore, highest_score: highestScore, lowest_score: lowestScore, avg_accuracy: avgAccuracy };

  // Concept cohort analytics
  const conceptMap = new Map<string, { correct: number; total: number; pCount: Set<string> }>();
  for (const r of results) {
    for (const cr of r.concept_results) {
      const entry = conceptMap.get(cr.concept) ?? { correct: 0, total: 0, pCount: new Set() };
      entry.correct += cr.correct;
      entry.total += cr.total;
      entry.pCount.add(r.participant_id);
      conceptMap.set(cr.concept, entry);
    }
  }
  const concept_cohort: ConceptCohortRow[] = Array.from(conceptMap.entries()).map(([concept, data]) => ({
    concept,
    total_questions: data.total / Math.max(1, data.pCount.size),
    cohort_accuracy: data.total > 0 ? data.correct / data.total : 0,
    participant_count: data.pCount.size,
  }));

  // Most missed questions
  const allQuestions = flattenQuestions(snapshot);
  const questionMissMap = new Map<string, { miss: number; total: number }>();
  for (const r of responses) {
    if (!r.question_id) continue;
    const entry = questionMissMap.get(r.question_id) ?? { miss: 0, total: 0 };
    entry.total++;
    if (!r.is_correct) entry.miss++;
    questionMissMap.set(r.question_id, entry);
  }

  const most_missed: MostMissedQuestion[] = allQuestions
    .map((q) => {
      const qFull = q as { id: string; question: string; concept: string };
      const missData = questionMissMap.get(q.id) ?? { miss: 0, total: 0 };
      const moduleTitle = snapshot.modules.find((m) => m.questions.some((mq) => mq.id === q.id))?.title ?? "";
      return {
        question_id: q.id,
        question_text: qFull.question,
        module_title: moduleTitle,
        concept: qFull.concept,
        miss_count: missData.miss,
        total_responses: missData.total,
        miss_rate: missData.total > 0 ? missData.miss / missData.total : 0,
      };
    })
    .filter((q) => q.miss_count > 0)
    .sort((a, b) => b.miss_rate - a.miss_rate)
    .slice(0, 10);

  const payload: AdminResultsPayload = { session, quiz_snapshot: snapshot, leaderboard, stats, concept_cohort, most_missed };
  return Response.json(payload);
}
