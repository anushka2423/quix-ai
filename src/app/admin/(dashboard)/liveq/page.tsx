import Link from "next/link";
import { db } from "@/lib/server/db";
import { card, PageHead } from "../_components/ui";

export const dynamic = "force-dynamic";

export default async function LiveQDashboard() {
  const c = db();
  let quizzes: Array<{
    id: string; title: string; status: string; created_at: string;
    session_count?: number; module_count?: number; question_count?: number;
  }> = [];
  let sessions: Array<{
    id: string; quiz_id: string; join_code: string; status: string;
    created_at: string; started_at: string | null; completed_at: string | null;
    participant_count?: number;
  }> = [];
  let dbErr = "";

  if (!c) {
    dbErr = "Supabase is not configured.";
  } else {
    const [qz, ss] = await Promise.all([
      c.from("lq_quizzes").select("id, title, status, created_at").order("created_at", { ascending: false }),
      c.from("lq_sessions").select("id, quiz_id, join_code, status, created_at, started_at, completed_at").order("created_at", { ascending: false }).limit(50),
    ]);
    if (qz.error) dbErr = qz.error.message;
    quizzes = (qz.data ?? []) as typeof quizzes;
    sessions = (ss.data ?? []) as typeof sessions;

    // Augment quiz counts
    if (quizzes.length > 0) {
      const ids = quizzes.map((q) => q.id);
      const [mods, qs, sessCounts] = await Promise.all([
        c.from("lq_modules").select("quiz_id").in("quiz_id", ids),
        c.from("lq_questions").select("quiz_id").in("quiz_id", ids),
        c.from("lq_sessions").select("quiz_id").in("quiz_id", ids),
      ]);
      const modCount = new Map<string, number>();
      const qCount = new Map<string, number>();
      const sCount = new Map<string, number>();
      for (const m of mods.data ?? []) modCount.set(m.quiz_id, (modCount.get(m.quiz_id) ?? 0) + 1);
      for (const q of qs.data ?? []) qCount.set(q.quiz_id, (qCount.get(q.quiz_id) ?? 0) + 1);
      for (const s of sessCounts.data ?? []) sCount.set(s.quiz_id, (sCount.get(s.quiz_id) ?? 0) + 1);
      quizzes = quizzes.map((q) => ({ ...q, module_count: modCount.get(q.id) ?? 0, question_count: qCount.get(q.id) ?? 0, session_count: sCount.get(q.id) ?? 0 }));
    }

    // Augment session participant counts
    if (sessions.length > 0) {
      const sIds = sessions.map((s) => s.id);
      const { data: parts } = await c.from("lq_participants").select("session_id").in("session_id", sIds);
      const pCount = new Map<string, number>();
      for (const p of parts ?? []) pCount.set(p.session_id, (pCount.get(p.session_id) ?? 0) + 1);
      sessions = sessions.map((s) => ({ ...s, participant_count: pCount.get(s.id) ?? 0 }));
    }
  }

  const statusBadge = (status: string) => {
    const colors: Record<string, { bg: string; color: string }> = {
      draft: { bg: "#f0f0f0", color: "#555" },
      published: { bg: "#dbeafe", color: "#1d4ed8" },
      archived: { bg: "#f0f0f0", color: "#888" },
      lobby: { bg: "#fef3c7", color: "#92400e" },
      active: { bg: "#d1fae5", color: "#065f46" },
      paused: { bg: "#fde8d8", color: "#c2410c" },
      completed: { bg: "#e8eaf6", color: "#3730a3" },
    };
    const c = colors[status] ?? { bg: "#f0f0f0", color: "#555" };
    return (
      <span style={{ background: c.bg, color: c.color, padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>
        {status}
      </span>
    );
  };

  return (
    <div style={{ padding: "32px 40px", maxWidth: 1100 }}>
      <PageHead title="Quiz Mode">
        <Link href="/admin/liveq/new" style={{ display: "inline-block", padding: "8px 16px", background: "var(--navy)", color: "#fff", borderRadius: 6, fontSize: 14, fontWeight: 600, textDecoration: "none" }}>
          + Create Quiz
        </Link>
      </PageHead>

      {dbErr && (
        <div style={{ background: "#fff4db", color: "#65501f", padding: "10px 14px", borderRadius: 6, marginBottom: 16 }}>
          {dbErr} — Run <code>supabase/migrations/0002_liveq.sql</code> in the Supabase SQL editor.
        </div>
      )}

      {/* Quizzes */}
      <h2 style={{ fontSize: 18, margin: "0 0 12px" }}>Quizzes ({quizzes.length})</h2>
      {quizzes.length === 0 && !dbErr && (
        <div style={{ ...card, textAlign: "center", padding: "40px 20px", marginBottom: 32 }}>
          <p style={{ margin: "0 0 12px", color: "var(--muted)" }}>No quizzes yet.</p>
          <Link href="/admin/liveq/new" style={{ color: "var(--navy)", fontWeight: 600 }}>Create your first quiz →</Link>
        </div>
      )}
      {quizzes.length > 0 && (
        <div style={{ ...card, padding: 0, overflow: "hidden", marginBottom: 32 }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--canvas)", fontSize: 12, color: "var(--muted)", textAlign: "left" }}>
                <th style={{ padding: "10px 16px" }}>Title</th>
                <th style={{ padding: "10px 16px" }}>Status</th>
                <th style={{ padding: "10px 16px" }}>Modules</th>
                <th style={{ padding: "10px 16px" }}>Questions</th>
                <th style={{ padding: "10px 16px" }}>Sessions</th>
                <th style={{ padding: "10px 16px" }}>Created</th>
                <th style={{ padding: "10px 16px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {quizzes.map((q) => (
                <tr key={q.id} style={{ borderTop: "1px solid var(--border)" }}>
                  <td style={{ padding: "12px 16px", fontWeight: 600 }}>{q.title}</td>
                  <td style={{ padding: "12px 16px" }}>{statusBadge(q.status)}</td>
                  <td style={{ padding: "12px 16px", color: "var(--muted)" }}>{q.module_count ?? 0}</td>
                  <td style={{ padding: "12px 16px", color: "var(--muted)" }}>{q.question_count ?? 0}</td>
                  <td style={{ padding: "12px 16px", color: "var(--muted)" }}>{q.session_count ?? 0}</td>
                  <td style={{ padding: "12px 16px", color: "var(--muted)", fontSize: 13 }}>
                    {new Date(q.created_at).toLocaleDateString()}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {q.status === "draft" && (
                        <Link href={`/admin/liveq/${q.id}/edit`} style={{ color: "var(--navy)", fontSize: 13, textDecoration: "none", fontWeight: 500 }}>Edit</Link>
                      )}
                      {q.status === "published" && (
                        <Link href={`/admin/liveq/${q.id}/edit`} style={{ color: "var(--navy)", fontSize: 13, textDecoration: "none", fontWeight: 500 }}>View / Session</Link>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Sessions */}
      <h2 style={{ fontSize: 18, margin: "0 0 12px" }}>Recent Sessions ({sessions.length})</h2>
      {sessions.length === 0 && !dbErr && (
        <div style={{ ...card, padding: "40px 20px", textAlign: "center" }}>
          <p style={{ margin: 0, color: "var(--muted)" }}>No sessions yet. Publish a quiz and create a session.</p>
        </div>
      )}
      {sessions.length > 0 && (
        <div style={{ ...card, padding: 0, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--canvas)", fontSize: 12, color: "var(--muted)", textAlign: "left" }}>
                <th style={{ padding: "10px 16px" }}>Code</th>
                <th style={{ padding: "10px 16px" }}>Status</th>
                <th style={{ padding: "10px 16px" }}>Participants</th>
                <th style={{ padding: "10px 16px" }}>Started</th>
                <th style={{ padding: "10px 16px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => (
                <tr key={s.id} style={{ borderTop: "1px solid var(--border)" }}>
                  <td style={{ padding: "12px 16px", fontFamily: "monospace", fontWeight: 700, fontSize: 16, letterSpacing: "0.1em" }}>{s.join_code}</td>
                  <td style={{ padding: "12px 16px" }}>{statusBadge(s.status)}</td>
                  <td style={{ padding: "12px 16px", color: "var(--muted)" }}>{s.participant_count ?? 0}</td>
                  <td style={{ padding: "12px 16px", color: "var(--muted)", fontSize: 13 }}>
                    {s.started_at ? new Date(s.started_at).toLocaleString() : "—"}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", gap: 8 }}>
                      {(s.status === "lobby" || s.status === "active" || s.status === "paused") && (
                        <Link href={`/admin/liveq/sessions/${s.id}`} style={{ color: "var(--correct-text)", fontSize: 13, textDecoration: "none", fontWeight: 600 }}>Open →</Link>
                      )}
                      {s.status === "completed" && (
                        <Link href={`/admin/liveq/sessions/${s.id}/results`} style={{ color: "var(--navy)", fontSize: 13, textDecoration: "none", fontWeight: 500 }}>Results</Link>
                      )}
                    </div>
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
