"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteQuestionAction, moveQuestionAction, saveQuestionAction } from "@/app/admin/actions";
import { DEMO_SIZE } from "@/lib/blueprint";
import type { AdminDomain, AdminQuestion } from "@/lib/server/admin-data";
import { questionFieldErrors } from "@/lib/admin-validate";
import { BusyButton, FieldError, btn, btnDanger, btnPrimary, card, input, inputError, label } from "../_components/ui";

const PAGE = 25;
const LABELS = ["A", "B", "C", "D"] as const;

interface Draft {
  id?: number;
  moduleId: number;
  section: string;
  difficulty: string;
  question: string;
  options: [string, string, string, string];
  answer: string[];
  explanation: string;
  submoduleId: number | null;
  topicId: number | null;
  /** The lesson when the form opened, so it is only sent when it changed (the column may not exist before 0012) */
  topicIdAtOpen: number | null;
  demoOrder: number | null;
  moduleOnly: boolean;
  /** The flag when the form opened, so it is only sent when it changed (the column may not exist before 0013) */
  moduleOnlyAtOpen: boolean;
}

const blank = (moduleId: number): Draft => ({ moduleId, section: "", difficulty: "Medium", question: "", options: ["", "", "", ""], answer: [], explanation: "", submoduleId: null, topicId: null, topicIdAtOpen: null, demoOrder: null, moduleOnly: false, moduleOnlyAtOpen: false });

const toDraft = (x: AdminQuestion): Draft => ({ id: x.id, moduleId: x.moduleId, section: x.section, difficulty: x.difficulty, question: x.question, options: x.options, answer: x.answer.split(",").filter(Boolean), explanation: x.explanation, submoduleId: x.submoduleId, topicId: x.topicId, topicIdAtOpen: x.topicId, demoOrder: x.demoOrder, moduleOnly: x.moduleOnly, moduleOnlyAtOpen: x.moduleOnly });

