"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import type { ParticipantState, PublicQuestionState, ConceptResult, LiveLeaderboardEntry } from "@/types/liveq";

// ── Countdown bar ──────────────────────────────────────────────────────────────

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
        <span
          role="timer"
          style={{
            fontWeight: 700,
            color: danger ? "var(--incorrect-text)" : "var(--ink)",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {secs}s
        </span>
      </div>
      <div style={{ height: 6, background: "var(--border)", borderRadius: 100, overflow: "hidden" }}>
        <div style={{
          height: "100%", borderRadius: 100,
          transition: "width 0.5s linear, background 0.3s",
          width: `${pct}%`,
          background: danger ? "var(--incorrect-text)" : "var(--accent)",
        }} />
      </div>
    </div>
  );
}

// ── Session timer (40-min total countdown) ────────────────────────────────────

function SessionTimer({ startedAt, durationMins }: { startedAt: string; durationMins: number }) {
  const endMs = new Date(startedAt).getTime() + durationMins * 60 * 1000;
  const [remaining, setRemaining] = useState(() => Math.max(0, Math.ceil((endMs - Date.now()) / 1000)));

  useEffect(() => {
    const id = setInterval(() => setRemaining(Math.max(0, Math.ceil((endMs - Date.now()) / 1000))), 1000);
    return () => clearInterval(id);
  }, [endMs]);

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const danger = remaining <= 300; // last 5 minutes
  const fmt = `${mins}:${String(secs).padStart(2, "0")}`;

  return (
    <span style={{
      fontSize: 13, fontWeight: 700, fontVariantNumeric: "tabular-nums",
      color: danger ? "var(--accent)" : "rgba(255,255,255,.7)",
      background: "rgba(255,255,255,.1)", borderRadius: "var(--r-pill)",
      padding: "3px 10px", whiteSpace: "nowrap",
    }}>
      🕐 {fmt}
    </span>
  );
}

// ── Live leaderboard card ─────────────────────────────────────────────────────

function LiveLeaderboard({ entries }: { entries: LiveLeaderboardEntry[] }) {
  const medals = ["🥇", "🥈", "🥉"];
  return (
    <div style={{
      background: "#fff", borderRadius: "var(--r-quiz-card)",
      boxShadow: "var(--shadow-feature)", padding: "20px 24px", marginTop: 16,
    }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: "var(--muted)", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.06em" }}>
        Live Rankings
      </div>
      {entries.map((e, i) => {
        const isGap = i > 0 && e.rank > entries[i - 1].rank + 1;
        return (
          <div key={e.rank + e.display_name}>
            {isGap && (
              <div style={{ textAlign: "center", color: "var(--muted)", fontSize: 12, padding: "2px 0 6px" }}>· · ·</div>
            )}
            <div style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: e.is_me ? "8px 10px" : "8px 0",
              borderTop: i === 0 ? "none" : "1px solid var(--border)",
              background: e.is_me ? "var(--canvas)" : "transparent",
              borderRadius: e.is_me ? 6 : 0,
              margin: e.is_me ? "0 -10px" : "0",
            }}>
              <span style={{ fontSize: 20, width: 28, textAlign: "center", flexShrink: 0 }}>
                {e.rank <= 3 ? medals[e.rank - 1] : `#${e.rank}`}
              </span>
              <span style={{ flex: 1, fontWeight: e.is_me ? 800 : 500, fontSize: 15, color: "var(--ink)" }}>
                {e.display_name} {e.is_me && <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 400 }}>(you)</span>}
              </span>
              <span style={{ fontWeight: 700, fontSize: 16, color: e.is_me ? "var(--navy)" : "var(--ink)", fontVariantNumeric: "tabular-nums" }}>
                {e.score}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Concept badge ──────────────────────────────────────────────────────────────

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
      <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 2, color: "var(--ink)" }}>{concept.concept}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color: c.color }}>{Math.round(accuracy * 100)}%</div>
      <div style={{ fontSize: 11, color: c.color, textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.04em" }}>
        {status.replace("_", " ")}
      </div>
      <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
        {concept.correct}/{concept.total} correct
      </div>
    </div>
  );
}

