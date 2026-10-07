"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import type { OptionLabel, Question, QuizModule } from "@/types/quiz";
import { saveResult, saveLead } from "@/lib/supabase";
import { useQuizModules } from "@/lib/use-quiz-modules";
import { formatAnswer, isCorrectAnswer, parseAnswer, requiredPicks } from "@/lib/answers";
import { drawQuizQuestions } from "@/lib/quiz-sampling";
import Header from "@/components/Header";

export default function QuizPage() {
  const params = useParams();
  const moduleId = Number(params.id);
  const { modules, error } = useQuizModules();
  const mod = modules?.find((m) => m.id === moduleId);

  if (!modules && !error) {
    return (
      <main style={{ padding: "96px 48px", textAlign: "center" }}>
        <p style={{ color: "var(--muted)" }}>Loading questions…</p>
      </main>
    );
  }

  if (!mod || modules!.every((m) => m.questions.length === 0)) {
    return (
      <main style={{ padding: "96px 48px", textAlign: "center" }}>
        <p style={{ color: "var(--muted)" }}>
          {error ? "Couldn't load this module." : "Module not found."}{" "}
          <Link href="/" style={{ color: "var(--navy)" }}>
            Go back
          </Link>
        </p>
      </main>
    );
  }

  return <QuizRunner mod={mod} modules={modules!} />;
}

