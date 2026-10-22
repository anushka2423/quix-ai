"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addLessonQuestionAction, createLessonQuestionAction, removeLessonQuestionAction, saveQuestionAction } from "@/app/admin/actions";
import { MODULE_SIZE } from "@/lib/blueprint";
import type { AdminBankQuestion, AdminCourse, AdminLesson, AdminModuleQuizzes } from "@/lib/server/admin-data";
import { questionFieldErrors } from "@/lib/admin-validate";
import { BusyButton, FieldError, btn, btnDanger, btnPrimary, card, input, inputError, label } from "../_components/ui";

const LABELS = ["A", "B", "C", "D"] as const;
const clip = (t: string, n = 140) => (t.length > n ? `${t.slice(0, n).trimEnd()}…` : t);

interface NewDraft {
  /** Set when an existing question is being edited in place */
  id?: number;
  moduleId: number;
  section: string;
  difficulty: string;
  question: string;
  options: [string, string, string, string];
  answer: string[];
  explanation: string;
  moduleOnly: boolean;
  /** The flag when the form opened: sent only when it changed */
  moduleOnlyAtOpen?: boolean;
}
const blank = (course: AdminCourse): NewDraft => ({ moduleId: course.domains[0]?.id ?? 0, section: "", difficulty: "Medium", question: "", options: ["", "", "", ""], answer: [], explanation: "", moduleOnly: true });

type Outcome = { error?: string; id?: number; replaced?: boolean };
/** Runs a server action. `key` names the button that shows the spinner; every button is blocked until the action ends. */
type Panel = { topicId: number; kind: "add" | "new" | "edit" };
type RunFn = (key: string, fn: () => Promise<Outcome>, opts?: { done?: () => void; ok?: (r: Outcome) => string }) => void;

const toEditDraft = (b: AdminBankQuestion): NewDraft => ({ id: b.id, moduleId: b.domainId, section: b.section, difficulty: b.difficulty, question: b.question, options: b.options, answer: b.answer.split(",").filter(Boolean), explanation: b.explanation, moduleOnly: b.moduleOnly, moduleOnlyAtOpen: b.moduleOnly });

/** A button that looks like a plain row. It keeps the browser's own keyboard focus ring. */
const foldBtn: React.CSSProperties = { background: "none", border: "none", font: "inherit", color: "inherit", textAlign: "left", boxSizing: "border-box", width: "100%", cursor: "pointer" };

const pill = (tone: "ok" | "bad" | "muted"): React.CSSProperties => ({
  display: "inline-block", fontSize: 12, fontWeight: 600, padding: "2px 8px", borderRadius: 999, whiteSpace: "nowrap",
  background: tone === "ok" ? "var(--correct-bg)" : tone === "bad" ? "var(--incorrect-bg)" : "#eef1f6",
  color: tone === "ok" ? "var(--correct-text)" : tone === "bad" ? "var(--incorrect-text)" : "var(--muted)",
});

