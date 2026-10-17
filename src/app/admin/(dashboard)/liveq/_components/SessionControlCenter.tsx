"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import type { AdminSessionState, AdminParticipantRow } from "@/types/liveq";

const btn: React.CSSProperties = {
  padding: "8px 16px", borderRadius: 6, border: "1px solid var(--border)",
  background: "#fff", cursor: "pointer", fontFamily: "inherit", fontSize: 14, fontWeight: 600, color: "var(--ink)",
};
const btnPrimary: React.CSSProperties = { ...btn, background: "var(--navy)", borderColor: "var(--navy)", color: "#fff" };
const btnGreen: React.CSSProperties = { ...btn, background: "#15803d", borderColor: "#15803d", color: "#fff", fontSize: 16, padding: "12px 28px" };
const btnDanger: React.CSSProperties = { ...btn, color: "var(--incorrect-text)", borderColor: "var(--incorrect-text)" };
const card: React.CSSProperties = { background: "#fff", border: "1px solid var(--border)", borderRadius: 8, padding: 20 };
const statBox: React.CSSProperties = { ...card, textAlign: "center", flex: 1, minWidth: 100 };

function Countdown({ deadline, remaining }: { deadline: string | null; remaining: number | null }) {
  const [secs, setSecs] = useState<number | null>(null);

  useEffect(() => {
    if (remaining !== null) { setSecs(remaining); return; }
    if (!deadline) { setSecs(null); return; }
    const update = () => {
      const diff = Math.max(0, Math.ceil((new Date(deadline).getTime() - Date.now()) / 1000));
      setSecs(diff);
    };
    update();
    const id = setInterval(update, 500);
    return () => clearInterval(id);
  }, [deadline, remaining]);

  if (secs === null) return null;
  const danger = secs <= 10;
  return (
    <span style={{ color: danger ? "var(--incorrect-text)" : "var(--correct-text)", fontWeight: 700, fontSize: 32 }}>
      {secs}s
    </span>
  );
}

