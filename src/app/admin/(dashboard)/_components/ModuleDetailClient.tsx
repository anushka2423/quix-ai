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
import {
  EMPTY_Q,
  QuestionFormFields,
  questionToForm,
  validateQuestionForm,
  colStyle,
  DIFF_COLORS,
  fieldInputStyle,
  fieldLabelStyle,
  iconBtnStyle,
  primaryBtnStyle,
  secondaryBtnStyle,
  tableHeaderStyle,
  type QuestionForm,
} from "./question-form";

// ── Types ─────────────────────────────────────────────────────────────────────

type ModuleForm = { title: string; description: string; locked: boolean };

type Panel =
  | { type: "editModule" }
  | { type: "createQuestion" }
  | { type: "editQuestion"; question: DbQuestion };

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
    setQForm(questionToForm(q));
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
    const invalid = validateQuestionForm(qForm);
    if (invalid) {
      setFormError(invalid);
      return;
    }
    startTransition(async () => {
      let result;
      if (panel?.type === "createQuestion") {
        result = await createQuestionAction({ ...qForm, moduleId: mod.id });
      } else if (panel?.type === "editQuestion") {
        result = await updateQuestionAction({
          ...qForm,
          id: panel.question.id,
          moduleId: mod.id,
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
