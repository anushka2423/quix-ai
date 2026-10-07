"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { DbModule, DbQuestion } from "@/lib/admin-supabase";
import { createQuestionAction, updateQuestionAction } from "@/app/admin/actions";
import { parseAnswer } from "@/lib/answers";
import {
  EMPTY_Q,
  QuestionFormFields,
  questionToForm,
  validateQuestionForm,
  colStyle,
  DIFF_COLORS,
  fieldInputStyle,
  iconBtnStyle,
  primaryBtnStyle,
  secondaryBtnStyle,
  tableHeaderStyle,
  type QuestionForm,
} from "../../_components/question-form";

type Panel = { type: "create" } | { type: "edit"; question: DbQuestion };

export default function QuestionBankClient({
  modules,
  questions,
}: {
  modules: DbModule[];
  questions: DbQuestion[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [panel, setPanel] = useState<Panel | null>(null);
  const [form, setForm] = useState<QuestionForm>(EMPTY_Q);
  const [formError, setFormError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const moduleById = useMemo(() => new Map(modules.map((m) => [m.id, m])), [modules]);

  // Group by module in the same order as the Modules page, then by position
  const sorted = useMemo(() => {
    const rank = new Map(modules.map((m, i) => [m.id, i]));
    return [...questions].sort(
      (a, b) =>
        (rank.get(a.module_id) ?? Infinity) - (rank.get(b.module_id) ?? Infinity) ||
        a.order_index - b.order_index
    );
  }, [modules, questions]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return sorted.filter((q) => {
      if (moduleFilter && q.module_id !== Number(moduleFilter)) return false;
      if (difficultyFilter && q.difficulty !== difficultyFilter) return false;
      const isMulti = parseAnswer(q.answer).length > 1;
      if (typeFilter === "single" && isMulti) return false;
      if (typeFilter === "multi" && !isMulti) return false;
      if (!term) return true;
      return [q.question, q.section, q.option_a, q.option_b, q.option_c, q.option_d]
        .some((text) => text.toLowerCase().includes(term));
    });
  }, [sorted, search, moduleFilter, difficultyFilter, typeFilter]);

  const filtersActive = search || moduleFilter || difficultyFilter || typeFilter;

  function openCreate() {
    // Pre-select the module being filtered on, if any
    setForm({ ...EMPTY_Q, moduleId: moduleFilter ? Number(moduleFilter) : undefined });
    setFormError(null);
    setPanel({ type: "create" });
  }

  function openEdit(q: DbQuestion) {
    setForm(questionToForm(q));
    setFormError(null);
    setPanel({ type: "edit", question: q });
  }

  function handleSave() {
    const invalid = validateQuestionForm(form, true);
    if (invalid) {
      setFormError(invalid);
      return;
    }
    const moduleId = form.moduleId!;
    startTransition(async () => {
      const result =
        panel?.type === "edit"
          ? await updateQuestionAction({ ...form, id: panel.question.id, moduleId })
          : await createQuestionAction({ ...form, moduleId });
      if (result?.error) {
        setFormError(result.error);
      } else {
        setPanel(null);
        router.refresh();
      }
    });
  }

  const panelOpen = panel !== null;

  return (
    <>
      {/* Page header */}
      <div
        style={{
          padding: "28px 32px 0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
        }}
      >
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 700, color: "var(--ink)", margin: 0, letterSpacing: "-0.02em" }}>
            Question Bank
          </h1>
          <p style={{ fontSize: "13px", color: "var(--muted)", margin: "2px 0 0" }}>
            {filtersActive
              ? `${filtered.length} of ${questions.length} questions`
              : `${questions.length} question${questions.length !== 1 ? "s" : ""} across ${modules.length} module${modules.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <button onClick={openCreate} style={primaryBtnStyle} disabled={modules.length === 0}>
          + Add Question
        </button>
      </div>

      {/* Filters */}
      <div
        style={{
          padding: "18px 32px 0",
          display: "grid",
          gridTemplateColumns: "minmax(220px, 1fr) 220px 140px 150px",
          gap: "10px",
        }}
      >
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search questions, options or sections…"
          aria-label="Search questions"
          style={fieldInputStyle}
        />
        <select
          value={moduleFilter}
          onChange={(e) => setModuleFilter(e.target.value)}
          aria-label="Filter by module"
          style={fieldInputStyle}
        >
          <option value="">All modules</option>
          {modules.map((m) => (
            <option key={m.id} value={m.id}>
              {m.title}
            </option>
          ))}
        </select>
        <select
          value={difficultyFilter}
          onChange={(e) => setDifficultyFilter(e.target.value)}
          aria-label="Filter by difficulty"
          style={fieldInputStyle}
        >
          <option value="">All difficulties</option>
          <option>Easy</option>
          <option>Medium</option>
          <option>Hard</option>
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          aria-label="Filter by question type"
          style={fieldInputStyle}
        >
          <option value="">All types</option>
          <option value="single">Single answer</option>
          <option value="multi">Multi-select</option>
        </select>
      </div>

      {/* Questions table */}
      <div style={{ margin: "16px 32px 48px" }}>
        {filtered.length === 0 ? (
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
            {questions.length === 0 ? "No questions yet." : "No questions match these filters."}
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
            <div style={tableHeaderStyle}>
              <span style={{ ...colStyle, width: "44px" }}>ID</span>
              <span style={{ ...colStyle, flex: 1, flexShrink: 1 }}>Question</span>
              <span style={{ ...colStyle, width: "170px" }}>Module</span>
              <span style={{ ...colStyle, width: "130px" }}>Section</span>
              <span style={{ ...colStyle, width: "80px" }}>Difficulty</span>
              <span style={{ ...colStyle, width: "60px" }}>Answer</span>
              <span style={{ ...colStyle, width: "40px", textAlign: "right" }}>Edit</span>
            </div>

            {filtered.map((q, i) => {
              const diff = DIFF_COLORS[q.difficulty] ?? DIFF_COLORS.Easy;
              const mod = moduleById.get(q.module_id);
              return (
                <div
                  key={q.id}
                  onClick={() => openEdit(q)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "12px 18px",
                    borderTop: i === 0 ? "none" : "1px solid var(--border)",
                    background: i % 2 === 0 ? "#fff" : "#fafbfd",
                    cursor: "pointer",
                  }}
                >
                  <span style={{ width: "44px", fontSize: "12px", color: "var(--faint)", fontWeight: 600, flexShrink: 0 }}>
                    {q.id}
                  </span>
                  <span
                    title={q.question}
                    style={{
                      flex: 1,
                      minWidth: 0,
                      fontSize: "13px",
                      color: "var(--ink)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {q.question}
                  </span>
                  <span
                    title={mod?.title}
                    style={{
                      width: "170px",
                      flexShrink: 0,
                      fontSize: "12px",
                      color: "var(--ink-2)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {mod ? `${String(mod.order_index).padStart(2, "0")} · ${mod.title}` : "—"}
                  </span>
                  <span
                    title={q.section}
                    style={{
                      width: "130px",
                      flexShrink: 0,
                      fontSize: "12px",
                      color: "var(--muted)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {q.section || "—"}
                  </span>
                  <span style={{ width: "80px", flexShrink: 0 }}>
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
                  <span style={{ width: "60px", flexShrink: 0, fontSize: "13px", fontWeight: 700, color: "var(--navy)" }}>
                    {q.answer}
                  </span>
                  <span style={{ width: "40px", flexShrink: 0, textAlign: "right" }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openEdit(q);
                      }}
                      style={iconBtnStyle}
                      title="Edit"
                      aria-label={`Edit question ${q.id}`}
                    >
                      ✏️
                    </button>
                  </span>
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
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.4)", zIndex: 100 }}
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
        <div
          style={{
            padding: "18px 22px",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <h2 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "var(--ink)", letterSpacing: "-0.02em" }}>
            {panel?.type === "edit" ? `Edit Question #${panel.question.id}` : "New Question"}
          </h2>
          <button
            onClick={() => setPanel(null)}
            aria-label="Close"
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
          <QuestionFormFields form={form} onChange={setForm} modules={modules} />
          {panel?.type === "edit" && form.moduleId !== panel.question.module_id && (
            <p style={{ margin: 0, fontSize: "12px", color: "var(--muted)" }}>
              Moving to another module places this question at the end of that module.
            </p>
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
            onClick={handleSave}
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
