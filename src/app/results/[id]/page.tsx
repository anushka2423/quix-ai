"use client";

import { useParams, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import Link from "next/link";
import { domainData } from "@/lib/domain-data";
import type { QuizModule } from "@/types/quiz";
import { saveLead } from "@/lib/supabase";
import { useQuizModules } from "@/lib/use-quiz-modules";
import { formatAnswer, isCorrectAnswer, parseAnswer } from "@/lib/answers";
import { getStoredEmail } from "@/components/EmailGate";
import Header from "@/components/Header";

const EMAIL_KEY = "quix_user_email";
const COHORT_URL = "https://maven.com/mahesh-yadav/genaipm";

// ── Score preview + email gate + learning plan ────────────────────────────
function ResultsContent() {
  const params = useParams();
  const moduleId = Number(params.id);
  const { modules, error } = useQuizModules();
  const mod = modules?.find((m) => m.id === moduleId);

  if (!modules && !error) {
    return (
      <div style={{ padding: "96px 48px", textAlign: "center", color: "var(--muted)" }}>
        Loading results…
      </div>
    );
  }

  if (!modules || !mod) {
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

  return <ResultsView mod={mod} modules={modules} />;
}

function ResultsView({ mod, modules }: { mod: QuizModule; modules: QuizModule[] }) {
  const searchParams = useSearchParams();

  const [showLearningPlan, setShowLearningPlan] = useState(false);
  const [email, setEmail] = useState(getStoredEmail() ?? "");
  const [optIn, setOptIn] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);

  // One segment per question: "B", "AC" for multi-answer, "?" for not sure, "" for skipped
  const rawAnswers = searchParams.get("a") ?? "";
  const userAnswers = rawAnswers.split(",").map((a) => a.trim());

  // Which questions were asked: the random draw's ids ("q"), or the module's own
  // questions for result links created before quizzes were randomised
  const byId = new Map(modules.flatMap((m) => m.questions).map((q) => [q.id, q]));
  const askedIds = (searchParams.get("q") ?? "").split(",").filter(Boolean).map(Number);
  const asked = askedIds.length
    ? askedIds.flatMap((id, i) => {
        const q = byId.get(id);
        return q ? [{ q, answer: userAnswers[i] }] : [];
      })
    : mod.questions.map((q, i) => ({ q, answer: userAnswers[i] }));

  // ── Score calculation ──────────────────────────────────────────────────
  const results = asked.map(({ q, answer }) => ({
    id: q.id,
    questionText: q.question,
    section: q.section,
    difficulty: q.difficulty,
    userAnswer: answer === "?" ? "?" : formatAnswer([answer ?? ""]),
    correctAnswer: formatAnswer([q.answer]),
    isCorrect: answer !== "?" && isCorrectAnswer(answer ?? "", q.answer),
    options: q.options,
  }));

  const score = results.filter((r) => r.isCorrect).length;
  const total = results.length;
  const scaledScore = Math.round((score / total) * 100);

  // ── Domain scores ──────────────────────────────────────────────────────
  const domainMap = new Map<string, { correct: number; total: number }>();
  results.forEach((r) => {
    const existing = domainMap.get(r.section) ?? { correct: 0, total: 0 };
    domainMap.set(r.section, {
      correct: existing.correct + (r.isCorrect ? 1 : 0),
      total: existing.total + 1,
    });
  });

  const domains = Array.from(domainMap.entries()).map(([name, { correct, total: dt }]) => ({
    name,
    correct,
    total: dt,
    pct: correct / dt,
    info: domainData[name] ?? {
      exercise: "Review the questions in this area and identify patterns in what you missed.",
      relatedTopics: ["Review course materials for this topic"],
    },
  }));

  // Sort weakest first (ascending pct)
  const sortedDomains = [...domains].sort((a, b) => a.pct - b.pct);
  const weakest = sortedDomains[0];
  const allPerfect = score === total;
  const missed = results.filter((r) => !r.isCorrect);

  // ── Email submit ───────────────────────────────────────────────────────
  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setEmailError("Please enter a valid email address.");
      return;
    }
    setEmailLoading(true);
    setEmailError("");
    try {
      await saveLead(trimmed);
      localStorage.setItem(EMAIL_KEY, trimmed);
    } catch {}
    setEmailLoading(false);
    window.location.href = "https://calendly.com/d/d3rr-rn8-yrx/1-1-consult";
  }

  // ── Score preview page ─────────────────────────────────────────────────
  if (!showLearningPlan) {
    const btnOutline: React.CSSProperties = {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "14px 18px",
      border: "1px solid #dce3ed",
      borderRadius: "9px",
      background: "white",
      color: "#10213b",
      fontWeight: 700,
      fontSize: "15px",
      cursor: "pointer",
      fontFamily: "inherit",
      textDecoration: "none",
      minHeight: "52px",
      lineHeight: 1.3,
    };
    const btnDark: React.CSSProperties = {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
      padding: "16px 18px",
      border: "none",
      borderRadius: "9px",
      background: "#071b39",
      color: "white",
      fontWeight: 700,
      fontSize: "15px",
      cursor: "pointer",
      fontFamily: "inherit",
      textDecoration: "none",
      minHeight: "52px",
      marginTop: "12px",
      lineHeight: 1.3,
    };

    return (
      <>
        <Header moduleTitle={mod.title} />
        <main style={{ minHeight: "calc(100vh - 88px)", background: "#ffffff" }}>
          <div style={{ maxWidth: "660px", margin: "0 auto", padding: "28px 28px 80px" }}>

            {/* Dialog-style header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", marginBottom: "18px" }}>
              <span style={{
                fontSize: "13px",
                fontWeight: 800,
                letterSpacing: ".8px",
                color: "#214f91",
                textTransform: "uppercase",
                fontFamily: "var(--font-manrope), sans-serif",
              }}>
                CLAUDE CERTIFICATION preparation
              </span>
              <Link href="/" style={{
                display: "grid",
                placeContent: "center",
                width: "44px",
                height: "44px",
                borderRadius: "50%",
                background: "#f1f5fa",
                color: "#10213b",
                fontSize: "22px",
                textDecoration: "none",
                flexShrink: 0,
              }}>×</Link>
            </div>

            {/* Note box */}
            <div style={{
              background: "#fff4db",
              color: "#65501f",
              padding: "10px 13px",
              borderRadius: "6px",
              fontSize: "14px",
              lineHeight: 1.6,
              marginBottom: "22px",
            }}>
              Practice questions prepared for Claude certification. The email report is a
              preview of your revision plan.
            </div>

            {/* Heading */}
            <h1 style={{
              fontFamily: "var(--font-manrope), sans-serif",
              fontSize: "25px",
              fontWeight: 800,
              letterSpacing: "-0.025em",
              color: "#10213b",
              margin: "22px 0",
              lineHeight: 1.4,
            }}>
              Your practice score
            </h1>

            {/* Big score % */}
            <div style={{
              fontSize: "62px",
              fontWeight: 800,
              lineHeight: 1.3,
              letterSpacing: "-2px",
              color: "#10213b",
              fontFamily: "var(--font-manrope), sans-serif",
              marginBottom: "16px",
            }}>
              {scaledScore}
              <small style={{ fontSize: "20px", letterSpacing: 0, color: "var(--muted)", fontWeight: 500 }}>
                %
              </small>
            </div>

            {/* Description */}
            <p style={{ fontSize: "16px", color: "#10213b", margin: "0 0 24px", lineHeight: 1.6 }}>
              {score} of {total} correct in this session. This is practice accuracy, not
              an official scaled exam score or pass prediction.
            </p>

            {/* Action buttons */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <Link href={`/quiz/${mod.id}`} style={btnOutline}>
                Repeat this session
              </Link>
              {missed.length > 0 ? (
                <Link href={`/quiz/${mod.id}`} style={btnOutline}>
                  Retry missed questions
                </Link>
              ) : (
                <button disabled style={{ ...btnOutline, opacity: 0.45, cursor: "not-allowed" }}>
                  Retry missed questions
                </button>
              )}
            </div>
            <Link href="/" style={btnDark}>
              Choose any domain
            </Link>

            {/* Email / revision report */}
            <h2 style={{
              fontFamily: "var(--font-manrope), sans-serif",
              fontSize: "20px",
              fontWeight: 800,
              letterSpacing: "-0.025em",
              color: "#10213b",
              margin: "24px 0 8px",
            }}>
              Get your personalized revision report
            </h2>
            <p style={{ fontSize: "15px", color: "var(--muted)", margin: "0 0 18px", lineHeight: 1.6 }}>
              Domains, retakes and answer explanations remain freely accessible.
            </p>

            <form onSubmit={handleEmailSubmit}>
              <label
                htmlFor="result-email"
                style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#10213b", marginBottom: "8px" }}
              >
                Email address
              </label>
              <input
                id="result-email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setEmailError(""); }}
                required
                style={{
                  width: "100%",
                  border: emailError ? "1px solid var(--incorrect-text)" : "1px solid #99abc2",
                  borderRadius: "7px",
                  padding: "13px",
                  fontSize: "16px",
                  color: "#10213b",
                  outline: "none",
                  boxSizing: "border-box",
                  background: "#fff",
                  fontFamily: "inherit",
                  transition: "border-color 0.15s",
                }}
                onFocus={(e) => { if (!emailError) (e.target as HTMLInputElement).style.borderColor = "#214f91"; }}
                onBlur={(e) => { if (!emailError) (e.target as HTMLInputElement).style.borderColor = "#99abc2"; }}
              />
              {emailError && (
                <p style={{ fontSize: "13px", color: "var(--incorrect-text)", margin: "6px 0 0" }}>
                  {emailError}
                </p>
              )}

              <label style={{ display: "flex", alignItems: "flex-start", gap: "9px", fontSize: "14px", color: "var(--muted)", marginTop: "14px", cursor: "pointer", lineHeight: 1.55 }}>
                <input
                  type="checkbox"
                  checked={optIn}
                  onChange={(e) => setOptIn(e.target.checked)}
                  style={{ width: "18px", height: "18px", flexShrink: 0, marginTop: "2px" }}
                />
                Send me optional learning tips and Mahesh&apos;s cohort updates.
              </label>

              <button
                type="submit"
                disabled={emailLoading}
                style={{
                  marginTop: "16px",
                  width: "100%",
                  padding: "16px",
                  borderRadius: "9px",
                  border: "none",
                  background: "#071b39",
                  color: "white",
                  fontSize: "16px",
                  fontWeight: 700,
                  cursor: emailLoading ? "not-allowed" : "pointer",
                  opacity: emailLoading ? 0.7 : 1,
                  fontFamily: "inherit",
                  minHeight: "54px",
                  transition: "background 0.15s",
                }}
              >
                {emailLoading ? "Saving…" : "View my revision report"}
              </button>

              <p style={{ fontSize: "14px", color: "var(--muted)", textAlign: "center", marginTop: "12px" }}>
                Preview only. This form does not collect or send your email.
              </p>
            </form>
          </div>
        </main>
      </>
    );
  }

  // ── Learning plan page ─────────────────────────────────────────────────
  return (
    <>
      <Header />
      <main style={{ minHeight: "calc(100vh - 64px)", paddingBottom: "80px" }}>
        {/* Hero band */}
        <section style={{ background: "var(--gradient)", padding: "40px 0 56px" }}>
          <div style={{ maxWidth: "760px", margin: "0 auto", padding: "0 32px" }}>
            <Link
              href="/"
              style={{ fontSize: "14px", color: "var(--on-navy-2)", textDecoration: "none" }}
            >
              ← All tracks
            </Link>

            <h1
              style={{
                fontFamily: "var(--font-manrope), sans-serif",
                fontSize: "clamp(26px, 3.5vw, 40px)",
                fontWeight: 700,
                color: "#ffffff",
                letterSpacing: "-0.03em",
                lineHeight: 1.15,
                margin: "24px 0 12px",
              }}
            >
              Your AI PM learning plan
            </h1>

            <p style={{ fontSize: "16px", color: "var(--on-navy-2)", margin: "0 0 28px", lineHeight: 1.6 }}>
              {allPerfect
                ? "You answered every scenario correctly. Deepen your skills with hands-on builds and more demanding evaluations."
                : `Start with ${weakest.name.toLowerCase()}. It was one of your lowest-scoring areas.`}
            </p>

            {/* Score summary strip */}
            <div
              style={{
                display: "flex",
                gap: "24px",
                alignItems: "center",
                background: "rgba(255,255,255,.1)",
                borderRadius: "10px",
                padding: "14px 20px",
                flexWrap: "wrap",
              }}
            >
              <span style={{ color: "#ffffff", fontSize: "15px", fontWeight: 600 }}>
                {scaledScore} / 100
              </span>
              <span style={{ color: "var(--on-navy-2)", fontSize: "14px" }}>
                {score} correct of {total}
              </span>
              <span style={{ color: "var(--on-navy-2)", fontSize: "14px" }}>
                {mod.title}
              </span>
            </div>
          </div>
        </section>

        {/* Domain cards */}
        <section style={{ padding: "40px 0" }}>
          <div style={{ maxWidth: "760px", margin: "0 auto", padding: "0 32px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {sortedDomains.map((d, i) => {
                const isPerfect = d.correct === d.total;
                return (
                  <div
                    key={d.name}
                    className="card-enter"
                    style={{
                      background: "#ffffff",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--r-feature)",
                      padding: "28px 32px",
                      boxShadow: "var(--shadow-card)",
                      animationDelay: `${i * 0.07}s`,
                    }}
                  >
                    {/* Domain header */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "12px",
                        flexWrap: "wrap",
                        marginBottom: "16px",
                      }}
                    >
                      <div>
                        <h2
                          style={{
                            fontSize: "17px",
                            fontWeight: 700,
                            color: "var(--ink)",
                            margin: "0 0 4px",
                            letterSpacing: "-0.02em",
                            fontFamily: "var(--font-manrope), sans-serif",
                          }}
                        >
                          {d.name}
                        </h2>
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: 700,
                            letterSpacing: "0.08em",
                            textTransform: "uppercase",
                            color: isPerfect ? "var(--correct-text)" : "var(--accent)",
                          }}
                        >
                          {isPerfect ? "EXTEND YOUR PRACTICE" : "PRACTICE NEXT"}
                        </span>
                      </div>

                      {/* Score pill */}
                      <span
                        style={{
                          padding: "6px 16px",
                          borderRadius: "var(--r-pill)",
                          background: isPerfect ? "var(--correct-bg)" : "#fff3e8",
                          color: isPerfect ? "var(--correct-text)" : "var(--accent)",
                          fontSize: "15px",
                          fontWeight: 700,
                          whiteSpace: "nowrap",
                          fontFamily: "var(--font-manrope), sans-serif",
                        }}
                      >
                        {d.correct}/{d.total}
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div
                      style={{
                        height: "6px",
                        background: "#eaf0f7",
                        borderRadius: "3px",
                        overflow: "hidden",
                        marginBottom: "20px",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${d.pct * 100}%`,
                          background: isPerfect ? "var(--correct-text)" : "var(--accent)",
                          borderRadius: "3px",
                          transition: "width 0.6s ease",
                        }}
                      />
                    </div>

                    {/* Exercise */}
                    <div style={{ marginBottom: "20px" }}>
                      <p
                        style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          color: "var(--muted)",
                          margin: "0 0 8px",
                        }}
                      >
                        Learning exercise
                      </p>
                      <p
                        style={{
                          fontSize: "14px",
                          lineHeight: 1.65,
                          color: "var(--ink-2)",
                          margin: 0,
                        }}
                      >
                        {d.info.exercise}
                      </p>
                    </div>

                    {/* Related topics */}
                    <div>
                      <p
                        style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          color: "var(--muted)",
                          margin: "0 0 10px",
                        }}
                      >
                        Related cohort topics
                      </p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                        {d.info.relatedTopics.map((topic) => (
                          <span
                            key={topic}
                            style={{
                              padding: "5px 14px",
                              borderRadius: "var(--r-pill)",
                              background: "var(--canvas)",
                              border: "1px solid var(--border)",
                              color: "var(--ink-2)",
                              fontSize: "13px",
                              fontWeight: 500,
                            }}
                          >
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Cohort CTA */}
            <div
              style={{
                marginTop: "40px",
                padding: "36px 32px",
                background: "var(--gradient)",
                borderRadius: "var(--r-feature)",
                textAlign: "center",
              }}
            >
              <h2
                style={{
                  fontSize: "22px",
                  fontWeight: 700,
                  color: "#ffffff",
                  margin: "0 0 10px",
                  letterSpacing: "-0.02em",
                  fontFamily: "var(--font-manrope), sans-serif",
                }}
              >
                Want guided, hands-on practice?
              </h2>
              <p
                style={{
                  fontSize: "15px",
                  color: "var(--on-navy-2)",
                  margin: "0 0 28px",
                  lineHeight: 1.6,
                  maxWidth: "440px",
                  marginLeft: "auto",
                  marginRight: "auto",
                }}
              >
                Explore how Mahesh&apos;s cohort covers these areas, including Claude
                certification preparation.
              </p>
              <a
                href={COHORT_URL}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "16px 32px",
                  borderRadius: "9px",
                  background: "var(--accent)",
                  color: "var(--navy)",
                  fontWeight: 700,
                  fontSize: "15px",
                  textDecoration: "none",
                  letterSpacing: "-0.01em",
                  transition: "background 0.15s",
                  minHeight: "52px",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.background = "var(--accent-hover)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.background = "var(--accent)";
                }}
              >
                Explore the cohort on Maven →
              </a>
            </div>

            {/* Question review */}
            <div style={{ marginTop: "48px" }}>
              <h2
                style={{
                  fontSize: "20px",
                  fontWeight: 600,
                  color: "var(--ink)",
                  margin: "0 0 20px",
                  letterSpacing: "-0.02em",
                }}
              >
                Question review
              </h2>
              <QuestionReview results={results} />
            </div>

            {/* Next module CTA */}
            {(() => {
              const nextMod = modules[modules.findIndex((m) => m.id === mod.id) + 1];
              if (!nextMod) return null;
              return (
                <div style={{ marginTop: "32px" }}>
                  {nextMod.locked ? (
                    <a
                      href={COHORT_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "14px 24px",
                        borderRadius: "9px",
                        background: "var(--accent)",
                        color: "var(--navy)",
                        fontSize: "15px",
                        fontWeight: 700,
                        textDecoration: "none",
                        letterSpacing: "-0.01em",
                        minHeight: "52px",
                        transition: "background 0.15s",
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
                        padding: "14px 24px",
                        borderRadius: "9px",
                        background: "var(--accent)",
                        color: "var(--navy)",
                        fontSize: "15px",
                        fontWeight: 700,
                        textDecoration: "none",
                        letterSpacing: "-0.01em",
                        minHeight: "52px",
                        transition: "background 0.15s",
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
    </>
  );
}

// ── Question review accordion ─────────────────────────────────────────────
function QuestionReview({
  results,
}: {
  results: Array<{
    id: number;
    questionText: string;
    section: string;
    difficulty: string;
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    options: Array<{ label: string; text: string }>;
  }>;
}) {
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

  function toggle(i: number) {
    setExpanded((prev) => ({ ...prev, [i]: !prev[i] }));
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {results.map((r, i) => {
        const isExpanded = !!expanded[i];
        const describe = (answer: string) =>
          parseAnswer(answer).map(
            (l) => `${l}) ${r.options.find((o) => o.label === l)?.text ?? ""}`
          );
        const correctLines = describe(r.correctAnswer);
        const userLines =
          r.userAnswer === "?"
            ? ["I'm not sure"]
            : r.userAnswer
            ? describe(r.userAnswer)
            : ["Not answered"];

        return (
          <div key={i}>
            <div
              onClick={() => toggle(i)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && toggle(i)}
              aria-expanded={isExpanded}
              style={{
                background: "#ffffff",
                border: "1px solid var(--border)",
                borderRadius: isExpanded ? "var(--r-card) var(--r-card) 0 0" : "var(--r-card)",
                padding: "16px 20px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                cursor: "pointer",
                transition: "border-color 0.15s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border-hover)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)";
              }}
            >
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "var(--muted)",
                  flexShrink: 0,
                  minWidth: "24px",
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span
                style={{
                  flex: 1,
                  fontSize: "14px",
                  color: "var(--ink)",
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis",
                  minWidth: 0,
                }}
              >
                {r.questionText}
              </span>
              {!r.isCorrect && (
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "var(--incorrect-text)",
                    background: "var(--incorrect-bg)",
                    padding: "3px 10px",
                    borderRadius: "var(--r-pill)",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                  }}
                >
                  Incorrect
                </span>
              )}
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

            {isExpanded && (
              <div
                className="card-enter"
                style={{
                  background: "var(--canvas)",
                  border: "1px solid var(--border)",
                  borderTop: "none",
                  borderRadius: "0 0 var(--r-card) var(--r-card)",
                  padding: "18px 20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                {!r.isCorrect && (
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    <span
                      style={{
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "var(--incorrect-text)",
                        padding: "3px 10px",
                        background: "var(--incorrect-bg)",
                        borderRadius: "var(--r-pill)",
                      }}
                    >
                      Your answer
                    </span>
                    <span style={{ fontSize: "14px", color: "var(--incorrect-text)" }}>
                      {userLines.map((line) => (
                        <span key={line} style={{ display: "block" }}>{line}</span>
                      ))}
                    </span>
                  </div>
                )}
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "var(--correct-text)",
                      padding: "3px 10px",
                      background: "var(--correct-bg)",
                      borderRadius: "var(--r-pill)",
                    }}
                  >
                    {r.isCorrect ? "Your answer" : "Correct answer"}
                    {correctLines.length > 1 ? "s" : ""}
                  </span>
                  <span style={{ fontSize: "14px", color: "var(--correct-text)" }}>
                    {correctLines.map((line) => (
                      <span key={line} style={{ display: "block" }}>{line}</span>
                    ))}
                  </span>
                </div>
                <span
                  style={{
                    display: "inline-block",
                    fontSize: "11px",
                    fontWeight: 600,
                    padding: "3px 10px",
                    borderRadius: "var(--r-pill)",
                    background: "var(--wash)",
                    color: "var(--muted)",
                  }}
                >
                  {r.difficulty}
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense
      fallback={
        <div style={{ padding: "96px 48px", textAlign: "center", color: "var(--muted)" }}>
          Loading results…
        </div>
      }
    >
      <ResultsContent />
    </Suspense>
  );
}
