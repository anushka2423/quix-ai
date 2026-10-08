"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { modules } from "@/lib/quiz-data";
import Header from "@/components/Header";

const CALENDLY_URL = "https://calendly.com/d/dtdk-7jq-xwm/1-1";
const BLUE = "#214f91";

type Scores = Record<string, { score: number; total: number; pct: number }>;

const TOTAL_Q = modules.reduce((n, m) => n + m.questions.length, 0);
const UNLOCKED_COUNT = modules.filter((m) => !m.locked).length;

function PrepReportCard() {
  return (
    <div style={{
      background: "#fff",
      borderRadius: "16px",
      padding: "25px",
      color: "#10213b",
      boxShadow: "0 25px 70px rgba(0,0,0,.15)",
      border: "1px solid #d7e4f8",
      width: "100%",
    }}>
      {/* Top row */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "10px",
        borderBottom: "1px solid #dce3ed",
        paddingBottom: "17px",
        flexWrap: "wrap",
        rowGap: "10px",
      }}>
        <span style={{
          fontSize: "13px",
          fontWeight: 800,
          letterSpacing: ".5px",
          color: "#273b56",
          fontFamily: "var(--font-manrope), sans-serif",
          textTransform: "uppercase",
          margin: 0,
        }}>
          Your Claude Certification Prep
        </span>
        <span style={{
          fontSize: "13px",
          color: "#44536a",
          background: "#f1f5fa",
          borderRadius: "4px",
          padding: "3px 7px",
          fontWeight: 500,
        }}>
          CCCM-F
        </span>
      </div>

      {/* Stats grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "12px",
        margin: "22px 0 16px",
      }}>
        <div style={{ background: "#f1f5fa", border: "1px solid #dce3ed", borderRadius: "10px", padding: "16px" }}>
          <strong style={{ display: "block", color: "#071b39", fontFamily: "var(--font-manrope), sans-serif", fontSize: "48px", lineHeight: "1.1" }}>
            {TOTAL_Q}
          </strong>
          <span style={{ display: "block", color: "#10213b", fontSize: "14px", marginTop: "7px" }}>
            Practice questions
          </span>
        </div>
        <div style={{ background: "#f1f5fa", border: "1px solid #dce3ed", borderRadius: "10px", padding: "16px" }}>
          <strong style={{ display: "block", color: "#071b39", fontFamily: "var(--font-manrope), sans-serif", fontSize: "48px", lineHeight: "1.1" }}>
            {modules.length}
          </strong>
          <span style={{ display: "block", color: "#10213b", fontSize: "14px", marginTop: "7px" }}>
            Modules
          </span>
        </div>
      </div>

      {/* Open modules note */}
      <div style={{ borderLeft: "3px solid #ff9b50", padding: "10px 14px", marginBottom: "18px", background: "#fff3e8" }}>
        <strong style={{ display: "block", fontSize: "14px", color: "#10213b" }}>
          {UNLOCKED_COUNT} modules open · Free to start
        </strong>
        <span style={{ display: "block", fontSize: "14px", color: "#10213b" }}>
          12 questions each · ~18 min per module
        </span>
      </div>

      {/* Module blueprint */}
      <div>
        {modules.map((mod) => (
          <div key={mod.id} style={{
            display: "grid",
            gridTemplateColumns: "23px minmax(0,1fr) 52px",
            gap: "9px",
            alignItems: "start",
            borderBottom: "1px solid #dce3ed",
            padding: "10px 0",
            fontSize: "14px",
            lineHeight: "1.4",
            color: "#10213b",
          }}>
            <span style={{ color: BLUE }}>{String(mod.id).padStart(2, "0")}</span>
            <strong style={{ fontWeight: 500, fontSize: "14px" }}>{mod.title}</strong>
            <b style={{ textAlign: "right", color: mod.locked ? "#9aa5b4" : BLUE, fontSize: "14px" }}>
              {mod.locked ? "🔒" : `${mod.questions.length}Q`}
            </b>
          </div>
        ))}
      </div>

      {/* Action box */}
      <div style={{ marginTop: "20px", padding: "15px", borderRadius: "8px", background: "#fff3e8", borderLeft: "3px solid #ff9b50" }}>
        <span style={{
          display: "block", fontSize: "13px", letterSpacing: ".4px", color: "#a33f08",
          fontWeight: 800, marginBottom: "6px",
          fontFamily: "var(--font-manrope), sans-serif", textTransform: "uppercase",
        }}>
          Personalised to your answers
        </span>
        <strong style={{ fontSize: "14px", lineHeight: "1.5", display: "block" }}>
          Get a skill breakdown and revision plan.
        </strong>
        <p style={{ fontSize: "14px", lineHeight: "1.5", margin: "6px 0 0", color: "#44536a" }}>
          Complete a module to see where to focus next.
        </p>
      </div>

      <p style={{ fontSize: "13px", color: "#64748b", margin: "15px 0 0", lineHeight: "1.55" }}>
        Unlocked modules are free. Email unlocks your full report.
      </p>
    </div>
  );
}

