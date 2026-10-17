import { db } from "@/lib/server/db";
import type {
  LQQuiz,
  LQModule,
  LQQuestion,
  LQSession,
  LQParticipant,
  LQResponse,
  QuizSnapshot,
  PrivateQuizSnapshot,
  SnapshotModule,
  PrivateSnapshotModule,
  QuizConfig,
  LQParticipantResult,
} from "@/types/liveq";

// ── Read helpers ──────────────────────────────────────────────────────────────

export async function getQuizWithModulesAndQuestions(quizId: string): Promise<{
  quiz: LQQuiz;
  modules: LQModule[];
  questions: LQQuestion[];
} | null> {
  const c = db();
  if (!c) return null;

  const [qz, mods, qs] = await Promise.all([
    c.from("lq_quizzes").select("*").eq("id", quizId).single(),
    c.from("lq_modules").select("*").eq("quiz_id", quizId).order("order_index"),
    c.from("lq_questions").select("*").eq("quiz_id", quizId).order("order_index"),
  ]);

  if (qz.error || !qz.data) return null;
  return {
    quiz: qz.data as LQQuiz,
    modules: (mods.data ?? []) as LQModule[],
    questions: (qs.data ?? []) as LQQuestion[],
  };
}

export async function getSession(sessionId: string): Promise<LQSession | null> {
  const c = db();
  if (!c) return null;
  const { data, error } = await c.from("lq_sessions").select("*").eq("id", sessionId).single();
  if (error) return null;
  return data as LQSession;
}

export async function getSessionByCode(joinCode: string): Promise<LQSession | null> {
  const c = db();
  if (!c) return null;
  const { data, error } = await c
    .from("lq_sessions")
    .select("*")
    .eq("join_code", joinCode)
    .in("status", ["lobby", "active", "paused"])
    .single();
  if (error) return null;
  return data as LQSession;
}

export async function getParticipantByToken(token: string): Promise<LQParticipant | null> {
  const c = db();
  if (!c) return null;
  const { data, error } = await c.from("lq_participants").select("*").eq("token", token).single();
  if (error) return null;
  return data as LQParticipant;
}

export async function getSessionParticipants(sessionId: string): Promise<LQParticipant[]> {
  const c = db();
  if (!c) return [];
  const { data } = await c
    .from("lq_participants")
    .select("*")
    .eq("session_id", sessionId)
    .order("score", { ascending: false });
  return (data ?? []) as LQParticipant[];
}

export async function getParticipantResponse(
  sessionId: string,
  participantId: string,
  questionId: string
): Promise<LQResponse | null> {
  const c = db();
  if (!c) return null;
  const { data } = await c
    .from("lq_responses")
    .select("*")
    .eq("session_id", sessionId)
    .eq("participant_id", participantId)
    .eq("question_id", questionId)
    .maybeSingle();
  return (data ?? null) as LQResponse | null;
}

export async function countSubmissions(sessionId: string, questionId: string): Promise<number> {
  const c = db();
  if (!c) return 0;
  const { count } = await c
    .from("lq_responses")
    .select("id", { count: "exact", head: true })
    .eq("session_id", sessionId)
    .eq("question_id", questionId)
    .not("selected_answer", "is", null);
  return count ?? 0;
}

export async function getPrivateSnapshot(versionId: string): Promise<PrivateQuizSnapshot | null> {
  const c = db();
  if (!c) return null;
  const { data, error } = await c
    .from("lq_quiz_versions")
    .select("snapshot_with_keys")
    .eq("id", versionId)
    .single();
  if (error || !data) return null;
  return data.snapshot_with_keys as PrivateQuizSnapshot;
}

export async function getPublicSnapshot(versionId: string): Promise<QuizSnapshot | null> {
  const c = db();
  if (!c) return null;
  const { data, error } = await c
    .from("lq_quiz_versions")
    .select("snapshot")
    .eq("id", versionId)
    .single();
  if (error || !data) return null;
  return data.snapshot as QuizSnapshot;
}

