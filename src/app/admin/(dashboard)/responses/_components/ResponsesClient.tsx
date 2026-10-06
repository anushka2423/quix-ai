"use client";

import { useState } from "react";
import type { DbResponse, DetailedAnswer } from "@/lib/admin-supabase";

function parseAnswers(raw: string): DetailedAnswer[] {
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
  } catch {}
  return [];
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) +
    " " + d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

export default function ResponsesClient({ responses }: { responses: DbResponse[] }) {
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

  function toggle(id: number) {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <>
      <div style={{ padding: "28px 32px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 700, color: "var(--ink)", margin: 0, letterSpacing: "-0.02em" }}>
            Responses
          </h1>
          <p style={{ fontSize: "13px", color: "var(--muted)", margin: "2px 0 0" }}>
            {responses.length} submission{responses.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div style={{ padding: "20px 32px 48px" }}>
        {responses.length === 0 ? (
          <div style={{
            padding: "56px",
            textAlign: "center",
            color: "var(--faint)",
            fontSize: "14px",
            background: "#fff",
            border: "1.5px dashed var(--border)",
            borderRadius: "var(--r-card)",
            marginTop: "8px",
          }}>
            No responses yet.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {/* Table header */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 180px 90px 80px 160px 36px",
              gap: "12px",
              padding: "8px 18px",
              fontSize: "11px",
              fontWeight: 700,
              color: "var(--muted)",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}>
              <span>Email</span>
              <span>Module</span>
              <span>Score</span>
              <span>%</span>
              <span>Date</span>
              <span />
            </div>

            {responses.map((r) => {
              const isOpen = !!expanded[r.id];
              const answers = parseAnswers(r.answers);
              const hasDetail = answers.length > 0;

              return (
                <div key={r.id}>
                  {/* Row */}
                  <div
                    onClick={() => hasDetail && toggle(r.id)}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 180px 90px 80px 160px 36px",
                      gap: "12px",
                      padding: "14px 18px",
                      background: "#fff",
                      border: "1px solid var(--border)",
                      borderRadius: isOpen ? "var(--r-card) var(--r-card) 0 0" : "var(--r-card)",
                      boxShadow: "var(--shadow-card)",
                      alignItems: "center",
                      cursor: hasDetail ? "pointer" : "default",
                    }}
                  >
                    <span style={{ fontSize: "13px", color: "var(--ink)", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {r.email}
                    </span>
                    <span style={{ fontSize: "12px", color: "var(--muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {r.module_title}
                    </span>
                    <span style={{ fontSize: "13px", color: "var(--ink)" }}>
                      {r.score}/{r.total}
                    </span>
                    <span style={{
                      display: "inline-block",
                      fontSize: "12px",
                      fontWeight: 600,
                      padding: "2px 8px",
                      borderRadius: "var(--r-pill)",
                      background: r.pct >= 80 ? "var(--correct-bg)" : r.pct >= 50 ? "#fff8e1" : "var(--incorrect-bg)",
                      color: r.pct >= 80 ? "var(--correct-text)" : r.pct >= 50 ? "#b45309" : "var(--incorrect-text)",
                    }}>
                      {r.pct}%
                    </span>
                    <span style={{ fontSize: "12px", color: "var(--faint)" }}>
                      {r.completed_at ? formatDate(r.completed_at) : "—"}
                    </span>
                    <span style={{ fontSize: "14px", color: "var(--faint)", textAlign: "center", transition: "transform 0.15s", transform: isOpen ? "rotate(90deg)" : "none", display: "inline-block" }}>
                      {hasDetail ? "›" : ""}
                    </span>
                  </div>

                  {/* Expanded per-question breakdown */}
                  {isOpen && hasDetail && (
                    <div style={{
                      background: "var(--canvas)",
                      border: "1px solid var(--border)",
                      borderTop: "none",
                      borderRadius: "0 0 var(--r-card) var(--r-card)",
                      overflow: "hidden",
                    }}>
                      {/* Sub-header */}
                      <div style={{
                        display: "grid",
                        gridTemplateColumns: "28px 1fr 60px 100px 100px 70px",
                        gap: "12px",
                        padding: "8px 18px",
                        background: "#f5f7fb",
                        borderBottom: "1px solid var(--border)",
                        fontSize: "10px",
                        fontWeight: 700,
                        color: "var(--muted)",
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                      }}>
                        <span>#</span>
                        <span>Question</span>
                        <span>Section</span>
                        <span>Their answer</span>
                        <span>Correct answer</span>
                        <span>Result</span>
                      </div>

                      {answers.map((a, i) => (
                        <div
                          key={i}
                          style={{
                            display: "grid",
                            gridTemplateColumns: "28px 1fr 60px 100px 100px 70px",
                            gap: "12px",
                            padding: "10px 18px",
                            borderTop: i === 0 ? "none" : "1px solid var(--border)",
                            background: i % 2 === 0 ? "#fff" : "#fafbfd",
                            alignItems: "start",
                          }}
                        >
                          <span style={{ fontSize: "12px", color: "var(--faint)", fontWeight: 600, paddingTop: "2px" }}>
                            {i + 1}
                          </span>
                          <span style={{ fontSize: "13px", color: "var(--ink)", lineHeight: "20px" }}>
                            {a.question}
                          </span>
                          <span style={{ fontSize: "11px", color: "var(--muted)", paddingTop: "2px" }}>
                            {a.section}
                          </span>
                          <span style={{ fontSize: "13px", fontWeight: 500, color: a.isCorrect ? "var(--correct-text)" : "var(--incorrect-text)", paddingTop: "2px" }}>
                            {a.userAnswer || "—"}
                          </span>
                          <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--correct-text)", paddingTop: "2px" }}>
                            {a.correctAnswer}
                          </span>
                          <span style={{
                            display: "inline-block",
                            fontSize: "11px",
                            fontWeight: 600,
                            padding: "2px 8px",
                            borderRadius: "var(--r-pill)",
                            background: a.isCorrect ? "var(--correct-bg)" : "var(--incorrect-bg)",
                            color: a.isCorrect ? "var(--correct-text)" : "var(--incorrect-text)",
                            marginTop: "2px",
                            alignSelf: "start",
                          }}>
                            {a.isCorrect ? "Correct" : "Wrong"}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
