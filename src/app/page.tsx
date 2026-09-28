"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { modules } from "@/lib/quiz-data";
import Header from "@/components/Header";

const CALENDLY_URL = "https://calendly.com/d/dtdk-7jq-xwm/1-1";

type Scores = Record<string, { score: number; total: number; pct: number }>;

function quizMeta(questionCount: number) {
  return `${questionCount} questions · ~${Math.round(questionCount * 1.5)} min`;
}

export default function Home() {
  const [scores, setScores] = useState<Scores>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem("aipm_scores");
      if (raw) setScores(JSON.parse(raw));
    } catch {}
  }, []);

  const unlocked = modules.filter((m) => !m.locked);
  const locked = modules.filter((m) => m.locked);
  const completed = Object.keys(scores).length;

  return (
    <>
      <Header />

      <main style={{ minHeight: "100vh" }}>
        {/* ── Hero ── */}
        <section
          style={{
            background: "var(--gradient)",
            padding: "88px 0 80px",
          }}
        >
          <div
            style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 48px" }}
          >
            {/* Chip */}
            <div
              style={{
                display: "inline-block",
                padding: "5px 14px",
                border: "1px solid rgba(255,255,255,.2)",
                borderRadius: "var(--r-pill)",
                fontSize: "12px",
                color: "var(--on-navy)",
                marginBottom: "20px",
                letterSpacing: "0.01em",
              }}
            >
              Claude Certification · Module Assessment
            </div>

            <h1
              style={{
                fontSize: "clamp(32px, 4vw, 42px)",
                fontWeight: 600,
                lineHeight: 1.15,
                letterSpacing: "-0.03em",
                color: "#ffffff",
                maxWidth: "640px",
                margin: 0,
              }}
            >
              Are you an AI-ready Product Manager?
            </h1>

            <p
              style={{
                fontSize: "16px",
                lineHeight: "26px",
                color: "var(--on-navy-2)",
                maxWidth: "520px",
                marginTop: "16px",
                marginBottom: 0,
              }}
            >
              Test your knowledge across agentic AI, product roadmapping,
              evaluation, and observability. Get a personalized skills breakdown
              in under 15 minutes.
            </p>

            {/* CTA row */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "12px",
                marginTop: "32px",
              }}
            >
              <Link
                href="/quiz/1"
                style={{
                  display: "inline-block",
                  padding: "11px 24px",
                  borderRadius: "var(--r-pill)",
                  background: "#ffffff",
                  color: "var(--navy)",
                  fontWeight: 600,
                  fontSize: "15px",
                  textDecoration: "none",
                  letterSpacing: "-0.01em",
                }}
              >
                Start assessment →
              </Link>
              <span
                style={{
                  fontSize: "14px",
                  color: "var(--on-navy-2)",
                }}
              >
                {completed} of {unlocked.length} modules completed
              </span>
            </div>
          </div>
        </section>

        {/* ── Tracks section ── */}
        <section
          style={{
            background: "#ffffff",
            padding: "64px 0 48px",
          }}
        >
          <div
            style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 48px" }}
          >
            <p
              style={{
                fontSize: "12px",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "var(--muted)",
                margin: "0 0 8px",
              }}
            >
              Certification modules
            </p>
            <h2
              style={{
                fontSize: "24px",
                fontWeight: 600,
                color: "var(--ink)",
                letterSpacing: "-0.02em",
                margin: "0 0 32px",
              }}
            >
              Choose your module
            </h2>

            {/* Unlocked cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {unlocked.map((mod) => {
                const s = scores[String(mod.id)];
                return (
                  <Link
                    key={mod.id}
                    href={`/quiz/${mod.id}`}
                    style={{ textDecoration: "none" }}
                  >
                    <div
                      className="module-card"
                      style={{
                        background: "#ffffff",
                        border: "1px solid var(--border)",
                        borderRadius: "var(--r-card)",
                        padding: "28px",
                        boxShadow: "var(--shadow-card)",
                        cursor: "pointer",
                      }}
                    >
                      {/* Top row */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        <span
                          style={{
                            display: "inline-block",
                            padding: "3px 12px",
                            borderRadius: "var(--r-pill)",
                            background: "var(--navy)",
                            color: "#ffffff",
                            fontSize: "11px",
                            fontWeight: 700,
                            letterSpacing: "0.02em",
                          }}
                        >
                          0{mod.id}
                        </span>
                        {s && (
                          <span
                            style={{
                              display: "inline-block",
                              padding: "3px 12px",
                              borderRadius: "var(--r-pill)",
                              background: "var(--correct-bg)",
                              color: "var(--correct-text)",
                              fontSize: "12px",
                              fontWeight: 600,
                            }}
                          >
                            Scored {s.pct}%
                          </span>
                        )}
                      </div>

                      <h3
                        style={{
                          fontSize: "20px",
                          lineHeight: "28px",
                          fontWeight: 600,
                          color: "var(--ink)",
                          margin: "10px 0 6px",
                          letterSpacing: "-0.01em",
                        }}
                      >
                        {mod.title}
                      </h3>

                      <p
                        style={{
                          fontSize: "15px",
                          lineHeight: "24px",
                          color: "var(--muted)",
                          margin: "0 0 16px",
                        }}
                      >
                        {mod.description}
                      </p>

                      {/* Footer */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "14px",
                            color: "var(--faint)",
                          }}
                        >
                          {quizMeta(mod.questions.length)}
                        </span>
                        <span
                          style={{
                            marginLeft: "auto",
                            fontSize: "14px",
                            fontWeight: 600,
                            color: "var(--navy)",
                          }}
                        >
                          Start →
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* ── Unlock banner ── */}
            <div
              style={{
                margin: "40px 0 16px",
                background: "var(--gradient)",
                borderRadius: "var(--r-feature)",
                padding: "36px 40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "24px",
                flexWrap: "wrap",
                boxShadow: "var(--shadow-feature)",
              }}
            >
              <div>
                <p
                  style={{
                    fontSize: "20px",
                    fontWeight: 600,
                    color: "#ffffff",
                    margin: "0 0 6px",
                    letterSpacing: "-0.02em",
                  }}
                >
                  Unlock the full assessment
                </p>
                <p
                  style={{
                    fontSize: "14px",
                    color: "var(--on-navy-2)",
                    margin: 0,
                    lineHeight: 1.55,
                    maxWidth: "440px",
                  }}
                >
                  Book a free 1-on-1 to get access to all modules and a
                  personalised review of your results.
                </p>
              </div>
              <a
                href={CALENDLY_URL}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-block",
                  padding: "11px 24px",
                  borderRadius: "var(--r-pill)",
                  background: "#ffffff",
                  color: "var(--navy)",
                  fontWeight: 600,
                  fontSize: "15px",
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                  letterSpacing: "-0.01em",
                }}
              >
                Book a call →
              </a>
            </div>

            {/* ── Locked cards ── */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {locked.map((mod) => (
                <a
                  key={mod.id}
                  href={CALENDLY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    textDecoration: "none",
                    display: "block",
                    background: "#ffffff",
                    border: "1.5px dashed var(--border)",
                    borderRadius: "var(--r-card)",
                    padding: "24px 28px",
                    opacity: 0.8,
                    cursor: "pointer",
                    transition: "opacity 0.2s, border-color 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.opacity = "1";
                    (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--border-hover)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.opacity = "0.8";
                    (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--border)";
                  }}
                >
                  {/* Top row */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      marginBottom: "10px",
                    }}
                  >
                    <span
                      style={{
                        display: "inline-block",
                        padding: "3px 12px",
                        borderRadius: "var(--r-pill)",
                        background: "var(--canvas)",
                        color: "var(--faint)",
                        fontSize: "11px",
                        fontWeight: 700,
                        border: "1px solid var(--border)",
                      }}
                    >
                      0{mod.id}
                    </span>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        padding: "3px 12px",
                        borderRadius: "var(--r-pill)",
                        border: "1px solid var(--border)",
                        color: "var(--faint)",
                        fontSize: "12px",
                        fontWeight: 500,
                      }}
                    >
                      🔒 Locked
                    </span>
                  </div>

                  <h3
                    style={{
                      fontSize: "20px",
                      fontWeight: 600,
                      color: "var(--ink-2)",
                      margin: "0 0 6px",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {mod.title}
                  </h3>
                  <p
                    style={{
                      fontSize: "14px",
                      color: "var(--faint)",
                      lineHeight: 1.55,
                      margin: "0 0 12px",
                    }}
                  >
                    {mod.description}
                  </p>
                  <span
                    style={{
                      fontSize: "14px",
                      fontWeight: 500,
                      color: "var(--navy)",
                    }}
                  >
                    Book a call to unlock →
                  </span>
                </a>
              ))}
            </div>
          </div>
        </section>
      </main>

    </>
  );
}
