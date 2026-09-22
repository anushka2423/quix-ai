"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import Link from "next/link";
import { modules } from "@/lib/quiz-data";
import type { OptionLabel } from "@/types/quiz";
import { saveResult } from "@/lib/supabase";
import { getStoredEmail } from "@/components/EmailGate";

const CONFETTI_COLORS = [
  "#006FFF", "#FF6F00", "#10B981", "#F59E0B", "#8B5CF6",
  "#EC4899", "#06B6D4", "#84CC16", "#EF4444", "#04275E",
];

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();
  const moduleId = Number(params.id);
  const mod = modules.find((m) => m.id === moduleId);

  const [answers, setAnswers] = useState<Record<number, OptionLabel>>({});
  const [currentIdx, setCurrentIdx] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

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
        <p style={{ fontFamily: "var(--font-geist)", color: "var(--color-slate)" }}>
          Module not found.{" "}
          <Link href="/" style={{ color: "var(--color-primary)" }}>Go back</Link>
        </p>
      </main>
    );
  }

  const total = mod.questions.length;
  const q = mod.questions[currentIdx];
  const selected = answers[q.id];
  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === total;
  const isFirst = currentIdx === 0;
  const isLast = currentIdx === total - 1;

  // Arc
  const arcR = 26;
  const arcC = 2 * Math.PI * arcR;
  const arcOffset = arcC * (1 - answeredCount / total);
  const arcColor = allAnswered ? "#10B981" : "var(--color-primary)";

  function handleSelect(option: OptionLabel) {
    setAnswers((prev) => ({ ...prev, [q.id]: option }));
    if (!isLast) setTimeout(() => setCurrentIdx((i) => i + 1), 380);
  }

  function handlePrev() {
    if (!isFirst) setCurrentIdx((i) => i - 1);
  }

  function handleNext() {
    if (!isLast) {
      setCurrentIdx((i) => i + 1);
    } else if (allAnswered) {
      handleSubmit();
    } else {
      const first = mod!.questions.findIndex((qq) => !answers[qq.id]);
      if (first !== -1) setCurrentIdx(first);
    }
  }

  async function handleSubmit() {
    if (!allAnswered) {
      const first = mod!.questions.findIndex((qq) => !answers[qq.id]);
      if (first !== -1) { setCurrentIdx(first); return; }
    }
    const answerString = mod!.questions.map((qq) => answers[qq.id] ?? "").join(",");
    const score = mod!.questions.filter((qq, i) => answers[qq.id] === qq.answer).length;
    const email = getStoredEmail();
    if (email) {
      saveResult({ email, moduleId, moduleTitle: mod!.title, answers: answerString, score, total }).catch(() => {});
    }
    setShowConfetti(true);
    setTimeout(() => {
      router.push(`/results/${moduleId}?a=${answerString}`);
    }, 2200);
  }

  return (
    <>
      {/* ── Confetti overlay ── */}
      {showConfetti && (
        <div style={{ position: "fixed", inset: 0, zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(4,39,94,0.88)", backdropFilter: "blur(6px)" }}>
          {confettiPieces.map((p, i) => (
            <div key={i} style={{ position: "absolute", left: p.left, top: "-24px", width: p.width, height: p.height, background: p.color, borderRadius: p.isCircle ? "50%" : "3px", animation: `confetti-fall ${p.duration} ease-in forwards`, animationDelay: p.delay, transform: `rotate(${p.rotate})` }} />
          ))}
          <div style={{ position: "relative", zIndex: 1000, background: "#fff", borderRadius: "var(--radius-xl)", padding: "48px 56px", textAlign: "center", boxShadow: "0 32px 64px rgba(0,0,0,0.3)", animation: "fade-in-up 0.4s ease both" }}>
            <div style={{ fontSize: "64px", lineHeight: 1, marginBottom: "20px" }}>🎉</div>
            <h2 style={{ fontFamily: "var(--font-golos)", fontSize: "26px", fontWeight: 700, color: "var(--color-ink)", margin: "0 0 10px" }}>Module Complete!</h2>
            <p style={{ fontFamily: "var(--font-geist)", fontSize: "15px", color: "var(--color-slate)", margin: 0 }}>Loading your results…</p>
            <div style={{ display: "flex", justifyContent: "center", gap: "6px", marginTop: "20px" }}>
              {[0, 1, 2].map((d) => (
                <div key={d} style={{ width: "7px", height: "7px", borderRadius: "50%", background: "var(--color-primary)", animation: `shimmer-pulse 1s ease-in-out ${d * 0.2}s infinite` }} />
              ))}
            </div>
          </div>
        </div>
      )}

      <main style={{ height: "100vh", background: "#F7F8FA", display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* ── Top bar ── */}
        <div style={{ background: "#fff", borderBottom: "1px solid var(--color-hairline)", flexShrink: 0 }}>
          <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "14px 48px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Link href="/" style={{ fontFamily: "var(--font-geist)", fontSize: "14px", color: "var(--color-slate)", textDecoration: "none" }}>
              ← Back
            </Link>
            <span style={{ fontFamily: "var(--font-geist)", fontSize: "14px", fontWeight: 500, color: "var(--color-steel)", maxWidth: "400px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {mod.title}
            </span>
            <span style={{ fontFamily: "var(--font-geist)", fontSize: "14px", color: allAnswered ? "#10B981" : "var(--color-slate)", fontWeight: 500, transition: "color 0.2s" }}>
              {answeredCount}/{total} answered
            </span>
          </div>
          <div style={{ height: "3px", background: "var(--color-hairline)" }}>
            <div style={{ width: `${(answeredCount / total) * 100}%`, height: "100%", background: allAnswered ? "#10B981" : "var(--color-primary)", transition: "width 0.3s ease" }} />
          </div>
        </div>

        {/* ── Two-column content ── */}
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 48px", overflow: "auto" }}>
          <div style={{ maxWidth: "1280px", width: "100%", display: "flex", gap: "56px", alignItems: "flex-start" }}>

            {/* ── LEFT: Question + Options + Prev/Next ── */}
            <div
              key={currentIdx}
              style={{ flex: 1, minWidth: 0, animation: "fade-in-up 0.2s ease both" }}
            >
              {/* Question label */}
              <p style={{ fontFamily: "var(--font-geist)", fontSize: "15px", fontWeight: 600, color: "var(--color-steel)", margin: "0 0 14px", letterSpacing: "0.1px" }}>
                Question {currentIdx + 1}
              </p>

              {/* Question text box */}
              <div style={{ background: "var(--color-surface-blue-tint)", borderRadius: "var(--radius-lg)", padding: "24px 28px", marginBottom: "24px" }}>
                <p style={{ fontFamily: "var(--font-golos)", fontSize: "22px", fontWeight: 600, color: "var(--color-ink)", margin: 0, lineHeight: 1.5 }}>
                  {q.question}
                </p>
              </div>

              {/* Instruction */}
              <p style={{ fontFamily: "var(--font-geist)", fontSize: "14px", color: "var(--color-slate)", margin: "0 0 14px" }}>
                Select the correct answer from the options below:
              </p>

              {/* Options — vertical list */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {q.options.map((opt) => {
                  const isSelected = selected === opt.label;
                  return (
                    <button
                      key={opt.label}
                      onClick={() => handleSelect(opt.label)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "16px",
                        padding: "18px 22px",
                        borderRadius: "var(--radius-md)",
                        border: isSelected ? "2px solid var(--color-primary)" : "1px solid var(--color-hairline)",
                        background: isSelected ? "var(--color-surface-blue-soft)" : "#fff",
                        cursor: "pointer",
                        textAlign: "left",
                        width: "100%",
                        transition: "all 0.12s",
                      }}
                    >
                      <div style={{
                        width: "22px", height: "22px", borderRadius: "6px", flexShrink: 0,
                        border: isSelected ? "none" : "1.5px solid #D0D5DD",
                        background: isSelected ? "var(--color-primary)" : "#fff",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        transition: "all 0.12s",
                      }}>
                        {isSelected && (
                          <svg width="12" height="9" viewBox="0 0 12 9" fill="none">
                            <path d="M1 4.5L4 7.5L11 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                      <span style={{ fontFamily: "var(--font-geist)", fontSize: "16px", lineHeight: 1.5, color: "var(--color-ink)", fontWeight: isSelected ? 500 : 400 }}>
                        {opt.text}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Prev / Next */}
              <div style={{ display: "flex", gap: "12px", marginTop: "32px" }}>
                <button
                  onClick={handlePrev}
                  disabled={isFirst}
                  style={{
                    fontFamily: "var(--font-golos)", fontSize: "16px", fontWeight: 500,
                    padding: "13px 32px", borderRadius: "var(--radius-md)",
                    border: "1px solid var(--color-hairline)", background: "#fff",
                    color: isFirst ? "#C0C5D0" : "var(--color-ink)",
                    cursor: isFirst ? "not-allowed" : "pointer",
                  }}
                >
                  Previous
                </button>
                <button
                  onClick={handleNext}
                  style={{
                    fontFamily: "var(--font-golos)", fontSize: "16px", fontWeight: 500,
                    padding: "13px 32px", borderRadius: "var(--radius-md)",
                    border: "none", background: "var(--color-navy-900)", color: "#fff",
                    cursor: "pointer",
                  }}
                >
                  Next
                </button>
              </div>
            </div>

            {/* ── RIGHT: Progress + Grid + Submit ── */}
            <div style={{ width: "260px", flexShrink: 0, paddingTop: "4px" }}>

              {/* "Questions remaining" + arc row */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
                <span style={{ fontFamily: "var(--font-geist)", fontSize: "15px", fontWeight: 500, color: "var(--color-ink)" }}>
                  Questions remaining
                </span>
                <svg width="62" height="62" viewBox="0 0 62 62">
                  <circle cx="31" cy="31" r={arcR} fill="none" stroke="var(--color-hairline)" strokeWidth="5" />
                  <circle
                    cx="31" cy="31" r={arcR} fill="none" stroke={arcColor} strokeWidth="5"
                    strokeLinecap="round" strokeDasharray={arcC} strokeDashoffset={arcOffset}
                    transform="rotate(-90 31 31)"
                    style={{ transition: "stroke-dashoffset 0.35s ease, stroke 0.3s" }}
                  />
                  <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" style={{ fontFamily: "var(--font-golos)", fontSize: "13px", fontWeight: 700, fill: arcColor }}>
                    {answeredCount}/{total}
                  </text>
                </svg>
              </div>

              {/* Number grid — 3 columns */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px", marginBottom: "20px" }}>
                {mod.questions.map((qq, i) => {
                  const isCurrent = i === currentIdx;
                  const isAnswered = !!answers[qq.id];
                  return (
                    <button
                      key={qq.id}
                      onClick={() => setCurrentIdx(i)}
                      style={{
                        height: "48px",
                        borderRadius: "var(--radius-md)",
                        fontFamily: "var(--font-geist)", fontSize: "15px",
                        fontWeight: isCurrent ? 700 : 500,
                        border: `1.5px solid ${isCurrent ? "var(--color-navy-900)" : isAnswered ? "#10B981" : "var(--color-hairline)"}`,
                        background: isCurrent ? "var(--color-navy-900)" : isAnswered ? "#10B981" : "#fff",
                        color: isCurrent || isAnswered ? "#fff" : "var(--color-ink)",
                        cursor: "pointer",
                        transition: "all 0.12s",
                      }}
                    >
                      {i + 1}
                    </button>
                  );
                })}
              </div>

              {/* Submit quiz */}
              <button
                onClick={handleSubmit}
                style={{
                  width: "100%",
                  padding: "16px",
                  borderRadius: "var(--radius-md)",
                  border: "none",
                  background: allAnswered ? "#10B981" : "var(--color-navy-900)",
                  color: "#fff",
                  fontFamily: "var(--font-golos)", fontSize: "17px", fontWeight: 600,
                  cursor: "pointer",
                  transition: "background 0.2s",
                  letterSpacing: "0.1px",
                }}
              >
                {allAnswered ? "Submit quiz ✓" : "Submit quiz"}
              </button>

              {!allAnswered && (
                <p style={{ fontFamily: "var(--font-geist)", fontSize: "13px", color: "var(--color-slate)", marginTop: "10px", textAlign: "center", lineHeight: 1.4 }}>
                  {total - answeredCount} question{total - answeredCount !== 1 ? "s" : ""} left
                </p>
              )}
            </div>

          </div>
        </div>
      </main>
    </>
  );
}
