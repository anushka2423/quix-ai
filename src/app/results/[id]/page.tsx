"use client";

import { useParams, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import Link from "next/link";
import { modules } from "@/lib/quiz-data";
import type { OptionLabel } from "@/types/quiz";
import Header from "@/components/Header";
import BookingModal from "@/components/BookingModal";

const CONFETTI_COLORS = [
  "#002862", "#0a3578", "#7cc4a0", "#d6def0", "#e6f5ed",
  "#a9bcdf", "#eef2f9", "#1f7a52",
];

function Confetti() {
  const pieces = Array.from({ length: 50 }, (_, i) => ({
    left: `${(i * 37.3 + 5) % 100}%`,
    delay: `${(i * 0.12) % 3}s`,
    duration: `${2.5 + (i % 5) * 0.4}s`,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
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

function getLevel(pct: number) {
  if (pct >= 80) {
    return {
      label: "AI-ready",
      color: "var(--correct-text)",
      bg: "var(--correct-bg)",
      headline: "You're AI-ready! Here's what to focus on next.",
    };
  }
  if (pct >= 50) {
    return {
      label: "Building momentum",
      color: "#b86e00",
      bg: "#fff3e0",
      headline: "Good progress — let's sharpen these areas.",
    };
  }
  return {
    label: "Keep practicing",
    color: "var(--incorrect-text)",
    bg: "var(--incorrect-bg)",
    headline: "Let's build your foundation.",
  };
}

function ResultsContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const moduleId = Number(params.id);
  const mod = modules.find((m) => m.id === moduleId);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "incorrect">("all");
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

  const rawAnswers = searchParams.get("a") ?? "";
  const userAnswers: (OptionLabel | "")[] = rawAnswers
    .split(",")
    .map((a) => a.trim()) as (OptionLabel | "")[];

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

  const results = mod.questions.map((q, i) => ({
    questionText: q.question,
    section: q.section,
    difficulty: q.difficulty,
    userAnswer: userAnswers[i] ?? ("" as OptionLabel | ""),
    correctAnswer: q.answer,
    isCorrect: userAnswers[i] === q.answer,
    options: q.options,
  }));

  const score = results.filter((r) => r.isCorrect).length;
  const total = results.length;
  const pct = Math.round((score / total) * 100);
  const level = getLevel(pct);

  const focusAreas = Array.from(
    new Set(results.filter((r) => !r.isCorrect).map((r) => r.section))
  );

  const circumference = 2 * Math.PI * 52;
  const dashOffset = circumference * (1 - pct / 100);

  const filtered =
    filter === "incorrect" ? results.filter((r) => !r.isCorrect) : results;

  function toggleExpanded(i: number) {
    setExpanded((prev) => ({ ...prev, [i]: !prev[i] }));
  }

  return (
    <>
      <Header />

      {pct >= 80 && <Confetti />}

      <main style={{ minHeight: "calc(100vh - 64px)", paddingBottom: "88px" }}>
        {/* ── Top section ── */}
        <section style={{ background: "#ffffff", padding: "48px 0 40px" }}>
          <div
            style={{ maxWidth: "860px", margin: "0 auto", padding: "0 48px" }}
          >
            <Link
              href="/"
              style={{
                fontSize: "14px",
                color: "var(--muted)",
                textDecoration: "none",
              }}
            >
              ← All tracks
            </Link>

            <h1
              style={{
                fontSize: "32px",
                lineHeight: "40px",
                fontWeight: 700,
                color: "var(--ink)",
                letterSpacing: "-0.03em",
                margin: "20px 0 4px",
              }}
            >
              Your results
            </h1>
            <p
              style={{
                fontSize: "14px",
                color: "var(--muted)",
                margin: "0 0 32px",
              }}
            >
              {mod.title}
            </p>

            {/* Score ring */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "16px",
              }}
            >
              <svg width="140" height="140" viewBox="0 0 140 140">
                <circle
                  cx="70"
                  cy="70"
                  r="52"
                  fill="none"
                  stroke="var(--border)"
                  strokeWidth="10"
                />
                <circle
                  cx="70"
                  cy="70"
                  r="52"
                  fill="none"
                  stroke={level.color}
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={dashOffset}
                  transform="rotate(-90 70 70)"
                  className="score-arc"
                />
                <text
                  x="50%"
                  y="46%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  style={{
                    fontSize: "26px",
                    fontWeight: 600,
                    fill: level.color,
                    fontFamily: "inherit",
                  }}
                >
                  {pct}%
                </text>
                <text
                  x="50%"
                  y="62%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  style={{
                    fontSize: "12px",
                    fill: "var(--muted)",
                    fontFamily: "inherit",
                  }}
                >
                  {score}/{total}
                </text>
              </svg>

              <span
                style={{
                  display: "inline-block",
                  padding: "5px 16px",
                  borderRadius: "var(--r-pill)",
                  background: level.bg,
                  color: level.color,
                  fontSize: "13px",
                  fontWeight: 500,
                }}
              >
                {level.label}
              </span>
            </div>
          </div>
        </section>

        {/* ── Gradient feedback card ── */}
        <section style={{ padding: "0 0 8px" }}>
          <div
            style={{ maxWidth: "860px", margin: "0 auto", padding: "0 48px" }}
          >
            <div
              style={{
                background: "var(--gradient)",
                borderRadius: "var(--r-feature)",
                padding: "40px",
                margin: "32px 0",
                boxShadow: "var(--shadow-feature)",
              }}
            >
              {/* Chip */}
              <span
                style={{
                  display: "inline-block",
                  padding: "4px 14px",
                  borderRadius: "var(--r-pill)",
                  background: "rgba(255,255,255,.15)",
                  color: "var(--on-navy)",
                  fontSize: "12px",
                  fontWeight: 500,
                }}
              >
                Your personalized feedback
              </span>

              <h2
                style={{
                  fontSize: "22px",
                  fontWeight: 600,
                  color: "#ffffff",
                  margin: "12px 0 8px",
                  letterSpacing: "-0.02em",
                }}
              >
                {level.headline}
              </h2>

              {focusAreas.length > 0 ? (
                <p
                  style={{
                    fontSize: "15px",
                    lineHeight: "24px",
                    color: "var(--on-navy-2)",
                    margin: "0 0 16px",
                  }}
                >
                  Based on your answers, we&apos;ve identified these focus areas:
                </p>
              ) : (
                <p
                  style={{
                    fontSize: "15px",
                    lineHeight: "24px",
                    color: "var(--on-navy-2)",
                    margin: "0 0 16px",
                  }}
                >
                  Excellent work — you answered every question correctly!
                </p>
              )}

              {/* Focus area chips */}
              {focusAreas.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "8px",
                    marginBottom: "24px",
                  }}
                >
                  {focusAreas.map((area) => (
                    <span
                      key={area}
                      style={{
                        display: "inline-block",
                        padding: "5px 16px",
                        borderRadius: "var(--r-pill)",
                        background: "rgba(255,255,255,.15)",
                        color: "#ffffff",
                        fontSize: "13px",
                        fontWeight: 500,
                      }}
                    >
                      {area}
                    </span>
                  ))}
                </div>
              )}

              <button
                onClick={() => setBookingOpen(true)}
                style={{
                  display: "inline-block",
                  padding: "12px 24px",
                  borderRadius: "var(--r-pill)",
                  background: "#ffffff",
                  color: "var(--navy)",
                  fontWeight: 600,
                  fontSize: "15px",
                  border: "none",
                  cursor: "pointer",
                  letterSpacing: "-0.01em",
                }}
              >
                Book my free 1-on-1
              </button>
            </div>
          </div>
        </section>

        {/* ── Question review ── */}
        <section style={{ padding: "8px 0 40px" }}>
          <div
            style={{ maxWidth: "860px", margin: "0 auto", padding: "0 48px" }}
          >
            {/* Header row */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "20px",
                flexWrap: "wrap",
                gap: "12px",
              }}
            >
              <h2
                style={{
                  fontSize: "22px",
                  fontWeight: 600,
                  color: "var(--ink)",
                  margin: 0,
                  letterSpacing: "-0.02em",
                }}
              >
                Question review
              </h2>
              <div style={{ display: "flex", gap: "8px" }}>
                {(["all", "incorrect"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    style={{
                      padding: "7px 18px",
                      borderRadius: "var(--r-pill)",
                      border: filter === f ? "none" : "1px solid var(--border)",
                      background: filter === f ? "var(--navy)" : "transparent",
                      color: filter === f ? "#ffffff" : "var(--ink)",
                      fontSize: "13px",
                      fontWeight: 500,
                      cursor: "pointer",
                      transition: "all 0.15s",
                      textTransform: "capitalize",
                    }}
                  >
                    {f === "all" ? "All" : "Incorrect"}
                  </button>
                ))}
              </div>
            </div>

            {/* Questions list */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {filtered.map((r, i) => {
                const globalIdx = results.indexOf(r);
                const isExpanded = !!expanded[globalIdx];
                const correctText =
                  r.options.find((o) => o.label === r.correctAnswer)?.text ?? "";
                const userText =
                  r.options.find((o) => o.label === r.userAnswer)?.text ??
                  "Not answered";

                return (
                  <div key={globalIdx}>
                    {/* Collapsed row */}
                    <div
                      onClick={() => toggleExpanded(globalIdx)}
                      style={{
                        background: "#ffffff",
                        border: "1px solid var(--border)",
                        borderRadius: isExpanded
                          ? `var(--r-card) var(--r-card) 0 0`
                          : "var(--r-card)",
                        padding: "18px 20px",
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        cursor: "pointer",
                        transition: "border-color 0.15s",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLDivElement).style.borderColor =
                          "var(--border-hover)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLDivElement).style.borderColor =
                          "var(--border)";
                      }}
                    >
                      {/* Status icon */}
                      <div
                        style={{
                          width: "20px",
                          height: "20px",
                          borderRadius: "50%",
                          background: r.isCorrect
                            ? "var(--correct-bg)"
                            : "var(--incorrect-bg)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          fontSize: "11px",
                          fontWeight: 700,
                          color: r.isCorrect
                            ? "var(--correct-text)"
                            : "var(--incorrect-text)",
                        }}
                      >
                        {r.isCorrect ? "✓" : "✕"}
                      </div>

                      <span
                        style={{
                          fontSize: "13px",
                          fontWeight: 600,
                          color: "var(--muted)",
                          flexShrink: 0,
                        }}
                      >
                        Q{globalIdx + 1}
                      </span>

                      <span
                        style={{
                          flex: 1,
                          fontSize: "15px",
                          color: "var(--ink)",
                          overflow: "hidden",
                          whiteSpace: "nowrap",
                          textOverflow: "ellipsis",
                          minWidth: 0,
                        }}
                      >
                        {r.questionText}
                      </span>

                      <span
                        style={{
                          fontSize: "13px",
                          color: "var(--muted)",
                          flexShrink: 0,
                        }}
                      >
                        {isExpanded ? "Hide ↑" : "Show →"}
                      </span>
                    </div>

                    {/* Expanded content */}
                    {isExpanded && (
                      <div
                        className="card-enter"
                        style={{
                          background: "var(--canvas)",
                          border: "1px solid var(--border)",
                          borderTop: "none",
                          borderRadius: `0 0 var(--r-card) var(--r-card)`,
                          padding: "20px",
                          display: "flex",
                          flexDirection: "column",
                          gap: "10px",
                        }}
                      >
                        {!r.isCorrect && (
                          <div
                            style={{
                              display: "flex",
                              gap: "8px",
                              alignItems: "flex-start",
                              flexWrap: "wrap",
                            }}
                          >
                            <span
                              style={{
                                fontSize: "12px",
                                fontWeight: 600,
                                color: "var(--incorrect-text)",
                                padding: "3px 10px",
                                background: "var(--incorrect-bg)",
                                borderRadius: "var(--r-pill)",
                                whiteSpace: "nowrap",
                              }}
                            >
                              Your answer
                            </span>
                            <span
                              style={{
                                fontSize: "14px",
                                color: "var(--incorrect-text)",
                              }}
                            >
                              {r.userAnswer ? `${r.userAnswer}) ${userText}` : "Not answered"}
                            </span>
                          </div>
                        )}

                        <div
                          style={{
                            display: "flex",
                            gap: "8px",
                            alignItems: "flex-start",
                            flexWrap: "wrap",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "12px",
                              fontWeight: 600,
                              color: "var(--correct-text)",
                              padding: "3px 10px",
                              background: "var(--correct-bg)",
                              borderRadius: "var(--r-pill)",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {r.isCorrect ? "Your answer" : "Correct answer"}
                          </span>
                          <span
                            style={{
                              fontSize: "14px",
                              color: "var(--correct-text)",
                            }}
                          >
                            {r.correctAnswer}) {correctText}
                          </span>
                        </div>

                        {/* Difficulty badge */}
                        <div>
                          <span
                            style={{
                              display: "inline-block",
                              fontSize: "11px",
                              fontWeight: 600,
                              padding: "3px 10px",
                              borderRadius: "var(--r-pill)",
                              background: "var(--wash)",
                              color: "var(--muted)",
                              letterSpacing: "0.02em",
                            }}
                          >
                            {r.difficulty}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Next module CTA */}
            {(() => {
              const nextMod = modules.find((m) => m.id === moduleId + 1);
              if (!nextMod) return null;
              return (
                <div style={{ marginTop: "32px" }}>
                  {nextMod.locked ? (
                    <button
                      onClick={() => setBookingOpen(true)}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "13px 24px",
                        borderRadius: "var(--r-card)",
                        border: "none",
                        background: "var(--navy)",
                        color: "#ffffff",
                        fontSize: "15px",
                        fontWeight: 600,
                        cursor: "pointer",
                        letterSpacing: "-0.01em",
                      }}
                    >
                      🔒 Unlock Module {nextMod.id}: {nextMod.title}
                    </button>
                  ) : (
                    <Link
                      href={`/quiz/${nextMod.id}`}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "13px 24px",
                        borderRadius: "var(--r-card)",
                        background: "var(--navy)",
                        color: "#ffffff",
                        fontSize: "15px",
                        fontWeight: 600,
                        textDecoration: "none",
                        letterSpacing: "-0.01em",
                      }}
                    >
                      Next: {nextMod.title} →
                    </Link>
                  )}
                </div>
              );
            })()}
          </div>
        </section>
      </main>

      {/* ── Sticky bar ── */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          background: "#ffffff",
          borderTop: "1px solid var(--border)",
          zIndex: 100,
          padding: "16px 24px",
        }}
      >
        <div
          style={{
            maxWidth: "860px",
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
          }}
        >
          <span style={{ fontSize: "14px", fontWeight: 500, color: "var(--ink-2)" }}>
            {focusAreas.length} focus area{focusAreas.length !== 1 ? "s" : ""}{" "}
            identified
          </span>
          <button
            onClick={() => setBookingOpen(true)}
            style={{
              padding: "11px 24px",
              borderRadius: "var(--r-pill)",
              border: "none",
              background: "var(--navy)",
              color: "#ffffff",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              whiteSpace: "nowrap",
              letterSpacing: "-0.01em",
            }}
          >
            Book my free 1-on-1 →
          </button>
        </div>
      </div>

      <BookingModal
        open={bookingOpen}
        onClose={() => setBookingOpen(false)}
      />
    </>
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
            color: "var(--muted)",
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
