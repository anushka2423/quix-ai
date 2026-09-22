"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { modules } from "@/lib/quiz-data";
import type { OptionLabel } from "@/types/quiz";
import { updateCallScript } from "@/lib/supabase";
import { getStoredEmail } from "@/components/EmailGate";

/* ── Confetti ── */
function Confetti({ pct }: { pct: number }) {
  if (pct < 70) return null;
  const COLORS = ["#006FFF", "#FF6F00", "#FFC08C", "#10B981", "#ECF2FF", "#04275E"];
  const pieces = Array.from({ length: 50 }, (_, i) => ({
    left: `${(i * 37.3 + 5) % 100}%`,
    delay: `${(i * 0.12) % 3}s`,
    duration: `${2.5 + (i % 5) * 0.4}s`,
    color: COLORS[i % COLORS.length],
    size: `${7 + (i % 4)}px`,
    borderRadius: i % 3 === 0 ? "50%" : "2px",
  }));
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 100,
        overflow: "hidden",
      }}
    >
      {pieces.map((p, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: "-20px",
            left: p.left,
            width: p.size,
            height: p.size,
            borderRadius: p.borderRadius,
            background: p.color,
            opacity: 0,
            animation: `confetti-fall ${p.duration} ${p.delay} ease-in forwards`,
          }}
        />
      ))}
    </div>
  );
}

/* ── Score Arc ── */
function ScoreArc({ pct, score, total }: { pct: number; score: number; total: number }) {
  const r = 52;
  const cx = 64;
  const cy = 64;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - pct / 100);
  const color = pct >= 80 ? "#10B981" : pct >= 60 ? "#006FFF" : "#EF4444";
  const label = pct >= 80 ? "Excellent!" : pct >= 60 ? "Good work" : "Keep practicing";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "40px 0 32px",
      }}
    >
      <svg width="128" height="128" viewBox="0 0 128 128">
        {/* Track */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="var(--color-hairline)"
          strokeWidth="10"
        />
        {/* Animated arc */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 64 64)"
          className="score-arc"
        />
        {/* Percentage */}
        <text
          x="50%"
          y="46%"
          textAnchor="middle"
          dominantBaseline="middle"
          style={{
            fontFamily: "var(--font-golos)",
            fontSize: "28px",
            fontWeight: 600,
            fill: color,
          }}
        >
          {pct}%
        </text>
        {/* Score fraction */}
        <text
          x="50%"
          y="64%"
          textAnchor="middle"
          dominantBaseline="middle"
          style={{
            fontFamily: "var(--font-geist)",
            fontSize: "12px",
            fill: "var(--color-slate)",
          }}
        >
          {score}/{total}
        </text>
      </svg>

      <p
        style={{
          fontFamily: "var(--font-golos)",
          fontSize: "20px",
          fontWeight: 600,
          color,
          marginTop: "12px",
          marginBottom: 0,
        }}
      >
        {label}
      </p>
    </div>
  );
}

/* ── Difficulty badge ── */
function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const styles: Record<string, { bg: string; color: string }> = {
    Easy: { bg: "#ECF2FF", color: "#006FFF" },
    Medium: { bg: "#FFC08C", color: "#5A2E00" },
    Hard: { bg: "#FF6F00", color: "#ffffff" },
  };
  const s = styles[difficulty] ?? styles.Easy;
  return (
    <span
      style={{
        fontFamily: "var(--font-geist)",
        fontSize: "11px",
        fontWeight: 600,
        padding: "3px 9px",
        borderRadius: "var(--radius-full)",
        background: s.bg,
        color: s.color,
      }}
    >
      {difficulty}
    </span>
  );
}

/* ── Sparkle icon ── */
function SparkleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8L12 2z"
        stroke="#006FFF"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ── Main results content ── */
function ResultsContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const moduleId = Number(params.id);
  const mod = modules.find((m) => m.id === moduleId);

  const [summary, setSummary] = useState<string | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(true);

  const rawAnswers = searchParams.get("a") ?? "";
  const userAnswers: (OptionLabel | "")[] = rawAnswers
    .split(",")
    .map((a) => a.trim()) as (OptionLabel | "")[];

  if (!mod) {
    return (
      <main style={{ padding: "96px 48px", textAlign: "center" }}>
        <p style={{ fontFamily: "var(--font-geist)", color: "var(--color-slate)" }}>
          Module not found.{" "}
          <Link href="/" style={{ color: "var(--color-primary)" }}>
            Go back
          </Link>
        </p>
      </main>
    );
  }

  const results = mod.questions.map((q, i) => ({
    questionText: q.question,
    difficulty: q.difficulty,
    section: q.section,
    userAnswer: userAnswers[i] ?? "",
    correctAnswer: q.answer,
    isCorrect: userAnswers[i] === q.answer,
    options: q.options,
  }));

  const score = results.filter((r) => r.isCorrect).length;
  const total = results.length;
  const pct = Math.round((score / total) * 100);

  useEffect(() => {
    async function fetchSummary() {
      try {
        const res = await fetch("/api/summary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            moduleTitle: mod!.title,
            score,
            total,
            results: results.map((r) => ({
              questionText: r.questionText,
              difficulty: r.difficulty,
              userAnswer: r.userAnswer,
              correctAnswer: r.correctAnswer,
              isCorrect: r.isCorrect,
            })),
          }),
        });
        const data = await res.json();
        setSummary(data.summary ?? null);
        if (data.callScript) {
          const email = getStoredEmail();
          if (email) {
            updateCallScript({ email, moduleId, callScript: data.callScript }).catch(() => {});
          }
        }
      } catch {
        setSummary(null);
      } finally {
        setLoadingSummary(false);
      }
    }
    fetchSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "var(--color-surface-deep)",
        paddingBottom: "96px",
      }}
    >
      {/* Confetti for good scores */}
      <Confetti pct={pct} />

      {/* ── Top bar ── */}
      <div
        style={{
          background: "var(--color-canvas)",
          borderBottom: "1px solid var(--color-hairline)",
          padding: "14px 0",
        }}
      >
        <div
          style={{
            maxWidth: "760px",
            margin: "0 auto",
            padding: "0 32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-geist)",
              fontSize: "13px",
              fontWeight: 500,
              color: "var(--color-steel)",
            }}
          >
            {mod.title}
          </span>
        </div>
      </div>

      <div style={{ maxWidth: "760px", margin: "0 auto", padding: "0 32px" }}>
        {/* Module label */}
        <p
          style={{
            fontFamily: "var(--font-geist)",
            fontSize: "12px",
            fontWeight: 600,
            letterSpacing: "0.6px",
            textTransform: "uppercase",
            color: "var(--color-steel)",
            marginTop: "40px",
            marginBottom: "4px",
          }}
        >
          {mod.title}
        </p>
        <h1
          style={{
            fontFamily: "var(--font-golos)",
            fontSize: "32px",
            fontWeight: 600,
            lineHeight: 1.2,
            color: "var(--color-ink)",
            margin: "0 0 0",
          }}
        >
          Your Results
        </h1>

        {/* Score arc */}
        <ScoreArc pct={pct} score={score} total={total} />

        {/* ── 1-on-1 Feedback Banner ── */}
        <div
          style={{
            marginBottom: "32px",
            background: "var(--color-navy-900)",
            borderRadius: "var(--radius-xl)",
            padding: "32px 36px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "24px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "2px", background: "var(--color-orange-500)", flexShrink: 0 }} />
              <span style={{ fontFamily: "var(--font-geist)", fontSize: "12px", fontWeight: 600, letterSpacing: "0.5px", textTransform: "uppercase", color: "var(--color-on-dark-muted)" }}>
                Personalised feedback
              </span>
            </div>
            <p style={{ fontFamily: "var(--font-golos)", fontSize: "20px", fontWeight: 600, color: "var(--color-on-dark)", margin: "0 0 6px", lineHeight: 1.3 }}>
              Get 1-on-1 feedback on your results
            </p>
            <p style={{ fontFamily: "var(--font-geist)", fontSize: "15px", fontWeight: 600, color: "#ffffff", margin: "0 0 8px", lineHeight: 1.5 }}>
              We&apos;ve created a personalised learning path based on your results.
            </p>
            <p style={{ fontFamily: "var(--font-geist)", fontSize: "14px", color: "var(--color-on-dark-muted)", margin: 0, lineHeight: 1.6 }}>
              Get on a 1:1 call. We&apos;re happy to walk you through where you stand, what to focus on, and how to level up fast.
            </p>
          </div>
          <a
            href="https://calendly.com/d/dtdk-7jq-xwm/1-1"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              fontFamily: "var(--font-golos)",
              fontSize: "16px",
              fontWeight: 500,
              padding: "13px 20px 13px 28px",
              borderRadius: "var(--radius-md)",
              background: "var(--color-canvas)",
              color: "var(--color-ink)",
              textDecoration: "none",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            Contact us here
            <span style={{ width: "30px", height: "30px", borderRadius: "var(--radius-sm)", background: "var(--color-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M3 11L11 3M11 3H5M11 3V9" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </a>
        </div>

        {/* ── AI Summary ── */}
        <div
          style={{
            background: "var(--color-canvas)",
            border: "1px solid var(--color-hairline)",
            borderRadius: "var(--radius-lg)",
            padding: "24px",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "14px",
            }}
          >
            <SparkleIcon />
            <span
              style={{
                fontFamily: "var(--font-geist)",
                fontSize: "13px",
                fontWeight: 600,
                color: "var(--color-primary)",
              }}
            >
              AI Performance Summary
            </span>
          </div>

          {loadingSummary ? (
            <div>
              {[80, 62, 44].map((w) => (
                <div
                  key={w}
                  className="shimmer"
                  style={{
                    height: "14px",
                    width: `${w}%`,
                    background: "var(--color-hairline)",
                    borderRadius: "var(--radius-sm)",
                    marginBottom: "10px",
                  }}
                />
              ))}
            </div>
          ) : summary ? (
            <p
              style={{
                fontFamily: "var(--font-geist)",
                fontSize: "15px",
                lineHeight: 1.65,
                color: "var(--color-ink)",
                margin: 0,
              }}
            >
              {summary}
            </p>
          ) : (
            <p
              style={{
                fontFamily: "var(--font-geist)",
                fontSize: "14px",
                color: "var(--color-stone)",
                margin: 0,
              }}
            >
              Summary unavailable — add an{" "}
              <code
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "13px",
                  background: "var(--color-surface-blue-soft)",
                  padding: "1px 6px",
                  borderRadius: "4px",
                }}
              >
                OPENAI_API_KEY
              </code>{" "}
              to enable this feature.
            </p>
          )}
        </div>

        {/* ── Question Review ── */}
        <h2
          style={{
            fontFamily: "var(--font-golos)",
            fontSize: "22px",
            fontWeight: 600,
            color: "var(--color-ink)",
            marginBottom: "20px",
          }}
        >
          Question Review
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {results.map((r, i) => {
            const correctText =
              r.options.find((o) => o.label === r.correctAnswer)?.text ?? "";
            const userText =
              r.options.find((o) => o.label === r.userAnswer)?.text ?? "Not answered";

            return (
              <div
                key={i}
                className="card-enter"
                style={{
                  background: "var(--color-canvas)",
                  border: `1px solid ${r.isCorrect ? "#A7F3D0" : "#FECACA"}`,
                  borderLeft: `4px solid ${r.isCorrect ? "#10B981" : "#EF4444"}`,
                  borderRadius: "var(--radius-lg)",
                  padding: "20px 24px",
                  animationDelay: `${i * 0.04}s`,
                }}
              >
                {/* Header row */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginBottom: "8px",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-geist)",
                      fontSize: "13px",
                      fontWeight: 700,
                      color: "var(--color-steel)",
                    }}
                  >
                    Q{i + 1}
                  </span>
                  <DifficultyBadge difficulty={r.difficulty} />
                  <span
                    style={{
                      marginLeft: "auto",
                      fontFamily: "var(--font-geist)",
                      fontSize: "13px",
                      fontWeight: 600,
                      color: r.isCorrect ? "#047857" : "#DC2626",
                    }}
                  >
                    {r.isCorrect ? "✓ Correct" : "✗ Incorrect"}
                  </span>
                </div>

                {/* Question text */}
                <p
                  style={{
                    fontFamily: "var(--font-geist)",
                    fontSize: "15px",
                    fontWeight: 500,
                    color: "var(--color-ink)",
                    margin: "0 0 12px",
                    lineHeight: 1.5,
                  }}
                >
                  {r.questionText}
                </p>

                {/* Answer rows */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {!r.isCorrect && (
                    <div style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                      <span
                        style={{
                          fontFamily: "var(--font-geist)",
                          fontSize: "12px",
                          fontWeight: 600,
                          color: "#DC2626",
                          flexShrink: 0,
                          paddingTop: "1px",
                        }}
                      >
                        Your answer:
                      </span>
                      <span
                        style={{
                          fontFamily: "var(--font-geist)",
                          fontSize: "13px",
                          color: "#DC2626",
                        }}
                      >
                        {r.userAnswer}) {userText}
                      </span>
                    </div>
                  )}
                  <div style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                    <span
                      style={{
                        fontFamily: "var(--font-geist)",
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "#047857",
                        flexShrink: 0,
                        paddingTop: "1px",
                      }}
                    >
                      {r.isCorrect ? "Your answer:" : "Correct answer:"}
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-geist)",
                        fontSize: "13px",
                        color: "#047857",
                      }}
                    >
                      {r.correctAnswer}) {correctText}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Next module CTA ── */}
        {(() => {
          const nextMod = modules.find((m) => m.id === moduleId + 1);
          if (!nextMod) return null;
          return (
            <div style={{ marginTop: "16px" }}>
              {nextMod.locked ? (
                <a
                  href="https://calendly.com/d/dtdk-7jq-xwm/1-1"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "10px",
                    fontFamily: "var(--font-golos)",
                    fontSize: "16px",
                    fontWeight: 500,
                    padding: "13px 20px 13px 28px",
                    borderRadius: "var(--radius-md)",
                    background: "var(--color-navy-900)",
                    color: "var(--color-on-dark)",
                    textDecoration: "none",
                  }}
                >
                  🔒 Unlock Module {nextMod.id}: {nextMod.title}
                </a>
              ) : (
                <Link
                  href={`/quiz/${nextMod.id}`}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "10px",
                    fontFamily: "var(--font-golos)",
                    fontSize: "16px",
                    fontWeight: 500,
                    padding: "13px 20px 13px 28px",
                    borderRadius: "var(--radius-md)",
                    background: "var(--color-primary)",
                    color: "#fff",
                    textDecoration: "none",
                  }}
                >
                  Next: {nextMod.title}
                  <span style={{ width: "30px", height: "30px", borderRadius: "var(--radius-sm)", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>
                    →
                  </span>
                </Link>
              )}
            </div>
          );
        })()}
      </div>
    </main>
  );
}

export default function ResultsPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            padding: "96px 48px",
            textAlign: "center",
            fontFamily: "var(--font-geist)",
            color: "var(--color-slate)",
          }}
        >
          Loading results…
        </div>
      }
    >
      <ResultsContent />
    </Suspense>
  );
}