/** Add, write, edit and remove the questions of each lesson of each module (Skill Jar course). Modules and lessons fold away. */
export default function ModuleQuizzesClient({ data }: { data: AdminModuleQuizzes }) {
  const [track, setTrack] = useState<"associate" | "developer">("associate");
  const [openCourses, setOpenCourses] = useState<Set<string>>(new Set());
  const [openLessons, setOpenLessons] = useState<Set<number>>(new Set());
  const [onlyGaps, setOnlyGaps] = useState(false);
  const [find, setFind] = useState("");
  const [panel, setPanel] = useState<Panel | null>(null);
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState<NewDraft | null>(null);
  const [msg, setMsg] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState("");
  const router = useRouter();
  const [pending, start] = useTransition();

  const needle = find.trim().toLowerCase();
  const trackCourses = data.courses.filter((c) => c.track === track);
  const stats = useMemo(() => {
    const lessons = trackCourses.flatMap((c) => c.lessons);
    return { modules: trackCourses.length, lessons: lessons.length, questions: new Set(lessons.flatMap((l) => l.questions.map((q) => q.id))).size, gaps: lessons.filter((l) => !l.questions.length).length };
  }, [trackCourses]);

  // What is shown: the finder narrows by module or lesson name, "needs questions" keeps only lessons without any
  const visible = trackCourses
    .map((course) => {
      const courseHit = !needle || course.name.toLowerCase().includes(needle);
      const lessons = course.lessons.filter((l) => (courseHit || l.name.toLowerCase().includes(needle)) && (!onlyGaps || l.questions.length === 0));
      return { course, lessons, show: lessons.length > 0 || (!onlyGaps && courseHit && course.lessons.length === 0) };
    })
    .filter((x) => x.show);

  const toggle = <T,>(set: Set<T>, v: T): Set<T> => {
    const next = new Set(set);
    if (!next.delete(v)) next.add(v);
    return next;
  };
  const filtering = !!needle || onlyGaps;
  const allCoursesOpen = visible.length > 0 && visible.every((x) => openCourses.has(x.course.name) || filtering);

  function expandAll(open: boolean) {
    setOpenCourses(open ? new Set(visible.map((x) => x.course.name)) : new Set());
    setOpenLessons(open ? new Set(visible.flatMap((x) => x.lessons.map((l) => l.topicId))) : new Set());
  }

  const runIt: RunFn = (key, fn, opts) => {
    setMsg("");
    setNotice("");
    setBusy(key);
    start(async () => {
      try {
        const r = await fn();
        if (r.error) setMsg(`✗ ${r.error}`);
        else {
          opts?.done?.();
          if (opts?.ok) setNotice(opts.ok(r));
          router.refresh();
        }
      } catch {
        setMsg("✗ Could not reach the server. Reload the page, sign in again if asked, and retry.");
      } finally {
        setBusy("");
      }
    });
  };

  function open(topicId: number, kind: Panel["kind"], course: AdminCourse, question?: AdminBankQuestion) {
    setPanel({ topicId, kind });
    setSearch("");
    setMsg("");
    setNotice("");
    setDraft(kind === "new" ? blank(course) : kind === "edit" && question ? toEditDraft(question) : null);
    setOpenLessons((s) => new Set(s).add(topicId));
  }

  return (
    <>
      <div style={{ display: "flex", gap: 8, margin: "0 0 12px", flexWrap: "wrap" }}>
        {(["associate", "developer"] as const).map((t) => (
          <button key={t} style={{ ...btn, ...(track === t ? { background: "var(--navy)", color: "#fff", border: "1px solid var(--navy)" } : {}) }} aria-pressed={track === t} onClick={() => { setTrack(t); setPanel(null); setMsg(""); }}>
            {t === "associate" ? "Associate" : "Developer"}
          </button>
        ))}
      </div>

      <div style={{ ...card, display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center", margin: "0 0 12px", padding: "12px 16px" }}>
        <span style={{ fontSize: 14 }}>
          <strong>{stats.modules}</strong> modules · <strong>{stats.lessons}</strong> lessons · <strong>{stats.questions}</strong> questions
        </span>
        <span style={pill(stats.gaps ? "bad" : "ok")}>{stats.gaps ? `✗ ${stats.gaps} lesson${stats.gaps === 1 ? "" : "s"} with no question` : "✓ every lesson has a question"}</span>
        <span style={{ flex: 1 }} />
        <input value={find} onChange={(e) => setFind(e.target.value)} placeholder="Find a module or lesson" aria-label="Find a module or lesson" style={{ ...input, width: 230 }} />
        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14 }}>
          <input type="checkbox" checked={onlyGaps} onChange={(e) => setOnlyGaps(e.target.checked)} /> Only lessons with no question
        </label>
        <button style={btn} onClick={() => expandAll(!allCoursesOpen)} disabled={filtering}>{allCoursesOpen ? "Collapse all" : "Expand all"}</button>
      </div>
      {notice && <p role="status" style={{ background: "var(--correct-bg)", color: "var(--correct-text)", padding: "8px 12px", borderRadius: 6, fontSize: 14, margin: "0 0 12px" }}>{notice}</p>}
      {msg && <p role="alert" style={{ color: "var(--incorrect-text)", fontSize: 14 }}>{msg}</p>}

      <div style={{ display: "grid", gap: 10 }}>
        {visible.map(({ course, lessons }) => (
          <CourseCard
            key={course.name}
            course={course}
            lessons={lessons}
            data={data}
            expanded={filtering || openCourses.has(course.name)}
            toggleCourse={() => setOpenCourses((s) => toggle(s, course.name))}
            openLessons={openLessons}
            forceOpenLessons={filtering}
            toggleLesson={(id) => setOpenLessons((s) => toggle(s, id))}
            panel={panel}
            search={search}
            setSearch={setSearch}
            draft={draft}
            setDraft={setDraft}
            open={open}
            close={() => setPanel(null)}
            run={runIt}
            pending={pending}
            busy={busy}
          />
        ))}
        {!visible.length && (
          <p style={{ color: "var(--muted)" }}>
            {trackCourses.length ? "Nothing matches. Clear the search or the filter." : "No modules for this track yet. Add submodules under a domain first."}
          </p>
        )}
      </div>
    </>
  );
}

