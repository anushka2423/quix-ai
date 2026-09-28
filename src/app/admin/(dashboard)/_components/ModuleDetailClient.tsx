"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { DbModule, DbQuestion } from "@/lib/admin-supabase";
import {
  updateModuleAction,
  createQuestionAction,
  updateQuestionAction,
  deleteQuestionAction,
} from "@/app/admin/actions";

// ── Types ─────────────────────────────────────────────────────────────────────

type QuestionForm = {
  section: string;
  difficulty: string;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  answer: string;
};

type ModuleForm = { title: string; description: string; locked: boolean };

type Panel =
  | { type: "editModule" }
  | { type: "createQuestion" }
  | { type: "editQuestion"; question: DbQuestion };

const EMPTY_Q: QuestionForm = {
  section: "",
  difficulty: "Easy",
  question: "",
  optionA: "",
  optionB: "",
  optionC: "",
  optionD: "",
  answer: "A",
};

const DIFF_COLORS: Record<string, { bg: string; color: string }> = {
  Easy: { bg: "var(--correct-bg)", color: "var(--correct-text)" },
  Medium: { bg: "#fff8e1", color: "#b45309" },
  Hard: { bg: "var(--incorrect-bg)", color: "var(--incorrect-text)" },
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function ModuleDetailClient({
  mod,
  initialQuestions,
}: {
  mod: DbModule;
  initialQuestions: DbQuestion[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [panel, setPanel] = useState<Panel | null>(null);
  const [qForm, setQForm] = useState<QuestionForm>(EMPTY_Q);
  const [mForm, setMForm] = useState<ModuleForm>({
    title: mod.title,
    description: mod.description,
    locked: mod.locked,
  });
  const [formError, setFormError] = useState<string | null>(null);

  // ── Handlers ──────────────────────────────────────────────────────────────

  function openCreateQuestion() {
    setQForm(EMPTY_Q);
    setFormError(null);
    setPanel({ type: "createQuestion" });
  }

  function openEditQuestion(q: DbQuestion) {
    setQForm({
      section: q.section,
      difficulty: q.difficulty,
      question: q.question,
      optionA: q.option_a,
      optionB: q.option_b,
      optionC: q.option_c,
      optionD: q.option_d,
      answer: q.answer,
    });
    setFormError(null);
    setPanel({ type: "editQuestion", question: q });
  }

  function openEditModule() {
    setMForm({ title: mod.title, description: mod.description, locked: mod.locked });
    setFormError(null);
    setPanel({ type: "editModule" });
  }

  function handleSaveModule() {
    if (!mForm.title.trim()) {
      setFormError("Title is required");
      return;
    }
    startTransition(async () => {
      const result = await updateModuleAction({ id: mod.id, ...mForm });
      if (result?.error) {
        setFormError(result.error);
      } else {
        setPanel(null);
        router.refresh();
      }
    });
  }

  function handleSaveQuestion() {
    if (!qForm.question.trim()) {
      setFormError("Question text is required");
      return;
    }
    if (!qForm.optionA || !qForm.optionB || !qForm.optionC || !qForm.optionD) {
      setFormError("All four options are required");
      return;
    }
    startTransition(async () => {
      let result;
      if (panel?.type === "createQuestion") {
        result = await createQuestionAction({ moduleId: mod.id, ...qForm });
      } else if (panel?.type === "editQuestion") {
        result = await updateQuestionAction({
          id: panel.question.id,
          moduleId: mod.id,
          ...qForm,
        });
      }
      if (result?.error) {
        setFormError(result.error);
      } else {
        setPanel(null);
        router.refresh();
      }
    });
  }

  function handleDeleteQuestion(q: DbQuestion) {
    if (!window.confirm(`Delete this question?\n\n"${q.question.slice(0, 80)}…"`)) return;
    startTransition(async () => {
      await deleteQuestionAction(q.id, mod.id);
      router.refresh();
    });
  }

  const panelOpen = panel !== null;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Module info card */}
      <div
        style={{
          margin: "16px 32px 0",
          background: "#fff",
          border: "1px solid var(--border)",
          borderRadius: "var(--r-card)",
          padding: "18px 22px",
          boxShadow: "var(--shadow-card)",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "16px",
        }}
      >
        <div>
          <div
            style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}
          >
            <h2
              style={{
                fontSize: "18px",
                fontWeight: 700,
                color: "var(--ink)",
                margin: 0,
                letterSpacing: "-0.02em",
              }}
            >
              {mod.title}
            </h2>
            <span
              style={{
                padding: "2px 8px",
                borderRadius: "var(--r-pill)",
                fontSize: "11px",
                fontWeight: 600,
                background: mod.locked ? "var(--canvas)" : "var(--correct-bg)",
                color: mod.locked ? "var(--faint)" : "var(--correct-text)",
                border: `1px solid ${mod.locked ? "var(--border)" : "#b7e2cc"}`,
              }}
            >
              {mod.locked ? "Locked" : "Unlocked"}
            </span>
          </div>
          <p style={{ fontSize: "13px", color: "var(--muted)", margin: 0, lineHeight: 1.5 }}>
            {mod.description || "No description"}
          </p>
        </div>
        <button onClick={openEditModule} style={secondaryBtnStyle}>
          Edit Module
        </button>
      </div>

      {/* Questions section */}
      <div style={{ margin: "20px 32px 48px" }}>
        {/* Section header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "14px",
          }}
        >
          <div>
            <h3
              style={{
                fontSize: "15px",
                fontWeight: 700,
                color: "var(--ink)",
                margin: 0,
                letterSpacing: "-0.01em",
              }}
            >
              Questions
            </h3>
            <p style={{ fontSize: "12px", color: "var(--muted)", margin: "2px 0 0" }}>
              {initialQuestions.length} question{initialQuestions.length !== 1 ? "s" : ""}
            </p>
          </div>
          <button onClick={openCreateQuestion} style={primaryBtnStyle}>
            + Add Question
          </button>
        </div>

        {/* Questions table */}
        {initialQuestions.length === 0 ? (
          <div
            style={{
              padding: "48px",
              textAlign: "center",
              color: "var(--faint)",
              fontSize: "14px",
              background: "#fff",
              border: "1.5px dashed var(--border)",
              borderRadius: "var(--r-card)",
            }}
          >
            No questions yet.{" "}
            <button
              onClick={openCreateQuestion}
              style={{
                background: "none",
                border: "none",
                color: "var(--navy)",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: 600,
                padding: 0,
              }}
            >
              Add the first one →
            </button>
          </div>
        ) : (
          <div
            style={{
              background: "#fff",
              border: "1px solid var(--border)",
              borderRadius: "var(--r-card)",
              overflow: "hidden",
              boxShadow: "var(--shadow-card)",
            }}
          >
            {/* Table header */}
            <div style={tableHeaderStyle}>
              <span style={{ ...colStyle, width: "36px" }}>#</span>
              <span style={{ ...colStyle, flex: 1 }}>Question</span>
              <span style={{ ...colStyle, width: "120px" }}>Section</span>
              <span style={{ ...colStyle, width: "90px" }}>Difficulty</span>
              <span style={{ ...colStyle, width: "70px" }}>Answer</span>
              <span style={{ ...colStyle, width: "100px", textAlign: "right" }}>Actions</span>
            </div>

            {/* Table rows */}
            {initialQuestions.map((q, i) => {
              const diff = DIFF_COLORS[q.difficulty] ?? DIFF_COLORS.Easy;
              return (
                <div
                  key={q.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "13px 18px",
                    borderTop: i === 0 ? "none" : "1px solid var(--border)",
                    background: i % 2 === 0 ? "#fff" : "#fafbfd",
                  }}
                >
                  <span
                    style={{
                      width: "36px",
                      fontSize: "12px",
                      color: "var(--faint)",
                      fontWeight: 600,
                      flexShrink: 0,
                    }}
                  >
                    {i + 1}
                  </span>
                  <span
                    style={{
                      flex: 1,
                      fontSize: "13px",
                      color: "var(--ink)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                    title={q.question}
                  >
                    {q.question}
                  </span>
                  <span
                    style={{
                      width: "120px",
                      fontSize: "12px",
                      color: "var(--muted)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                    }}
                    title={q.section}
                  >
                    {q.section || "—"}
                  </span>
                  <span style={{ width: "90px", flexShrink: 0 }}>
                    <span
                      style={{
                        padding: "2px 8px",
                        borderRadius: "var(--r-pill)",
                        fontSize: "11px",
                        fontWeight: 600,
                        background: diff.bg,
                        color: diff.color,
                      }}
                    >
                      {q.difficulty}
                    </span>
                  </span>
                  <span
                    style={{
                      width: "70px",
                      flexShrink: 0,
                      fontSize: "13px",
                      fontWeight: 700,
                      color: "var(--navy)",
                    }}
                  >
                    {q.answer}
                  </span>
                  <div
                    style={{
                      width: "100px",
                      display: "flex",
                      gap: "6px",
                      justifyContent: "flex-end",
                      flexShrink: 0,
                    }}
                  >
                    <button
                      onClick={() => openEditQuestion(q)}
                      style={iconBtnStyle}
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDeleteQuestion(q)}
                      style={{ ...iconBtnStyle, color: "var(--incorrect-text)" }}
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Overlay */}
      {panelOpen && (
        <div
          onClick={() => setPanel(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.4)",
            zIndex: 100,
          }}
        />
      )}

      {/* Slide-over panel */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: "460px",
          background: "#fff",
          zIndex: 101,
          boxShadow: "-4px 0 32px rgba(0,0,0,.14)",
          display: "flex",
          flexDirection: "column",
          transform: panelOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.22s ease",
        }}
      >
        {/* Panel header */}
        <div
          style={{
            padding: "18px 22px",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "16px",
              fontWeight: 700,
              color: "var(--ink)",
              letterSpacing: "-0.02em",
            }}
          >
            {panel?.type === "editModule"
              ? "Edit Module"
              : panel?.type === "createQuestion"
              ? "New Question"
              : "Edit Question"}
          </h2>
          <button
            onClick={() => setPanel(null)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "20px",
              color: "var(--muted)",
              lineHeight: 1,
              padding: "0 4px",
            }}
          >
            ×
          </button>
        </div>

        {/* Form body */}
        <div
          style={{
            flex: 1,
            padding: "22px",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          {panel?.type === "editModule" ? (
            <ModuleFormFields form={mForm} onChange={setMForm} />
          ) : (
            <QuestionFormFields form={qForm} onChange={setQForm} />
          )}

          {formError && (
            <p
              style={{
                margin: 0,
                fontSize: "13px",
                color: "var(--incorrect-text)",
                background: "var(--incorrect-bg)",
                padding: "8px 12px",
                borderRadius: "6px",
              }}
            >
              {formError}
            </p>
          )}
        </div>

        {/* Panel footer */}
        <div
          style={{
            padding: "16px 22px",
            borderTop: "1px solid var(--border)",
            display: "flex",
            gap: "10px",
            justifyContent: "flex-end",
          }}
        >
          <button onClick={() => setPanel(null)} style={secondaryBtnStyle}>
            Cancel
          </button>
          <button
            onClick={panel?.type === "editModule" ? handleSaveModule : handleSaveQuestion}
            disabled={isPending}
            style={{
              ...primaryBtnStyle,
              opacity: isPending ? 0.7 : 1,
              cursor: isPending ? "not-allowed" : "pointer",
            }}
          >
            {isPending ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </>
  );
}

// ── Sub-forms ─────────────────────────────────────────────────────────────────

function ModuleFormFields({
  form,
  onChange,
}: {
  form: ModuleForm;
  onChange: (f: ModuleForm) => void;
}) {
  return (
    <>
      <div>
        <label style={fieldLabelStyle}>Title</label>
        <input
          value={form.title}
          onChange={(e) => onChange({ ...form, title: e.target.value })}
          placeholder="Module title"
          style={fieldInputStyle}
        />
      </div>
      <div>
        <label style={fieldLabelStyle}>Description</label>
        <textarea
          value={form.description}
          onChange={(e) => onChange({ ...form, description: e.target.value })}
          placeholder="What does this module cover?"
          rows={3}
          style={{ ...fieldInputStyle, resize: "vertical" as const }}
        />
      </div>
      <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
        <input
          type="checkbox"
          checked={form.locked}
          onChange={(e) => onChange({ ...form, locked: e.target.checked })}
          style={{ width: "16px", height: "16px", cursor: "pointer" }}
        />
        <span style={{ fontSize: "13px", color: "var(--ink-2)" }}>
          Lock this module
        </span>
      </label>
    </>
  );
}

function QuestionFormFields({
  form,
  onChange,
}: {
  form: QuestionForm;
  onChange: (f: QuestionForm) => void;
}) {
  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        <div>
          <label style={fieldLabelStyle}>Section</label>
          <input
            value={form.section}
            onChange={(e) => onChange({ ...form, section: e.target.value })}
            placeholder="e.g. Technical Foundations"
            style={fieldInputStyle}
          />
        </div>
        <div>
          <label style={fieldLabelStyle}>Difficulty</label>
          <select
            value={form.difficulty}
            onChange={(e) => onChange({ ...form, difficulty: e.target.value })}
            style={fieldInputStyle}
          >
            <option>Easy</option>
            <option>Medium</option>
            <option>Hard</option>
          </select>
        </div>
      </div>

      <div>
        <label style={fieldLabelStyle}>Question</label>
        <textarea
          value={form.question}
          onChange={(e) => onChange({ ...form, question: e.target.value })}
          placeholder="Enter the question text"
          rows={3}
          style={{ ...fieldInputStyle, resize: "vertical" as const }}
        />
      </div>

      <div>
        <label style={fieldLabelStyle}>Option A</label>
        <input
          value={form.optionA}
          onChange={(e) => onChange({ ...form, optionA: e.target.value })}
          placeholder="Option A"
          style={fieldInputStyle}
        />
      </div>
      <div>
        <label style={fieldLabelStyle}>Option B</label>
        <input
          value={form.optionB}
          onChange={(e) => onChange({ ...form, optionB: e.target.value })}
          placeholder="Option B"
          style={fieldInputStyle}
        />
      </div>
      <div>
        <label style={fieldLabelStyle}>Option C</label>
        <input
          value={form.optionC}
          onChange={(e) => onChange({ ...form, optionC: e.target.value })}
          placeholder="Option C"
          style={fieldInputStyle}
        />
      </div>
      <div>
        <label style={fieldLabelStyle}>Option D</label>
        <input
          value={form.optionD}
          onChange={(e) => onChange({ ...form, optionD: e.target.value })}
          placeholder="Option D"
          style={fieldInputStyle}
        />
      </div>

      <div>
        <label style={fieldLabelStyle}>Correct Answer</label>
        <select
          value={form.answer}
          onChange={(e) => onChange({ ...form, answer: e.target.value })}
          style={fieldInputStyle}
        >
          {["A", "B", "C", "D"].map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}

// ── Shared styles ─────────────────────────────────────────────────────────────

const primaryBtnStyle: React.CSSProperties = {
  padding: "8px 16px",
  background: "var(--navy)",
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  fontSize: "13px",
  fontWeight: 600,
  cursor: "pointer",
};

const secondaryBtnStyle: React.CSSProperties = {
  padding: "6px 14px",
  background: "#fff",
  border: "1px solid var(--border)",
  borderRadius: "6px",
  fontSize: "12px",
  fontWeight: 500,
  color: "var(--ink-2)",
  cursor: "pointer",
};

const iconBtnStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  cursor: "pointer",
  fontSize: "14px",
  padding: "2px 4px",
  borderRadius: "4px",
};

const tableHeaderStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  padding: "10px 18px",
  background: "var(--canvas)",
  borderBottom: "1px solid var(--border)",
};

const colStyle: React.CSSProperties = {
  fontSize: "11px",
  fontWeight: 700,
  color: "var(--muted)",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
  flexShrink: 0,
};

const fieldLabelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "12px",
  fontWeight: 600,
  color: "var(--ink-2)",
  marginBottom: "6px",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
};

const fieldInputStyle: React.CSSProperties = {
  width: "100%",
  padding: "9px 12px",
  border: "1px solid var(--border)",
  borderRadius: "8px",
  fontSize: "14px",
  color: "var(--ink)",
  outline: "none",
  boxSizing: "border-box",
  background: "#fff",
};
