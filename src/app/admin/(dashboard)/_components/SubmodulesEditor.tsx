"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteSubmoduleAction, reorderSubmodulesAction, saveSubmoduleAction } from "@/app/admin/actions";
import { moveId } from "@/lib/admin-validate";
import type { AdminDomain, AdminSubmodule } from "@/lib/server/admin-data";
import { BusyButton, btn, btnDanger, btnPrimary, card, input, label } from "./ui";

interface Draft {
  id?: number;
  title: string;
  description: string;
  /** Text of the position field, and what it was when the form opened (to send it only when changed) */
  position: string;
  positionAtOpen: string;
  topics: { id?: number; courseTitle: string; lessonTitle: string; url: string }[];
}

const blank = (): Draft => ({ title: "", description: "", position: "", positionAtOpen: "", topics: [{ courseTitle: "", lessonTitle: "", url: "" }] });
const toDraft = (s: AdminSubmodule): Draft => ({ id: s.id, title: s.title, description: s.description, position: s.coursePosition === null ? "" : String(s.coursePosition), positionAtOpen: s.coursePosition === null ? "" : String(s.coursePosition), topics: s.topics.map((t) => ({ ...t })) });

/** Create, edit, delete and reorder the submodules of one domain, with the Skill Jar topics each one links to. */
export default function SubmodulesEditor({ domain }: { domain: AdminDomain }) {
  const [draft, setDraft] = useState<Draft | null>(null);
  const [msg, setMsg] = useState("");
  const router = useRouter();
  const [pending, start] = useTransition();
  const [busy, setBusy] = useState("");
  const list = [...domain.submodules].sort((a, b) => a.order - b.order || a.id - b.id);

  /** `key` names the button that shows the spinner; every button is blocked until the action ends */
  function run(key: string, fn: () => Promise<{ error?: string }>, done?: () => void) {
    setMsg("");
    setBusy(key);
    start(async () => {
      try {
        const r = await fn();
        if (r.error) setMsg(`✗ ${r.error}`);
        else {
          done?.();
          router.refresh();
        }
      } catch {
        setMsg("✗ Could not reach the server. Reload the page and retry.");
      } finally {
        setBusy("");
      }
    });
  }

  function save() {
    if (!draft) return;
    const { position, positionAtOpen, ...rest } = draft;
    const coursePosition = position === positionAtOpen ? undefined : position.trim() === "" ? null : Number(position);
    run("save", () => saveSubmoduleAction({ ...rest, moduleId: domain.id, coursePosition }), () => setDraft(null));
  }

  function remove(s: AdminSubmodule) {
    const note = s.questionCount ? ` ${s.questionCount} question(s) are assigned to it, so this will be refused until they are reassigned.` : "";
    if (!window.confirm(`Delete submodule "${s.title}" and its Skill Jar topics?${note}`)) return;
    run(`delete:${s.id}`, () => deleteSubmoduleAction(s.id));
  }

  function move(s: AdminSubmodule, dir: "up" | "down") {
    const next = moveId(list.map((x) => x.id), s.id, dir);
    if (next) run(`move:${s.id}:${dir}`, () => reorderSubmodulesAction(domain.id, next));
  }

  const setTopic = (i: number, patch: Partial<Draft["topics"][number]>) =>
    draft && setDraft({ ...draft, topics: draft.topics.map((t, j) => (j === i ? { ...t, ...patch } : t)) });

  return (
    <section style={{ marginTop: 28 }}>
      <h2 style={{ fontSize: 18, margin: "0 0 4px" }}>Submodules</h2>
      <p style={{ color: "var(--muted)", fontSize: 13, margin: "0 0 12px" }}>
        Skill Jar courses that teach this domain. They are for navigation and content only: they do not change sub-skills, weights or scoring. Learners see the topic links with the explanation of any question assigned to the submodule.
      </p>

      <div style={{ display: "grid", gap: 8 }}>
        {list.map((s, i) => (
          <article key={s.id} style={card}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <div>
                <strong>{s.title}</strong>
                <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 2 }}>
                  {s.questionCount} question{s.questionCount === 1 ? "" : "s"} · {s.topics.length} Skill Jar topic{s.topics.length === 1 ? "" : "s"}{s.coursePosition !== null ? ` · module list position ${s.coursePosition}` : ""}
                </div>
              </div>
              <div style={{ display: "flex", gap: 6, alignItems: "flex-start" }}>
                <BusyButton style={btn} busy={busy === `move:${s.id}:up`} block={pending || i === 0} onClick={() => move(s, "up")} aria-label={`Move ${s.title} up`}>↑</BusyButton>
                <BusyButton style={btn} busy={busy === `move:${s.id}:down`} block={pending || i === list.length - 1} onClick={() => move(s, "down")} aria-label={`Move ${s.title} down`}>↓</BusyButton>
                <button style={btn} disabled={pending} onClick={() => { setDraft(toDraft(s)); setMsg(""); }}>Edit</button>
                <BusyButton style={btnDanger} busy={busy === `delete:${s.id}`} block={pending} busyLabel="Deleting…" onClick={() => remove(s)}>Delete</BusyButton>
              </div>
            </div>
            {s.description && <p style={{ margin: "8px 0 0", fontSize: 14 }}>{s.description}</p>}
            {s.topics.length > 0 && (
              <ul style={{ margin: "8px 0 0", paddingLeft: 18, fontSize: 13 }}>
                {s.topics.map((t) => (
                  <li key={t.id ?? t.url}>
                    {t.courseTitle}{t.lessonTitle ? `: ${t.lessonTitle}` : ""} · <a href={t.url} target="_blank" rel="noopener noreferrer" style={{ color: "#214f91" }}>link ↗</a>
                  </li>
                ))}
              </ul>
            )}
          </article>
        ))}
        {list.length === 0 && <p style={{ margin: 0, color: "var(--muted)" }}>No submodules for this domain yet.</p>}
      </div>

      {draft ? (
        <div style={{ ...card, marginTop: 12, border: "1px solid var(--navy)" }}>
          <strong>{draft.id ? "Edit submodule" : "New submodule"}</strong>
          <label style={label}>Name (shown to learners; must be unique in this domain)</label>
          <input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} style={input} />
          <label style={label}>Description (optional)</label>
          <textarea value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} rows={2} style={input} />
          <label style={label}>Position in the practice-by-module list (1 = first; same name in several domains: use the same number)</label>
          <input value={draft.position} onChange={(e) => setDraft({ ...draft, position: e.target.value })} inputMode="numeric" style={{ ...input, maxWidth: 140 }} />

          <label style={label}>Skill Jar topics (each needs a course name and a full link)</label>
          <div style={{ display: "grid", gap: 6 }}>
            {draft.topics.map((t, i) => (
              <div key={t.id ?? `new-${i}`} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.4fr auto", gap: 8 }}>
                <input value={t.courseTitle} onChange={(e) => setTopic(i, { courseTitle: e.target.value })} style={input} placeholder="Course" />
                <input value={t.lessonTitle} onChange={(e) => setTopic(i, { lessonTitle: e.target.value })} style={input} placeholder="Lesson (optional)" />
                <input value={t.url} onChange={(e) => setTopic(i, { url: e.target.value })} style={input} placeholder="https://…" inputMode="url" />
                <button style={btn} onClick={() => setDraft({ ...draft, topics: draft.topics.filter((_, j) => j !== i) })} aria-label="Remove topic">×</button>
              </div>
            ))}
          </div>
          <div style={{ margin: "8px 0 12px" }}>
            <button style={btn} onClick={() => setDraft({ ...draft, topics: [...draft.topics, { courseTitle: "", lessonTitle: "", url: "" }] })}>+ Add Skill Jar topic</button>
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <BusyButton style={btnPrimary} busy={busy === "save"} block={pending} busyLabel="Saving…" onClick={save}>Save submodule</BusyButton>
            <button style={btn} disabled={pending} onClick={() => { setDraft(null); setMsg(""); }}>Cancel</button>
          </div>
        </div>
      ) : (
        <div style={{ marginTop: 12 }}>
          <button style={btnPrimary} disabled={pending} onClick={() => { setDraft(blank()); setMsg(""); }}>+ Add submodule</button>
        </div>
      )}
      {msg && <p role="alert" style={{ fontSize: 13, color: "var(--incorrect-text)", margin: "10px 0 0" }}>{msg}</p>}
    </section>
  );
}