export async function getAllSessionResponses(sessionId: string): Promise<LQResponse[]> {
  const c = db();
  if (!c) return [];
  const { data } = await c
    .from("lq_responses")
    .select("*")
    .eq("session_id", sessionId);
  return (data ?? []) as LQResponse[];
}

export async function getParticipantResult(
  sessionId: string,
  participantId: string
): Promise<LQParticipantResult | null> {
  const c = db();
  if (!c) return null;
  const { data } = await c
    .from("lq_participant_results")
    .select("*")
    .eq("session_id", sessionId)
    .eq("participant_id", participantId)
    .maybeSingle();
  if (!data) return null;
  return {
    ...data,
    module_results: data.module_results ?? [],
    concept_results: data.concept_results ?? [],
  } as LQParticipantResult;
}

export async function getAllParticipantResults(sessionId: string): Promise<LQParticipantResult[]> {
  const c = db();
  if (!c) return [];
  const { data } = await c
    .from("lq_participant_results")
    .select("*")
    .eq("session_id", sessionId)
    .order("rank", { ascending: true });
  return (data ?? []).map((r) => ({
    ...r,
    module_results: r.module_results ?? [],
    concept_results: r.concept_results ?? [],
  })) as LQParticipantResult[];
}

// ── Write helpers ─────────────────────────────────────────────────────────────

export async function touchParticipant(participantId: string): Promise<void> {
  const c = db();
  if (!c) return;
  await c
    .from("lq_participants")
    .update({ last_seen_at: new Date().toISOString() })
    .eq("id", participantId);
}

export async function logSessionEvent(
  sessionId: string,
  event: string,
  payload?: Record<string, unknown>
): Promise<void> {
  const c = db();
  if (!c) return;
  await c.from("lq_session_events").insert({ session_id: sessionId, event, payload: payload ?? null });
}

// ── Snapshot builder ──────────────────────────────────────────────────────────

export function buildSnapshots(
  quiz: LQQuiz,
  modules: LQModule[],
  questions: LQQuestion[]
): { publicSnapshot: QuizSnapshot; privateSnapshot: PrivateQuizSnapshot } {
  const sortedModules = [...modules].sort((a, b) => a.order_index - b.order_index);

  const publicModules: SnapshotModule[] = sortedModules.map((m) => ({
    id: m.id,
    title: m.title,
    description: m.description,
    order_index: m.order_index,
    questions: questions
      .filter((q) => q.module_id === m.id)
      .sort((a, b) => a.order_index - b.order_index)
      .map((q) => ({
        id: q.id,
        module_id: q.module_id,
        type: q.type,
        question: q.question,
        options: q.options,
        concept: q.concept,
        points: q.points,
        timer_secs: q.timer_secs,
        order_index: q.order_index,
      })),
  }));

  const privateModules: PrivateSnapshotModule[] = sortedModules.map((m, i) => ({
    ...publicModules[i],
    questions: questions
      .filter((q) => q.module_id === m.id)
      .sort((a, b) => a.order_index - b.order_index)
      .map((q) => ({
        id: q.id,
        module_id: q.module_id,
        type: q.type,
        question: q.question,
        options: q.options,
        concept: q.concept,
        points: q.points,
        timer_secs: q.timer_secs,
        order_index: q.order_index,
        correct_answer: q.correct_answer,
        explanation: q.explanation,
      })),
  }));

  const base = {
    quiz_id: quiz.id,
    title: quiz.title,
    description: quiz.description,
    instructions: quiz.instructions,
    config: quiz.config as QuizConfig,
  };

  return {
    publicSnapshot: { ...base, modules: publicModules },
    privateSnapshot: { ...base, modules: privateModules },
  };
}

/** Flat ordered list of all questions across modules (the progression order). */
export function flattenQuestions<T extends { id: string; timer_secs: number }>(
  snapshot: { modules: { questions: T[] }[] }
): T[] {
  return snapshot.modules.flatMap((m) => m.questions);
}
