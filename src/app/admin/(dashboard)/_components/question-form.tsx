"use client";

import { formatAnswer, parseAnswer } from "@/lib/answers";
import type { DbModule, DbQuestion } from "@/lib/admin-supabase";

// Question form shared by the module editor and the question bank

export type QuestionForm = {
  section: string;
  difficulty: string;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  answer: string;
  moduleId?: number;
};

export const EMPTY_Q: QuestionForm = {
  section: "",
  difficulty: "Easy",
  question: "",
  optionA: "",
  optionB: "",
  optionC: "",
  optionD: "",
  answer: "A",
};

export const DIFF_COLORS: Record<string, { bg: string; color: string }> = {
  Easy: { bg: "var(--correct-bg)", color: "var(--correct-text)" },
  Medium: { bg: "#fff8e1", color: "#b45309" },
  Hard: { bg: "var(--incorrect-bg)", color: "var(--incorrect-text)" },
};

export function questionToForm(q: DbQuestion): QuestionForm {
  return {
    moduleId: q.module_id,
    section: q.section,
    difficulty: q.difficulty,
    question: q.question,
    optionA: q.option_a,
    optionB: q.option_b,
    optionC: q.option_c,
    optionD: q.option_d,
    answer: q.answer,
  };
}

/** Returns an error message, or null when the form can be saved. */
export function validateQuestionForm(form: QuestionForm, needsModule = false): string | null {
  if (needsModule && !form.moduleId) return "Select a module";
  if (!form.question.trim()) return "Question text is required";
  if (!form.optionA || !form.optionB || !form.optionC || !form.optionD) {
    return "All four options are required";
  }
  if (parseAnswer(form.answer).length === 0) return "Select at least one correct answer";
  return null;
}

export function QuestionFormFields({
  form,
  onChange,
  modules,
}: {
  form: QuestionForm;
  onChange: (f: QuestionForm) => void;
  /** When given, shows a module picker (used by the question bank) */
  modules?: DbModule[];
}) {
  return (
    <>
      {modules && (
        <div>
          <label style={fieldLabelStyle}>Module</label>
          <select
            value={form.moduleId ?? ""}
            onChange={(e) => onChange({ ...form, moduleId: Number(e.target.value) || undefined })}
            style={fieldInputStyle}
          >
            <option value="">Select a module…</option>
            {modules.map((m) => (
              <option key={m.id} value={m.id}>
                {m.title}
              </option>
            ))}
          </select>
        </div>
      )}

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
        <label style={fieldLabelStyle}>Correct Answer(s)</label>
        <div style={{ display: "flex", gap: "16px" }}>
          {(["A", "B", "C", "D"] as const).map((opt) => {
            const current = parseAnswer(form.answer);
            const checked = current.includes(opt);
            return (
              <label
                key={opt}
                style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", cursor: "pointer" }}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() =>
                    onChange({
                      ...form,
                      answer: formatAnswer(
                        checked ? current.filter((l) => l !== opt) : [...current, opt]
                      ),
                    })
                  }
                />
                {opt}
              </label>
            );
          })}
        </div>
        <p style={{ fontSize: "12px", color: "var(--muted)", margin: "6px 0 0" }}>
          Tick more than one to make this a multi-select question.
        </p>
      </div>
    </>
  );
}

// ── Shared styles ─────────────────────────────────────────────────────────────

export const primaryBtnStyle: React.CSSProperties = {
  padding: "8px 16px",
  background: "var(--navy)",
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  fontSize: "13px",
  fontWeight: 600,
  cursor: "pointer",
};

export const secondaryBtnStyle: React.CSSProperties = {
  padding: "6px 14px",
  background: "#fff",
  border: "1px solid var(--border)",
  borderRadius: "6px",
  fontSize: "12px",
  fontWeight: 500,
  color: "var(--ink-2)",
  cursor: "pointer",
};

export const iconBtnStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  cursor: "pointer",
  fontSize: "14px",
  padding: "2px 4px",
  borderRadius: "4px",
};

export const tableHeaderStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  padding: "10px 18px",
  background: "var(--canvas)",
  borderBottom: "1px solid var(--border)",
};

export const colStyle: React.CSSProperties = {
  fontSize: "11px",
  fontWeight: 700,
  color: "var(--muted)",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
  flexShrink: 0,
};

export const fieldLabelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "12px",
  fontWeight: 600,
  color: "var(--ink-2)",
  marginBottom: "6px",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
};

export const fieldInputStyle: React.CSSProperties = {
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
