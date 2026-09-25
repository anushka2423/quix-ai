"use client";

import { useParams, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import Link from "next/link";
import { modules } from "@/lib/quiz-data";
import type { OptionLabel } from "@/types/quiz";
import Header from "@/components/Header";

const CALENDLY_URL = "https://calendly.com/d/dtdk-7jq-xwm/1-1";

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
      headline: "You've nailed it. Now go deeper.",
      body: "You answered every question correctly. You have a strong command of this material.",
    };
  }
  if (pct >= 50) {
    return {
      label: "Building momentum",
      color: "#b86e00",
      bg: "#fff3e0",
      headline: "Good progress. Let's sharpen these areas.",
      body: "You're building strong foundations. A few areas are worth revisiting to sharpen your edge.",
    };
  }
  return {
    label: "Keep practicing",
    color: "var(--incorrect-text)",
    bg: "var(--incorrect-bg)",
    headline: "There is a clear path from here.",
    body: "Several core concepts in this track are worth revisiting. We can walk through each focus area below and map out what to practice first.",
  };
}

function ResultsContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const moduleId = Number(params.id);
  const mod = modules.find((m) => m.id === moduleId);
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

        {/* ── Full-width gradient hero banner ── */}
        <section style={{ background: "var(--gradient)", padding: "32px 0 48px" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 48px" }}>

            {/* Back link */}
            <Link
              href="/"
              style={{ fontSize: "14px", color: "var(--on-navy-2)", textDecoration: "none" }}
            >
              ← All tracks
            </Link>

            {/* Two-column layout */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "280px 1fr",
                gap: "32px",
                marginTop: "24px",
                alignItems: "start",
              }}
            >
              {/* LEFT: Score card */}
              <div
                style={{
                  background: "#ffffff",
                  borderRadius: "var(--r-feature)",
                  padding: "32px 24px",
                  textAlign: "center",
                  boxShadow: "0 4px 24px rgba(0,0,0,.12)",
                }}
              >
                <p
                  style={{
                    fontSize: "10px",
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "var(--muted)",
                    margin: "0 0 20px",
                  }}
                >
                  {mod.title}
                </p>

                {/* Score ring */}
                <svg width="140" height="140" viewBox="0 0 140 140" style={{ display: "block", margin: "0 auto" }}>
                  <circle cx="70" cy="70" r="52" fill="none" stroke="var(--border)" strokeWidth="10" />
                  <circle
                    cx="70" cy="70" r="52" fill="none"
                    stroke={level.color} strokeWidth="10" strokeLinecap="round"
                    strokeDasharray={circumference} strokeDashoffset={dashOffset}
                    transform="rotate(-90 70 70)" className="score-arc"
                  />
                  <text x="50%" y="45%" textAnchor="middle" dominantBaseline="middle"
                    style={{ fontSize: "28px", fontWeight: 700, fill: level.color, fontFamily: "inherit" }}>
                    {pct}%
                  </text>
                </svg>

                <span
                  style={{
                    display: "inline-block",
                    marginTop: "16px",
                    padding: "5px 18px",
                    borderRadius: "var(--r-pill)",
                    background: level.bg,
                    color: level.color,
                    fontSize: "13px",
                    fontWeight: 600,
                  }}
                >
                  {level.label}
                </span>

                <p style={{ fontSize: "14px", color: "var(--muted)", margin: "10px 0 0" }}>
                  {score} of {total} correct
                </p>
              </div>

              {/* RIGHT: Feedback content */}
              <div style={{ paddingTop: "4px" }}>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "6px 16px",
                    borderRadius: "var(--r-pill)",
                    background: "rgba(255,255,255,.18)",
                    border: "1px solid rgba(255,255,255,.3)",
                    color: "#ffffff",
                    fontSize: "12px",
                    fontWeight: 600,
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                    marginBottom: "16px",
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <circle cx="6" cy="6" r="5" stroke="white" strokeWidth="1.2" />
                    <path d="M6 3.5v3l2 1.2" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Get your 1-on-1 feedback &amp; learning plan
                </span>

                <h1
                  style={{
                    fontSize: "clamp(28px, 3.5vw, 40px)",
                    fontWeight: 700,
                    color: "#ffffff",
                    letterSpacing: "-0.03em",
                    lineHeight: 1.15,
                    margin: "0 0 16px",
                  }}
                >
                  {level.headline}
                </h1>

                <p
                  style={{
                    fontSize: "16px",
                    lineHeight: "26px",
                    color: "var(--on-navy-2)",
                    margin: "0 0 28px",
                    maxWidth: "520px",
                  }}
                >
                  {level.body}
                </p>

                {focusAreas.length > 0 && (
                  <>
                    <p
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        color: "var(--on-navy-2)",
                        margin: "0 0 12px",
                      }}
                    >
                      Focus Areas
                    </p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "32px" }}>
                      {focusAreas.map((area) => (
                        <span
                          key={area}
                          style={{
                            padding: "6px 16px",
                            borderRadius: "var(--r-pill)",
                            background: "rgba(255,255,255,.15)",
                            color: "#ffffff",
                            fontSize: "13px",
                            fontWeight: 500,
                            border: "1px solid rgba(255,255,255,.2)",
                          }}
                        >
                          {area}
                        </span>
                      ))}
                    </div>
                  </>
                )}

                <a
                  href={CALENDLY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "14px 32px",
                    borderRadius: "var(--r-pill)",
                    background: "#ffffff",
                    color: "var(--navy)",
                    fontWeight: 700,
                    fontSize: "16px",
                    textDecoration: "none",
                    letterSpacing: "-0.01em",
                    boxShadow: "0 4px 16px rgba(0,0,0,.15)",
                  }}
                >
                  Book my free 1-on-1
                </a>
              </div>
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
                {(["all", "incorrect"] as const).map((f) => {
                  const count = f === "all" ? results.length : results.filter((r) => !r.isCorrect).length;
                  return (
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
                      }}
                    >
                      {f === "all" ? `All ${count}` : `Incorrect ${count}`}
                    </button>
                  );
                })}
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
                      {/* Question number */}
                      <span
                        style={{
                          fontSize: "13px",
                          fontWeight: 700,
                          color: "var(--muted)",
                          flexShrink: 0,
                          minWidth: "24px",
                        }}
                      >
                        {String(globalIdx + 1).padStart(2, "0")}
                      </span>

                      {/* Question text */}
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

                      {/* Status badge */}
                      {!r.isCorrect && (
                        <span
                          style={{
                            fontSize: "12px",
                            fontWeight: 600,
                            color: "var(--incorrect-text)",
                            background: "var(--incorrect-bg)",
                            padding: "3px 12px",
                            borderRadius: "var(--r-pill)",
                            whiteSpace: "nowrap",
                            flexShrink: 0,
                          }}
                        >
                          Incorrect
                        </span>
                      )}

                      {/* Chevron */}
                      <span
                        style={{
                          fontSize: "16px",
                          color: "var(--faint)",
                          flexShrink: 0,
                          transition: "transform 0.15s",
                          transform: isExpanded ? "rotate(90deg)" : "none",
                        }}
                      >
                        ›
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
                    <a
                      href={CALENDLY_URL}
                      target="_blank"
                      rel="noopener noreferrer"
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
                      🔒 Unlock Module {nextMod.id}: {nextMod.title}
                    </a>
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
          <a
            href={CALENDLY_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-block",
              padding: "11px 24px",
              borderRadius: "var(--r-pill)",
              background: "var(--navy)",
              color: "#ffffff",
              fontSize: "14px",
              fontWeight: 600,
              textDecoration: "none",
              whiteSpace: "nowrap",
              letterSpacing: "-0.01em",
            }}
          >
            Book my free 1-on-1 →
          </a>
        </div>
      </div>

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