function QuizRunner({ mod, modules }: { mod: QuizModule; modules: QuizModule[] }) {
  const router = useRouter();
  const moduleId = mod.id;

  // A new random set from every module each time a quiz starts
  const [questions] = useState<Question[]>(() => drawQuizQuestions(modules));

  const [answers, setAnswers] = useState<Record<number, OptionLabel[]>>({});
  const [currentIdx, setCurrentIdx] = useState(0);

  // Mobile carousel — tracks which option card is currently visible (0–4)
  const [visibleOptIdx, setVisibleOptIdx] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Email gate — mandatory before quiz
  const [emailGateReady, setEmailGateReady] = useState(false);
  const [emailGateEmail, setEmailGateEmail] = useState<string | null>(null);
  const [emailInput, setEmailInput] = useState("");
  const [emailError, setEmailError] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("quix_user_email");
    setEmailGateEmail(stored);
    setEmailGateReady(true);
  }, []);

  const total = questions.length;
  const q = questions[currentIdx];
  const selected = answers[q.id] ?? [];
  const picks = requiredPicks(q.answer);
  const isMulti = picks > 1;
  const isComplete = (qq: Question) =>
    (answers[qq.id]?.length ?? 0) === requiredPicks(qq.answer);
  // Once every pick is made the answer is checked and locked
  const currentComplete = selected.length === picks;
  const revealed = currentComplete;
  const correctLabels = parseAnswer(q.answer);
  const currentCorrect = revealed && isCorrectAnswer(selected, q.answer);
  const isFirst = currentIdx === 0;
  const isLast = currentIdx === total - 1;
  const primaryDisabled = !currentComplete;
  const primaryLabel = isLast ? "See my score →" : "Next question →";

  // Finish the quiz — save results and navigate to results page
  async function handleFinish() {
    // One segment per question; multi-answer picks are concatenated, e.g. "B,AC,D"
    const answerString = questions
      .map((qq) => (answers[qq.id] ?? []).join(""))
      .join(",");
    const score = questions.filter((qq) =>
      isCorrectAnswer(answers[qq.id] ?? [], qq.answer)
    ).length;
    const pct = Math.round((score / total) * 100);

    try {
      const existing = JSON.parse(localStorage.getItem("aipm_scores") ?? "{}");
      existing[String(moduleId)] = { score, total, pct };
      localStorage.setItem("aipm_scores", JSON.stringify(existing));
    } catch {}

    const email = emailGateEmail;
    if (email) {
      const detailedAnswers = questions.map((qq) => ({
        questionId: qq.id,
        question: qq.question,
        section: qq.section,
        difficulty: qq.difficulty,
        userAnswer: formatAnswer(answers[qq.id] ?? []),
        correctAnswer: formatAnswer([qq.answer]),
        isCorrect: isCorrectAnswer(answers[qq.id] ?? [], qq.answer),
      }));
      saveResult({
        email,
        moduleId,
        moduleTitle: mod.title,
        answers: JSON.stringify(detailedAnswers),
        score,
        total,
      }).catch(() => {});
    }

    // Question ids tell the results page which random questions were asked
    const questionIds = questions.map((qq) => qq.id).join(",");
    router.push(`/results/${moduleId}?q=${questionIds}&a=${answerString}`);
  }

  function handleNext() {
    if (!currentComplete) return;
    if (isLast) {
      handleFinish();
    } else {
      setCurrentIdx((i) => i + 1);
    }
  }

  function handleBack() {
    if (!isFirst) setCurrentIdx((i) => i - 1);
  }

  // Single-answer questions lock on the first click; multi-answer questions toggle
  // until the required number is picked, then lock.
  function selectAnswer(label: OptionLabel) {
    setAnswers((prev) => {
      const current = prev[q.id] ?? [];
      if (current.length >= picks) return prev;
      if (!isMulti) return { ...prev, [q.id]: [label] };
      if (current.includes(label)) {
        return { ...prev, [q.id]: current.filter((l) => l !== label) };
      }
      return { ...prev, [q.id]: [...current, label].sort() as OptionLabel[] };
    });
  }

  // Mobile carousel helpers
  function scrollToOpt(idx: number) {
    const el = carouselRef.current;
    if (!el) return;
    el.scrollLeft = idx * el.offsetWidth;
    setVisibleOptIdx(idx);
  }

  function handleCarouselScroll() {
    const el = carouselRef.current;
    if (!el) return;
    setVisibleOptIdx(Math.round(el.scrollLeft / el.offsetWidth));
  }

  // Keyboard handler
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const optionLabels: OptionLabel[] = ["A", "B", "C", "D"];
      if (["1", "2", "3", "4"].includes(e.key)) {
        e.preventDefault();
        const label = optionLabels[Number(e.key) - 1];
        if (label) selectAnswer(label);
      } else if (e.key === "Enter") {
        e.preventDefault();
        handleNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (!isFirst) setCurrentIdx((i) => i - 1);
      } else if (e.key === "ArrowRight" && !isLast) {
        e.preventDefault();
        if (currentComplete && !isLast) setCurrentIdx((i) => i + 1);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [q, isFirst, isLast, currentComplete, answers]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Reset carousel to first card when question changes
  useEffect(() => {
    setVisibleOptIdx(0);
    if (carouselRef.current) carouselRef.current.scrollLeft = 0;
  }, [currentIdx]);

  // Segment progress bar
  function segmentState(i: number) {
    const qq = questions[i];
    if (i === currentIdx) return "current";
    if (isComplete(qq)) return "answered";
    return "default";
  }

  const segmentColors: Record<string, string> = {
    default: "rgba(255,255,255,.18)",
    current: "var(--accent)",
    answered: "rgba(255,255,255,1)",
  };

  type OptState = "default" | "selected" | "correct" | "wrong" | "dimmed";

  function optionState(label: OptionLabel): OptState {
    if (revealed) {
      if (correctLabels.includes(label)) return "correct";
      if (selected.includes(label)) return "wrong";
      return "dimmed";
    }
    return selected.includes(label) ? "selected" : "default";
  }

  // Tag shown on an option after the answer is checked
  function optionTag(label: OptionLabel): string | null {
    if (!revealed) return null;
    const picked = selected.includes(label);
    if (correctLabels.includes(label)) return picked ? "Your answer · Correct" : "Correct answer";
    return picked ? "Your answer · Incorrect" : null;
  }

  function getOptionStyles(state: OptState) {
    if (state === "correct" || state === "wrong") {
      const color = state === "correct" ? "var(--correct-text)" : "var(--incorrect-text)";
      return {
        wrapper: {
          border: `2px solid ${color}`,
          background: state === "correct" ? "var(--correct-bg)" : "var(--incorrect-bg)",
          color: "var(--ink)",
        },
        badge: { background: color, color: "#ffffff", border: "none" },
        text: { color: "var(--ink)" },
      };
    }
    if (state === "dimmed") {
      return {
        wrapper: {
          border: "1px solid var(--border)",
          background: "#ffffff",
          color: "var(--ink)",
          opacity: 0.6,
        },
        badge: {
          background: "#ffffff",
          color: "var(--muted)",
          border: "1px solid var(--border)",
        },
        text: { color: "var(--ink)" },
      };
    }
    if (state === "selected") {
      return {
        wrapper: {
          border: "2px solid var(--accent)",
          background: "#fff3e8",
          color: "var(--ink)",
        },
        badge: { background: "var(--accent)", color: "#ffffff", border: "none" },
        text: { color: "var(--ink)" },
      };
    }
    return {
      wrapper: {
        border: "1px solid var(--border)",
        background: "#ffffff",
        color: "var(--ink)",
      },
      badge: {
        background: "#ffffff",
        color: "var(--muted)",
        border: "1px solid var(--border)",
      },
      text: { color: "var(--ink)" },
    };
  }

  async function handleEmailGateSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = emailInput.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setEmailError("Please enter a valid email address.");
      return;
    }
    setEmailLoading(true);
    setEmailError("");
    await saveLead(trimmed);
    localStorage.setItem("quix_user_email", trimmed);
    setEmailGateEmail(trimmed);
    setEmailLoading(false);
  }

  return (
    <>
      {/* Mandatory email gate — covers everything until email is provided */}
      {(!emailGateReady || !emailGateEmail) && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "var(--canvas)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
          }}
        >
          {emailGateReady && (
            <div
              style={{
                background: "#fff",
                borderRadius: "var(--r-feature)",
                padding: "48px",
                maxWidth: "480px",
                width: "100%",
                boxShadow: "var(--shadow-feature)",
              }}
            >
              {/* Icon */}
              <div
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "14px",
                  background: "var(--wash)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "24px",
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="#002862" strokeWidth="1.6" strokeLinejoin="round" />
                  <path d="M22 6l-10 7L2 6" stroke="#002862" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "12px" }}>
                <div style={{ width: "7px", height: "7px", borderRadius: "2px", background: "var(--navy)" }} />
                <span style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "0.6px", textTransform: "uppercase" as const, color: "var(--muted)" }}>
                  Claude Certification · Module Assessment
                </span>
              </div>

              <h2 style={{ fontSize: "26px", fontWeight: 700, color: "var(--ink)", margin: "0 0 10px", lineHeight: 1.25, letterSpacing: "-0.02em" }}>
                Before we begin
              </h2>
              <p style={{ fontSize: "15px", lineHeight: 1.6, color: "var(--muted)", margin: "0 0 28px" }}>
                Enter your work email to start the assessment. Your results will be tracked so our team can give you personalised feedback.
              </p>

              <form onSubmit={handleEmailGateSubmit}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--ink)", marginBottom: "8px" }}>
                  Email address
                </label>
                <input
                  type="email"
                  placeholder="you@company.com"
                  value={emailInput}
                  onChange={(e) => { setEmailInput(e.target.value); setEmailError(""); }}
                  autoFocus
                  style={{
                    width: "100%",
                    padding: "13px 16px",
                    borderRadius: "var(--r-input)",
                    border: emailError ? "1.5px solid var(--incorrect-text)" : "1.5px solid var(--border)",
                    fontSize: "15px",
                    color: "var(--ink)",
                    outline: "none",
                    boxSizing: "border-box" as const,
                    background: "#fff",
                    fontFamily: "inherit",
                  }}
                />
                {emailError && (
                  <p style={{ fontSize: "13px", color: "var(--incorrect-text)", marginTop: "6px", marginBottom: 0 }}>
                    {emailError}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={emailLoading}
                  style={{
                    marginTop: "16px",
                    width: "100%",
                    padding: "14px",
                    borderRadius: "var(--r-card)",
                    border: "none",
                    background: "var(--navy)",
                    color: "#fff",
                    fontSize: "16px",
                    fontWeight: 600,
                    cursor: emailLoading ? "not-allowed" : "pointer",
                    opacity: emailLoading ? 0.7 : 1,
                    fontFamily: "inherit",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {emailLoading ? "Saving…" : "Start Assessment →"}
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      <Header moduleTitle={mod.title} />

      <div
        style={{
          minHeight: "calc(100vh - 64px)",
          display: "flex",
          flexDirection: "column",
          background: "var(--canvas)",
        }}
      >
        {/* ── Navy band ── */}
        <div
          style={{
            background: "var(--gradient)",
            padding: "28px 0 36px",
            flexShrink: 0,
          }}
        >
          <div
            className="quiz-band-inner"
            style={{ maxWidth: "860px", margin: "0 auto", padding: "0 48px" }}
          >
            {/* Row 1 */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                marginBottom: "24px",
              }}
            >
              <Link
                href="/"
                style={{
                  fontSize: "14px",
                  color: "var(--on-navy-2)",
                  textDecoration: "none",
                  flexShrink: 0,
                }}
              >
                ← All tracks
              </Link>
              <div style={{ flex: 1 }} />
              <span
                style={{
                  fontSize: "14px",
                  color: "var(--on-navy-2)",
                  whiteSpace: "nowrap",
                }}
              >
                {questions.filter(isComplete).length} of {total} answered
              </span>
            </div>

            {/* Segmented progress */}
            <div
              role="progressbar"
              aria-valuenow={currentIdx + 1}
              aria-valuemin={1}
              aria-valuemax={total}
              aria-label={`Question ${currentIdx + 1} of ${total}`}
              style={{
                display: "flex",
                gap: "4px",
                alignItems: "center",
                height: "16px",
              }}
            >
              {questions.map((_, i) => {
                const state = segmentState(i);
                return (
                  <div
                    key={i}
                    onClick={() => setCurrentIdx(i)}
                    style={{
                      flex: 1,
                      borderRadius: "var(--r-pill)",
                      background: segmentColors[state],
                      height: state === "current" ? "8px" : "4px",
                      transition: "background 0.2s, height 0.2s",
                      cursor: "pointer",
                    }}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Content area ── */}
        <div style={{ flex: 1, padding: "40px 0 80px" }}>
          <div
            className="quiz-content-inner"
            style={{ maxWidth: "860px", margin: "0 auto", padding: "0 48px" }}
          >
            {/* Quiz card */}
            <div
              key={currentIdx}
              className="card-enter quiz-card"
              style={{
                background: "#ffffff",
                borderRadius: "var(--r-quiz-card)",
                boxShadow: "var(--shadow-feature)",
                padding: "40px",
              }}
            >
              {/* Card header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "24px",
                }}
              >
                <span
                  style={{
                    padding: "5px 14px",
                    borderRadius: "var(--r-pill)",
                    background: "var(--accent)",
                    color: "var(--navy)",
                    fontSize: "13px",
                    fontWeight: 800,
                    letterSpacing: "0.04em",
                    flexShrink: 0,
                    fontFamily: "var(--font-manrope), sans-serif",
                  }}
                >
                  {String(currentIdx + 1).padStart(2, "0")}
                </span>
                <span style={{ fontSize: "14px", color: "var(--muted)" }}>
                  Question {currentIdx + 1} of {total} · {q.section}
                </span>
              </div>

              {/* Question */}
              <p
                className="quiz-question"
                style={{
                  fontSize: "22px",
                  lineHeight: "32px",
                  fontWeight: 600,
                  color: "var(--ink)",
                  letterSpacing: "-0.02em",
                  margin: isMulti ? "0 0 14px" : "0 0 28px",
                }}
              >
                {q.question}
              </p>

              {isMulti && (
                <p
                  role="status"
                  aria-live="polite"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "8px",
                    fontSize: "14px",
                    color: "var(--ink)",
                    margin: "0 0 20px",
                  }}
                >
                  <span
                    style={{
                      padding: "3px 10px",
                      borderRadius: "var(--r-pill)",
                      background: "#fff3e8",
                      border: "1px solid var(--accent)",
                      fontSize: "12px",
                      fontWeight: 700,
                      letterSpacing: "0.02em",
                    }}
                  >
                    Multi-select
                  </span>
                  <span>
                    {revealed
                      ? `This question has ${picks} correct answers.`
                      : `This question has ${picks} correct answers. Select ${picks} options (${selected.length} of ${picks} selected). Your answer is checked once all ${picks} are picked.`}
                  </span>
                </p>
              )}

              {/* Options — Desktop list (hidden on ≤460px) */}
              <div
                className="quiz-options-desktop"
                style={{ display: "flex", flexDirection: "column", gap: "10px" }}
              >
                {q.options.map((opt) => {
                  const state = optionState(opt.label);
                  const styles = getOptionStyles(state);
                  return (
                    <button
                      key={opt.label}
                      onClick={() => selectAnswer(opt.label)}
                      disabled={revealed}
                      aria-pressed={selected.includes(opt.label)}
                      className={`option-btn${state === "selected" ? " option-selected" : ""}${revealed ? " option-answered" : ""}`}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "14px",
                        padding: "14px 18px",
                        borderRadius: "var(--r-option)",
                        textAlign: "left",
                        width: "100%",
                        cursor: revealed ? "default" : "pointer",
                        ...styles.wrapper,
                        transition: "all 0.15s",
                      }}
                    >
                      <span
                        style={{
                          width: "28px",
                          height: "28px",
                          borderRadius: "var(--r-option)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "13px",
                          fontWeight: 600,
                          flexShrink: 0,
                          transition: "all 0.15s",
                          ...styles.badge,
                        }}
                      >
                        {opt.label}
                      </span>
                      <span
                        style={{ flex: 1, fontSize: "15px", lineHeight: "24px", ...styles.text }}
                      >
                        {opt.text}
                      </span>
                      {optionTag(opt.label) && (
                        <span
                          style={{
                            flexShrink: 0,
                            fontSize: "12px",
                            fontWeight: 700,
                            color: state === "correct" ? "var(--correct-text)" : "var(--incorrect-text)",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {state === "correct" ? "✓ " : "✗ "}
                          {optionTag(opt.label)}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Options — Mobile swipeable carousel (visible only on ≤460px) */}
              <div className="quiz-options-mobile">
                <p className="mobile-answer-label">Answer</p>

                {/* Swipeable card track */}
                <div
                  ref={carouselRef}
                  className="mobile-carousel"
                  onScroll={handleCarouselScroll}
                >
                  {q.options.map((opt) => {
                    const state = optionState(opt.label);
                    const styles = getOptionStyles(state);
                    return (
                      <div key={opt.label} className="mobile-option-slide">
                        <button
                          onClick={() => selectAnswer(opt.label)}
                          disabled={revealed}
                          aria-pressed={selected.includes(opt.label)}
                          className="mobile-option-card"
                          style={styles.wrapper as React.CSSProperties}
                        >
                          <div
                            className="mobile-option-badge"
                            style={styles.badge as React.CSSProperties}
                          >
                            {opt.label}
                          </div>
                          <p
                            className="mobile-option-text"
                            style={{ color: (styles.text as React.CSSProperties).color }}
                          >
                            {opt.text}
                          </p>
                          {optionTag(opt.label) && (
                            <span
                              className={`result-tag ${state === "correct" ? "correct-tag-mobile" : "wrong-tag-mobile"}`}
                            >
                              {state === "correct" ? "✓ " : "✗ "}
                              {optionTag(opt.label)}
                            </span>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Swipe hint */}
                <p className="mobile-swipe-hint" aria-hidden="true">
                  ← swipe →
                </p>

                {/* A / B / C / D navigation */}
                <div
                  className="mobile-carousel-nav"
                  role="group"
                  aria-label="Answer navigation"
                >
                  {q.options.map((opt, optIdx) => {
                    const isViewing = optIdx === visibleOptIdx;
                    const isChosen = selected.includes(opt.label);
                    const state = optionState(opt.label);
                    return (
                      <button
                        key={opt.label}
                        // Only scrolls to the card; tapping the card itself selects it,
                        // so viewing an option can't accidentally lock in an answer
                        onClick={() => scrollToOpt(optIdx)}
                        aria-label={`View option ${opt.label}${isChosen ? " (selected)" : ""}`}
                        className={
                          "mobile-nav-btn" +
                          (isViewing ? " mnb-viewing" : "") +
                          (isChosen ? " mnb-chosen" : "") +
                          (state === "correct" ? " mnb-correct" : "") +
                          (state === "wrong" ? " mnb-wrong" : "")
                        }
                      >
                        <span>{opt.label}</span>
                        {isChosen && (
                          <span className="mnb-dot" aria-hidden="true">
                            ●
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Answer feedback */}
              <div aria-live="polite">
                {revealed && (
                  <div
                    style={{
                      marginTop: "20px",
                      padding: "12px 16px",
                      borderRadius: "var(--r-option)",
                      background: currentCorrect ? "var(--correct-bg)" : "var(--incorrect-bg)",
                      color: currentCorrect ? "var(--correct-text)" : "var(--incorrect-text)",
                      fontSize: "15px",
                      fontWeight: 600,
                    }}
                  >
                    {currentCorrect
                      ? "✓ Correct!"
                      : `✗ Incorrect. The correct answer${correctLabels.length > 1 ? "s are" : " is"} ${correctLabels.join(" and ")}.`}
                  </div>
                )}
              </div>

              {/* Primary action + Back button row */}
              <div
                className="quiz-action-row"
                style={{
                  marginTop: "28px",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                {/* Back */}
                <button
                  onClick={handleBack}
                  disabled={isFirst}
                  aria-label="Go to previous question"
                  style={{
                    padding: "14px 22px",
                    borderRadius: "9px",
                    border: "1.5px solid var(--border)",
                    background: "#ffffff",
                    color: isFirst ? "var(--disabled)" : "var(--ink)",
                    fontSize: "15px",
                    fontWeight: 600,
                    cursor: isFirst ? "not-allowed" : "pointer",
                    transition: "border-color 0.15s, color 0.15s",
                    flexShrink: 0,
                    minHeight: "52px",
                    fontFamily: "inherit",
                  }}
                >
                  ← Back
                </button>

                {/* Next / See my score */}
                <button
                  onClick={handleNext}
                  disabled={primaryDisabled}
                  className="quiz-primary-btn"
                  style={{
                    flex: 1,
                    padding: "14px 32px",
                    borderRadius: "9px",
                    border: "none",
                    background: primaryDisabled ? "var(--disabled)" : "var(--accent)",
                    color: primaryDisabled ? "#ffffff" : "var(--navy)",
                    fontSize: "16px",
                    fontWeight: 700,
                    cursor: primaryDisabled ? "not-allowed" : "pointer",
                    transition: "background 0.2s, transform 0.15s",
                    letterSpacing: "-0.01em",
                    minHeight: "52px",
                    fontFamily: "inherit",
                  }}
                  onMouseEnter={(e) => {
                    if (!primaryDisabled) {
                      (e.currentTarget as HTMLButtonElement).style.background = "var(--accent-hover)";
                      (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = primaryDisabled
                      ? "var(--disabled)"
                      : "var(--accent)";
                    (e.currentTarget as HTMLButtonElement).style.transform = "none";
                  }}
                >
                  {primaryLabel}
                </button>
              </div>
            </div>

            {/* Below card: keyboard hint */}
            <div style={{ marginTop: "16px", textAlign: "center" }}>
              <span
                className="quiz-keyboard-hint"
                style={{ fontSize: "12px", color: "var(--faint)" }}
              >
                Use 1–4 to select · Enter to advance · ← → navigate
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