// ── Option button styles (matching existing quiz page) ─────────────────────────

type OptState = "default" | "selected" | "correct" | "wrong";

function getOptionStyles(state: OptState) {
  if (state === "correct") return {
    wrapper: { border: "2px solid var(--correct-text)", background: "var(--correct-bg)" },
    badge: { background: "var(--correct-text)", color: "#fff", border: "none" },
  };
  if (state === "wrong") return {
    wrapper: { border: "2px solid var(--incorrect-text)", background: "var(--incorrect-bg)" },
    badge: { background: "var(--incorrect-text)", color: "#fff", border: "none" },
  };
  if (state === "selected") return {
    wrapper: { border: "2px solid var(--accent)", background: "#fff3e8" },
    badge: { background: "var(--accent)", color: "var(--navy)", border: "none" },
  };
  return {
    wrapper: { border: "1px solid var(--border)", background: "#fff" },
    badge: { background: "#fff", color: "var(--muted)", border: "1px solid var(--border)" },
  };
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ParticipantSession({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [token, setToken] = useState<string | null>(null);
  const [state, setState] = useState<ParticipantState | null>(null);
  const [error] = useState("");
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitResult, setSubmitResult] = useState<{ is_correct: boolean; points_awarded: number; correct_answer?: string } | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const urlToken = searchParams.get("token");
    const storedToken = localStorage.getItem("liveq_token");
    const storedSession = localStorage.getItem("liveq_session_id");
    const resolvedToken = urlToken ?? (storedSession === sessionId ? storedToken : null);
    if (!resolvedToken) { router.replace("/liveq"); return; }
    setToken(resolvedToken);
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
      if (!res.ok) setSubmitError(data.error ?? "Failed to submit");
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

  // ── Connecting ──────────────────────────────────────────────────────────────

  if (!token || !state) {
    return (
      <>
        <Header hideBooking moduleTitle="Live Quiz" />
        <div style={{ minHeight: "calc(100vh - 88px)", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--canvas)" }}>
          <p style={{ color: "var(--muted)" }}>Connecting…</p>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header hideBooking moduleTitle="Live Quiz" />
        <div style={{ minHeight: "calc(100vh - 88px)", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--canvas)" }}>
          <p style={{ color: "var(--incorrect-text)" }}>{error}</p>
        </div>
      </>
    );
  }

  // ── Lobby ───────────────────────────────────────────────────────────────────

  if (state.status === "lobby") {
    return (
      <>
        <Header hideBooking moduleTitle={state.quiz_title} />
        <div style={{ background: "var(--gradient)", padding: "28px 0 36px" }}>
          <div style={{ maxWidth: "860px", margin: "0 auto", padding: "0 48px", textAlign: "center" }}>
            <h1 style={{ fontSize: "26px", fontWeight: 800, color: "#ffffff", margin: "0 0 4px" }}>{state.quiz_title}</h1>
            <p style={{ color: "var(--on-navy-2)", margin: 0, fontSize: 15 }}>Live Quiz Session</p>
          </div>
        </div>

        <div style={{ background: "var(--canvas)", padding: "40px 20px 80px" }}>
          <div style={{ maxWidth: "560px", margin: "0 auto" }}>
            <div style={{ background: "#fff", borderRadius: "var(--r-quiz-card)", boxShadow: "var(--shadow-feature)", padding: "40px", textAlign: "center" }}>
              <div style={{ background: "var(--correct-bg)", borderRadius: 8, padding: "14px 18px", marginBottom: 24 }}>
                <div style={{ fontSize: 13, color: "var(--correct-text)", fontWeight: 600 }}>✓ You've joined successfully</div>
                <div style={{ fontWeight: 800, fontSize: 20, marginTop: 4, color: "var(--ink)" }}>{state.display_name}</div>
              </div>
              {state.instructions && (
                <div style={{ background: "var(--canvas)", borderRadius: 8, padding: "14px 18px", marginBottom: 24, fontSize: 14, color: "var(--ink)", textAlign: "left", lineHeight: 1.6 }}>
                  {state.instructions}
                </div>
              )}
              <div style={{ fontSize: 40, marginBottom: 12 }}>⏳</div>
              <p style={{ color: "var(--muted)", margin: 0, fontSize: 15 }}>Waiting for the host to start the quiz…</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ── Paused ──────────────────────────────────────────────────────────────────

  if (state.status === "paused") {
    return (
      <>
        <Header hideBooking moduleTitle={state.quiz_title} />
        <div style={{ background: "var(--gradient)", padding: "28px 0 36px" }}>
          <div style={{ maxWidth: "860px", margin: "0 auto", padding: "0 48px" }} />
        </div>
        <div style={{ background: "var(--canvas)", padding: "40px 20px 80px" }}>
          <div style={{ maxWidth: "560px", margin: "0 auto" }}>
            <div style={{ background: "#fff", borderRadius: "var(--r-quiz-card)", boxShadow: "var(--shadow-feature)", padding: "40px", textAlign: "center" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>⏸</div>
              <h2 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 8px", color: "var(--ink)" }}>Quiz Paused</h2>
              <p style={{ color: "var(--muted)", margin: "0 0 20px" }}>The host has paused the quiz. It will resume shortly.</p>
              <div style={{
                display: "inline-block", padding: "8px 20px", borderRadius: "var(--r-pill)",
                background: "var(--accent)", color: "var(--navy)", fontWeight: 800, fontSize: 18,
              }}>
                Score: {state.score}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ── Active question ─────────────────────────────────────────────────────────

  if (state.status === "active" && state.current_question) {
    const q = state.current_question;
    const locked = state.answered || !!submitResult;
    const qIdx = state.current_question_index ?? 0;
    const total = state.total_questions;

    return (
      <>
        <Header hideBooking moduleTitle={`${state.quiz_title} · Live Quiz`} />

        {/* Navy band */}
        <div style={{ background: "var(--gradient)", padding: "28px 0 36px", flexShrink: 0 }}>
          <div style={{ maxWidth: "860px", margin: "0 auto", padding: "0 48px" }}>
            {/* Row: leave + timer pill + score */}
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
              <button
                onClick={leave}
                style={{ fontSize: 14, color: "var(--on-navy-2)", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", padding: 0, flexShrink: 0 }}
              >
                ← Leave
              </button>
              <div style={{ flex: 1 }} />
              <span style={{
                fontSize: 14, fontWeight: 700,
                color: (q.paused_remaining_secs ?? Math.ceil((new Date(q.deadline).getTime() - Date.now()) / 1000)) <= 10
                  ? "var(--accent)" : "#fff",
                background: "rgba(255,255,255,.12)",
                borderRadius: "var(--r-pill)", padding: "4px 12px",
                whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums",
              }}>
                ⏱ {q.paused_remaining_secs !== null ? q.paused_remaining_secs : Math.max(0, Math.ceil((new Date(q.deadline).getTime() - Date.now()) / 1000))}s
              </span>
              {state.session_started_at && (
                <SessionTimer startedAt={state.session_started_at} durationMins={state.session_duration_mins} />
              )}
              <span style={{ fontSize: 14, color: "var(--on-navy-2)", whiteSpace: "nowrap" }}>
                Score: <strong style={{ color: "#fff" }}>{state.score}</strong>
              </span>
            </div>

            {/* Segmented progress */}
            <div
              role="progressbar"
              aria-valuenow={qIdx + 1}
              aria-valuemin={1}
              aria-valuemax={total}
              aria-label={`Question ${qIdx + 1} of ${total}`}
              style={{ display: "flex", gap: 4, alignItems: "center", height: 16 }}
            >
              {Array.from({ length: total }, (_, i) => {
                const isCurrent = i === qIdx;
                return (
                  <div key={i} style={{
                    flex: 1, borderRadius: "var(--r-pill)",
                    background: isCurrent ? "var(--accent)" : i < qIdx ? "rgba(255,255,255,1)" : "rgba(255,255,255,.18)",
                    height: isCurrent ? 8 : 4,
                    transition: "background 0.2s, height 0.2s",
                  }} />
                );
              })}
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, padding: "40px 0 80px", background: "var(--canvas)" }}>
          <div style={{ maxWidth: "860px", margin: "0 auto", padding: "0 48px" }}>
            <div style={{
              background: "#ffffff", borderRadius: "var(--r-quiz-card)",
              boxShadow: "var(--shadow-feature)", padding: "40px",
            }}>
              {/* Card header */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                <span style={{
                  padding: "5px 14px", borderRadius: "var(--r-pill)",
                  background: "var(--accent)", color: "var(--navy)",
                  fontSize: 13, fontWeight: 800, letterSpacing: "0.04em", flexShrink: 0,
                  fontFamily: "var(--font-manrope), sans-serif",
                }}>
                  {String(qIdx + 1).padStart(2, "0")}
                </span>
                <span style={{ fontSize: 14, color: "var(--muted)" }}>
                  Question {qIdx + 1} of {total} · {q.module_title}
                </span>
              </div>

              {/* Countdown bar */}
              <Countdown question={q} />

              {/* Question text */}
              <p style={{
                fontSize: 22, lineHeight: "32px", fontWeight: 600,
                color: "var(--ink)", letterSpacing: "-0.02em", margin: "0 0 28px",
              }}>
                {q.question}
              </p>

              {/* Options */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {q.options.map((opt) => {
                  let optState: OptState = "default";
                  if (submitResult) {
                    if (submitResult.correct_answer && opt.label === submitResult.correct_answer) {
                      optState = "correct";
                    } else if (selectedAnswer === opt.label && !submitResult.is_correct) {
                      optState = "wrong";
                    }
                  } else if (selectedAnswer === opt.label) {
                    optState = "selected";
                  }
                  const styles = getOptionStyles(optState);

                  return (
                    <button
                      key={opt.label}
                      onClick={() => !locked && setSelectedAnswer(opt.label)}
                      disabled={locked}
                      aria-pressed={selectedAnswer === opt.label}
                      style={{
                        display: "flex", alignItems: "center", gap: 14,
                        padding: "14px 18px", borderRadius: "var(--r-option)",
                        textAlign: "left", width: "100%",
                        cursor: locked ? "default" : "pointer",
                        fontFamily: "inherit",
                        transition: "all 0.15s",
                        ...styles.wrapper,
                      }}
                    >
                      <span style={{
                        width: 28, height: 28, borderRadius: "var(--r-option)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 13, fontWeight: 600, flexShrink: 0,
                        transition: "all 0.15s",
                        ...styles.badge,
                      }}>
                        {opt.label}
                      </span>
                      <span style={{ flex: 1, fontSize: 15, lineHeight: "24px", color: "var(--ink)" }}>
                        {opt.text}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Submit */}
              {!locked && (
                <button
                  disabled={!selectedAnswer || submitting}
                  onClick={submitAnswer}
                  style={{
                    width: "100%", marginTop: 20, padding: "15px 32px",
                    borderRadius: "9px", border: "none",
                    background: selectedAnswer ? "var(--accent)" : "var(--disabled)",
                    color: selectedAnswer ? "var(--navy)" : "#fff",
                    fontFamily: "inherit", fontSize: 16, fontWeight: 700,
                    cursor: selectedAnswer && !submitting ? "pointer" : "not-allowed",
                    transition: "background 0.2s",
                    minHeight: 52,
                  }}
                >
                  {submitting ? "Submitting…" : "Submit Answer"}
                </button>
              )}

              {/* Feedback */}
              <div aria-live="polite">
                {submitResult && (
                  <div style={{
                    marginTop: 16, padding: "12px 16px", borderRadius: "var(--r-option)",
                    textAlign: "center", fontWeight: 700, fontSize: 16,
                    background: submitResult.is_correct ? "var(--correct-bg)" : "var(--incorrect-bg)",
                    color: submitResult.is_correct ? "var(--correct-text)" : "var(--incorrect-text)",
                  }}>
                    {submitResult.is_correct
                      ? `✓ Correct! +${submitResult.points_awarded} pts`
                      : `✗ Incorrect — correct answer: ${submitResult.correct_answer}`}
                  </div>
                )}
                {locked && !submitResult && (
                  <div style={{ marginTop: 16, padding: "12px 16px", borderRadius: "var(--r-option)", textAlign: "center", background: "var(--canvas)", color: "var(--muted)", fontSize: 14 }}>
                    Answer locked — waiting for next question…
                  </div>
                )}
                {submitError && (
                  <div style={{ marginTop: 10, padding: "10px 14px", borderRadius: 6, background: "var(--incorrect-bg)", color: "var(--incorrect-text)", fontSize: 14 }}>
                    {submitError}{" "}
                    <button onClick={submitAnswer} style={{ background: "none", border: "none", color: "var(--navy)", textDecoration: "underline", cursor: "pointer", fontFamily: "inherit", fontSize: 14 }}>
                      Retry
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Live leaderboard — shown after answering */}
            {locked && state.leaderboard && state.leaderboard.length > 0 && (
              <LiveLeaderboard entries={state.leaderboard} />
            )}

            <div style={{ marginTop: 16, textAlign: "center" }}>
              <button onClick={leave} style={{ background: "none", border: "none", color: "var(--muted)", textDecoration: "underline", cursor: "pointer", fontSize: 13, fontFamily: "inherit" }}>
                Leave session
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ── Completed ───────────────────────────────────────────────────────────────

  if (state.status === "completed") {
    if (!state.results) {
      return (
        <>
          <Header hideBooking moduleTitle={state.quiz_title} />
          <div style={{ background: "var(--gradient)", padding: "28px 0 36px" }}>
            <div style={{ maxWidth: "860px", margin: "0 auto", padding: "0 48px" }} />
          </div>
          <div style={{ background: "var(--canvas)", padding: "40px 20px 80px" }}>
            <div style={{ maxWidth: "560px", margin: "0 auto" }}>
              <div style={{ background: "#fff", borderRadius: "var(--r-quiz-card)", boxShadow: "var(--shadow-feature)", padding: "40px", textAlign: "center" }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
                <h2 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 8px", color: "var(--ink)" }}>Quiz Completed!</h2>
                <p style={{ color: "var(--muted)", margin: "0 0 20px" }}>Results will be published by the host shortly.</p>
                <div style={{ display: "inline-block", padding: "8px 24px", borderRadius: "var(--r-pill)", background: "var(--accent)", color: "var(--navy)", fontWeight: 800, fontSize: 20 }}>
                  Score: {state.score}
                </div>
              </div>
            </div>
          </div>
        </>
      );
    }

    const r = state.results;
    const topConcepts = r.concept_results.filter((c) => c.status === "strong").slice(0, 3);
    const weakConcepts = r.concept_results.filter((c) => c.status === "needs_improvement");

    return (
      <>
        <Header hideBooking moduleTitle={`${state.quiz_title} · Results`} />
        <div style={{ background: "var(--gradient)", padding: "28px 0 36px" }}>
          <div style={{ maxWidth: "860px", margin: "0 auto", padding: "0 48px", textAlign: "center" }}>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: "#fff", margin: "0 0 4px" }}>{state.quiz_title}</h1>
            <p style={{ color: "var(--on-navy-2)", margin: 0, fontSize: 15 }}>Your results</p>
          </div>
        </div>

        <div style={{ background: "var(--canvas)", padding: "40px 0 80px" }}>
          <div style={{ maxWidth: "860px", margin: "0 auto", padding: "0 48px" }}>

            {/* Score card */}
            <div style={{ background: "#fff", borderRadius: "var(--r-quiz-card)", boxShadow: "var(--shadow-feature)", padding: "40px", textAlign: "center", marginBottom: 20 }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>🎉</div>
              <h2 style={{ fontSize: 26, fontWeight: 800, margin: "0 0 4px", color: "var(--ink)" }}>Quiz Complete!</h2>
              <div style={{ fontSize: 56, fontWeight: 900, color: "var(--navy)", margin: "16px 0 4px", letterSpacing: "-0.03em" }}>
                {r.score}
              </div>
              <div style={{ fontSize: 15, color: "var(--muted)", marginBottom: 16 }}>points</div>
              {r.rank && (
                <div style={{
                  display: "inline-block", padding: "6px 20px", marginBottom: 24,
                  borderRadius: "var(--r-pill)", background: "var(--accent)", color: "var(--navy)",
                  fontWeight: 800, fontSize: 18,
                }}>
                  Rank #{r.rank} of {r.total_participants}
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "center", gap: 32 }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontWeight: 700, color: "var(--correct-text)", fontSize: 24 }}>{r.correct_count}</div>
                  <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>Correct</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontWeight: 700, color: "var(--incorrect-text)", fontSize: 24 }}>{r.incorrect_count}</div>
                  <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>Incorrect</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontWeight: 700, color: "var(--muted)", fontSize: 24 }}>{r.unanswered_count}</div>
                  <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>Unanswered</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontWeight: 700, fontSize: 24, color: "var(--ink)" }}>{Math.round(r.accuracy * 100)}%</div>
                  <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>Accuracy</div>
                </div>
              </div>
            </div>

            {/* Module results */}
            {r.module_results.length > 0 && (
              <div style={{ background: "#fff", borderRadius: "var(--r-quiz-card)", boxShadow: "var(--shadow-feature)", padding: "32px 40px", marginBottom: 20 }}>
                <h3 style={{ margin: "0 0 16px", fontSize: 17, fontWeight: 700, color: "var(--ink)" }}>Module Results</h3>
                {r.module_results.map((m, i) => (
                  <div key={m.module_id} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "12px 0",
                    borderBottom: i < r.module_results.length - 1 ? "1px solid var(--border)" : "none",
                  }}>
                    <span style={{ fontSize: 15, color: "var(--ink)" }}>{m.title}</span>
                    <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                      <span style={{ fontSize: 13, color: "var(--muted)" }}>{m.correct}/{m.total}</span>
                      <span style={{
                        fontWeight: 800, fontSize: 15, color: "var(--navy)",
                        background: "var(--canvas)", borderRadius: "var(--r-pill)",
                        padding: "3px 12px",
                      }}>{Math.round(m.accuracy * 100)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Concept analytics */}
            {r.concept_results.length > 0 && (
              <div style={{ background: "#fff", borderRadius: "var(--r-quiz-card)", boxShadow: "var(--shadow-feature)", padding: "32px 40px", marginBottom: 20 }}>
                <h3 style={{ margin: "0 0 16px", fontSize: 17, fontWeight: 700, color: "var(--ink)" }}>Concept Performance</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12 }}>
                  {r.concept_results.map((c) => <ConceptBadge key={c.concept} concept={c} />)}
                </div>
              </div>
            )}

            {/* Strengths & weaknesses */}
            {topConcepts.length > 0 && (
              <div style={{ background: "var(--correct-bg)", borderRadius: "var(--r-quiz-card)", padding: "24px 32px", marginBottom: 12 }}>
                <h4 style={{ margin: "0 0 10px", color: "var(--correct-text)", fontSize: 15, fontWeight: 700 }}>💪 Strong Areas</h4>
                {topConcepts.map((c) => <div key={c.concept} style={{ fontSize: 14, margin: "3px 0", color: "var(--ink)" }}>{c.concept}</div>)}
              </div>
            )}
            {weakConcepts.length > 0 && (
              <div style={{ background: "var(--incorrect-bg)", borderRadius: "var(--r-quiz-card)", padding: "24px 32px", marginBottom: 24 }}>
                <h4 style={{ margin: "0 0 10px", color: "var(--incorrect-text)", fontSize: 15, fontWeight: 700 }}>📚 Focus Areas</h4>
                {weakConcepts.map((c) => <div key={c.concept} style={{ fontSize: 14, margin: "3px 0", color: "var(--ink)" }}>{c.concept}</div>)}
              </div>
            )}

            <button
              onClick={leave}
              style={{
                width: "100%", padding: "15px", borderRadius: "9px",
                border: "1.5px solid var(--border)", background: "#fff",
                fontFamily: "inherit", fontSize: 15, fontWeight: 600,
                cursor: "pointer", color: "var(--ink)",
              }}
            >
              Done
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header hideBooking moduleTitle="Live Quiz" />
      <div style={{ minHeight: "calc(100vh - 88px)", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--canvas)" }}>
        <p style={{ color: "var(--muted)" }}>Unknown session state</p>
      </div>
    </>
  );
}