"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { ParticipantState, PublicQuestionState, ConceptResult } from "@/types/liveq";

// ── Shared styles ─────────────────────────────────────────────────────────────

const screenWrap: React.CSSProperties = {
  minHeight: "100vh", background: "var(--canvas)", display: "flex",
  flexDirection: "column", alignItems: "center", justifyContent: "center",
  padding: "20px", fontFamily: "var(--font-golos), ui-sans-serif, system-ui, sans-serif",
};
const card: React.CSSProperties = {
  background: "#fff", borderRadius: 12, padding: 28,
  boxShadow: "var(--shadow-card)", width: "100%", maxWidth: 560,
};
const optionBase: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 12, padding: "14px 18px",
  border: "2px solid var(--border)", borderRadius: 8, cursor: "pointer",
  background: "#fff", textAlign: "left", width: "100%", fontFamily: "inherit",
  fontSize: 15, color: "var(--ink)", marginBottom: 10, transition: "border-color 0.15s",
};

// ── Countdown ─────────────────────────────────────────────────────────────────

function Countdown({ question }: { question: PublicQuestionState }) {
  const [secs, setSecs] = useState<number>(0);

  useEffect(() => {
    if (question.paused_remaining_secs !== null) {
      setSecs(question.paused_remaining_secs);
      return;
    }
    const update = () => {
      const diff = Math.max(0, Math.ceil((new Date(question.deadline).getTime() - Date.now()) / 1000));
      setSecs(diff);
    };
    update();
    const id = setInterval(update, 500);
    return () => clearInterval(id);
  }, [question.deadline, question.paused_remaining_secs]);

  const pct = Math.min(100, (secs / question.timer_secs) * 100);
  const danger = secs <= 10;

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "var(--muted)", marginBottom: 6 }}>
        <span>{question.module_title}</span>
        <span style={{ fontWeight: 700, color: danger ? "var(--incorrect-text)" : "var(--ink)" }}>{secs}s</span>
      </div>
      <div style={{ height: 6, background: "var(--border)", borderRadius: 100, overflow: "hidden" }}>
        <div style={{
          height: "100%", borderRadius: 100, transition: "width 0.5s linear",
          width: `${pct}%`,
          background: danger ? "var(--incorrect-text)" : "var(--navy)",
        }} />
      </div>
    </div>
  );
}

// ── Concept Performance ───────────────────────────────────────────────────────