export default function SessionControlCenter({ sessionId }: { sessionId: string }) {
  const [state, setState] = useState<AdminSessionState | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchState = useCallback(async () => {
    try {
      const res = await fetch(`/api/liveq/admin/sessions/${sessionId}`);
      if (!res.ok) return;
      const data: AdminSessionState = await res.json();
      setState(data);
    } catch { /* ignore */ }
  }, [sessionId]);

  // Generate QR code on client
  useEffect(() => {
    const siteUrl = typeof window !== "undefined" ? window.location.origin : "";
    if (!state?.session?.join_code || !siteUrl) return;
    const url = `${siteUrl}/liveq?code=${state.session.join_code}`;
    // Use QR API server endpoint
    fetch(`/api/liveq/qr?url=${encodeURIComponent(url)}`)
      .then((r) => r.json())
      .then((d) => { if (d.svg) setQrDataUrl(`data:image/svg+xml;base64,${btoa(d.svg)}`); })
      .catch(() => {});
  }, [state?.session?.join_code]);

  useEffect(() => {
    fetchState();
    pollRef.current = setInterval(fetchState, 2000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [fetchState]);

  const action = useCallback(async (path: string, body?: Record<string, unknown>) => {
    setBusy(true);
    setError("");
    try {
      const res = await fetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = await res.json();
      if (!res.ok) setError(data.error ?? "Action failed");
      await fetchState();
    } catch { setError("Network error"); }
    finally { setBusy(false); }
  }, [fetchState]);

  const copyJoinLink = () => {
    if (!state?.session?.join_code) return;
    const url = `${window.location.origin}/liveq?code=${state.session.join_code}`;
    navigator.clipboard.writeText(url).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  if (!state) return <div style={{ padding: 40 }}>Loading session…</div>;

  const { session, quiz_snapshot, participants, current_question } = state;
  const joinUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/liveq?code=${session.join_code}`;

  return (
    <div style={{ padding: "32px 40px", maxWidth: 1100 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 4 }}>
            <Link href="/admin/liveq" style={{ color: "var(--muted)" }}>← Quiz Mode</Link>
          </div>
          <h1 style={{ fontSize: 26, margin: 0 }}>{quiz_snapshot.title}</h1>
          <div style={{ marginTop: 4, display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{
              background: session.status === "active" ? "#d1fae5" : session.status === "completed" ? "#e8eaf6" : "#fef3c7",
              color: session.status === "active" ? "#065f46" : session.status === "completed" ? "#3730a3" : "#92400e",
              padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 700, textTransform: "uppercase",
            }}>{session.status}</span>
          </div>
        </div>
        {session.status === "completed" && (
          <Link href={`/admin/liveq/sessions/${sessionId}/results`} style={{ ...btnPrimary, textDecoration: "none", display: "inline-block" }}>
            View Results →
          </Link>
        )}
      </div>

      {error && <div style={{ background: "var(--incorrect-bg)", color: "var(--incorrect-text)", padding: "10px 14px", borderRadius: 6, marginBottom: 16 }}>{error}</div>}

      {/* Lobby view */}
      {session.status === "lobby" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
          {/* Join info */}
          <div style={card}>
            <h2 style={{ fontSize: 18, margin: "0 0 16px" }}>Join Information</h2>
            <div style={{ textAlign: "center", marginBottom: 16 }}>
              <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 4 }}>Join Code</div>
              <div style={{ fontSize: 48, fontFamily: "monospace", fontWeight: 900, letterSpacing: "0.15em", color: "var(--navy)" }}>
                {session.join_code}
              </div>
            </div>
            {qrDataUrl && (
              <div style={{ textAlign: "center", marginBottom: 16 }}>
                <img src={qrDataUrl} alt="QR code" width={160} height={160} />
              </div>
            )}
            <div style={{ fontSize: 13, color: "var(--muted)", wordBreak: "break-all", marginBottom: 12 }}>{joinUrl}</div>
            <div style={{ display: "flex", gap: 8 }}>
              <button style={btn} onClick={copyJoinLink}>{copied ? "Copied!" : "Copy Join Link"}</button>
              <button style={btn} onClick={() => navigator.clipboard.writeText(session.join_code)}>Copy Code</button>
            </div>
          </div>

          {/* Participant list */}
          <div style={card}>
            <h2 style={{ fontSize: 18, margin: "0 0 16px" }}>
              Participants Joined: <span style={{ color: "var(--navy)" }}>{participants.length}</span>
            </h2>
            <div style={{ maxHeight: 300, overflowY: "auto" }}>
              {participants.length === 0 && <p style={{ color: "var(--muted)", fontSize: 14 }}>Waiting for participants to join…</p>}
              {participants.map((p) => (
                <div key={p.id} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--border)", fontSize: 14 }}>
                  <span>{p.display_name}</span>
                  <span style={{ color: "var(--muted)", fontSize: 12 }}>{new Date(p.joined_at).toLocaleTimeString()}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 20 }}>
              <button
                style={{ ...btnGreen, width: "100%" }}
                disabled={busy || participants.length === 0}
                onClick={() => {
                  if (confirm(`Start the quiz with ${participants.length} participant${participants.length === 1 ? "" : "s"}?`)) {
                    action(`/api/liveq/admin/sessions/${sessionId}/start`);
                  }
                }}
              >
                {busy ? "Starting…" : `Start Quiz (${participants.length})`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active / Paused view */}
      {(session.status === "active" || session.status === "paused") && (
        <>
          {/* Stats row */}
          <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
            <div style={statBox}>
              <div style={{ fontSize: 28, fontWeight: 700, color: "var(--navy)" }}>{participants.length}</div>
              <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>Participants</div>
            </div>
            <div style={statBox}>
              <div style={{ fontSize: 28, fontWeight: 700 }}>
                {current_question ? `${current_question.index + 1}/${quiz_snapshot.modules.flatMap((m) => m.questions).length}` : "—"}
              </div>
              <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>Question Progress</div>
            </div>
            <div style={statBox}>
              <div style={{ fontSize: 28, fontWeight: 700, color: "var(--correct-text)" }}>{state.submission_count}</div>
              <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>Submitted</div>
            </div>
            <div style={statBox}>
              <div style={{ fontSize: 28, fontWeight: 700, color: "var(--muted)" }}>{participants.length - state.submission_count}</div>
              <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>Pending</div>
            </div>
            <div style={statBox}>
              {session.status === "paused" ? (
                <>
                  <div style={{ fontSize: 24, fontWeight: 700, color: "#c2410c" }}>{session.question_remaining_secs}s</div>
                  <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>Paused</div>
                </>
              ) : (
                <Countdown deadline={session.question_deadline} remaining={null} />
              )}
            </div>
          </div>

          {/* Current question */}
          {current_question && (
            <div style={{ ...card, marginBottom: 20 }}>
              <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 4 }}>{current_question.module_title}</div>
              <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 12 }}>{current_question.question}</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {current_question.options.map((o) => (
                  <span key={o.label} style={{ padding: "4px 12px", border: "1px solid var(--border)", borderRadius: 4, fontSize: 13 }}>
                    <strong>{o.label}</strong>: {o.text}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Controls */}
          <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
            {session.status === "active" && (
              <button style={btn} disabled={busy} onClick={() => action(`/api/liveq/admin/sessions/${sessionId}/pause`)}>
                ⏸ Pause
              </button>
            )}
            {session.status === "paused" && (
              <button style={btnPrimary} disabled={busy} onClick={() => action(`/api/liveq/admin/sessions/${sessionId}/resume`)}>
                ▶ Resume
              </button>
            )}
            <button style={btnDanger} disabled={busy} onClick={() => {
              if (confirm("End the quiz early? This will finalize scores with current progress.")) {
                action(`/api/liveq/admin/sessions/${sessionId}/end`);
              }
            }}>
              End Quiz
            </button>
          </div>

          {/* Participant list with scores */}
          <div style={card}>
            <h3 style={{ margin: "0 0 12px", fontSize: 16 }}>Live Scores</h3>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ fontSize: 12, color: "var(--muted)", textAlign: "left" }}>
                  <th style={{ padding: "6px 12px" }}>Name</th>
                  <th style={{ padding: "6px 12px" }}>Score</th>
                  <th style={{ padding: "6px 12px" }}>Last seen</th>
                </tr>
              </thead>
              <tbody>
                {[...participants].sort((a, b) => b.score - a.score).map((p) => (
                  <tr key={p.id} style={{ borderTop: "1px solid var(--border)" }}>
                    <td style={{ padding: "8px 12px" }}>{p.display_name}</td>
                    <td style={{ padding: "8px 12px", fontWeight: 700 }}>{p.score}</td>
                    <td style={{ padding: "8px 12px", fontSize: 12, color: "var(--muted)" }}>
                      {new Date(p.last_seen_at).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Completed view */}
      {session.status === "completed" && (
        <div style={{ ...card, textAlign: "center", padding: 40 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🎉</div>
          <h2 style={{ margin: "0 0 8px" }}>Quiz Completed!</h2>
          <p style={{ color: "var(--muted)", margin: "0 0 20px" }}>{participants.length} participants · Completed {session.completed_at ? new Date(session.completed_at).toLocaleString() : ""}</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <Link href={`/admin/liveq/sessions/${sessionId}/results`} style={{ ...btnPrimary, textDecoration: "none", display: "inline-block" }}>
              View Full Results →
            </Link>
            <button style={btn} onClick={() => action(`/api/liveq/admin/sessions/${sessionId}/publish-results`)}>
              Publish Results to Participants
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
