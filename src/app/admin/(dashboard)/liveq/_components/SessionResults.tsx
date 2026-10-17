"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { AdminResultsPayload, LeaderboardEntry, ConceptCohortRow } from "@/types/liveq";

const card: React.CSSProperties = { background: "#fff", border: "1px solid var(--border)", borderRadius: 8, padding: 20 };
const statBox: React.CSSProperties = { ...card, textAlign: "center", flex: 1 };

function conceptStatusColor(accuracy: number) {
  if (accuracy >= 0.8) return { bg: "var(--correct-bg)", color: "var(--correct-text)" };
  if (accuracy >= 0.6) return { bg: "#fef3c7", color: "#92400e" };
  return { bg: "var(--incorrect-bg)", color: "var(--incorrect-text)" };
}

export default function SessionResults({ sessionId }: { sessionId: string }) {
  const [data, setData] = useState<AdminResultsPayload | null>(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);

  useEffect(() => {
    fetch(`/api/liveq/admin/sessions/${sessionId}/results`)
      .then((r) => { if (!r.ok) throw new Error("Failed to load"); return r.json(); })
      .then(setData)
      .catch((e) => setError(e.message));
  }, [sessionId]);

  const publishResults = async () => {
    setPublishing(true);
    await fetch(`/api/liveq/admin/sessions/${sessionId}/publish-results`, { method: "POST" });
    setPublished(true);
    setPublishing(false);
  };

  if (error) return <div style={{ padding: 40, color: "var(--incorrect-text)" }}>Error: {error}</div>;
  if (!data) return <div style={{ padding: 40 }}>Loading results…</div>;

  const { session, quiz_snapshot, leaderboard, stats, concept_cohort, most_missed } = data;
  const top3 = leaderboard.slice(0, 3);

  const filtered = leaderboard.filter((e) =>
    !search || e.display_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: "32px 40px", maxWidth: 1100 }}>
      <div style={{ marginBottom: 6, fontSize: 13, color: "var(--muted)" }}>
        <Link href="/admin/liveq" style={{ color: "var(--muted)" }}>← Quiz Mode</Link>
        {" / "}
        <Link href={`/admin/liveq/sessions/${sessionId}`} style={{ color: "var(--muted)" }}>Session</Link>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, margin: 0 }}>{quiz_snapshot.title} — Results</h1>
        <div style={{ display: "flex", gap: 8 }}>
          {!session.results_published && !published && (
            <button
              style={{ padding: "8px 14px", borderRadius: 6, border: "1px solid var(--navy)", background: "var(--navy)", color: "#fff", cursor: "pointer", fontFamily: "inherit", fontSize: 14, fontWeight: 600 }}
              onClick={publishResults} disabled={publishing}
            >
              {publishing ? "Publishing…" : "Publish to Participants"}
            </button>
          )}
          {(session.results_published || published) && (
            <span style={{ padding: "8px 14px", borderRadius: 6, background: "var(--correct-bg)", color: "var(--correct-text)", fontSize: 14, fontWeight: 600 }}>✓ Results Published</span>
          )}
          <a
            href={`/api/liveq/admin/sessions/${sessionId}/export`}
            style={{ padding: "8px 14px", borderRadius: 6, border: "1px solid var(--border)", background: "#fff", color: "var(--ink)", textDecoration: "none", fontSize: 14, fontWeight: 600 }}
          >
            Export CSV
          </a>
        </div>
      </div>

      {/* Summary stats */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
        <div style={statBox}>
          <div style={{ fontSize: 32, fontWeight: 700, color: "var(--navy)" }}>{stats.total_participants}</div>
          <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>Participants</div>
        </div>
        <div style={statBox}>
          <div style={{ fontSize: 32, fontWeight: 700 }}>{stats.highest_score}</div>
          <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>Highest Score</div>
        </div>
        <div style={statBox}>
          <div style={{ fontSize: 32, fontWeight: 700 }}>{Math.round(stats.avg_score)}</div>
          <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>Avg Score</div>
        </div>
        <div style={statBox}>
          <div style={{ fontSize: 32, fontWeight: 700 }}>{stats.lowest_score}</div>
          <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>Lowest Score</div>
        </div>
        <div style={statBox}>
          <div style={{ fontSize: 32, fontWeight: 700 }}>{Math.round(stats.avg_accuracy * 100)}%</div>
          <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>Avg Accuracy</div>
        </div>
      </div>

      {/* Top 3 podium */}
      {top3.length > 0 && (
        <div style={{ ...card, marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, margin: "0 0 16px" }}>Top Performers</h2>
          <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
            {top3.map((e, i) => (
              <div key={e.participant_id} style={{
                textAlign: "center", padding: "16px 24px", borderRadius: 8,
                background: i === 0 ? "#fef9c3" : i === 1 ? "#f1f5f9" : "#fef3ed",
                flex: 1,
              }}>
                <div style={{ fontSize: 28 }}>{i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉"}</div>
                <div style={{ fontWeight: 700, fontSize: 15, margin: "8px 0 4px" }}>{e.display_name}</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: "var(--navy)" }}>{e.score} pts</div>
                <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>{Math.round(e.accuracy * 100)}% accuracy</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Leaderboard */}
      <div style={{ ...card, marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h2 style={{ fontSize: 18, margin: 0 }}>Full Leaderboard</h2>
          <input
            style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid var(--border)", fontSize: 13, width: 200 }}
            placeholder="Search by name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ fontSize: 12, color: "var(--muted)", textAlign: "left" }}>
              <th style={{ padding: "8px 12px" }}>Rank</th>
              <th style={{ padding: "8px 12px" }}>Name</th>
              <th style={{ padding: "8px 12px" }}>Score</th>
              <th style={{ padding: "8px 12px" }}>Correct</th>
              <th style={{ padding: "8px 12px" }}>Incorrect</th>
              <th style={{ padding: "8px 12px" }}>Unanswered</th>
              <th style={{ padding: "8px 12px" }}>Accuracy</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((e) => (
              <tr key={e.participant_id} style={{ borderTop: "1px solid var(--border)" }}>
                <td style={{ padding: "10px 12px", fontWeight: 700, color: e.rank <= 3 ? "var(--navy)" : "var(--ink)" }}>#{e.rank}</td>
                <td style={{ padding: "10px 12px" }}>{e.display_name}</td>
                <td style={{ padding: "10px 12px", fontWeight: 700 }}>{e.score}</td>
                <td style={{ padding: "10px 12px", color: "var(--correct-text)" }}>{e.correct_count}</td>
                <td style={{ padding: "10px 12px", color: "var(--incorrect-text)" }}>{e.incorrect_count}</td>
                <td style={{ padding: "10px 12px", color: "var(--muted)" }}>{e.unanswered_count}</td>
                <td style={{ padding: "10px 12px" }}>{Math.round(e.accuracy * 100)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Concept cohort analytics */}
      <div style={{ ...card, marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, margin: "0 0 16px" }}>Concept-Wise Cohort Performance</h2>
        {concept_cohort.length === 0 && <p style={{ color: "var(--muted)", fontSize: 14 }}>No concept data available.</p>}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
          {concept_cohort.sort((a, b) => a.cohort_accuracy - b.cohort_accuracy).map((c) => {
            const { bg, color } = conceptStatusColor(c.cohort_accuracy);
            return (
              <div key={c.concept} style={{ background: bg, borderRadius: 8, padding: 14 }}>
                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{c.concept}</div>
                <div style={{ fontSize: 24, fontWeight: 700, color }}>{Math.round(c.cohort_accuracy * 100)}%</div>
                <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
                  {c.participant_count} participants
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Most missed questions */}
      {most_missed.length > 0 && (
        <div style={card}>
          <h2 style={{ fontSize: 18, margin: "0 0 16px" }}>Most Missed Questions</h2>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ fontSize: 12, color: "var(--muted)", textAlign: "left" }}>
                <th style={{ padding: "8px 12px" }}>Question</th>
                <th style={{ padding: "8px 12px" }}>Module</th>
                <th style={{ padding: "8px 12px" }}>Concept</th>
                <th style={{ padding: "8px 12px" }}>Miss Rate</th>
              </tr>
            </thead>
            <tbody>
              {most_missed.map((q) => (
                <tr key={q.question_id} style={{ borderTop: "1px solid var(--border)" }}>
                  <td style={{ padding: "10px 12px", fontSize: 14, maxWidth: 400 }}>{q.question_text}</td>
                  <td style={{ padding: "10px 12px", fontSize: 13, color: "var(--muted)" }}>{q.module_title}</td>
                  <td style={{ padding: "10px 12px", fontSize: 13 }}>{q.concept}</td>
                  <td style={{ padding: "10px 12px", fontWeight: 700, color: "var(--incorrect-text)" }}>
                    {Math.round(q.miss_rate * 100)}% ({q.miss_count}/{q.total_responses})
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