function ConceptBadge({ concept }: { concept: ConceptResult }) {
  const { accuracy, status } = concept;
  const colors = {
    strong: { bg: "var(--correct-bg)", color: "var(--correct-text)" },
    developing: { bg: "#fef3c7", color: "#92400e" },
    needs_improvement: { bg: "var(--incorrect-bg)", color: "var(--incorrect-text)" },
  };
  const c = colors[status];
  return (
    <div style={{ background: c.bg, borderRadius: 8, padding: "12px 14px" }}>
      <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 2 }}>{concept.concept}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color: c.color }}>{Math.round(accuracy * 100)}%</div>
      <div style={{ fontSize: 11, color: c.color, textTransform: "uppercase", fontWeight: 600 }}>
        {status.replace("_", " ")}
      </div>
      <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
        {concept.correct}/{concept.total} correct
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ParticipantSession({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [token, setToken] = useState<string | null>(null);
  const [state, setState] = useState<ParticipantState | null>(null);
  const [error, setError] = useState("");
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitResult, setSubmitResult] = useState<{ is_correct: boolean; points_awarded: number } | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Resolve token from URL or localStorage
  useEffect(() => {
    const urlToken = searchParams.get("token");
    const storedToken = localStorage.getItem("liveq_token");
    const storedSession = localStorage.getItem("liveq_session_id");
    const resolvedToken = urlToken ?? (storedSession === sessionId ? storedToken : null);

    if (!resolvedToken) {
      router.replace("/liveq");
      return;
    }
    setToken(resolvedToken);
    // Persist
    localStorage.setItem("liveq_token", resolvedToken);
    localStorage.setItem("liveq_session_id", sessionId);
  }, [sessionId, searchParams, router]);

  const fetchState = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`/api/liveq/state?token=${encodeURIComponent(token)}`);
      if (res.status === 401) { router.replace("/liveq"); return; }
      if (!res.ok) return;
      const data: ParticipantState = await res.json();
      setState((prev) => {
        // Reset answer selection when question changes
        if (prev?.current_question?.id !== data.current_question?.id) {
          setSelectedAnswer(null);
          setSubmitResult(null);
          setSubmitError("");
        }
        return data;
      });
    } catch { /* ignore */ }
  }, [token, router]);

  useEffect(() => {
    if (!token) return;
    fetchState();
    pollRef.current = setInterval(fetchState, 2000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [fetchState, token]);

  const submitAnswer = async () => {
    if (!selectedAnswer || !state?.current_question || !token) return;
    setSubmitting(true);
    setSubmitError("");
    try {
      const res = await fetch("/api/liveq/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, question_id: state.current_question.id, selected_answer: selectedAnswer }),
      });
      const data = await res.json();
      if (!res.ok) { setSubmitError(data.error ?? "Failed to submit"); }
      else { setSubmitResult(data); fetchState(); }
    } catch {
      setSubmitError("Network error");
    }
    setSubmitting(false);
  };

  const leave = () => {
    localStorage.removeItem("liveq_token");
    localStorage.removeItem("liveq_session_id");
    router.push("/liveq");
  };

  if (!token || !state) {
    return (
      <div style={screenWrap}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>⚡</div>
          <p style={{ color: "var(--muted)" }}>Connecting…</p>
        </div>
      </div>
    );
  }

  // ── Waiting room ────────────────────────────────────────────────────────────

  if (state.status === "lobby") {
    return (
      <div style={screenWrap}>
        <div style={card}>
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>⚡</div>
            <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>{state.quiz_title}</h1>
          </div>
          <div style={{ background: "var(--correct-bg)", borderRadius: 8, padding: "14px 18px", textAlign: "center", marginBottom: 20 }}>
            <div style={{ fontSize: 13, color: "var(--correct-text)", fontWeight: 600 }}>✓ You've joined successfully</div>
            <div style={{ fontWeight: 700, fontSize: 18, marginTop: 4 }}>{state.display_name}</div>
          </div>
          {state.instructions && (
            <div style={{ background: "var(--canvas)", borderRadius: 8, padding: 14, marginBottom: 20, fontSize: 14, color: "var(--ink-2)" }}>
              {state.instructions}
            </div>
          )}
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>⏳</div>
            <p style={{ color: "var(--muted)", margin: 0 }}>Waiting for the host to start the quiz…</p>
          </div>
        </div>
      </div>
    );
  }

  // ── Paused ──────────────────────────────────────────────────────────────────

  if (state.status === "paused") {
    return (
      <div style={screenWrap}>
        <div style={{ ...card, textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>⏸</div>
          <h2 style={{ fontSize: 20, margin: "0 0 8px" }}>Quiz Paused</h2>
          <p style={{ color: "var(--muted)", margin: 0 }}>The host has paused the quiz. It will resume shortly.</p>
          <div style={{ marginTop: 16, fontSize: 14, color: "var(--muted)" }}>Your score: <strong>{state.score}</strong></div>
        </div>
      </div>
    );
  }

  // ── Active question ─────────────────────────────────────────────────────────

  if (state.status === "active" && state.current_question) {
    const q = state.current_question;
    const locked = state.answered || !!submitResult;

    return (
      <div style={{ ...screenWrap, justifyContent: "flex-start", paddingTop: 24 }}>
        {/* Progress bar */}
        <div style={{ width: "100%", maxWidth: 560, marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--muted)", marginBottom: 4 }}>
            <span>Question {(state.current_question_index ?? 0) + 1} of {state.total_questions}</span>
            <span>Score: {state.score}</span>
          </div>
          <div style={{ height: 4, background: "var(--border)", borderRadius: 100 }}>
            <div style={{
              height: "100%", borderRadius: 100, background: "var(--navy)",
              width: `${(((state.current_question_index ?? 0) + 1) / state.total_questions) * 100}%`,
            }} />
          </div>
        </div>

        <div style={card}>
          <Countdown question={q} />

          <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 20, lineHeight: 1.4 }}>{q.question}</div>

          {/* Options */}
          <div>
            {q.options.map((opt) => {
              const selected = selectedAnswer === opt.label;
              const isLocked = locked;
              const wasSubmitted = submitResult && selectedAnswer === opt.label;

              let borderColor = "var(--border)";
              let bg = "#fff";
              if (selected && !isLocked) { borderColor = "var(--navy)"; bg = "var(--wash)"; }
              if (wasSubmitted) {
                borderColor = submitResult.is_correct ? "var(--correct-text)" : "var(--incorrect-text)";
                bg = submitResult.is_correct ? "var(--correct-bg)" : "var(--incorrect-bg)";
              }

              return (
                <button
                  key={opt.label}
                  disabled={isLocked}
                  onClick={() => !isLocked && setSelectedAnswer(opt.label)}
                  style={{ ...optionBase, borderColor, background: bg, cursor: isLocked ? "default" : "pointer" }}
                >
                  <span style={{
                    width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                    background: selected ? "var(--navy)" : "var(--canvas)",
                    color: selected ? "#fff" : "var(--muted)", fontWeight: 700, fontSize: 13, flexShrink: 0,
                  }}>
                    {opt.label}
                  </span>
                  <span>{opt.text}</span>
                </button>
              );
            })}
          </div>

          {/* Submit / feedback */}
          {!locked && (
            <button
              style={{
                width: "100%", padding: "13px", borderRadius: 8, border: "none",
                background: selectedAnswer ? "var(--navy)" : "var(--disabled)",
                color: "#fff", fontFamily: "inherit", fontSize: 16, fontWeight: 700,
                cursor: selectedAnswer ? "pointer" : "not-allowed", marginTop: 4,
              }}
              disabled={!selectedAnswer || submitting}
              onClick={submitAnswer}
            >
              {submitting ? "Submitting…" : "Submit Answer"}
            </button>
          )}

          {submitResult && (
            <div style={{
              marginTop: 12, padding: "12px 16px", borderRadius: 8, textAlign: "center",
              background: submitResult.is_correct ? "var(--correct-bg)" : "var(--incorrect-bg)",
              color: submitResult.is_correct ? "var(--correct-text)" : "var(--incorrect-text)",
              fontWeight: 700, fontSize: 16,
            }}>
              {submitResult.is_correct ? `✓ Correct! +${submitResult.points_awarded} pts` : "✗ Incorrect"}
            </div>
          )}

          {locked && !submitResult && (
            <div style={{ marginTop: 12, padding: "12px 16px", borderRadius: 8, textAlign: "center", background: "var(--canvas)", color: "var(--muted)", fontSize: 14 }}>
              Answer locked — waiting for next question…
            </div>
          )}

          {submitError && (
            <div style={{ marginTop: 8, padding: "10px 14px", borderRadius: 6, background: "var(--incorrect-bg)", color: "var(--incorrect-text)", fontSize: 14 }}>{submitError}</div>
          )}
        </div>

        <button onClick={leave} style={{ marginTop: 16, background: "none", border: "none", color: "var(--muted)", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
          Leave session
        </button>
      </div>
    );
  }

  // ── Completed ───────────────────────────────────────────────────────────────

  if (state.status === "completed") {
    if (!state.results) {
      return (
        <div style={screenWrap}>
          <div style={{ ...card, textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🎉</div>
            <h2 style={{ margin: "0 0 8px" }}>Quiz Completed!</h2>
            <p style={{ color: "var(--muted)" }}>Results will be published by the host shortly.</p>
            <div style={{ marginTop: 12, fontSize: 14 }}>Your score: <strong>{state.score}</strong></div>
          </div>
        </div>
      );
    }

    const r = state.results;
    const topConcepts = r.concept_results.filter((c) => c.status === "strong").slice(0, 3);
    const weakConcepts = r.concept_results.filter((c) => c.status === "needs_improvement");

    return (
      <div style={{ ...screenWrap, justifyContent: "flex-start", paddingTop: 24, paddingBottom: 40 }}>
        <div style={{ width: "100%", maxWidth: 560 }}>
          {/* Score card */}
          <div style={{ ...card, textAlign: "center", marginBottom: 20 }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>🎉</div>
            <h1 style={{ fontSize: 26, fontWeight: 800, margin: "0 0 4px" }}>Quiz Complete!</h1>
            <div style={{ fontSize: 48, fontWeight: 900, color: "var(--navy)", margin: "12px 0" }}>{r.score}</div>
            <div style={{ fontSize: 15, color: "var(--muted)", marginBottom: 4 }}>points</div>
            {r.rank && (
              <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>
                Rank #{r.rank} of {r.total_participants}
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "center", gap: 24 }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontWeight: 700, color: "var(--correct-text)", fontSize: 20 }}>{r.correct_count}</div>
                <div style={{ fontSize: 12, color: "var(--muted)" }}>Correct</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontWeight: 700, color: "var(--incorrect-text)", fontSize: 20 }}>{r.incorrect_count}</div>
                <div style={{ fontSize: 12, color: "var(--muted)" }}>Incorrect</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontWeight: 700, color: "var(--muted)", fontSize: 20 }}>{r.unanswered_count}</div>
                <div style={{ fontSize: 12, color: "var(--muted)" }}>Unanswered</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontWeight: 700, fontSize: 20 }}>{Math.round(r.accuracy * 100)}%</div>
                <div style={{ fontSize: 12, color: "var(--muted)" }}>Accuracy</div>
              </div>
            </div>
          </div>

          {/* Module results */}
          {r.module_results.length > 0 && (
            <div style={{ ...card, marginBottom: 20 }}>
              <h3 style={{ margin: "0 0 12px", fontSize: 16 }}>Module Results</h3>
              {r.module_results.map((m) => (
                <div key={m.module_id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                  <span style={{ fontSize: 14 }}>{m.title}</span>
                  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <span style={{ fontSize: 13, color: "var(--muted)" }}>{m.correct}/{m.total}</span>
                    <span style={{ fontWeight: 700 }}>{Math.round(m.accuracy * 100)}%</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Concept analytics */}
          {r.concept_results.length > 0 && (
            <div style={{ ...card, marginBottom: 20 }}>
              <h3 style={{ margin: "0 0 12px", fontSize: 16 }}>Concept Performance</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 10 }}>
                {r.concept_results.map((c) => <ConceptBadge key={c.concept} concept={c} />)}
              </div>
            </div>
          )}

          {/* Strengths and weaknesses */}
          {topConcepts.length > 0 && (
            <div style={{ ...card, background: "var(--correct-bg)", borderColor: "var(--correct-text)", marginBottom: 12 }}>
              <h4 style={{ margin: "0 0 8px", color: "var(--correct-text)", fontSize: 14 }}>💪 Strong Areas</h4>
              {topConcepts.map((c) => <div key={c.concept} style={{ fontSize: 14, margin: "2px 0" }}>{c.concept}</div>)}
            </div>
          )}
          {weakConcepts.length > 0 && (
            <div style={{ ...card, background: "var(--incorrect-bg)", borderColor: "var(--incorrect-text)", marginBottom: 20 }}>
              <h4 style={{ margin: "0 0 8px", color: "var(--incorrect-text)", fontSize: 14 }}>📚 Focus Areas</h4>
              {weakConcepts.map((c) => <div key={c.concept} style={{ fontSize: 14, margin: "2px 0" }}>{c.concept}</div>)}
            </div>
          )}

          <button onClick={leave} style={{ width: "100%", padding: "13px", borderRadius: 8, border: "1px solid var(--border)", background: "#fff", fontFamily: "inherit", fontSize: 15, cursor: "pointer" }}>
            Done
          </button>
        </div>
      </div>
    );
  }

  return <div style={screenWrap}><p style={{ color: "var(--muted)" }}>Unknown session state</p></div>;
}
