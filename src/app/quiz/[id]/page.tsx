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
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});
  const [showNudge, setShowNudge] = useState(false);

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
  const isRevealed = !!revealed[q.id];
  const isCorrect = selected === q.answer;
  const answeredCount = Object.keys(answers).length;
  const revealedCount = Object.keys(revealed).length;
  const allAnswered = answeredCount === total;
  const allRevealed = revealedCount === total;
  const isFirst = currentIdx === 0;
  const isLast = currentIdx === total - 1;

  const arcR = 26;
  const arcC = 2 * Math.PI * arcR;
  const arcOffset = arcC * (1 - revealedCount / total);
  const arcColor = allRevealed ? "#10B981" : "var(--color-primary)";

  function handleSelect(option: OptionLabel) {
    if (isRevealed) return;
    setShowNudge(false);
    setAnswers((prev) => ({ ...prev, [q.id]: option }));
  }

  function handleQuestionSubmit() {
    if (isRevealed) {
      if (!isLast) setCurrentIdx((i) => i + 1);
      return;
    }
    if (!selected) {
      setShowNudge(true);
      setTimeout(() => setShowNudge(false), 2000);
      return;
    }
    setRevealed((prev) => ({ ...prev, [q.id]: true }));
  }

  async function handleQuizSubmit() {
    if (!allAnswered) {
      const first = mod!.questions.findIndex((qq) => !answers[qq.id]);
      if (first !== -1) { setCurrentIdx(first); return; }
    }
    const answerString = mod!.questions.map((qq) => answers[qq.id] ?? "").join(",");
    const score = mod!.questions.filter((qq) => answers[qq.id] === qq.answer).length;
    const email = getStoredEmail();
    if (email) {
      saveResult({ email, moduleId, moduleTitle: mod!.title, answers: answerString, score, total }).catch(() => {});
    }
    setShowConfetti(true);
    setTimeout(() => {
      router.push(`/results/${moduleId}?a=${answerString}`);
    }, 2200);
  }

  function optionStyle(label: OptionLabel) {
    if (!isRevealed) {
      const isSelected = label === selected;
      return {
        border: isSelected ? "2px solid var(--color-primary)" : "1px solid var(--color-hairline)",
        background: isSelected ? "var(--color-surface-blue-soft)" : "#fff",
        color: "var(--color-ink)",
      };
    }
    if (label === q.answer) {
      return { border: "2px solid #10B981", background: "#F0FDF4", color: "#065F46" };
    }
    if (label === selected && selected !== q.answer) {
      return { border: "2px solid #EF4444", background: "#FEF2F2", color: "#991B1B" };
    }
    return { border: "1px solid #F0F0F0", background: "#FAFAFA", color: "#AAA" };
  }

  function checkboxStyle(label: OptionLabel) {
    if (!isRevealed) {
      const isSelected = label === selected;
      return isSelected
        ? { border: "none", background: "var(--color-primary)" }
        : { border: "1.5px solid #D0D5DD", background: "#fff" };
    }
    if (label === q.answer) return { border: "none", background: "#10B981" };
    if (label === selected && selected !== q.answer) return { border: "none", background: "#EF4444" };
    return { border: "1.5px solid #E0E0E0", background: "#f5f5f5" };
  }

  const submitLabel = isRevealed ? (isLast ? "Done" : "Next →") : "Submit";

  return (
    <>
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

        {/* Top bar */}
        <div style={{ background: "#fff", borderBottom: "1px solid var(--color-hairline)", flexShrink: 0 }}>
          <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "14px 48px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Link href="/" style={{ fontFamily: "var(--font-geist)", fontSize: "14px", color: "var(--color-slate)", textDecoration: "none" }}>← Back</Link>
            <span style={{ fontFamily: "var(--font-geist)", fontSize: "14px", fontWeight: 500, color: "var(--color-steel)", maxWidth: "400px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{mod.title}</span>
            <span style={{ fontFamily: "var(--font-geist)", fontSize: "14px", color: allAnswered ? "#10B981" : "var(--color-slate)", fontWeight: 500, transition: "color 0.2s" }}>{answeredCount}/{total} answered</span>
          </div>
          <div style={{ height: "3px", background: "var(--color-hairline)" }}>
            <div style={{ width: `${(answeredCount / total) * 100}%`, height: "100%", background: allAnswered ? "#10B981" : "var(--color-primary)", transition: "width 0.3s ease" }} />
          </div>
        </div>

        {/* Two-column content */}
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 48px", overflow: "auto" }}>
          <div style={{ maxWidth: "1280px", width: "100%", display: "flex", gap: "56px", alignItems: "flex-start" }}>

            {/* LEFT */}
            <div key={currentIdx} style={{ flex: 1, minWidth: 0, animation: "fade-in-up 0.2s ease both" }}>

              <p style={{ fontFamily: "var(--font-geist)", fontSize: "15px", fontWeight: 600, color: "var(--color-steel)", margin: "0 0 14px" }}>
                Question {currentIdx + 1} <span style={{ fontWeight: 400, color: "#B0B8C8" }}>of {total}</span>
              </p>

              <div style={{ background: "var(--color-surface-blue-tint)", borderRadius: "var(--radius-lg)", padding: "24px 28px", marginBottom: "20px" }}>
                <p style={{ fontFamily: "var(--font-golos)", fontSize: "22px", fontWeight: 600, color: "var(--color-ink)", margin: 0, lineHeight: 1.5 }}>
                  {q.question}
                </p>
              </div>

              {/* Instruction / result label */}
              {!isRevealed ? (
                <p style={{ fontFamily: "var(--font-geist)", fontSize: "14px", color: showNudge ? "#DC2626" : "var(--color-slate)", margin: "0 0 14px", transition: "color 0.2s" }}>
                  {showNudge ? "Please select an answer before submitting." : "Select an answer, then click Submit to check."}
                </p>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px", animation: "fade-in-up 0.25s ease both" }}>
                  <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: isCorrect ? "#10B981" : "#EF4444", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                      {isCorrect
                        ? <path d="M1 5L4.5 8.5L11 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        : <path d="M2 2L10 10M10 2L2 10" stroke="white" strokeWidth="2" strokeLinecap="round" />
                      }
                    </svg>
                  </div>
                  <span style={{ fontFamily: "var(--font-golos)", fontSize: "16px", fontWeight: 600, color: isCorrect ? "#047857" : "#DC2626" }}>
                    {isCorrect ? "Correct!" : `Incorrect — the correct answer is ${q.answer}`}
                  </span>
                </div>
              )}

              {/* Options */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {q.options.map((opt) => {
                  const oStyle = optionStyle(opt.label);
                  const cStyle = checkboxStyle(opt.label);
                  const showCheckIcon = (!isRevealed && opt.label === selected) || (isRevealed && opt.label === q.answer);
                  const showWrongIcon = isRevealed && opt.label === selected && selected !== q.answer;
                  return (
                    <button
                      key={opt.label}
                      onClick={() => handleSelect(opt.label)}
                      disabled={isRevealed}
                      style={{ display: "flex", alignItems: "center", gap: "16px", padding: "16px 20px", borderRadius: "var(--radius-md)", ...oStyle, cursor: isRevealed ? "default" : "pointer", textAlign: "left", width: "100%", transition: "all 0.18s" }}
                    >
                      <div style={{ width: "22px", height: "22px", borderRadius: "6px", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.18s", ...cStyle }}>
                        {showCheckIcon && !isRevealed && (
                          <svg width="11" height="9" viewBox="0 0 11 9" fill="none"><path d="M1 4L4 7L10 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        )}
                        {showCheckIcon && isRevealed && opt.label === q.answer && (
                          <svg width="12" height="9" viewBox="0 0 12 9" fill="none"><path d="M1 4.5L4 7.5L11 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        )}
                        {showWrongIcon && (
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1 1L9 9M9 1L1 9" stroke="white" strokeWidth="2" strokeLinecap="round" /></svg>
                        )}
                      </div>
                      <span style={{ fontFamily: "var(--font-geist)", fontSize: "16px", lineHeight: 1.5, fontWeight: (isRevealed && opt.label === q.answer) ? 500 : 400 }}>
                        {opt.text}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Buttons */}
              <div style={{ display: "flex", gap: "10px", marginTop: "24px", alignItems: "center" }}>
                <button
                  onClick={() => { if (!isFirst) setCurrentIdx((i) => i - 1); }}
                  disabled={isFirst}
                  style={{ fontFamily: "var(--font-golos)", fontSize: "15px", fontWeight: 500, padding: "12px 24px", borderRadius: "var(--radius-md)", border: "1px solid var(--color-hairline)", background: "#fff", color: isFirst ? "#C0C5D0" : "var(--color-ink)", cursor: isFirst ? "not-allowed" : "pointer" }}
                >
                  Prev
                </button>

                {!isRevealed && (
                  <button
                    onClick={() => { if (!isLast) setCurrentIdx((i) => i + 1); }}
                    disabled={isLast}
                    style={{ fontFamily: "var(--font-golos)", fontSize: "15px", fontWeight: 500, padding: "12px 24px", borderRadius: "var(--radius-md)", border: "1px solid var(--color-hairline)", background: "#fff", color: isLast ? "#C0C5D0" : "var(--color-slate)", cursor: isLast ? "not-allowed" : "pointer" }}
                  >
                    Skip
                  </button>
                )}

                <button
                  onClick={handleQuestionSubmit}
                  style={{ fontFamily: "var(--font-golos)", fontSize: "15px", fontWeight: 600, padding: "12px 28px", borderRadius: "var(--radius-md)", border: "none", background: isRevealed ? "var(--color-navy-900)" : selected ? "var(--color-primary)" : "#C0C5D0", color: "#fff", cursor: selected || isRevealed ? "pointer" : "not-allowed", transition: "background 0.2s" }}
                >
                  {submitLabel}
                </button>
              </div>
            </div>

            {/* RIGHT */}
            <div style={{ width: "260px", flexShrink: 0, paddingTop: "4px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
                <span style={{ fontFamily: "var(--font-geist)", fontSize: "15px", fontWeight: 500, color: "var(--color-ink)" }}>Progress</span>
                <svg width="62" height="62" viewBox="0 0 62 62">
                  <circle cx="31" cy="31" r={arcR} fill="none" stroke="var(--color-hairline)" strokeWidth="5" />
                  <circle cx="31" cy="31" r={arcR} fill="none" stroke={arcColor} strokeWidth="5" strokeLinecap="round" strokeDasharray={arcC} strokeDashoffset={arcOffset} transform="rotate(-90 31 31)" style={{ transition: "stroke-dashoffset 0.35s ease, stroke 0.3s" }} />
                  <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" style={{ fontFamily: "var(--font-golos)", fontSize: "13px", fontWeight: 700, fill: arcColor }}>{revealedCount}/{total}</text>
                </svg>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px", marginBottom: "20px" }}>
                {mod.questions.map((qq, i) => {
                  const isCurrent = i === currentIdx;
                  const isRev = !!revealed[qq.id];
                  const ans = answers[qq.id];
                  const wasCorrect = ans === qq.answer;

                  let bgColor = "#fff";
                  let borderColor = "var(--color-hairline)";
                  let textColor = "var(--color-ink)";

                  if (isCurrent) {
                    bgColor = "var(--color-navy-900)"; borderColor = "var(--color-navy-900)"; textColor = "#fff";
                  } else if (isRev) {
                    bgColor = wasCorrect ? "#10B981" : "#EF4444"; borderColor = bgColor; textColor = "#fff";
                  } else if (ans) {
                    bgColor = "#EBF3FF"; borderColor = "var(--color-primary)"; textColor = "var(--color-primary)";
                  }

                  return (
                    <button key={qq.id} onClick={() => setCurrentIdx(i)} style={{ height: "48px", borderRadius: "var(--radius-md)", fontFamily: "var(--font-geist)", fontSize: "15px", fontWeight: isCurrent ? 700 : 500, border: `1.5px solid ${borderColor}`, background: bgColor, color: textColor, cursor: "pointer", transition: "all 0.15s" }}>
                      {i + 1}
                    </button>
                  );
                })}
              </div>

              <button onClick={handleQuizSubmit} style={{ width: "100%", padding: "16px", borderRadius: "var(--radius-md)", border: "none", background: allAnswered ? "#10B981" : "var(--color-navy-900)", color: "#fff", fontFamily: "var(--font-golos)", fontSize: "17px", fontWeight: 600, cursor: "pointer", transition: "background 0.2s" }}>
                {allAnswered ? "Submit quiz ✓" : "Submit quiz"}
              </button>
              <p style={{ fontFamily: "var(--font-geist)", fontSize: "13px", color: "var(--color-slate)", marginTop: "10px", textAlign: "center" }}>
                {allAnswered ? "All answered — ready to submit!" : `${total - answeredCount} question${total - answeredCount !== 1 ? "s" : ""} remaining`}
              </p>
            </div>

          </div>
        </div>
      </main>
    </>
  );
}