export default function QuestionsClient({ domains, questions, initialDomain, initialEdit = 0 }: { domains: AdminDomain[]; questions: AdminQuestion[]; initialDomain: number; initialEdit?: number }) {
  const [track, setTrack] = useState("");
  const [domain, setDomain] = useState(initialDomain);
  const [sub, setSub] = useState("");
  const [q, setQ] = useState("");
  const [demoOnly, setDemoOnly] = useState(false);
  const [page, setPage] = useState(0);
  const [draft, setDraft] = useState<Draft | null>(() => {
    const x = initialEdit ? questions.find((q) => q.id === initialEdit) : undefined;
    return x ? toDraft(x) : null;
  });
  const [msg, setMsg] = useState("");
  const [notice, setNotice] = useState("");
  /** Set after a save attempt with empty fields: the fields then show what is missing, and clear as they are filled */
  const [showErrors, setShowErrors] = useState(false);
  /** Which action is running, so only its own button shows the spinner while every button is blocked */
  const [busy, setBusy] = useState("");
  const [pending, start] = useTransition();
  const router = useRouter();
  const formRef = useRef<HTMLDivElement>(null);

  const domainById = useMemo(() => new Map(domains.map((d) => [d.id, d])), [domains]);
  const visibleDomains = domains.filter((d) => !track || d.track === track);

  const filtered = questions.filter((x) => {
    const d = domainById.get(x.moduleId);
    if (track && d?.track !== track) return false;
    if (domain && x.moduleId !== domain) return false;
    if (sub && x.section !== sub) return false;
    if (q && !`${x.question} ${x.section}`.toLowerCase().includes(q.toLowerCase())) return false;
    if (demoOnly && x.demoOrder === null) return false;
    return true;
  });
  // Moving only makes sense when the list is exactly one domain in its stored order
  const canReorder = domain !== 0 && !sub && !q && !demoOnly;
  const pageItems = filtered.slice(page * PAGE, page * PAGE + PAGE);
  const subOptions = [...new Set([...(domainById.get(domain)?.subSkills.map((s) => s.name) ?? []), ...questions.filter((x) => !domain || x.moduleId === domain).map((x) => x.section)])].sort();

  // Bring the form into view when it opens, so Edit on a long list visibly does something
  useEffect(() => {
    if (draft) formRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [draft?.id, !!draft]); // eslint-disable-line react-hooks/exhaustive-deps

  function edit(x: AdminQuestion) {
    setDraft(toDraft(x));
    setShowErrors(false);
    setMsg("");
    setNotice("");
  }

  /** Runs a server action with every button blocked until it finishes. A thrown error (session expired, network) is shown, never lost. */
  function run(key: string, fn: () => Promise<{ error?: string; id?: number; replaced?: boolean }>, done: (r: { id?: number; replaced?: boolean }) => void) {
    setMsg("");
    setNotice("");
    setBusy(key);
    start(async () => {
      try {
        const r = await fn();
        if (r.error) setMsg(`✗ ${r.error}`);
        else done(r);
      } catch {
        setMsg("✗ Could not reach the server. Reload the page, sign in again if asked, and retry.");
      } finally {
        setBusy("");
      }
    });
  }

  /** Reloading the page would reopen the form, because the address still says ?edit=ID. Drop it and refresh the data instead. */
  function finish(text: string) {
    if (initialEdit) window.history.replaceState(null, "", `${window.location.pathname}${domain ? `?domain=${domain}` : ""}`);
    setDraft(null);
    setShowErrors(false);
    setNotice(text);
    router.refresh();
  }

  function save() {
    if (!draft) return;
    if (errs) {
      setShowErrors(true);
      setMsg("");
      const first = errs.question ? "qf-question" : errs.section ? "qf-section" : errs.options.findIndex(Boolean) >= 0 ? `qf-opt-${errs.options.findIndex(Boolean)}` : errs.answer ? "qf-opt-0" : "qf-explanation";
      document.getElementById(first)?.focus();
      return;
    }
    const { topicIdAtOpen, moduleOnlyAtOpen, ...rest } = draft;
    run("save", () => saveQuestionAction({ ...rest, topicId: draft.topicId === topicIdAtOpen ? undefined : draft.topicId, moduleOnly: draft.moduleOnly === moduleOnlyAtOpen ? undefined : draft.moduleOnly, answer: [...draft.answer].sort().join(",") }), (r) =>
      finish(r.replaced ? `✓ A question with exactly this text already existed, so question #${r.id} was overwritten with the new version.` : draft.id ? `✓ Question #${draft.id} saved.` : `✓ Question #${r.id} added.`),
    );
  }

  function remove(id: number) {
    if (!window.confirm("Delete this question?")) return;
    run(`delete:${id}`, () => deleteQuestionAction(id), () => { setNotice(`✓ Question #${id} deleted.`); router.refresh(); });
  }

  function move(id: number, direction: "up" | "down") {
    run(`move:${id}:${direction}`, () => moveQuestionAction(id, direction), () => router.refresh());
  }

  const errs = draft ? questionFieldErrors(draft, !draft.moduleOnly) : null;
  const shown = showErrors ? errs : null;
  const dSubs = draft ? (domainById.get(draft.moduleId)?.subSkills ?? []) : [];
  const dSubmodules = draft ? (domainById.get(draft.moduleId)?.submodules ?? []) : [];
  const dLessons = (dSubmodules.find((s) => s.id === draft?.submoduleId)?.topics ?? []).filter((t) => t.id !== undefined && t.lessonTitle.trim());

  return (
    <>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, margin: "0 0 12px" }}>
        <select value={track} onChange={(e) => { setTrack(e.target.value); setDomain(0); setSub(""); setPage(0); }} style={{ ...input, width: 170 }}>
          <option value="">All tracks</option><option value="associate">Associate</option><option value="developer">Developer</option>
        </select>
        <select value={domain} onChange={(e) => { setDomain(Number(e.target.value)); setSub(""); setPage(0); }} style={{ ...input, width: 260 }}>
          <option value={0}>All domains</option>
          {visibleDomains.map((d) => <option key={d.id} value={d.id}>{d.title}</option>)}
        </select>
        <select value={sub} onChange={(e) => { setSub(e.target.value); setPage(0); }} style={{ ...input, width: 220 }}>
          <option value="">All sub-skills</option>
          {subOptions.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <input value={q} onChange={(e) => { setQ(e.target.value); setPage(0); }} placeholder="Search text" style={{ ...input, width: 200 }} />
        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14 }}>
          <input type="checkbox" checked={demoOnly} onChange={(e) => { setDemoOnly(e.target.checked); setPage(0); }} /> Demo picks only
        </label>
        <BusyButton style={btnPrimary} onClick={() => { setDraft(blank(domain || visibleDomains[0]?.id || 0)); setShowErrors(false); setMsg(""); setNotice(""); }} block={!domains.length || pending}>+ New question</BusyButton>
      </div>
      <p style={{ color: "var(--muted)", fontSize: 13, margin: "0 0 12px" }}>{filtered.length} of {questions.length} questions</p>
      {notice && <p role="status" style={{ background: "var(--correct-bg)", color: "var(--correct-text)", padding: "8px 12px", borderRadius: 6, fontSize: 14, margin: "0 0 12px" }}>{notice}</p>}
      {msg && !draft && <p role="alert" style={{ color: "var(--incorrect-text)", fontSize: 14, margin: "0 0 12px" }}>{msg}</p>}

      {draft && (
        <div ref={formRef} style={{ ...card, margin: "0 0 16px", borderColor: "var(--navy)" }}>
          <strong>{draft.id ? `Edit question #${draft.id}` : "New question"}</strong>
          <div style={{ display: "grid", gridTemplateColumns: draft.moduleOnly ? "1fr 140px" : "1fr 1fr 140px", gap: 12 }}>
            <div>
              <label style={label}>Domain</label>
              <select value={draft.moduleId} onChange={(e) => setDraft({ ...draft, moduleId: Number(e.target.value), submoduleId: null, topicId: null, demoOrder: null })} style={input}>
                {domains.map((d) => <option key={d.id} value={d.id}>{d.title} ({d.track ?? "no track"})</option>)}
              </select>
            </div>
            {!draft.moduleOnly && (
              <div>
                <label style={label}>Sub-skill</label>
                <input id="qf-section" list="subskills" value={draft.section} onChange={(e) => setDraft({ ...draft, section: e.target.value })} style={shown?.section ? inputError : input} aria-invalid={!!shown?.section} />
                <FieldError>{shown?.section}</FieldError>
                <datalist id="subskills">{dSubs.map((s) => <option key={s.name} value={s.name} />)}</datalist>
              </div>
            )}
            <div>
              <label style={label}>Difficulty</label>
              <select value={draft.difficulty} onChange={(e) => setDraft({ ...draft, difficulty: e.target.value })} style={input}>
                <option>Easy</option><option>Medium</option><option>Hard</option>
              </select>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <div>
              <label style={label}>Submodule (Skill Jar course shown with the explanation)</label>
              <select value={draft.submoduleId ?? ""} onChange={(e) => setDraft({ ...draft, submoduleId: e.target.value ? Number(e.target.value) : null, topicId: null })} style={input}>
                <option value="">None</option>
                {dSubmodules.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
              </select>
            </div>
            <div>
              <label style={label}>Skill Jar lesson (named in the link under the explanation)</label>
              <select value={draft.topicId ?? ""} onChange={(e) => setDraft({ ...draft, topicId: e.target.value ? Number(e.target.value) : null })} style={input} disabled={!dLessons.length}>
                <option value="">{dLessons.length ? "Course link only" : "No lessons for this submodule"}</option>
                {dLessons.map((t) => <option key={t.id} value={t.id}>{t.lessonTitle}</option>)}
              </select>
            </div>
            <div>
              <label style={label}>Demo position (the domain demo has {DEMO_SIZE} fixed questions)</label>
              <select value={draft.demoOrder ?? ""} onChange={(e) => setDraft({ ...draft, demoOrder: e.target.value ? Number(e.target.value) : null })} style={input}>
                <option value="">Not in the demo</option>
                {Array.from({ length: DEMO_SIZE }, (_, i) => i + 1).map((n) => <option key={n} value={n}>Question {n} of {DEMO_SIZE}</option>)}
              </select>
            </div>
          </div>
          <label style={{ display: "flex", gap: 8, alignItems: "center", margin: "12px 0 0", fontSize: 14 }}>
            <input type="checkbox" checked={draft.moduleOnly} onChange={(e) => setDraft({ ...draft, moduleOnly: e.target.checked })} />
            Module quiz only: keep out of the diagnostic, sprint, drill and full mock (no sub-skill needed)
          </label>
          <label style={label}>Question</label>
          <textarea id="qf-question" value={draft.question} onChange={(e) => setDraft({ ...draft, question: e.target.value })} rows={3} style={shown?.question ? inputError : input} aria-invalid={!!shown?.question} />
          <FieldError>{shown?.question}</FieldError>
          <label style={label}>Options (tick every correct one: more than one makes it a &quot;Select N&quot; item, scored all-or-nothing)</label>
          {LABELS.map((l, i) => (
            <div key={l} style={{ margin: "0 0 6px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "28px 1fr", gap: 8, alignItems: "center" }}>
              <input
                type="checkbox"
                aria-label={`Option ${l} is correct`}
                checked={draft.answer.includes(l)}
                onChange={(e) => setDraft({ ...draft, answer: e.target.checked ? [...draft.answer, l] : draft.answer.filter((x) => x !== l) })}
              />
              <input id={`qf-opt-${i}`} value={draft.options[i]} onChange={(e) => { const o = [...draft.options] as Draft["options"]; o[i] = e.target.value; setDraft({ ...draft, options: o }); }} style={shown?.options[i] ? inputError : input} aria-invalid={!!shown?.options[i]} placeholder={`Option ${l}`} />
            </div>
            <FieldError>{shown?.options[i]}</FieldError>
            </div>
          ))}
          <FieldError>{shown?.answer}</FieldError>
          <label style={label}>Explanation (shown after every answer; do not mention option letters, options are shuffled)</label>
          <textarea id="qf-explanation" value={draft.explanation} onChange={(e) => setDraft({ ...draft, explanation: e.target.value })} rows={3} style={shown?.explanation ? inputError : input} aria-invalid={!!shown?.explanation} />
          <FieldError>{shown?.explanation}</FieldError>
          <div style={{ marginTop: 12, display: "flex", gap: 8, alignItems: "center" }}>
            <BusyButton style={btnPrimary} busy={busy === "save"} block={pending} busyLabel="Saving…" onClick={save}>Save question</BusyButton>
            <BusyButton style={btn} block={pending} onClick={() => setDraft(null)}>Cancel</BusyButton>
            {shown && <span role="alert" style={{ fontSize: 13, color: "var(--incorrect-text)" }}>Fill in the highlighted fields, then save again.</span>}
            {msg && <span style={{ fontSize: 13, color: "var(--incorrect-text)" }}>{msg}</span>}
          </div>
        </div>
      )}

      <div style={{ display: "grid", gap: 8 }}>
        {pageItems.map((x) => {
          const d = domainById.get(x.moduleId);
          return (
            <article key={x.id} style={card}>
              <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 4 }}>
                #{x.id} · {d?.title ?? "unknown domain"} · {x.section} · {x.difficulty} · key {x.answer}{x.explanation ? "" : " · ✗ no explanation"}
                {x.submoduleId !== null && ` · submodule: ${d?.submodules.find((s) => s.id === x.submoduleId)?.title ?? "unknown"}`}
                {x.topicId !== null && ` · lesson: ${d?.submodules.flatMap((s) => s.topics).find((t) => t.id === x.topicId)?.lessonTitle ?? "unknown"}`}
                {x.demoOrder !== null && ` · demo ${x.demoOrder}/${DEMO_SIZE}`}
                {x.moduleOnly && " · module quiz only"}
              </div>
              <div style={{ fontWeight: 600 }}>{x.question}</div>
              <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                <BusyButton style={btn} block={pending} onClick={() => edit(x)}>Edit</BusyButton>
                <BusyButton style={btnDanger} onClick={() => remove(x.id)} busy={busy === `delete:${x.id}`} block={pending} busyLabel="Deleting…">Delete</BusyButton>
                {canReorder && (
                  <>
                    <BusyButton style={btn} onClick={() => move(x.id, "up")} busy={busy === `move:${x.id}:up`} block={pending} aria-label={`Move question ${x.id} up`}>↑</BusyButton>
                    <BusyButton style={btn} onClick={() => move(x.id, "down")} busy={busy === `move:${x.id}:down`} block={pending} aria-label={`Move question ${x.id} down`}>↓</BusyButton>
                  </>
                )}
              </div>
            </article>
          );
        })}
      </div>
      {filtered.length > PAGE && (
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 14 }}>
          <button style={btn} disabled={page === 0} onClick={() => setPage(page - 1)}>← Prev</button>
          <span style={{ fontSize: 13 }}>Page {page + 1} of {Math.ceil(filtered.length / PAGE)}</span>
          <button style={btn} disabled={(page + 1) * PAGE >= filtered.length} onClick={() => setPage(page + 1)}>Next →</button>
        </div>
      )}
    </>
  );
}
