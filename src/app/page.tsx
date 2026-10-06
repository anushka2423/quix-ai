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
        <section style={{ background: "var(--navy)", overflow: "hidden" }}>
          <div className="page-wrap">
            <div className="hero-grid">
              {/* Left: copy */}
              <div>
                <p style={{
                  fontSize: "13px",
                  letterSpacing: "1.2px",
                  fontWeight: 800,
                  color: "var(--accent)",
                  textTransform: "uppercase",
                  margin: "0 0 20px",
                  fontFamily: "var(--font-manrope), sans-serif",
                }}>
                  FOR PRODUCT MANAGERS MOVING INTO AI
                </p>

                <h1 style={{
                  fontFamily: "var(--font-manrope), sans-serif",
                  fontSize: "clamp(38px, 4.5vw, 56px)",
                  fontWeight: 800,
                  lineHeight: 1.12,
                  letterSpacing: "-0.035em",
                  color: "#ffffff",
                  margin: "0 0 24px",
                }}>
                  Are you an<br />
                  AI-ready{" "}
                  <em style={{ fontStyle: "normal", color: "var(--accent)" }}>
                    Product Manager?
                  </em>
                </h1>

                <p style={{
                  fontSize: "18px",
                  lineHeight: 1.65,
                  color: "#c7d4e7",
                  maxWidth: "470px",
                  margin: "0 0 28px",
                }}>
                  Test your knowledge across agentic AI, product roadmapping,
                  evaluation, and observability. Get a personalized skill
                  breakdown in under 15 minutes.
                </p>

                <Link
                  href="/quiz/1"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "17px 28px",
                    borderRadius: "9px",
                    background: "var(--accent)",
                    color: "var(--navy)",
                    fontWeight: 700,
                    fontSize: "16px",
                    textDecoration: "none",
                    minHeight: "54px",
                    transition: "background 0.15s, transform 0.15s",
                    letterSpacing: "-0.01em",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.background = "#ffb77e";
                    (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-1px)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.background = "var(--accent)";
                    (e.currentTarget as HTMLAnchorElement).style.transform = "none";
                  }}
                >
                  Start assessment →
                </Link>

                <p style={{ fontSize: "13px", color: "#dce7f7", margin: "13px 0 0" }}>
                  Free · {unlocked.length} modules · ~15 min per module
                </p>

                {/* Byline */}
                <div style={{
                  display: "flex",
                  gap: "12px",
                  alignItems: "center",
                  borderTop: "1px solid rgba(255,255,255,.15)",
                  paddingTop: "24px",
                  marginTop: "28px",
                  fontSize: "14px",
                  color: "#f1f4fa",
                }}>
                  <span style={{
                    background: "#1e3a64",
                    border: "1px solid #4a5b75",
                    borderRadius: "50%",
                    flexShrink: 0,
                    width: "42px",
                    height: "42px",
                    display: "grid",
                    placeItems: "center",
                    fontWeight: 700,
                    fontSize: "14px",
                    fontFamily: "var(--font-manrope), sans-serif",
                    color: "white",
                  }}>
                    AI
                  </span>
                  <div>
                    <span style={{ display: "block" }}>Claude Certification · Module Assessment</span>
                    <span style={{ display: "block", color: "#a9bcdf", fontSize: "13px", marginTop: "3px" }}>
                      {completed} of {unlocked.length} modules completed
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: hero card screenshot */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/hero-card.png"
                  alt="AI PM Skill Report sample"
                  style={{
                    width: "100%",
                    maxWidth: "480px",
                    borderRadius: "16px",
                    boxShadow: "0 25px 70px rgba(0,0,0,.18)",
                    display: "block",
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* ── Stats strip ── */}
        <section style={{ borderBottom: "1px solid var(--border)", background: "#f9fbfe" }}>
          <div className="page-wrap">
            <div className="stats-strip">
              <p style={{ fontSize: "14px", lineHeight: 1.65, margin: 0, color: "var(--muted)" }}>
                A certification assessment built around{" "}
                <strong style={{ color: "var(--ink)", fontWeight: 500 }}>
                  Claude AI for Product Managers
                </strong>
              </p>
              <div style={{ borderLeft: "1px solid var(--border)", paddingLeft: "22px" }}>
                <b style={{ display: "block", fontSize: "17px", fontWeight: 700, lineHeight: 1.5, color: "var(--ink)" }}>
                  5 Modules
                </b>
                <span style={{ fontSize: "14px", color: "var(--muted)", display: "block", marginTop: "3px" }}>
                  Across the full AI PM curriculum
                </span>
              </div>
              <div style={{ borderLeft: "1px solid var(--border)", paddingLeft: "22px" }}>
                <b style={{ display: "block", fontSize: "17px", fontWeight: 700, lineHeight: 1.5, color: "var(--ink)" }}>
                  Claude Code
                </b>
                <span style={{ fontSize: "14px", color: "var(--muted)", display: "block", marginTop: "3px" }}>
                  Hands-on agent building
                </span>
              </div>
              <div style={{ borderLeft: "1px solid var(--border)", paddingLeft: "22px" }}>
                <b style={{ display: "block", fontSize: "17px", fontWeight: 700, lineHeight: 1.5, color: "var(--ink)" }}>
                  Certification prep
                </b>
                <span style={{ fontSize: "14px", color: "var(--muted)", display: "block", marginTop: "3px" }}>
                  Claude Associate &amp; Developer
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ── Module cards section ── */}
        <section style={{ padding: "80px 0", background: "#ffffff" }}>
          <div className="page-wrap">
            <div className="section-head">
              <div>
                <p style={{
                  fontSize: "13px",
                  letterSpacing: "1px",
                  fontWeight: 800,
                  color: "var(--accent-dark)",
                  textTransform: "uppercase",
                  fontFamily: "var(--font-manrope), sans-serif",
                  margin: "0 0 16px",
                }}>
                  CERTIFICATION MODULES
                </p>
                <h2 style={{
                  fontFamily: "var(--font-manrope), sans-serif",
                  fontSize: "clamp(28px, 3.4vw, 40px)",
                  fontWeight: 800,
                  color: "var(--ink)",
                  margin: 0,
                }}>
                  Can you make the calls<br />an AI PM needs to make?
                </h2>
              </div>
              <p style={{ color: "var(--muted)", margin: 0, fontSize: "16px", lineHeight: 1.65 }}>
                Short product scenarios across five skill areas. Choose how
                you&apos;d approach each situation — even if AI is new to you.
              </p>
            </div>

            {/* Unlocked cards */}
            <div className="module-grid">
              {unlocked.map((mod, i) => {
                const s = scores[String(mod.id)];
                const labels = ["DECIDE", "DESIGN", "VALIDATE"];
                return (
                  <Link key={mod.id} href={`/quiz/${mod.id}`} style={{ textDecoration: "none" }}>
                    <div className="module-card" style={{
                      background: "#ffffff",
                      border: "1px solid var(--border)",
                      borderRadius: "10px",
                      padding: "24px 20px",
                      cursor: "pointer",
                      height: "100%",
                      boxSizing: "border-box",
                      display: "flex",
                      flexDirection: "column",
                    }}>
                      <span style={{
                        display: "block",
                        color: "var(--accent-dark)",
                        fontSize: "13px",
                        fontWeight: 800,
                        letterSpacing: "0.8px",
                        textTransform: "uppercase",
                        marginBottom: "24px",
                        fontFamily: "var(--font-manrope), sans-serif",
                      }}>
                        {String(i + 1).padStart(2, "0")} / {labels[i] ?? "MODULE"}
                      </span>
                      <h3 style={{
                        fontFamily: "var(--font-manrope), sans-serif",
                        fontSize: "20px",
                        lineHeight: 1.35,
                        fontWeight: 800,
                        color: "var(--ink)",
                        margin: "0 0 12px",
                        minHeight: "54px",
                      }}>
                        {mod.title}
                      </h3>
                      <p style={{
                        fontSize: "15px",
                        color: "var(--muted)",
                        lineHeight: 1.7,
                        margin: "0",
                        flex: 1,
                        paddingBottom: "20px",
                      }}>
                        {mod.description}
                      </p>
                      <div style={{
                        borderTop: "1px solid var(--border)",
                        paddingTop: "14px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        fontSize: "14px",
                      }}>
                        <span style={{ color: s ? "var(--correct-text)" : "var(--accent-dark)" }}>
                          {s ? `Scored ${s.pct}%` : quizMeta(mod.questions.length)}
                        </span>
                        <span style={{ fontWeight: 700, color: "var(--navy)" }}>
                          {s ? "Retake →" : "Start →"}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* ── Cohort / unlock banner ── */}
            <div style={{
              margin: "40px 0 16px",
              background: "var(--navy)",
              borderRadius: "14px",
              padding: "46px",
              color: "#ffffff",
              boxShadow: "var(--shadow-feature)",
            }}>
              <div className="cohort-grid">
                <div>
                  <p style={{
                    fontSize: "13px",
                    fontWeight: 800,
                    letterSpacing: "1px",
                    color: "var(--accent)",
                    textTransform: "uppercase",
                    margin: "0 0 16px",
                    fontFamily: "var(--font-manrope), sans-serif",
                  }}>
                    WHEN YOU&apos;RE READY TO CLOSE THE GAPS
                  </p>
                  <h2 style={{
                    fontFamily: "var(--font-manrope), sans-serif",
                    fontSize: "clamp(26px, 2.5vw, 34px)",
                    fontWeight: 800,
                    color: "#ffffff",
                    margin: "0 0 20px",
                    lineHeight: 1.25,
                  }}>
                    AI product leadership.<br />
                    Hands-on Claude Code.<br />
                    Certification prep.
                  </h2>
                  <p style={{ fontSize: "15px", color: "#c7d4e7", margin: 0, lineHeight: 1.65 }}>
                    Book a free 1-on-1 to get access to all modules and a
                    personalised review of your results. Includes preparation for
                    Claude Certified Associate and Developer certifications.
                  </p>
                </div>

                <div
                  className="cohort-aside-border"
                  style={{
                    borderLeft: "1px solid rgba(255,255,255,.15)",
                    paddingLeft: "40px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "flex-start",
                  }}
                >
                  <span style={{
                    fontSize: "13px",
                    fontWeight: 800,
                    letterSpacing: "0.8px",
                    color: "#aebfd8",
                    textTransform: "uppercase",
                    fontFamily: "var(--font-manrope), sans-serif",
                    marginBottom: "16px",
                    display: "block",
                  }}>
                    START WITH YOUR SKILL GAPS
                  </span>
                  <h3 style={{
                    fontFamily: "var(--font-manrope), sans-serif",
                    fontSize: "22px",
                    lineHeight: 1.4,
                    color: "#ffffff",
                    fontWeight: 800,
                    margin: "0 0 22px",
                  }}>
                    Make your next learning decision an informed one.
                  </h3>
                  <a
                    href={CALENDLY_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "17px 24px",
                      borderRadius: "9px",
                      background: "var(--accent)",
                      color: "var(--navy)",
                      fontWeight: 700,
                      fontSize: "15px",
                      textDecoration: "none",
                      minHeight: "54px",
                      transition: "background 0.15s, transform 0.15s",
                      whiteSpace: "nowrap",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.background = "#ffb77e";
                      (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-1px)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.background = "var(--accent)";
                      (e.currentTarget as HTMLAnchorElement).style.transform = "none";
                    }}
                  >
                    Book a call →
                  </a>
                  <p style={{ fontSize: "14px", color: "#b8c8df", maxWidth: "270px", margin: "14px 0 0", lineHeight: 1.65 }}>
                    No purchase needed to start the assessment.
                  </p>
                </div>
              </div>
            </div>

            {/* ── Locked cards ── */}
            <div className="locked-grid">
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
                    borderRadius: "10px",
                    padding: "24px",
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
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                    <span style={{
                      display: "inline-block",
                      padding: "3px 12px",
                      borderRadius: "var(--r-pill)",
                      background: "var(--canvas)",
                      color: "var(--faint)",
                      fontSize: "11px",
                      fontWeight: 700,
                      border: "1px solid var(--border)",
                    }}>
                      0{mod.id}
                    </span>
                    <span style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      padding: "3px 12px",
                      borderRadius: "var(--r-pill)",
                      border: "1px solid var(--border)",
                      color: "var(--faint)",
                      fontSize: "12px",
                      fontWeight: 500,
                    }}>
                      🔒 Locked
                    </span>
                  </div>
                  <h3 style={{
                    fontSize: "18px",
                    fontWeight: 800,
                    color: "var(--ink-2)",
                    margin: "0 0 6px",
                    fontFamily: "var(--font-manrope), sans-serif",
                  }}>
                    {mod.title}
                  </h3>
                  <p style={{ fontSize: "14px", color: "var(--faint)", lineHeight: 1.55, margin: "0 0 14px" }}>
                    {mod.description}
                  </p>
                  <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--navy)" }}>
                    Book a call to unlock →
                  </span>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* ── Final CTA ── */}
        <section style={{
          background: "var(--navy)",
          textAlign: "center",
          padding: "60px 0",
          color: "#ffffff",
        }}>
          <div className="page-wrap">
            <p style={{
              fontSize: "13px",
              letterSpacing: "1.2px",
              fontWeight: 800,
              color: "var(--accent)",
              textTransform: "uppercase",
              margin: "0 0 20px",
              fontFamily: "var(--font-manrope), sans-serif",
            }}>
              YOUR NEXT AI PM MOVE STARTS HERE
            </p>
            <h2 style={{
              fontFamily: "var(--font-manrope), sans-serif",
              fontSize: "clamp(30px, 4vw, 42px)",
              fontWeight: 800,
              color: "#ffffff",
              margin: "0 0 28px",
            }}>
              Find your gaps.<br />Focus your learning.
            </h2>
            <Link
              href="/quiz/1"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "17px 32px",
                borderRadius: "9px",
                background: "var(--accent)",
                color: "var(--navy)",
                fontWeight: 700,
                fontSize: "16px",
                textDecoration: "none",
                minHeight: "54px",
                transition: "background 0.15s, transform 0.15s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.background = "#ffb77e";
                (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.background = "var(--accent)";
                (e.currentTarget as HTMLAnchorElement).style.transform = "none";
              }}
            >
              Start assessment →
            </Link>
            <p style={{ fontSize: "14px", color: "#b8c8df", margin: "18px 0 0" }}>
              {unlocked.length} modules · Free to start · Email unlocks your full report
            </p>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer style={{ borderTop: "1px solid var(--border)" }}>
          <div className="page-wrap" style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "20px",
            paddingTop: "26px",
            paddingBottom: "26px",
            fontSize: "14px",
            color: "var(--muted)",
            flexWrap: "wrap",
          }}>
            <span style={{ fontWeight: 700, color: "var(--ink)" }}>Quix AI</span>
            <span>Claude Certification Module Assessment</span>
            <a
              href={CALENDLY_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "inherit", textDecoration: "underline", textUnderlineOffset: "3px" }}
            >
              Book a 1-on-1 call
            </a>
          </div>
        </footer>
      </main>
    </>
  );
}
