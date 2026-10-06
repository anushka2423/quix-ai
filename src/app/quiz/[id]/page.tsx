"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { modules } from "@/lib/quiz-data";
import type { OptionLabel } from "@/types/quiz";
import { saveResult } from "@/lib/supabase";
import { getStoredEmail } from "@/components/EmailGate";
import Header from "@/components/Header";

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();
  const moduleId = Number(params.id);
  const mod = modules.find((m) => m.id === moduleId);

  const [answers, setAnswers] = useState<Record<number, OptionLabel>>({});
  const [currentIdx, setCurrentIdx] = useState(0);

  // Mobile carousel — tracks which option card is currently visible (0–4)
  const [visibleOptIdx, setVisibleOptIdx] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

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
  const selected = answers[q.id] as OptionLabel | undefined;
  const isFirst = currentIdx === 0;
  const isLast = currentIdx === total - 1;
  const primaryDisabled = !selected;
  const primaryLabel = isLast ? "See my score →" : "Next question →";

  // Finish the quiz — save results and navigate to results page
  async function handleFinish() {
    const answerString = mod!.questions
      .map((qq) => answers[qq.id] ?? "")
      .join(",");
    const score = mod!.questions.filter(
      (qq) => answers[qq.id] === qq.answer
    ).length;
    const pct = Math.round((score / total) * 100);

    try {
      const existing = JSON.parse(localStorage.getItem("aipm_scores") ?? "{}");
      existing[String(moduleId)] = { score, total, pct };
      localStorage.setItem("aipm_scores", JSON.stringify(existing));
    } catch {}

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

    router.push(`/results/${moduleId}?a=${answerString}`);
  }

  function handleNext() {
    if (!selected) return;
    if (isLast) {
      handleFinish();
    } else {
      setCurrentIdx((i) => i + 1);
    }
  }

  function handleBack() {
    if (!isFirst) setCurrentIdx((i) => i - 1);
  }

  function selectAnswer(label: OptionLabel) {
    setAnswers((prev) => ({ ...prev, [q.id]: label }));
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
      if (!mod) return;
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
        if (selected && !isLast) setCurrentIdx((i) => i + 1);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [q, isFirst, isLast, selected, answers]
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
    const qq = mod!.questions[i];
    if (i === currentIdx) return "current";
    if (answers[qq.id]) return "answered";
    return "default";
  }

  const segmentColors: Record<string, string> = {
    default: "rgba(255,255,255,.18)",
    current: "var(--accent)",
    answered: "rgba(255,255,255,1)",
  };

  function optionState(label: OptionLabel): "selected" | "default" {
    return label === selected ? "selected" : "default";
  }

  function getOptionStyles(state: "selected" | "default") {
    if (state === "selected") {
      return {
        wrapper: {
          border: "2px solid var(--accent-dark)",
          background: "#fff3e8",
          color: "var(--ink)",
        },
        badge: { background: "var(--accent-dark)", color: "#ffffff", border: "none" },
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

  return (
    <>
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
                {Object.keys(answers).length} of {total} answered
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
                  margin: "0 0 28px",
                }}
              >
                {q.question}
              </p>

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
                      aria-pressed={state === "selected"}
                      className={`option-btn${state === "selected" ? " option-selected" : ""}`}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "14px",
                        padding: "14px 18px",
                        borderRadius: "var(--r-option)",
                        textAlign: "left",
                        width: "100%",
                        cursor: "pointer",
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
                          aria-pressed={state === "selected"}
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
                    const isChosen = selected === opt.label;
                    return (
                      <button
                        key={opt.label}
                        onClick={() => {
                          scrollToOpt(optIdx);
                          selectAnswer(opt.label);
                        }}
                        aria-label={`Select option ${opt.label}${isChosen ? " (selected)" : ""}`}
                        className={
                          "mobile-nav-btn" +
                          (isViewing ? " mnb-viewing" : "") +
                          (isChosen ? " mnb-chosen" : "")
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
                      (e.currentTarget as HTMLButtonElement).style.background = "#ffb77e";
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
