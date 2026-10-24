"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FULL_MOCK_MAX_MINUTES, FULL_MOCK_MAX_QUESTIONS, FULL_MOCK_MIN_MINUTES, FULL_MOCK_MIN_QUESTIONS, MODULE_QUESTION_SECONDS, MODULE_SIZE, TRACKS } from "@/lib/blueprint";
import type { TrackMeta } from "@/lib/bank";
import { startAttempt, startDevFullMock } from "@/lib/client/start";
import { track as trackEvent } from "@/lib/analytics";
import Header from "@/components/Header";

const NAVY = "#071b39";
const BLUE = "#214f91";
const ACCENT = "#ff9b50";

const MODULE_TOTAL = 84; // 23 + 25 + 12 + 12 + 12 across 5 modules

type Screen = "home" | "full-mock-config";

export default function DeveloperTrackClient({ meta }: { meta: TrackMeta }) {
  const router = useRouter();
  const def = TRACKS.developer;

  const [screen, setScreen] = useState<Screen>("home");
  const [questionCount, setQuestionCount] = useState(53);
  const [timerMinutes, setTimerMinutes] = useState(120);
  const [fullBusy, setFullBusy] = useState(false);
  const [moduleBusy, setModuleBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const countRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    trackEvent("track_selected", { track: "developer", via: "page" });
  }, []);

  async function startFullMock() {
    setFullBusy(true);
    setError("");
    const r = await startDevFullMock({ questionCount, timerMinutes });
    if ("id" in r) router.push(`/quiz/${r.id}`);
    else {
      setError(r.error);
      setFullBusy(false);
    }
  }

  async function startModule(name: string) {
    setModuleBusy(name);
    setError("");
    const r = await startAttempt({ track: "developer", mode: "module", module: name, level: 1 });
    if ("id" in r) router.push(`/quiz/${r.id}`);
    else {
      setError(r.error);
      setModuleBusy(null);
    }
  }

  const modules = meta.modules.length > 0 ? meta.modules : [
    { name: "Module 1", description: "MSO Foundations", count: 23 },
    { name: "Module 2", description: "Production-Grade Prompting, Agents & Tool Use", count: 25 },
    { name: "Module 3", description: "Claude Code, MCP & Integration", count: 12 },
    { name: "Module 4", description: "Production Engineering, Evals & Security", count: 12 },
    { name: "Module 5", description: "Accelerators, IP & Deployment", count: 12 },
  ];

  return (
    <>
      <Header />
      <main style={{ background: "#fff" }}>

        {/* ── Hero ── */}
        <section style={{ background: NAVY, color: "white" }}>
          <div className="page-wrap" style={{ padding: "56px 0 60px" }}>
            <Link href="/" style={{ color: "#b5c5dc", fontSize: "14px", textDecoration: "none" }}>← All tracks</Link>
            <p style={{ fontSize: "14px", letterSpacing: "1.4px", fontWeight: 800, color: ACCENT, textTransform: "uppercase", margin: "22px 0 14px", fontFamily: "var(--font-manrope), sans-serif" }}>
              {def.code}
            </p>
            <h1 style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: "clamp(32px, 4vw, 48px)", fontWeight: 800, letterSpacing: "-0.035em", margin: 0, color: "#fff", lineHeight: 1.15 }}>
              {def.name}
            </h1>
            <p style={{ fontSize: "17px", lineHeight: 1.65, color: "#c7d4e7", maxWidth: "640px", margin: "18px 0 0" }}>
              {def.audience} Choose Full Mock Exam to test across all 5 modules, or By Module to practice one course at a time.
            </p>
          </div>
        </section>

        {/* ── Exam Modes ── */}
        <section style={{ padding: "64px 0", background: "#fff" }}>
          <div className="page-wrap">
            <p style={{ fontSize: "14px", letterSpacing: "1px", fontWeight: 800, color: BLUE, textTransform: "uppercase", margin: "0 0 14px", fontFamily: "var(--font-manrope), sans-serif" }}>
              Exam Modes
            </p>
            <h2 style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: "clamp(28px, 3vw, 38px)", fontWeight: 800, color: "var(--ink)", margin: "0 0 32px", letterSpacing: "-0.035em" }}>
              Pick how you want to practice
            </h2>
            {error && <p role="alert" style={{ color: "var(--incorrect-text)", marginBottom: "16px" }}>✗ {error}</p>}

            {screen === "home" && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" }}>

                {/* ── Full Mock Exam ── */}
                <article style={{ border: "1px solid #dce3ed", borderRadius: "12px", padding: "28px 24px", background: "white", display: "flex", flexDirection: "column" }}>
                  <span style={{ color: BLUE, fontSize: "14px", fontWeight: 800, letterSpacing: "1px", marginBottom: "20px", fontFamily: "var(--font-manrope), sans-serif" }}>
                    Exam Rehearsal
                  </span>
                  <h3 style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: "20px", lineHeight: 1.3, fontWeight: 800, color: "var(--ink)", margin: "0 0 10px", letterSpacing: "-0.025em" }}>
                    Full Mock Exam
                  </h3>
                  <p style={{ fontSize: "15px", color: "var(--muted)", lineHeight: 1.7, margin: 0, flex: 1 }}>
                    Questions drawn from all 5 course modules. Set your level, timer, and question count before you start.
                  </p>
                  <span style={{ fontSize: "14px", color: "#654a39", borderTop: "1px solid #dce3ed", paddingTop: "14px", marginTop: "20px" }}>
                    Up to {MODULE_TOTAL} questions · configurable timer
                  </span>
                  <button
                    onClick={() => { setScreen("full-mock-config"); setError(""); }}
                    style={{ width: "100%", marginTop: "14px", padding: "13px 18px", borderRadius: "9px", border: "none", background: ACCENT, color: NAVY, fontWeight: 800, fontSize: "15px", cursor: "pointer", fontFamily: "inherit", minHeight: "48px" }}
                  >
                    Configure →
                  </button>
                </article>

                {/* ── By Module ── */}
                <article style={{ border: "1px solid #dce3ed", borderRadius: "12px", padding: "28px 24px", background: "white", display: "flex", flexDirection: "column" }}>
                  <span style={{ color: BLUE, fontSize: "14px", fontWeight: 800, letterSpacing: "1px", marginBottom: "20px", fontFamily: "var(--font-manrope), sans-serif" }}>
                    Focused Practice
                  </span>
                  <h3 style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: "20px", lineHeight: 1.3, fontWeight: 800, color: "var(--ink)", margin: "0 0 10px", letterSpacing: "-0.025em" }}>
                    By Module
                  </h3>
                  <p style={{ fontSize: "15px", color: "var(--muted)", lineHeight: 1.7, margin: 0, flex: 1 }}>
                    Practice one course module at a time. {MODULE_QUESTION_SECONDS} seconds per question. Pause a question to skip it — it counts as incorrect but gives you 60 seconds to review.
                  </p>
                  <span style={{ fontSize: "14px", color: "#654a39", borderTop: "1px solid #dce3ed", paddingTop: "14px", marginTop: "20px" }}>
                    5 modules · up to {MODULE_SIZE} questions each · {MODULE_QUESTION_SECONDS} sec/question
                  </span>
                  <a
                    href="#by-module"
                    style={{ display: "block", width: "100%", marginTop: "14px", padding: "13px 18px", borderRadius: "9px", border: "1px solid #dce3ed", background: "white", color: "var(--ink)", fontWeight: 700, fontSize: "15px", cursor: "pointer", fontFamily: "inherit", minHeight: "48px", textAlign: "center", textDecoration: "none", boxSizing: "border-box" }}
                  >
                    Browse modules ↓
                  </a>
                </article>
              </div>
            )}

            {/* ── Full Mock Config Screen ── */}
            {screen === "full-mock-config" && (
              <div style={{ maxWidth: "520px" }}>
                <button
                  onClick={() => setScreen("home")}
                  style={{ background: "none", border: "none", padding: 0, marginBottom: "24px", color: BLUE, fontWeight: 700, fontSize: "14px", cursor: "pointer", fontFamily: "inherit", minHeight: "44px" }}
                >
                  ← Back
                </button>
                <div style={{ border: "1px solid #dce3ed", borderRadius: "12px", padding: "32px 28px", background: "white" }}>
                  <h3 style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: "22px", fontWeight: 800, margin: "0 0 24px", letterSpacing: "-0.025em" }}>Configure Full Mock</h3>

                  {/* Level selector */}
                  <div style={{ marginBottom: "24px" }}>
                    <p style={{ fontSize: "13px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".5px", margin: "0 0 10px" }}>Level</p>
                    <div style={{ display: "flex", gap: "8px" }}>
                      {[1, 2, 3].map((lvl) => {
                        const locked = lvl !== 1;
                        return (
                          <button
                            key={lvl}
                            disabled={locked}
                            style={{
                              padding: "10px 20px",
                              borderRadius: "8px",
                              border: "2px solid",
                              borderColor: !locked ? ACCENT : "#dce3ed",
                              background: !locked ? "#fff3e8" : "#f5f7fa",
                              color: !locked ? NAVY : "var(--muted)",
                              fontWeight: 700,
                              fontSize: "14px",
                              cursor: locked ? "not-allowed" : "default",
                              fontFamily: "inherit",
                              opacity: locked ? 0.7 : 1,
                            }}
                          >
                            Level {lvl} {locked ? "🔒" : "✓"}
                          </button>
                        );
                      })}
                    </div>
                    <p style={{ fontSize: "13px", color: "var(--muted)", margin: "8px 0 0" }}>Levels 2 and 3 will be available in a future update.</p>
                  </div>

                  {/* Question count */}
                  <div style={{ marginBottom: "24px" }}>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: "10px" }}>
                      Number of questions
                    </label>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <input
                        ref={countRef}
                        type="range"
                        min={FULL_MOCK_MIN_QUESTIONS}
                        max={Math.min(FULL_MOCK_MAX_QUESTIONS, MODULE_TOTAL)}
                        value={questionCount}
                        onChange={(e) => setQuestionCount(Number(e.target.value))}
                        style={{ flex: 1, accentColor: ACCENT }}
                      />
                      <input
                        type="number"
                        min={FULL_MOCK_MIN_QUESTIONS}
                        max={Math.min(FULL_MOCK_MAX_QUESTIONS, MODULE_TOTAL)}
                        value={questionCount}
                        onChange={(e) => {
                          const v = Math.max(FULL_MOCK_MIN_QUESTIONS, Math.min(Math.min(FULL_MOCK_MAX_QUESTIONS, MODULE_TOTAL), Number(e.target.value)));
                          setQuestionCount(v);
                        }}
                        style={{ width: "68px", padding: "8px 10px", borderRadius: "8px", border: "1.5px solid var(--border)", fontFamily: "inherit", fontSize: "15px", textAlign: "center" }}
                      />
                    </div>
                    <p style={{ fontSize: "13px", color: "var(--muted)", margin: "6px 0 0" }}>
                      Max {MODULE_TOTAL} questions ({modules.length} modules)
                    </p>
                  </div>

                  {/* Timer */}
                  <div style={{ marginBottom: "32px" }}>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: "10px" }}>
                      Time limit (minutes)
                    </label>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <input
                        type="range"
                        min={FULL_MOCK_MIN_MINUTES}
                        max={FULL_MOCK_MAX_MINUTES}
                        value={timerMinutes}
                        onChange={(e) => setTimerMinutes(Number(e.target.value))}
                        style={{ flex: 1, accentColor: ACCENT }}
                      />
                      <input
                        type="number"
                        min={FULL_MOCK_MIN_MINUTES}
                        max={FULL_MOCK_MAX_MINUTES}
                        value={timerMinutes}
                        onChange={(e) => {
                          const v = Math.max(FULL_MOCK_MIN_MINUTES, Math.min(FULL_MOCK_MAX_MINUTES, Number(e.target.value)));
                          setTimerMinutes(v);
                        }}
                        style={{ width: "68px", padding: "8px 10px", borderRadius: "8px", border: "1.5px solid var(--border)", fontFamily: "inherit", fontSize: "15px", textAlign: "center" }}
                      />
                    </div>
                    <p style={{ fontSize: "13px", color: "var(--muted)", margin: "6px 0 0" }}>
                      Recommended: ~{Math.round(timerMinutes / Math.max(1, questionCount) * 60)} seconds per question at current settings
                    </p>
                  </div>

                  <button
                    onClick={() => void startFullMock()}
                    disabled={fullBusy}
                    style={{ width: "100%", padding: "15px 24px", borderRadius: "9px", border: "none", background: fullBusy ? "var(--disabled)" : ACCENT, color: fullBusy ? "#fff" : NAVY, fontWeight: 800, fontSize: "16px", cursor: fullBusy ? "not-allowed" : "pointer", fontFamily: "inherit", minHeight: "52px" }}
                  >
                    {fullBusy ? "Starting…" : `Start Full Mock (${questionCount}Q · ${timerMinutes} min) →`}
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ── By Module ── */}
        <section id="by-module" style={{ padding: "64px 0", background: "#F4F6F9" }}>
          <div className="page-wrap">
            <p style={{ fontSize: "14px", letterSpacing: "1px", fontWeight: 800, color: BLUE, textTransform: "uppercase", margin: "0 0 14px", fontFamily: "var(--font-manrope), sans-serif" }}>
              By Module
            </p>
            <h2 style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: "clamp(24px, 2.6vw, 34px)", fontWeight: 800, color: "var(--ink)", margin: "0 0 8px", letterSpacing: "-0.03em" }}>
              Practice one module at a time
            </h2>
            <p style={{ color: "var(--muted)", margin: "0 0 28px", fontSize: "16px", maxWidth: "640px" }}>
              {MODULE_QUESTION_SECONDS} seconds per question. Pause a question to mark it incorrect and get 60 seconds to study the answer before moving on.
            </p>
            {error && <p role="alert" style={{ color: "var(--incorrect-text)", marginBottom: "16px" }}>✗ {error}</p>}

            <div className="module-grid">
              {modules.map((m) => (
                <article
                  key={m.name}
                  style={{ border: "1px solid #dce3ed", borderRadius: "10px", padding: "24px 20px", background: "white", display: "flex", flexDirection: "column" }}
                >
                  <h3 style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: "18px", lineHeight: 1.35, fontWeight: 800, color: "var(--ink)", margin: "0 0 8px", letterSpacing: "-0.02em" }}>
                    {m.name}
                  </h3>
                  <p style={{ fontSize: "15px", color: "var(--muted)", lineHeight: 1.65, margin: "0 0 16px", flex: 1 }}>{m.description}</p>

                  {/* Level buttons */}
                  <div style={{ display: "flex", gap: "6px", marginBottom: "16px" }}>
                    {[1, 2, 3].map((lvl) => {
                      const locked = lvl !== 1;
                      return (
                        <span
                          key={lvl}
                          style={{
                            padding: "4px 12px",
                            borderRadius: "999px",
                            fontSize: "12px",
                            fontWeight: 700,
                            background: !locked ? "#e8f5e9" : "#f5f7fa",
                            color: !locked ? "#2e7d32" : "var(--muted)",
                            border: `1px solid ${!locked ? "#a5d6a7" : "#dce3ed"}`,
                            letterSpacing: ".3px",
                          }}
                        >
                          {locked ? "🔒 " : ""}Level {lvl}
                        </span>
                      );
                    })}
                  </div>

                  <span style={{ fontSize: "14px", color: "#654a39", borderTop: "1px solid #dce3ed", paddingTop: "14px", marginBottom: "14px" }}>
                    {Math.min(m.count, MODULE_SIZE)} question{Math.min(m.count, MODULE_SIZE) === 1 ? "" : "s"} · {MODULE_QUESTION_SECONDS} sec each · Pause available
                  </span>
                  <button
                    onClick={() => void startModule(m.name)}
                    disabled={!!moduleBusy}
                    style={{
                      width: "100%",
                      padding: "12px 18px",
                      borderRadius: "9px",
                      border: "1px solid #dce3ed",
                      background: "white",
                      color: "var(--ink)",
                      fontWeight: 700,
                      fontSize: "14px",
                      cursor: moduleBusy ? "not-allowed" : "pointer",
                      fontFamily: "inherit",
                      minHeight: "44px",
                    }}
                  >
                    {moduleBusy === m.name ? "Starting…" : "Start Level 1 →"}
                  </button>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}