const OUTCOMES = [
  {
    n: "01",
    h: "Your score, immediately",
    p: "See how many questions you answered correctly, broken down by module.",
  },
  {
    n: "02",
    h: "A breakdown by module",
    p: "Get a personalised report showing which modules need attention. Skill breakdown and answer explanations remain open.",
  },
  {
    n: "03",
    h: "A focused revision plan",
    p: "Use your report to choose what to revisit. Explore guided learning when you want more support.",
  },
];

const STEPS = [
  {
    n: "1",
    h: "Choose a module or start from module 1",
    p: "Answer 12 questions per module, or start anywhere in the curriculum. Your score appears as soon as you finish.",
  },
  {
    n: "2",
    h: "See your score",
    p: "Get a skill breakdown with correct and incorrect answers. Use your email to unlock the detailed revision report.",
  },
  {
    n: "3",
    h: "Revise and practice again",
    p: "Retake any module. Use your revision report to focus your next session, or join the cohort for guided learning.",
  },
];

const FAQS = [
  {
    q: "Who is this assessment for?",
    a: "It is for product managers, engineers, and learners preparing for Claude certification or wanting to deepen their practical knowledge of agentic AI, Claude Code, and production systems.",
  },
  {
    q: "Is the assessment free? Why do you ask for my email?",
    a: "All unlocked modules and your score are free. Your email unlocks the detailed revision report so you can see which questions to revisit. Cohort updates require a separate opt-in.",
  },
  {
    q: "Can I retake a module?",
    a: "Yes. Every unlocked module is accessible from the start. Retake any module, or book a call to unlock all five modules.",
  },
  {
    q: "Is this an official Anthropic exam?",
    a: "No. This is an independent preparation quiz from Agentic AI Institute. It does not award a certification, reproduce official exam questions, or predict an exam pass.",
  },
  {
    q: "Will I have to book a call or join the cohort?",
    a: "No. You can use the revision plan on your own. Exploring the cohort is an optional next step for guided learning.",
  },
];

