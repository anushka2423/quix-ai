"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { modules } from "@/lib/quiz-data";
import type { OptionLabel } from "@/types/quiz";
import { saveResult } from "@/lib/supabase";
import { getStoredEmail } from "@/components/EmailGate";
import Header from "@/components/Header";

const CONFETTI_COLORS = [
  "#071b39", "#ff9b50", "#ec7626", "#1f7a52", "#7cc4a0",
  "#ffb77e", "#a9bcdf", "#fff3e8", "#e6f5ed",
];

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();
  const moduleId = Number(params.id);
  const mod = modules.find((m) => m.id === moduleId);

  const [answers, setAnswers] = useState<Record<number, OptionLabel>>({});
  const [currentIdx, setCurrentIdx] = useState(0);
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});
  const [showNudge, setShowNudge] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [submitWarned, setSubmitWarned] = useState(false);
  const [submitWarnMsg, setSubmitWarnMsg] = useState("");
  // Mobile carousel — tracks which option card is currently visible
  const [visibleOptIdx, setVisibleOptIdx] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  const confettiPieces = useMemo(
    () =>
      Array.from({ length: 70 }, (_, i) => ({
        left: `${(i * 1.43) % 100}%`,
        delay: `${((i * 0.041) % 0.9).toFixed(2)}s`,
        duration: `${(1.6 + (i % 6) * 0.3).toFixed(1)}s`,
        width: `${7 + (i % 5) * 2}px`,
        height: `${7 + ((i + 2) % 4) * 2}px`,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        isCircle: i % 3 !== 0,
        rotate: `${(i * 53) % 360}deg`,
      })),
    []
  );

  if (!mod) {
    return (
      <main style={{ padding: "96px 48px", textAlign: "center" }}>
        <p style={{ color: "var(--muted)" }}>
          Module not found.{" "}
          <Link href="/" style={{ color: "var(--navy)" }}>
            Go back
          </Link>
        </p>
      </main>
    );
  }

  const total = mod.questions.length;
  const q = mod.questions[currentIdx];
  const selected = answers[q.id];
  const isRevealed = !!revealed[q.id];
  const isCorrect = selected === q.answer;
  const answeredCount = Object.keys(answers).length;
  const correctCount = mod.questions.filter(
    (qq) => revealed[qq.id] && answers[qq.id] === qq.answer
  ).length;
  const isFirst = currentIdx === 0;
  const isLast = currentIdx === total - 1;

  async function handleFinish() {
    const answerString = mod!.questions.map((qq) => answers[qq.id] ?? "").join(",");
    const score = mod!.questions.filter((qq) => answers[qq.id] === qq.answer).length;
    const pct = Math.round((score / total) * 100);

    // Save to localStorage
    try {
      const existing = JSON.parse(localStorage.getItem("aipm_scores") ?? "{}");
      existing[String(moduleId)] = { score, total, pct };
      localStorage.setItem("aipm_scores", JSON.stringify(existing));
    } catch {}

    // Save to Supabase
    const email = getStoredEmail();
    if (email) {
      saveResult({
        email,
        moduleId,
        moduleTitle: mod!.title,
        answers: answerString,
        score,
        total,
      }).catch(() => {});
    }

    setShowConfetti(true);
    setTimeout(() => {
      router.push(`/results/${moduleId}?a=${answerString}`);
    }, 2200);
  }

  function handlePrimaryAction() {
    if (isRevealed) {
      if (isLast) {
        handleFinish();
      } else {
        setCurrentIdx((i) => i + 1);
      }
      return;
    }
    if (!selected) {
      setShowNudge(true);
      setTimeout(() => setShowNudge(false), 2000);
      return;
    }
    setRevealed((prev) => ({ ...prev, [q.id]: true }));
    setSubmitWarned(false);
    setSubmitWarnMsg("");
  }

  function handleSubmitQuiz() {
    const unanswered = mod!.questions.filter((qq) => !answers[qq.id]).length;
    if (unanswered > 0 && !submitWarned) {
      setSubmitWarned(true);
      setSubmitWarnMsg(
        `${unanswered} question${unanswered !== 1 ? "s" : ""} unanswered. Click again to submit anyway.`
      );
      setTimeout(() => {
        setSubmitWarned(false);
        setSubmitWarnMsg("");
      }, 4000);
      return;
    }
    handleFinish();
  }

  // Mobile carousel helpers
  function scrollToOpt(idx: number) {
    const el = carouselRef.current;
    if (!el) return;
    // Use instant assignment to avoid race with the onScroll handler
    // (smooth scrollTo fires many scroll events that would reset the index mid-animation)
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
      if (!mod) return;
      const optionLabels: OptionLabel[] = ["A", "B", "C", "D"];
      if (!isRevealed && ["1", "2", "3", "4"].includes(e.key)) {
        e.preventDefault();
        const label = optionLabels[Number(e.key) - 1];
        if (label) {
          setShowNudge(false);
          setAnswers((prev) => ({ ...prev, [q.id]: label }));
        }
      } else if (e.key === "Enter") {
        e.preventDefault();
        handlePrimaryAction();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (!isFirst) setCurrentIdx((i) => i - 1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        if (!isLast) setCurrentIdx((i) => i + 1);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [q, isRevealed, isFirst, isLast, selected, answers]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Reset carousel to first card when the question changes
  useEffect(() => {
    setVisibleOptIdx(0);
    if (carouselRef.current) carouselRef.current.scrollLeft = 0;
  }, [currentIdx]);

  // Determine segment state for each question
  function segmentState(i: number) {
    const qq = mod!.questions[i];
    if (i === currentIdx) return "current";
    if (revealed[qq.id]) {
      return answers[qq.id] === qq.answer ? "correct" : "wrong";
    }
    if (answers[qq.id]) return "answered";
    return "default";
  }

  const segmentColors: Record<string, string> = {
    default: "rgba(255,255,255,.18)",
    current: "var(--accent)",
    answered: "rgba(255,255,255,1)",
    correct: "#7cc4a0",
    wrong: "#e7a3a3",
  };

  function optionState(label: OptionLabel) {
    if (!isRevealed) {
      return label === selected ? "selected" : "default";
    }
    if (label === q.answer) return "correct";
    if (label === selected && selected !== q.answer) return "wrong";
    return "other";
  }

  function getOptionStyles(state: string) {
    switch (state) {
      case "selected":
        return {
          wrapper: {
            border: "2px solid var(--accent-dark)",
            background: "#fff3e8",
            color: "var(--ink)",
          },
          badge: { background: "var(--accent-dark)", color: "#ffffff", border: "none" },
          text: { color: "var(--ink)" },
        };
      case "correct":
        return {
          wrapper: {
            border: "2px solid var(--correct-text)",
            background: "var(--correct-bg)",
            color: "var(--correct-text)",
          },
          badge: {
            background: "var(--correct-text)",
            color: "#ffffff",
            border: "none",
          },
          text: { color: "var(--correct-text)", fontWeight: 500 },
        };
      case "wrong":
        return {
          wrapper: {
            border: "2px solid var(--incorrect-text)",
            background: "var(--incorrect-bg)",
            color: "var(--incorrect-text)",
          },
          badge: {
            background: "var(--incorrect-text)",
            color: "#ffffff",
            border: "none",
          },
          text: { color: "var(--incorrect-text)" },
        };
      case "other":
        return {
          wrapper: {
            border: "1px solid var(--border)",
            background: "var(--canvas)",
            color: "var(--faint)",
          },
          badge: {
            background: "var(--canvas)",
            color: "var(--faint)",
            border: "1px solid var(--border)",
          },
          text: { color: "var(--faint)" },
        };
      default:
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
  }

  const primaryLabel = isRevealed
    ? isLast
      ? "See results →"
      : "Next question →"
    : "Check answer";

  const primaryDisabled = !isRevealed && !selected;

  return (
    <>
      <Header moduleTitle={mod.title} />

      {/* Confetti overlay */}
      {showConfetti && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(15,27,51,0.88)",
            backdropFilter: "blur(6px)",
          }}
        >
          {confettiPieces.map((p, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left: p.left,
                top: "-24px",
                width: p.width,
                height: p.height,
                background: p.color,
                borderRadius: p.isCircle ? "50%" : "3px",
                animation: `confetti-fall ${p.duration} ease-in forwards`,
                animationDelay: p.delay,
                transform: `rotate(${p.rotate})`,
              }}
            />
          ))}
          <div
            style={{
              position: "relative",
              zIndex: 1000,
              background: "#fff",
              borderRadius: "var(--r-feature)",
              padding: "48px 56px",
              textAlign: "center",
              boxShadow: "var(--shadow-feature)",
              animation: "fade-in-up 0.4s ease both",
            }}
          >
            <div style={{ fontSize: "56px", lineHeight: 1, marginBottom: "20px" }}>
              🎉
            </div>
            <h2
              style={{
                fontSize: "24px",
                fontWeight: 700,
                color: "var(--ink)",
                margin: "0 0 10px",
                letterSpacing: "-0.02em",
              }}
            >
              Module Complete!
            </h2>
            <p style={{ fontSize: "15px", color: "var(--muted)", margin: 0 }}>
              Loading your results…
            </p>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "6px",
                marginTop: "20px",
              }}
            >
              {[0, 1, 2].map((d) => (
                <div
                  key={d}
                  className="shimmer"
                  style={{
                    width: "7px",
                    height: "7px",
                    borderRadius: "50%",
                    background: "var(--navy)",
                    animationDelay: `${d * 0.2}s`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

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
            style={{
              maxWidth: "860px",
              margin: "0 auto",
              padding: "0 48px",
            }}
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
              {correctCount > 0 && (
                <span
                  style={{
                    padding: "4px 12px",
                    borderRadius: "var(--r-pill)",
                    background: "rgba(255,255,255,.15)",
                    color: "var(--on-navy)",
                    fontSize: "13px",
                    fontWeight: 500,
                    whiteSpace: "nowrap",
                  }}
                >
                  {correctCount} correct
                </span>
              )}
              <span
                style={{
                  fontSize: "14px",
                  color: "var(--on-navy-2)",
                  whiteSpace: "nowrap",
                }}
              >
                {answeredCount} of {total} answered
              </span>
            </div>

            {/* Segmented progress */}
            <div
              style={{
                display: "flex",
                gap: "4px",
                alignItems: "center",
                height: "16px",
              }}
            >
              {mod.questions.map((_, i) => {
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
        <div
          style={{
            flex: 1,
            padding: "40px 0 80px",
          }}
        >
          <div
            className="quiz-content-inner"
            style={{
              maxWidth: "860px",
              margin: "0 auto",
              padding: "0 48px",
            }}
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
                  Question {currentIdx + 1} of {total} · {q.section} ·{" "}
                  {q.difficulty}
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
                  marginBottom: "28px",
                  letterSpacing: "-0.02em",
                  margin: "0 0 28px",
                }}
              >
                {q.question}
              </p>

              {/* Nudge */}
              {showNudge && (
                <p
                  style={{
                    fontSize: "13px",
                    color: "var(--incorrect-text)",
                    marginBottom: "12px",
                    animation: "fade-in-up 0.2s ease",
                  }}
                >
                  Please select an answer before checking.
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
                  const isCurrent = state === "selected";
                  const isCorrectOpt = state === "correct";
                  const isWrongOpt = state === "wrong";

                  return (
                    <button
                      key={opt.label}
                      onClick={() => {
                        if (isRevealed) return;
                        setShowNudge(false);
                        setAnswers((prev) => ({ ...prev, [q.id]: opt.label }));
                      }}
                      disabled={isRevealed}
                      className={`option-btn${isCurrent ? " option-selected" : ""}${isRevealed ? " option-answered" : ""}`}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "14px",
                        padding: "14px 18px",
                        borderRadius: "var(--r-option)",
                        textAlign: "left",
                        width: "100%",
                        cursor: isRevealed ? "default" : "pointer",
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
                        {isCorrectOpt ? "✓" : isWrongOpt ? "✕" : opt.label}
                      </span>
                      <span
                        style={{
                          flex: 1,
                          fontSize: "15px",
                          lineHeight: "24px",
                          ...styles.text,
                        }}
                      >
                        {opt.text}
                      </span>
                      {isCorrectOpt && (
                        <span
                          style={{
                            fontSize: "12px",
                            fontWeight: 600,
                            color: "var(--correct-text)",
                            background: "rgba(31,122,82,.1)",
                            padding: "2px 10px",
                            borderRadius: "var(--r-pill)",
                            whiteSpace: "nowrap",
                          }}
                        >
                          Correct
                        </span>
                      )}
                      {isWrongOpt && (
                        <span
                          style={{
                            fontSize: "12px",
                            fontWeight: 600,
                            color: "var(--incorrect-text)",
                            background: "rgba(194,59,59,.1)",
                            padding: "2px 10px",
                            borderRadius: "var(--r-pill)",
                            whiteSpace: "nowrap",
                          }}
                        >
                          Your answer
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
                    const isCorrectOpt = state === "correct";
                    const isWrongOpt = state === "wrong";

                    return (
                      <div key={opt.label} className="mobile-option-slide">
                        <button
                          onClick={() => {
                            if (isRevealed) return;
                            setShowNudge(false);
                            setAnswers((prev) => ({ ...prev, [q.id]: opt.label }));
                          }}
                          disabled={isRevealed}
                          className="mobile-option-card"
                          style={styles.wrapper as React.CSSProperties}
                        >
                          {/* Prominent letter badge */}
                          <div
                            className="mobile-option-badge"
                            style={styles.badge as React.CSSProperties}
                          >
                            {isCorrectOpt ? "✓" : isWrongOpt ? "✕" : opt.label}
                          </div>

                          {/* Full answer text — never truncated */}
                          <p
                            className="mobile-option-text"
                            style={{ color: (styles.text as React.CSSProperties).color }}
                          >
                            {opt.text}
                          </p>

                          {isCorrectOpt && (
                            <span className="result-tag correct-tag-mobile">Correct</span>
                          )}
                          {isWrongOpt && (
                            <span className="result-tag wrong-tag-mobile">Your answer</span>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Swipe hint */}
                <p className="mobile-swipe-hint" aria-hidden="true">← swipe →</p>

                {/* A / B / C / D navigation */}
                <div className="mobile-carousel-nav" role="group" aria-label="Answer navigation">
                  {q.options.map((opt, optIdx) => {
                    const isViewing = optIdx === visibleOptIdx;
                    const isChosen = selected === opt.label;
                    return (
                      <button
                        key={opt.label}
                        onClick={() => scrollToOpt(optIdx)}
                        aria-label={`View option ${opt.label}${isChosen ? " (your selection)" : ""}`}
                        className={
                          "mobile-nav-btn" +
                          (isViewing ? " mnb-viewing" : "") +
                          (isChosen ? " mnb-chosen" : "")
                        }
                      >
                        <span>{opt.label}</span>
                        {isChosen && <span className="mnb-dot" aria-hidden="true">●</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Explanation / result */}
              {isRevealed && (
                <div
                  className="card-enter"
                  style={{
                    marginTop: "20px",
                    padding: "16px",
                    borderRadius: "var(--r-option)",
                    background: "var(--wash)",
                    fontSize: "14px",
                    lineHeight: "22px",
                    color: "var(--ink-2)",
                  }}
                >
                  {isCorrect
                    ? `✓ Correct! The answer is ${q.answer}.`
                    : `The correct answer is ${q.answer}. ${q.options.find((o) => o.label === q.answer)?.text ?? ""}`}
                </div>
              )}

              {/* Primary action */}
              <button
                onClick={handlePrimaryAction}
                disabled={primaryDisabled}
                className="quiz-primary-btn"
                style={{
                  marginTop: "28px",
                  padding: "14px 32px",
                  borderRadius: "9px",
                  border: "none",
                  background: primaryDisabled
                    ? "var(--disabled)"
                    : "var(--accent)",
                  color: primaryDisabled ? "#ffffff" : "var(--navy)",
                  fontSize: "16px",
                  fontWeight: 700,
                  cursor: primaryDisabled ? "not-allowed" : "pointer",
                  transition: "background 0.2s, transform 0.15s",
                  letterSpacing: "-0.01em",
                  minHeight: "52px",
                }}
                onMouseEnter={(e) => {
                  if (!primaryDisabled) {
                    (e.currentTarget as HTMLButtonElement).style.background = "#ffb77e";
                    (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
                  }
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = primaryDisabled ? "var(--disabled)" : "var(--accent)";
                  (e.currentTarget as HTMLButtonElement).style.transform = "none";
                }}
              >
                {primaryLabel}
              </button>
            </div>

            {/* Below card */}
            <div
              style={{
                marginTop: "20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span className="quiz-keyboard-hint" style={{ fontSize: "12px", color: "var(--faint)" }}>
                Use 1–4 to select · Enter to confirm · ← → navigate
              </span>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
                <button
                  onClick={handleSubmitQuiz}
                  style={{
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "var(--accent-dark)",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                    borderBottom: "1px solid var(--accent-dark)",
                    paddingBottom: "2px",
                  }}
                >
                  Submit quiz →
                </button>
                {submitWarnMsg && (
                  <span
                    style={{
                      fontSize: "12px",
                      color: "var(--incorrect-text)",
                      animation: "fade-in-up 0.2s ease",
                    }}
                  >
                    {submitWarnMsg}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
