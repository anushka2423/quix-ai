// ── Shared config types ───────────────────────────────────────────────────────

export interface QuizConfig {
  timer_secs: number;
  points_correct: number;
  points_incorrect: number;
  points_unanswered: number;
  allow_late_join: boolean;
  show_leaderboard_live: boolean;
  results_released_by_admin: boolean;
  allow_pause: boolean;
  allow_early_end: boolean;
  session_duration_mins?: number;
}

export type QuizStatus = "draft" | "published" | "archived";
export type SessionStatus = "lobby" | "active" | "paused" | "completed";
export type QuestionType = "single" | "truefalse";

// ── Option ────────────────────────────────────────────────────────────────────

export interface LQOption {
  label: string;
  text: string;
}

// ── Quiz entities (DB rows) ───────────────────────────────────────────────────

export interface LQQuiz {
  id: string;
  title: string;
  description: string | null;
  instructions: string | null;
  status: QuizStatus;
  config: QuizConfig;
  published_at: string | null;
  created_at: string;
}

export interface LQModule {
  id: string;
  quiz_id: string;
  title: string;
  description: string | null;
  order_index: number;
}

export interface LQQuestion {
  id: string;
  quiz_id: string;
  module_id: string;
  type: QuestionType;
  question: string;
  options: LQOption[];
  /** Server-side only — never sent to participants */
  correct_answer: string;
  explanation: string | null;
  concept: string;
  points: number;
  timer_secs: number;
  order_index: number;
}

export interface LQSession {
  id: string;
  quiz_id: string;
  quiz_version_id: string;
  join_code: string;
  status: SessionStatus;
  current_question_index: number | null;
  question_deadline: string | null;
  question_started_at: string | null;
  question_remaining_secs: number | null;
  results_published: boolean;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface LQParticipant {
  id: string;
  session_id: string;
  display_name: string;
  token: string;
  joined_at: string;
  last_seen_at: string;
  score: number;
  rank: number | null;
}

export interface LQResponse {
  id: string;
  session_id: string;
  participant_id: string;
  question_id: string;
  selected_answer: string | null;
  is_correct: boolean | null;
  points_awarded: number;
  response_time_ms: number | null;
  submitted_at: string;
}

// ── Snapshot (stored in lq_quiz_versions) ────────────────────────────────────

/** A question as embedded in the public snapshot (no answer key). */
export interface SnapshotQuestion {
  id: string;
  module_id: string;
  type: QuestionType;
  question: string;
  options: LQOption[];
  concept: string;
  points: number;
  timer_secs: number;
  order_index: number;
}

export interface SnapshotModule {
  id: string;
  title: string;
  description: string | null;
  order_index: number;
  questions: SnapshotQuestion[];
}

export interface QuizSnapshot {
  quiz_id: string;
  title: string;
  description: string | null;
  instructions: string | null;
  config: QuizConfig;
  modules: SnapshotModule[];
}

/** Private snapshot that includes answer keys — used only by the server engine. */
export interface PrivateSnapshotQuestion extends SnapshotQuestion {
  correct_answer: string;
  explanation: string | null;
}

export interface PrivateSnapshotModule extends SnapshotModule {
  questions: PrivateSnapshotQuestion[];
}

export interface PrivateQuizSnapshot extends QuizSnapshot {
  modules: PrivateSnapshotModule[];
}

// ── API payloads ──────────────────────────────────────────────────────────────

export interface LiveLeaderboardEntry {
  rank: number;
  display_name: string;
  score: number;
  is_me: boolean;
}

/** Payload returned by GET /api/liveq/state (participant view). */
export interface ParticipantState {
  session_id: string;
  status: SessionStatus;
  quiz_title: string;
  instructions: string | null;
  participant_id: string;
  display_name: string;
  score: number;
  rank: number | null;
  /** Only when status=active|paused */
  current_question: PublicQuestionState | null;
  /** Progress across all questions */
  total_questions: number;
  current_question_index: number | null;
  /** Whether the participant has already answered the current question */
  answered: boolean;
  /** Results data (when status=completed and results are published) */
  results: ParticipantResultPayload | null;
  /** When the session started (ISO) — used for 40-min total timer */
  session_started_at: string | null;
  /** Total session duration in minutes (from quiz config, default 40) */
  session_duration_mins: number;
  /** Live leaderboard: shown after participant answers; top 3 + own entry */
  leaderboard: LiveLeaderboardEntry[] | null;
}

export interface PublicQuestionState {
  id: string;
  index: number;
  module_title: string;
  question: string;
  options: LQOption[];
  timer_secs: number;
  started_at: string;       // ISO
  deadline: string;         // ISO
  paused_remaining_secs: number | null;
  question_type: QuestionType;
}

/** Result payload visible to a participant after the quiz completes. */
export interface ParticipantResultPayload {
  score: number;
  rank: number | null;
  total_participants: number;
  correct_count: number;
  incorrect_count: number;
  unanswered_count: number;
  accuracy: number;
  module_results: ModuleResult[];
  concept_results: ConceptResult[];
}

export interface ModuleResult {
  module_id: string;
  title: string;
  score: number;
  correct: number;
  total: number;
  accuracy: number;
}

export interface ConceptResult {
  concept: string;
  correct: number;
  incorrect: number;
  unanswered: number;
  total: number;
  accuracy: number;
  status: "strong" | "developing" | "needs_improvement";
}

/** Payload returned by GET /api/liveq/admin/sessions/[id] (admin view). */
export interface AdminSessionState {
  session: LQSession;
  quiz_snapshot: QuizSnapshot;
  participants: AdminParticipantRow[];
  submission_count: number;
  current_question: AdminQuestionState | null;
}

export interface AdminParticipantRow {
  id: string;
  display_name: string;
  joined_at: string;
  last_seen_at: string;
  score: number;
  rank: number | null;
}

export interface AdminQuestionState {
  id: string;
  index: number;
  module_title: string;
  question: string;
  options: LQOption[];
  timer_secs: number;
  started_at: string;
  deadline: string;
  paused_remaining_secs: number | null;
  submission_count: number;
  total_participants: number;
}

// ── Admin results types ───────────────────────────────────────────────────────

export interface LQParticipantResult {
  id: string;
  session_id: string;
  participant_id: string;
  score: number;
  rank: number | null;
  correct_count: number;
  incorrect_count: number;
  unanswered_count: number;
  accuracy: number;
  total_response_ms: number;
  module_results: ModuleResult[];
  concept_results: ConceptResult[];
}

export interface AdminResultsPayload {
  session: LQSession;
  quiz_snapshot: QuizSnapshot;
  leaderboard: LeaderboardEntry[];
  stats: CohortStats;
  concept_cohort: ConceptCohortRow[];
  most_missed: MostMissedQuestion[];
}

export interface LeaderboardEntry {
  participant_id: string;
  display_name: string;
  score: number;
  rank: number;
  correct_count: number;
  incorrect_count: number;
  unanswered_count: number;
  accuracy: number;
  module_results: ModuleResult[];
  concept_results: ConceptResult[];
}

export interface CohortStats {
  total_participants: number;
  completed_participants: number;
  avg_score: number;
  highest_score: number;
  lowest_score: number;
  avg_accuracy: number;
}

export interface ConceptCohortRow {
  concept: string;
  total_questions: number;
  cohort_accuracy: number;
  participant_count: number;
}

export interface MostMissedQuestion {
  question_id: string;
  question_text: string;
  module_title: string;
  concept: string;
  miss_count: number;
  total_responses: number;
  miss_rate: number;
}