export default function Home() {
  const [scores, setScores] = useState<Scores>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem("aipm_scores");
      if (raw) setScores(JSON.parse(raw));
    } catch {}
  }, []);

  const completed = Object.keys(scores).length;

  return (
    <>
      <Header />

      <main style={{ minHeight: "100vh", backgroundColor: "#ffffff" }}>

        {/* ── Hero ── */}
        <section style={{ background: "#071b39", color: "white", overflow: "hidden" }}>
          <div className="page-wrap">
            <div className="hero-grid">
              {/* Left: copy */}
              <div>
                <p style={{
                  fontSize: "14px",
                  letterSpacing: "1.4px",
                  fontWeight: 800,
                  color: "#ff9b50",
                  textTransform: "uppercase",
                  margin: "0 0 20px",
                  fontFamily: "var(--font-manrope), sans-serif",
                  lineHeight: "1.5",
                }}>
                  Claude Certification Preparation
                </p>

                <h1 style={{
                  fontFamily: "var(--font-manrope), sans-serif",
                  fontSize: "clamp(40px, 4.2vw, 56px)",
                  fontWeight: 800,
                  lineHeight: 1.15,
                  letterSpacing: "-0.035em",
                  color: "#ffffff",
                  margin: 0,
                }}>
                  Practice until<br />
                  <em style={{ fontStyle: "normal", color: "#ff9b50" }}>you get it right.</em>
                </h1>

                <p style={{
                  fontSize: "18px",
                  lineHeight: 1.65,
                  color: "#c7d4e7",
                  maxWidth: "470px",
                  margin: "24px 0 27px",
                }}>
                  Prepare for Claude certification with {TOTAL_Q} practice questions
                  across all five modules. Review the reasoning behind each answer,
                  revisit your weak areas and practice again.
                </p>

                <Link
                  href="/quiz/1"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "17px 24px",
                    borderRadius: "9px",
                    background: "#ff9b50",
                    color: "#071b39",
                    fontWeight: 700,
                    fontSize: "16px",
                    textDecoration: "none",
                    minHeight: "54px",
                    transition: "background .15s, transform .15s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.background = "#ffb77e";
                    (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-1px)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.background = "#ff9b50";
                    (e.currentTarget as HTMLAnchorElement).style.transform = "none";
                  }}
                >
                  Start the assessment →
                </Link>

                <p style={{ fontSize: "14px", color: "#dce7f7", margin: "13px 0 5px" }}>
                  {UNLOCKED_COUNT} modules open · {TOTAL_Q} questions · Free to start
                </p>
                <p style={{ fontSize: "14px", lineHeight: 1.55, color: "#b5c5dc", maxWidth: "370px", margin: 0 }}>
                  All unlocked modules are open. Practice a module or start a session below.
                  Your score and skill breakdown are free.
                </p>

                {/* Byline */}
                <div className="hero-byline" style={{
                  display: "flex",
                  gap: "12px",
                  alignItems: "center",
                  borderTop: "1px solid rgba(255,255,255,.13)",
                  paddingTop: "24px",
                  marginTop: "28px",
                  fontSize: "14px",
                  color: "#f1f4fa",
                }}>
                  <span style={{
                    background: "#243955",
                    border: "1px solid #4a5b75",
                    borderRadius: "50%",
                    flexShrink: 0,
                    width: "42px",
                    height: "42px",
                    display: "grid",
                    placeItems: "center",
                    fontWeight: 700,
                    fontFamily: "var(--font-manrope), sans-serif",
                    color: "white",
                    fontSize: "14px",
                  }}>
                    MY
                  </span>
                  <div style={{ minWidth: 0 }}>
                    <span style={{ display: "block" }}>Created by Agentic AI Institute</span>
                    <span style={{ display: "block", color: "#b5c5dc", fontSize: "14px", marginTop: "3px" }}>
                      From Mahesh Yadav&apos;s Claude certification preparation program
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: prep report card */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                <PrepReportCard />
              </div>
            </div>
          </div>
        </section>

        {/* ── Stats strip ── */}
        <section style={{ borderBottom: "1px solid var(--border)", background: "#f9fbfe" }}>
          <div className="page-wrap">
            <div className="stats-strip">
              <p style={{ fontSize: "14px", lineHeight: 1.65, margin: 0, color: "var(--muted)" }}>
                Claude certification preparation from{" "}
                <strong style={{ color: "var(--ink)", fontWeight: 500 }}>Agentic AI Institute</strong>
              </p>
              <div style={{ borderLeft: "1px solid var(--border)", paddingLeft: "22px" }}>
                <b style={{ display: "block", fontSize: "17px", fontWeight: 700, lineHeight: 1.5, color: "var(--ink)" }}>
                  Detailed practice
                </b>
                <span style={{ fontSize: "14px", color: "var(--muted)", display: "block", marginTop: "3px" }}>
                  {TOTAL_Q} original questions
                </span>
              </div>
              <div style={{ borderLeft: "1px solid var(--border)", paddingLeft: "22px" }}>
                <b style={{ display: "block", fontSize: "17px", fontWeight: 700, lineHeight: 1.5, color: "var(--ink)" }}>
                  Every module open
                </b>
                <span style={{ fontSize: "14px", color: "var(--muted)", display: "block", marginTop: "3px" }}>
                  Start wherever you need
                </span>
              </div>
              <div style={{ borderLeft: "1px solid var(--border)", paddingLeft: "22px" }}>
                <b style={{ display: "block", fontSize: "17px", fontWeight: 700, lineHeight: 1.5, color: "var(--ink)" }}>
                  Learn and retry
                </b>
                <span style={{ fontSize: "14px", color: "var(--muted)", display: "block", marginTop: "3px" }}>
                  Skill breakdown included
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
                  fontSize: "14px",
                  letterSpacing: "1px",
                  fontWeight: 800,
                  color: BLUE,
                  textTransform: "uppercase",
                  margin: "0 0 16px",
                  fontFamily: "var(--font-manrope), sans-serif",
                }}>
                  Practice by module
                </p>
                <h2 style={{
                  fontFamily: "var(--font-manrope), sans-serif",
                  fontSize: "clamp(30px, 3.4vw, 42px)",
                  fontWeight: 800,
                  color: "var(--ink)",
                  margin: 0,
                  letterSpacing: "-0.035em",
                }}>
                  All {modules.length} modules.<br />All the practice you need.
                </h2>
              </div>
              <p style={{ color: "var(--muted)", margin: 0, fontSize: "16px", lineHeight: 1.65 }}>
                Take the full assessment or work through one module at a time. Module
                titles and topics follow the Claude certification curriculum.
              </p>
            </div>

            {/* All module cards in one unified grid */}
            <div className="module-grid">
              {modules.map((mod) => {
                const s = scores[String(mod.id)];
                if (mod.locked) {
                  return (
                    <a
                      key={mod.id}
                      href={CALENDLY_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ textDecoration: "none", display: "flex" }}
                    >
                      <article style={{
                        border: "1.5px dashed #dce3ed",
                        borderRadius: "10px",
                        padding: "23px 19px",
                        background: "white",
                        display: "flex",
                        flexDirection: "column",
                        width: "100%",
                        opacity: 0.8,
                      }}>
                        <span style={{
                          display: "block",
                          color: "#9aa5b4",
                          fontSize: "14px",
                          fontWeight: 800,
                          letterSpacing: "1px",
                          marginBottom: "27px",
                          fontFamily: "var(--font-manrope), sans-serif",
                        }}>
                          Module {mod.id} / 🔒 Locked
                        </span>
                        <h3 style={{
                          fontFamily: "var(--font-manrope), sans-serif",
                          fontSize: "19px",
                          lineHeight: 1.35,
                          fontWeight: 800,
                          color: "#6b7a8f",
                          margin: "0 0 14px",
                          letterSpacing: "-0.025em",
                        }}>
                          {mod.title}
                        </h3>
                        <p style={{ fontSize: "14px", color: "#9aa5b4", lineHeight: 1.7, margin: 0, flex: 1 }}>
                          {mod.description}
                        </p>
                        <span style={{
                          display: "block",
                          fontSize: "14px",
                          color: "#9aa5b4",
                          borderTop: "1px solid #dce3ed",
                          paddingTop: "14px",
                          marginTop: "24px",
                        }}>
                          {mod.questions.length} practice questions · ~18 min
                        </span>
                        <button style={{
                          width: "100%",
                          marginTop: "16px",
                          padding: "12px 18px",
                          borderRadius: "9px",
                          border: "1px solid #dce3ed",
                          background: "white",
                          color: "#9aa5b4",
                          fontWeight: 700,
                          fontSize: "14px",
                          cursor: "pointer",
                          fontFamily: "inherit",
                          lineHeight: 1.3,
                          minHeight: "44px",
                        }}>
                          Book to unlock →
                        </button>
                      </article>
                    </a>
                  );
                }
                return (
                  <Link key={mod.id} href={`/quiz/${mod.id}`} style={{ textDecoration: "none", display: "flex" }}>
                    <article style={{
                      border: "1px solid #dce3ed",
                      borderRadius: "10px",
                      padding: "23px 19px",
                      background: "white",
                      display: "flex",
                      flexDirection: "column",
                      width: "100%",
                      cursor: "pointer",
                    }}>
                      <span style={{
                        display: "block",
                        color: BLUE,
                        fontSize: "14px",
                        fontWeight: 800,
                        letterSpacing: "1px",
                        marginBottom: "27px",
                        fontFamily: "var(--font-manrope), sans-serif",
                      }}>
                        Module {mod.id} / {s ? "Completed" : "Open access"}
                      </span>
                      <h3 style={{
                        fontFamily: "var(--font-manrope), sans-serif",
                        fontSize: "19px",
                        lineHeight: 1.35,
                        fontWeight: 800,
                        color: "var(--ink)",
                        margin: "0 0 14px",
                        letterSpacing: "-0.025em",
                      }}>
                        {mod.title}
                      </h3>
                      <p style={{
                        fontSize: "15px",
                        color: "var(--muted)",
                        lineHeight: 1.7,
                        margin: 0,
                        flex: 1,
                      }}>
                        {mod.description}
                      </p>
                      <span style={{
                        display: "block",
                        fontSize: "14px",
                        color: s ? "#14532d" : "#654a39",
                        borderTop: "1px solid #dce3ed",
                        paddingTop: "14px",
                        marginTop: "24px",
                      }}>
                        {s
                          ? `Scored ${s.pct}% · ${mod.questions.length} questions`
                          : `${mod.questions.length} practice questions · ~18 min`}
                      </span>
                      <button style={{
                        width: "100%",
                        marginTop: "16px",
                        padding: "12px 18px",
                        borderRadius: "9px",
                        border: "1px solid #dce3ed",
                        background: "white",
                        color: "var(--ink)",
                        fontWeight: 700,
                        fontSize: "14px",
                        cursor: "pointer",
                        fontFamily: "inherit",
                        lineHeight: 1.3,
                        minHeight: "44px",
                        transition: "border-color .15s",
                      }}>
                        {s ? "Retake module →" : "Practice this module →"}
                      </button>
                    </article>
                  </Link>
                );
              })}
            </div>

            <p style={{ fontSize: "14px", color: "var(--muted)", margin: "18px 0 0" }}>
              Module titles and curriculum follow the Claude certification programme.
              Practice questions are independent; no official pass prediction is implied.
            </p>
          </div>
        </section>

        {/* ── Outcomes / results section ── */}
        <section style={{ background: "#f1f5fa" }}>
          <div className="page-wrap">
            <div className="outcomes-grid">
              <div>
                <p style={{
                  fontSize: "14px",
                  letterSpacing: "1.4px",
                  fontWeight: 800,
                  color: BLUE,
                  textTransform: "uppercase",
                  margin: "0 0 20px",
                  fontFamily: "var(--font-manrope), sans-serif",
                }}>
                  Turn your score into a revision plan
                </p>
                <h2 style={{
                  fontFamily: "var(--font-manrope), sans-serif",
                  fontSize: "clamp(30px, 3.4vw, 42px)",
                  fontWeight: 800,
                  color: "var(--ink)",
                  margin: 0,
                  letterSpacing: "-0.035em",
                }}>
                  Know what to<br />revise next.
                </h2>
                <p style={{ color: "var(--muted)", maxWidth: "335px", margin: "22px 0", fontSize: "16px", lineHeight: 1.65 }}>
                  Use your answers to focus your certification preparation on the
                  areas that need more practice.
                </p>
              </div>

              <div style={{ display: "grid", gap: "25px" }}>
                {OUTCOMES.map(({ n, h, p }) => (
                  <article key={n} style={{ display: "flex", gap: "20px" }}>
                    <span style={{
                      border: "1px solid #cdd9e9",
                      borderRadius: "50%",
                      minWidth: "38px",
                      height: "38px",
                      display: "grid",
                      placeContent: "center",
                      fontSize: "14px",
                      color: BLUE,
                      background: "white",
                      flexShrink: 0,
                      fontWeight: 600,
                    }}>
                      {n}
                    </span>
                    <div>
                      <h3 style={{
                        fontFamily: "var(--font-manrope), sans-serif",
                        fontSize: "19px",
                        fontWeight: 800,
                        margin: 0,
                        letterSpacing: "-0.025em",
                        color: "var(--ink)",
                      }}>
                        {h}
                      </h3>
                      <p style={{ fontSize: "15px", color: "var(--muted)", margin: "9px 0 0", lineHeight: 1.65 }}>
                        {p}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── How it works ── */}
        <section style={{ padding: "80px 0", background: "#ffffff" }}>
          <div className="page-wrap">
            <div style={{ textAlign: "center", marginBottom: "38px" }}>
              <p style={{
                fontSize: "14px",
                letterSpacing: "1.4px",
                fontWeight: 800,
                color: BLUE,
                textTransform: "uppercase",
                margin: "0 0 16px",
                fontFamily: "var(--font-manrope), sans-serif",
              }}>
                How it works
              </p>
              <h2 style={{
                fontFamily: "var(--font-manrope), sans-serif",
                fontSize: "clamp(30px, 3.4vw, 42px)",
                fontWeight: 800,
                color: "var(--ink)",
                margin: 0,
                letterSpacing: "-0.035em",
              }}>
                Take the test. Learn from every answer.
              </h2>
            </div>

            <div className="steps-grid">
              {STEPS.map(({ n, h, p }) => (
                <article key={n} style={{ position: "relative", paddingLeft: "50px" }}>
                  <span style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    width: "32px",
                    height: "32px",
                    borderRadius: "8px",
                    background: "#071b39",
                    color: "white",
                    display: "grid",
                    placeContent: "center",
                    fontSize: "14px",
                    fontWeight: 700,
                  }}>
                    {n}
                  </span>
                  <h3 style={{
                    fontFamily: "var(--font-manrope), sans-serif",
                    fontSize: "17px",
                    fontWeight: 800,
                    margin: 0,
                    paddingTop: "4px",
                    letterSpacing: "-0.025em",
                    color: "var(--ink)",
                  }}>
                    {h}
                  </h3>
                  <p style={{ color: "var(--muted)", fontSize: "15px", margin: "12px 0 0", lineHeight: 1.65 }}>
                    {p}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── Cohort / unlock banner ── */}
        <section style={{ paddingBottom: "80px", background: "#ffffff" }}>
          <div className="page-wrap">
            <div style={{
              background: "#071b39",
              borderRadius: "14px",
              padding: "46px",
              color: "white",
            }}>
              <div className="cohort-grid">
                <div>
                  <p style={{
                    fontSize: "14px",
                    letterSpacing: "1.4px",
                    fontWeight: 800,
                    color: "#ff9b50",
                    textTransform: "uppercase",
                    margin: "0 0 16px",
                    fontFamily: "var(--font-manrope), sans-serif",
                  }}>
                    Want guided certification preparation?
                  </p>
                  <h2 style={{
                    fontFamily: "var(--font-manrope), sans-serif",
                    fontSize: "clamp(26px, 2.5vw, 34px)",
                    fontWeight: 800,
                    color: "white",
                    margin: 0,
                    lineHeight: 1.25,
                    letterSpacing: "-0.025em",
                  }}>
                    Prepare for Claude certification.<br />
                    Build with Claude Code.
                  </h2>
                  <p style={{ fontSize: "16px", color: "#c7d4e7", margin: "22px 0", lineHeight: 1.65 }}>
                    Book a free 1-on-1 to get access to all modules and a personalised
                    review of your results. Includes preparation for Claude Certified
                    Associate and Developer certifications.
                  </p>
                  <a
                    href={CALENDLY_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: "14px", color: "#ff9b50", textUnderlineOffset: "5px", textDecoration: "underline" }}
                  >
                    Book a free 1-on-1 call
                  </a>
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
                    fontSize: "14px",
                    color: "#aebfd8",
                    textTransform: "uppercase",
                    letterSpacing: "0.8px",
                    fontWeight: 800,
                    fontFamily: "var(--font-manrope), sans-serif",
                    marginBottom: "16px",
                    display: "block",
                  }}>
                    Start with a practice score
                  </span>
                  <h3 style={{
                    fontFamily: "var(--font-manrope), sans-serif",
                    fontSize: "24px",
                    lineHeight: 1.4,
                    fontWeight: 800,
                    color: "white",
                    margin: "0 0 22px",
                    letterSpacing: "-0.025em",
                  }}>
                    Put your Claude knowledge to the test.
                  </h3>
                  <Link
                    href="/quiz/1"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "17px 24px",
                      borderRadius: "9px",
                      background: "#ff9b50",
                      color: "#071b39",
                      fontWeight: 700,
                      fontSize: "14px",
                      textDecoration: "none",
                      minHeight: "54px",
                      transition: "background .15s, transform .15s",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.background = "#ffb77e";
                      (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-1px)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.background = "#ff9b50";
                      (e.currentTarget as HTMLAnchorElement).style.transform = "none";
                    }}
                  >
                    Start the assessment →
                  </Link>
                  <p style={{ fontSize: "14px", color: "#b8c8df", maxWidth: "270px", margin: "14px 0 0", lineHeight: 1.65 }}>
                    No purchase or call booking required.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ── FAQ ── */}
        <section style={{ padding: "80px 0", background: "#ffffff", borderTop: "1px solid var(--border)" }}>
          <div className="page-wrap">
            <div className="faq-grid">
              <div>
                <p style={{
                  fontSize: "14px",
                  letterSpacing: "1.4px",
                  fontWeight: 800,
                  color: BLUE,
                  textTransform: "uppercase",
                  margin: "0 0 16px",
                  fontFamily: "var(--font-manrope), sans-serif",
                }}>
                  Before you start
                </p>
                <h2 style={{
                  fontFamily: "var(--font-manrope), sans-serif",
                  fontSize: "clamp(30px, 3.4vw, 42px)",
                  fontWeight: 800,
                  color: "var(--ink)",
                  margin: 0,
                  letterSpacing: "-0.035em",
                }}>
                  A few answers.
                </h2>
              </div>

              <div>
                {FAQS.map(({ q, a }) => (
                  <details key={q} className="faq-details">
                    <summary>{q}</summary>
                    <p>{a}</p>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Final CTA ── */}
        <section style={{ background: "#071b39", textAlign: "center", color: "white", padding: "60px 0" }}>
          <div className="page-wrap">
            <p style={{
              fontSize: "14px",
              letterSpacing: "1.4px",
              fontWeight: 800,
              color: "#ff9b50",
              textTransform: "uppercase",
              margin: "0 0 20px",
              fontFamily: "var(--font-manrope), sans-serif",
            }}>
              Prepare with a clear revision plan
            </p>
            <h2 style={{
              fontFamily: "var(--font-manrope), sans-serif",
              fontSize: "clamp(30px, 4vw, 42px)",
              fontWeight: 800,
              color: "white",
              margin: "0 0 27px",
              letterSpacing: "-0.035em",
            }}>
              Practice until<br />you get it right.
            </h2>
            <Link
              href="/quiz/1"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "17px 32px",
                borderRadius: "9px",
                background: "#ff9b50",
                color: "#071b39",
                fontWeight: 700,
                fontSize: "16px",
                textDecoration: "none",
                minHeight: "54px",
                transition: "background .15s, transform .15s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.background = "#ffb77e";
                (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.background = "#ff9b50";
                (e.currentTarget as HTMLAnchorElement).style.transform = "none";
              }}
            >
              Start the assessment →
            </Link>
            <p style={{ fontSize: "14px", color: "#b8c8df", margin: "17px 0 0" }}>
              All unlocked modules open · Detailed explanations · Repeat practice
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
            <span>Educational quiz. Not an official certification exam.</span>
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