function CourseCard({ course, lessons, data, expanded, toggleCourse, openLessons, forceOpenLessons, toggleLesson, panel, search, setSearch, draft, setDraft, open, close, run, pending, busy }: {
  course: AdminCourse;
  lessons: AdminLesson[];
  data: AdminModuleQuizzes;
  expanded: boolean;
  toggleCourse: () => void;
  openLessons: Set<number>;
  forceOpenLessons: boolean;
  toggleLesson: (id: number) => void;
  panel: Panel | null;
  search: string;
  setSearch: (v: string) => void;
  draft: NewDraft | null;
  setDraft: (d: NewDraft | null) => void;
  open: (topicId: number, kind: Panel["kind"], course: AdminCourse, question?: AdminBankQuestion) => void;
  close: () => void;
  run: RunFn;
  pending: boolean;
  busy: string;
}) {
  const inCourse = useMemo(() => new Set(course.lessons.flatMap((l) => l.questions.map((q) => q.id))), [course]);
  const total = inCourse.size + course.looseCount;
  const covered = course.lessons.filter((l) => l.questions.length > 0).length;
  const gaps = course.lessons.length - covered;
  const panelId = `course-${course.track}-${course.name.replace(/\W+/g, "-")}`;

  return (
    <section style={{ ...card, padding: 0 }}>
      <button
        onClick={toggleCourse}
        aria-expanded={expanded}
        aria-controls={panelId}
        style={{ ...foldBtn, padding: "14px 16px", display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}
      >
        <span aria-hidden style={{ width: 16, color: "var(--muted)" }}>{expanded ? "▾" : "▸"}</span>
        <h2 style={{ fontSize: 17, margin: 0, flex: "1 1 260px" }}>{course.name}</h2>
        <span style={pill(gaps ? "bad" : course.lessons.length ? "ok" : "muted")}>
          {course.lessons.length ? (gaps ? `✗ ${covered} of ${course.lessons.length} lessons covered` : `✓ all ${course.lessons.length} lessons covered`) : "no lessons listed"}
        </span>
        <span style={{ fontSize: 13, color: "var(--muted)" }}>{total} question{total === 1 ? "" : "s"} · a quiz takes {Math.min(MODULE_SIZE, total)}</span>
      </button>

      {expanded && (
        <div id={panelId} style={{ borderTop: "1px solid var(--border)", padding: "8px 16px 14px" }}>
          {course.lessons.length === 0 && (
            <p style={{ fontSize: 13, color: "var(--muted)", margin: "6px 0" }}>
              No lessons are listed for this course yet, so its quiz uses its {course.looseCount} course question{course.looseCount === 1 ? "" : "s"}. Add lessons as Skill Jar topics (with a lesson name) under the domain&apos;s submodule.
            </p>
          )}
          {course.looseCount > 0 && course.lessons.length > 0 && (
            <p style={{ fontSize: 13, color: "var(--muted)", margin: "6px 0" }}>{course.looseCount} question{course.looseCount === 1 ? " is" : "s are"} assigned to this course but to no lesson. A quiz uses them only after the lessons&apos; questions.</p>
          )}
          <div style={{ display: "grid", gap: 6 }}>
            {lessons.map((lesson) => (
              <LessonRow
                key={lesson.topicId}
                lesson={lesson}
                course={course}
                data={data}
                inCourse={inCourse}
                expanded={forceOpenLessons || openLessons.has(lesson.topicId)}
                toggle={() => toggleLesson(lesson.topicId)}
                panel={panel}
                search={search}
                setSearch={setSearch}
                draft={draft}
                setDraft={setDraft}
                open={open}
                close={close}
                run={run}
                pending={pending}
                busy={busy}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function LessonRow({ lesson, course, data, inCourse, expanded, toggle, panel, search, setSearch, draft, setDraft, open, close, run, pending, busy }: {
  lesson: AdminLesson; course: AdminCourse; data: AdminModuleQuizzes; inCourse: Set<number>; expanded: boolean; toggle: () => void;
  panel: Panel | null; search: string; setSearch: (v: string) => void; draft: NewDraft | null; setDraft: (d: NewDraft | null) => void;
  open: (topicId: number, kind: Panel["kind"], course: AdminCourse, question?: AdminBankQuestion) => void; close: () => void; run: RunFn; pending: boolean; busy: string;
}) {
  const n = lesson.questions.length;
  const bankById = new Map(data.bank.map((b) => [b.id, b]));
  const isPanel = panel?.topicId === lesson.topicId;
  const bodyId = `lesson-${lesson.topicId}`;
  return (
    <div style={{ border: "1px solid var(--border)", borderRadius: 6, background: n ? "#fff" : "var(--incorrect-bg)" }}>
      <button
        onClick={toggle}
        aria-expanded={expanded}
        aria-controls={bodyId}
        style={{ ...foldBtn, padding: "9px 12px", display: "flex", gap: 10, alignItems: "center" }}
      >
        <span aria-hidden style={{ width: 14, color: "var(--muted)", fontSize: 13 }}>{expanded ? "▾" : "▸"}</span>
        <strong style={{ flex: 1, fontSize: 15 }}>{lesson.name}</strong>
        <span style={pill(n ? "muted" : "bad")}>{n ? `${n} question${n === 1 ? "" : "s"}` : "✗ no questions"}</span>
      </button>

      {expanded && (
        <div id={bodyId} style={{ padding: "0 12px 12px", borderTop: "1px solid var(--border)" }}>
          <ul style={{ listStyle: "none", margin: "8px 0 0", padding: 0, display: "grid", gap: 6 }}>
            {lesson.questions.map((q) => (
              <li key={q.id} style={{ padding: "6px 8px", background: "var(--canvas)", borderRadius: 6 }}>
               <div style={{ display: "flex", gap: 10, alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ display: "grid", gap: 3, flex: 1, minWidth: 0 }}>
                  <span title={q.question} style={{ fontSize: 14, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{q.question}</span>
                  <span style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center", fontSize: 12, color: "var(--muted)" }}>
                    <span>#{q.id}</span>
                    <span>{q.domain}</span>
                    <span style={pill(q.moduleOnly ? "bad" : "muted")}>{q.moduleOnly ? "module quiz only" : "also in practice modes"}</span>
                  </span>
                </span>
                <span style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  <BusyButton
                    style={{ ...btn, fontSize: 13, padding: "4px 10px" }}
                    block={pending || !bankById.has(q.id)}
                    onClick={() => { const b = bankById.get(q.id); if (b) open(lesson.topicId, "edit", course, b); }}
                  >
                    Edit
                  </BusyButton>
                  <BusyButton
                    style={{ ...btnDanger, fontSize: 13, padding: "4px 10px" }}
                    busy={busy === `remove:${lesson.topicId}:${q.id}`}
                    block={pending}
                    busyLabel="Removing…"
                    onClick={() => window.confirm(`Take question #${q.id} out of "${lesson.name}"? It stays in the question bank.`) && run(`remove:${lesson.topicId}:${q.id}`, () => removeLessonQuestionAction(lesson.topicId, q.id), { ok: () => `✓ Question #${q.id} taken out of “${lesson.name}”. It stays in the question bank.` })}
                  >
                    Remove
                  </BusyButton>
                </span>
               </div>
               {/* Edit opens right under the question it changes; adding opens at the bottom of the lesson */}
               {isPanel && panel?.kind === "edit" && draft?.id === q.id && <NewQuestion key={q.id} lesson={lesson} course={course} draft={draft} setDraft={setDraft} run={run} close={close} pending={pending} busy={busy} />}
              </li>
            ))}
            {!n && <li style={{ fontSize: 13, color: "var(--incorrect-text)" }}>This lesson cannot appear in a module quiz until it has a question.</li>}
          </ul>
          <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
            <BusyButton style={btn} block={pending} onClick={() => (isPanel && panel?.kind === "add" ? close() : open(lesson.topicId, "add", course))}>+ Add from the bank</BusyButton>
            <BusyButton style={btn} block={pending || !course.domains.length} onClick={() => (isPanel && panel?.kind === "new" ? close() : open(lesson.topicId, "new", course))}>+ Write a new question</BusyButton>
          </div>
          {isPanel && panel?.kind === "add" && <AddFromBank lesson={lesson} course={course} data={data} inCourse={inCourse} search={search} setSearch={setSearch} run={run} close={close} pending={pending} busy={busy} />}
          {isPanel && panel?.kind === "new" && draft && <NewQuestion key="new" lesson={lesson} course={course} draft={draft} setDraft={setDraft} run={run} close={close} pending={pending} busy={busy} />}
        </div>
      )}
    </div>
  );
}

function AddFromBank({ lesson, course, data, inCourse, search, setSearch, run, close, pending, busy }: {
  lesson: AdminLesson; course: AdminCourse; data: AdminModuleQuizzes; inCourse: Set<number>; search: string; setSearch: (v: string) => void;
  run: RunFn; close: () => void; pending: boolean; busy: string;
}) {
  const needle = search.trim().toLowerCase();
  const results = data.bank
    .filter((b) => b.track === course.track && !inCourse.has(b.id))
    .filter((b) => !needle || `${b.question} ${b.section} ${b.domain}`.toLowerCase().includes(needle))
    .slice(0, 8);
  return (
    <div style={{ marginTop: 8, padding: 12, background: "var(--canvas)", border: "1px solid var(--border)", borderRadius: 6 }}>
      <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search the question bank (text, sub-skill or domain)" style={input} aria-label="Search the question bank" />
      <p style={{ fontSize: 12, color: "var(--muted)", margin: "6px 0" }}>Questions already in a lesson of this course are not listed: a question is in at most one lesson of a course. It can be in lessons of other courses.</p>
      <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 6 }}>
        {results.map((b) => (
          <li key={b.id} style={{ display: "flex", gap: 8, justifyContent: "space-between", alignItems: "baseline" }}>
            <span style={{ fontSize: 14 }}>
              <span style={{ color: "var(--muted)", fontSize: 12 }}>#{b.id} · {b.domain} · {b.section} · </span>
              {clip(b.question, 120)}
            </span>
            <BusyButton style={{ ...btnPrimary, fontSize: 13, padding: "4px 10px" }} busy={busy === `add:${b.id}`} block={pending} busyLabel="Adding…" onClick={() => run(`add:${b.id}`, () => addLessonQuestionAction(lesson.topicId, b.id), { ok: () => `✓ Question #${b.id} added to “${lesson.name}”.` })}>Add</BusyButton>
          </li>
        ))}
        {!results.length && <li style={{ fontSize: 13, color: "var(--muted)" }}>No matching questions.</li>}
      </ul>
      <BusyButton style={{ ...btn, marginTop: 8 }} block={pending} onClick={close}>Close</BusyButton>
    </div>
  );
}

function NewQuestion({ lesson, course, draft, setDraft, run, close, pending, busy }: {
  lesson: AdminLesson; course: AdminCourse; draft: NewDraft; setDraft: (d: NewDraft | null) => void;
  run: RunFn; close: () => void; pending: boolean; busy: string;
}) {
  const sections = course.domains.find((d) => d.id === draft.moduleId)?.sections ?? [];
  const boxRef = useRef<HTMLDivElement>(null);
  // Block body on purpose: an effect must return nothing or a clean-up function, never scrollIntoView's result
  useEffect(() => {
    boxRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, []);
  const editing = draft.id !== undefined;
  const answer = [...draft.answer].sort().join(",");
  /** Set after a save attempt with empty fields: the fields then show what is missing, and clear as they are filled */
  const [showErrors, setShowErrors] = useState(false);
  const errs = questionFieldErrors(draft, !draft.moduleOnly);
  const shown = showErrors ? errs : null;
  function save() {
    if (errs) {
      setShowErrors(true);
      const first = errs.question ? "qf-question" : errs.section ? "qf-section" : errs.options.findIndex(Boolean) >= 0 ? `qf-opt-${errs.options.findIndex(Boolean)}` : errs.answer ? "qf-opt-0" : "qf-explanation";
      document.getElementById(first)?.focus();
      return;
    }
    const finish = { done: () => { setDraft(null); close(); } };
    if (editing) {
      // Changes the wording, options and answer in place. Its domain, lesson and demo slot are left exactly as they are.
      run("save", () => saveQuestionAction({ id: draft.id, moduleId: draft.moduleId, section: draft.section, difficulty: draft.difficulty, question: draft.question, options: draft.options, answer, explanation: draft.explanation, moduleOnly: draft.moduleOnly === draft.moduleOnlyAtOpen ? undefined : draft.moduleOnly }), { ...finish, ok: (r) => `✓ Question #${r.id} saved.` });
      return;
    }
    run("save", () => createLessonQuestionAction({ topicId: lesson.topicId, moduleId: draft.moduleId, section: draft.section, difficulty: draft.difficulty, question: draft.question, options: draft.options, answer, explanation: draft.explanation, moduleOnly: draft.moduleOnly }), {
      ...finish,
      ok: (r) => (r.replaced ? `✓ A question with exactly this text already existed, so question #${r.id} was overwritten with the new version and kept in “${lesson.name}”.` : `✓ Question #${r.id} added to “${lesson.name}”.`),
    });
  }
  return (
    <div ref={boxRef} style={{ marginTop: 8, padding: 12, background: "#fff", border: "1px solid var(--navy)", borderRadius: 6 }}>
      <strong>{editing ? `Edit question #${draft.id}` : `New question for “${lesson.name}”`}</strong>
      <label style={{ display: "flex", gap: 8, alignItems: "center", margin: "10px 0 0", fontSize: 14 }}>
        <input type="checkbox" checked={draft.moduleOnly} onChange={(e) => setDraft({ ...draft, moduleOnly: e.target.checked })} />
        Module quiz only: keep it out of the diagnostic, sprint, drill and full mock (no sub-skill needed)
      </label>
      <div style={{ display: "grid", gridTemplateColumns: draft.moduleOnly ? "1fr 140px" : "1fr 1fr 140px", gap: 12 }}>
        <div>
          <label style={label}>{editing ? "Domain (fixed once saved)" : "Filed under domain"}</label>
          <select value={draft.moduleId} disabled={editing} onChange={(e) => setDraft({ ...draft, moduleId: Number(e.target.value), section: "" })} style={input}>
            {course.domains.map((d) => <option key={d.id} value={d.id}>{d.title}</option>)}
            {editing && !course.domains.some((d) => d.id === draft.moduleId) && <option value={draft.moduleId}>Domain #{draft.moduleId}</option>}
          </select>
        </div>
        {!draft.moduleOnly && (
          <div>
            <label style={label}>Sub-skill (also used for exam-weighted practice)</label>
            <input id="qf-section" list={`sections-${lesson.topicId}`} value={draft.section} onChange={(e) => setDraft({ ...draft, section: e.target.value })} style={shown?.section ? inputError : input} aria-invalid={!!shown?.section} />
            <FieldError>{shown?.section}</FieldError>
            <datalist id={`sections-${lesson.topicId}`}>{sections.map((s) => <option key={s} value={s} />)}</datalist>
          </div>
        )}
        <div>
          <label style={label}>Difficulty</label>
          <select value={draft.difficulty} onChange={(e) => setDraft({ ...draft, difficulty: e.target.value })} style={input}><option>Easy</option><option>Medium</option><option>Hard</option></select>
        </div>
      </div>
      <label style={label}>Question</label>
      <textarea id="qf-question" value={draft.question} onChange={(e) => setDraft({ ...draft, question: e.target.value })} rows={3} style={shown?.question ? inputError : input} aria-invalid={!!shown?.question} />
      <FieldError>{shown?.question}</FieldError>
      <label style={label}>Options (tick every correct one)</label>
      {LABELS.map((l, i) => (
        <div key={l} style={{ margin: "0 0 6px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "28px 1fr", gap: 8, alignItems: "center" }}>
          <input type="checkbox" aria-label={`Option ${l} is correct`} checked={draft.answer.includes(l)} onChange={(e) => setDraft({ ...draft, answer: e.target.checked ? [...draft.answer, l] : draft.answer.filter((x) => x !== l) })} />
          <input id={`qf-opt-${i}`} value={draft.options[i]} onChange={(e) => { const o = [...draft.options] as NewDraft["options"]; o[i] = e.target.value; setDraft({ ...draft, options: o }); }} style={shown?.options[i] ? inputError : input} aria-invalid={!!shown?.options[i]} placeholder={`Option ${l}`} />
        </div>
        <FieldError>{shown?.options[i]}</FieldError>
        </div>
      ))}
      <FieldError>{shown?.answer}</FieldError>
      <label style={label}>Explanation (shown after every answer; do not mention option letters, options are shuffled)</label>
      <textarea id="qf-explanation" value={draft.explanation} onChange={(e) => setDraft({ ...draft, explanation: e.target.value })} rows={3} style={shown?.explanation ? inputError : input} aria-invalid={!!shown?.explanation} />
      <FieldError>{shown?.explanation}</FieldError>
      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <BusyButton style={btnPrimary} busy={busy === "save"} block={pending} busyLabel="Saving…" onClick={save}>{editing ? "Save changes" : "Save question"}</BusyButton>
        <BusyButton style={btn} block={pending} onClick={() => { setDraft(null); close(); }}>Cancel</BusyButton>
        {shown && <span role="alert" style={{ fontSize: 13, color: "var(--incorrect-text)", alignSelf: "center" }}>Fill in the highlighted fields, then save again.</span>}
      </div>
    </div>
  );
}
