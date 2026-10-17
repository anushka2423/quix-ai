"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { QuizConfig, LQOption } from "@/types/liveq";

interface Question {
  id?: string;
  type: "single" | "truefalse";
  question: string;
  options: LQOption[];
  correct_answer: string;
  explanation: string;
  concept: string;
  points: number;
  timer_secs: number;
  order_index: number;
}

interface Module {
  id?: string;
  title: string;
  description: string;
  order_index: number;
  questions: Question[];
}

const DEFAULT_CONFIG: QuizConfig = {
  timer_secs: 60,
  points_correct: 100,
  points_incorrect: 0,
  points_unanswered: 0,
  allow_late_join: false,
  show_leaderboard_live: true,
  results_released_by_admin: false,
  allow_pause: true,
  allow_early_end: true,
};

function defaultQuestion(orderIndex: number): Question {
  return {
    type: "single",
    question: "",
    options: [
      { label: "A", text: "" },
      { label: "B", text: "" },
      { label: "C", text: "" },
      { label: "D", text: "" },
    ],
    correct_answer: "A",
    explanation: "",
    concept: "",
    points: 100,
    timer_secs: 60,
    order_index: orderIndex,
  };
}

function defaultModule(title: string, order: number): Module {
  return {
    title,
    description: "",
    order_index: order,
    questions: Array.from({ length: 10 }, (_, i) => defaultQuestion(i + 1)),
  };
}

const STEPS = ["Basic Info", "Modules", "Questions", "Config", "Review & Publish"];

const inp: React.CSSProperties = {
  width: "100%", padding: "8px 10px", borderRadius: 6,
  border: "1.5px solid var(--border)", fontFamily: "inherit",
  fontSize: 14, color: "var(--ink)", background: "#fff", boxSizing: "border-box",
};
const btn: React.CSSProperties = {
  padding: "8px 14px", borderRadius: 6, border: "1px solid var(--border)",
  background: "#fff", cursor: "pointer", fontFamily: "inherit", fontSize: 14, fontWeight: 600, color: "var(--ink)",
};
const btnPrimary: React.CSSProperties = { ...btn, background: "var(--navy)", borderColor: "var(--navy)", color: "#fff" };
const label: React.CSSProperties = { display: "block", fontSize: 12, fontWeight: 700, color: "var(--muted)", margin: "12px 0 4px", textTransform: "uppercase", letterSpacing: ".4px" };

export default function QuizWizard({ quizId }: { quizId?: string }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [quizStatus, setQuizStatus] = useState<string>("draft");

  // Basic info
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [instructions, setInstructions] = useState("");

  // Modules (always 3)
  const [modules, setModules] = useState<Module[]>([
    defaultModule("Module 1", 1),
    defaultModule("Module 2", 2),
    defaultModule("Module 3", 3),
  ]);

  // Active question editing
  const [activeModuleIdx, setActiveModuleIdx] = useState(0);
  const [activeQuestionIdx, setActiveQuestionIdx] = useState(0);

  // Config
  const [config, setConfig] = useState<QuizConfig>(DEFAULT_CONFIG);

  // ID from save
  const [savedQuizId, setSavedQuizId] = useState<string | undefined>(quizId);

  // Load existing quiz
  useEffect(() => {
    if (!quizId) return;
    setLoading(true);
    fetch(`/api/liveq/admin/quizzes/${quizId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.quiz) {
          setTitle(data.quiz.title);
          setDescription(data.quiz.description ?? "");
          setInstructions(data.quiz.instructions ?? "");
          setConfig({ ...DEFAULT_CONFIG, ...data.quiz.config });
          setQuizStatus(data.quiz.status);
        }
        if (data.modules?.length) {
          const mods: Module[] = data.modules.map((m: Record<string, unknown>) => ({
            id: m.id as string,
            title: m.title as string,
            description: (m.description as string) ?? "",
            order_index: m.order_index as number,
            questions: (data.questions as Record<string, unknown>[])
              .filter((q) => q.module_id === m.id)
              .sort((a, b) => (a.order_index as number) - (b.order_index as number))
              .map((q) => ({
                id: q.id as string,
                type: (q.type as "single" | "truefalse") ?? "single",
                question: q.question as string,
                options: q.options as LQOption[],
                correct_answer: q.correct_answer as string,
                explanation: (q.explanation as string) ?? "",
                concept: (q.concept as string) ?? "",
                points: (q.points as number) ?? 100,
                timer_secs: (q.timer_secs as number) ?? 60,
                order_index: q.order_index as number,
              })),
          }));
          // Pad to 3 modules
          while (mods.length < 3) mods.push(defaultModule(`Module ${mods.length + 1}`, mods.length + 1));
          setModules(mods);
        }
      })
      .catch(() => setError("Failed to load quiz"))
      .finally(() => setLoading(false));
  }, [quizId]);

  const saveProgress = useCallback(async () => {
    setSaving(true);
    setError("");
    const body = {
      title, description, instructions, config,
      modules: modules.map((m) => ({
        title: m.title,
        description: m.description,
        order_index: m.order_index,
        questions: m.questions.map((q) => ({
          type: q.type,
          question: q.question,
          options: q.type === "truefalse"
            ? [{ label: "A", text: "True" }, { label: "B", text: "False" }]
            : q.options,
          correct_answer: q.correct_answer,
          explanation: q.explanation,
          concept: q.concept,
          points: q.points,
          timer_secs: q.timer_secs,
          order_index: q.order_index,
        })),
      })),
    };

    try {
      let res;
      if (savedQuizId) {
        res = await fetch(`/api/liveq/admin/quizzes/${savedQuizId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      } else {
        res = await fetch("/api/liveq/admin/quizzes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
        const data = await res.json();
        if (data.quiz?.id) setSavedQuizId(data.quiz.id);
      }
    } catch {
      setError("Failed to save");
    } finally {
      setSaving(false);
    }
  }, [title, description, instructions, config, modules, savedQuizId]);

  const publish = async () => {
    if (!savedQuizId) { setError("Save the quiz first"); return; }
    setSaving(true);
    setError("");
    const res = await fetch(`/api/liveq/admin/quizzes/${savedQuizId}/publish`, { method: "POST" });
    const data = await res.json();
    if (data.errors) { setError(data.errors.join(" | ")); setSaving(false); return; }
    if (data.error) { setError(data.error); setSaving(false); return; }
    setQuizStatus("published");
    setSaving(false);
    router.push("/admin/liveq");
  };

  const createSession = async () => {
    if (!savedQuizId) return;
    setSaving(true);
    const res = await fetch("/api/liveq/admin/sessions", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quiz_id: savedQuizId }),
    });
    const data = await res.json();
    setSaving(false);
    if (data.session?.id) router.push(`/admin/liveq/sessions/${data.session.id}`);
    else setError(data.error ?? "Failed to create session");
  };

  const updateQuestion = (qi: number, field: keyof Question, value: unknown) => {
    setModules((prev) => {
      const next = prev.map((m, mi) => {
        if (mi !== activeModuleIdx) return m;
        return {
          ...m,
          questions: m.questions.map((q, i) => i === qi ? { ...q, [field]: value } : q),
        };
      });
      return next;
    });
  };

  const addQuestion = () => {
    setModules((prev) =>
      prev.map((m, mi) => mi !== activeModuleIdx ? m : {
        ...m,
        questions: [...m.questions, defaultQuestion(m.questions.length + 1)],
      })
    );
    setActiveQuestionIdx(modules[activeModuleIdx].questions.length);
  };

  const removeQuestion = (qi: number) => {
    setModules((prev) =>
      prev.map((m, mi) => mi !== activeModuleIdx ? m : {
        ...m,
        questions: m.questions.filter((_, i) => i !== qi).map((q, i) => ({ ...q, order_index: i + 1 })),
      })
    );
    if (activeQuestionIdx >= modules[activeModuleIdx].questions.length - 1) setActiveQuestionIdx(Math.max(0, activeQuestionIdx - 1));
  };

  if (loading) return <div style={{ padding: 40 }}>Loading…</div>;

  return (
    <div style={{ padding: "32px 40px", maxWidth: 1000 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, margin: 0 }}>{quizId ? "Edit Quiz" : "Create Quiz"}</h1>
        {saving && <span style={{ color: "var(--muted)", fontSize: 13 }}>Saving…</span>}
      </div>

      {/* Step indicators */}
      <div style={{ display: "flex", gap: 0, marginBottom: 32, borderRadius: 8, overflow: "hidden", border: "1px solid var(--border)" }}>
        {STEPS.map((s, i) => (
          <button key={s} onClick={() => setStep(i)} style={{
            flex: 1, padding: "10px 8px", border: "none", borderRight: i < STEPS.length - 1 ? "1px solid var(--border)" : "none",
            background: step === i ? "var(--navy)" : i < step ? "var(--wash)" : "#fff",
            color: step === i ? "#fff" : i < step ? "var(--navy)" : "var(--muted)",
            fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
          }}>
            {i + 1}. {s}
          </button>
        ))}
      </div>

      {error && <div style={{ background: "var(--incorrect-bg)", color: "var(--incorrect-text)", padding: "10px 14px", borderRadius: 6, marginBottom: 16 }}>{error}</div>}

      {/* Step 1: Basic Info */}
      {step === 0 && (
        <div>
          <label style={label}>Quiz Title *</label>
          <input style={inp} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Claude AI Certification Practice" />

          <label style={label}>Description</label>
          <textarea style={{ ...inp, minHeight: 80 }} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What this quiz covers" />

          <label style={label}>Participant Instructions</label>
          <textarea style={{ ...inp, minHeight: 80 }} value={instructions} onChange={(e) => setInstructions(e.target.value)} placeholder="Instructions shown to participants before the quiz starts" />

          <div style={{ display: "flex", gap: 8, marginTop: 24 }}>
            <button style={btnPrimary} onClick={async () => { await saveProgress(); setStep(1); }}>Save & Continue →</button>
          </div>
        </div>
      )}

      {/* Step 2: Modules */}
      {step === 1 && (
        <div>
          <p style={{ color: "var(--muted)", margin: "0 0 16px" }}>A quiz always has exactly 3 modules. Name them and add descriptions.</p>
          {modules.map((m, mi) => (
            <div key={mi} style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 8, padding: 16, marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ fontWeight: 700, fontSize: 13, color: "var(--muted)", minWidth: 70 }}>Module {mi + 1}</span>
                <input
                  style={{ ...inp }}
                  value={m.title}
                  onChange={(e) => setModules((prev) => prev.map((mod, i) => i === mi ? { ...mod, title: e.target.value } : mod))}
                  placeholder={`Module ${mi + 1} title`}
                />
              </div>
              <textarea
                style={{ ...inp, minHeight: 60 }}
                value={m.description}
                onChange={(e) => setModules((prev) => prev.map((mod, i) => i === mi ? { ...mod, description: e.target.value } : mod))}
                placeholder="Optional description"
              />
              <p style={{ margin: "8px 0 0", fontSize: 13, color: "var(--muted)" }}>{m.questions.length} questions</p>
            </div>
          ))}
          <div style={{ display: "flex", gap: 8, marginTop: 24 }}>
            <button style={btn} onClick={() => setStep(0)}>← Back</button>
            <button style={btnPrimary} onClick={async () => { await saveProgress(); setStep(2); }}>Save & Continue →</button>
          </div>
        </div>
      )}

      {/* Step 3: Questions */}
      {step === 2 && (
        <div style={{ display: "flex", gap: 20 }}>
          {/* Module + question selector */}
          <div style={{ width: 220, flexShrink: 0 }}>
            {modules.map((m, mi) => (
              <div key={mi} style={{ marginBottom: 12 }}>
                <div
                  onClick={() => { setActiveModuleIdx(mi); setActiveQuestionIdx(0); }}
                  style={{ fontWeight: 700, fontSize: 13, padding: "6px 10px", borderRadius: 6, cursor: "pointer",
                    background: activeModuleIdx === mi ? "var(--wash)" : "transparent",
                    color: activeModuleIdx === mi ? "var(--navy)" : "var(--ink)" }}
                >
                  {m.title}
                </div>
                {activeModuleIdx === mi && m.questions.map((q, qi) => (
                  <div
                    key={qi}
                    onClick={() => setActiveQuestionIdx(qi)}
                    style={{ padding: "4px 10px 4px 20px", fontSize: 13, cursor: "pointer",
                      background: activeQuestionIdx === qi ? "var(--navy)" : "transparent",
                      color: activeQuestionIdx === qi ? "#fff" : q.question ? "var(--ink)" : "var(--muted)",
                      borderRadius: 4 }}
                  >
                    Q{qi + 1} {!q.question && "·"}
                  </div>
                ))}
                {activeModuleIdx === mi && (
                  <button onClick={addQuestion} style={{ ...btn, width: "100%", marginTop: 4, fontSize: 12, padding: "4px 8px" }}>+ Add question</button>
                )}
              </div>
            ))}
          </div>

          {/* Question editor */}
          <div style={{ flex: 1 }}>
            {(() => {
              const q = modules[activeModuleIdx]?.questions[activeQuestionIdx];
              if (!q) return <p style={{ color: "var(--muted)" }}>Select a question</p>;
              return (
                <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 8, padding: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <h3 style={{ margin: 0, fontSize: 16 }}>Q{activeQuestionIdx + 1}</h3>
                    {modules[activeModuleIdx].questions.length > 1 && (
                      <button onClick={() => removeQuestion(activeQuestionIdx)} style={{ ...btn, fontSize: 12, color: "var(--incorrect-text)", borderColor: "var(--incorrect-text)" }}>Remove</button>
                    )}
                  </div>

                  <label style={label}>Question Type</label>
                  <select style={inp} value={q.type} onChange={(e) => {
                    const t = e.target.value as "single" | "truefalse";
                    updateQuestion(activeQuestionIdx, "type", t);
                    if (t === "truefalse") {
                      updateQuestion(activeQuestionIdx, "options", [{ label: "A", text: "True" }, { label: "B", text: "False" }]);
                      updateQuestion(activeQuestionIdx, "correct_answer", "A");
                    } else {
                      updateQuestion(activeQuestionIdx, "options", [{ label: "A", text: "" }, { label: "B", text: "" }, { label: "C", text: "" }, { label: "D", text: "" }]);
                    }
                  }}>
                    <option value="single">Single choice (A–D)</option>
                    <option value="truefalse">True / False</option>
                  </select>

                  <label style={label}>Question Text *</label>
                  <textarea style={{ ...inp, minHeight: 80 }} value={q.question} onChange={(e) => updateQuestion(activeQuestionIdx, "question", e.target.value)} placeholder="Enter question text" />

                  <label style={label}>Answer Options</label>
                  {q.options.map((opt, oi) => (
                    <div key={oi} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <input
                        type="radio" name={`correct-${activeModuleIdx}-${activeQuestionIdx}`}
                        checked={q.correct_answer === opt.label}
                        onChange={() => updateQuestion(activeQuestionIdx, "correct_answer", opt.label)}
                        title="Mark as correct answer"
                      />
                      <span style={{ fontWeight: 700, width: 20 }}>{opt.label}</span>
                      <input
                        style={{ ...inp, flex: 1 }}
                        value={opt.text}
                        readOnly={q.type === "truefalse"}
                        onChange={(e) => {
                          const newOpts = q.options.map((o, i) => i === oi ? { ...o, text: e.target.value } : o);
                          updateQuestion(activeQuestionIdx, "options", newOpts);
                        }}
                        placeholder={`Option ${opt.label}`}
                      />
                    </div>
                  ))}
                  <p style={{ fontSize: 12, color: "var(--muted)", margin: "4px 0 0" }}>Radio = correct answer</p>

                  <label style={label}>Concept Tag *</label>
                  <input style={inp} value={q.concept} onChange={(e) => updateQuestion(activeQuestionIdx, "concept", e.target.value)} placeholder="e.g. Prompt Engineering, API Design" />

                  <div style={{ display: "flex", gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <label style={label}>Timer (seconds)</label>
                      <input type="number" style={inp} min={5} max={300} value={q.timer_secs} onChange={(e) => updateQuestion(activeQuestionIdx, "timer_secs", Number(e.target.value))} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={label}>Points</label>
                      <input type="number" style={inp} min={0} value={q.points} onChange={(e) => updateQuestion(activeQuestionIdx, "points", Number(e.target.value))} />
                    </div>
                  </div>

                </div>
              );
            })()}

            <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
              <button style={btn} onClick={() => setStep(1)}>← Back</button>
              <button style={btnPrimary} onClick={async () => { await saveProgress(); setStep(3); }}>Save & Continue →</button>
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Config */}
      {step === 3 && (
        <div style={{ maxWidth: 600 }}>
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={label}>Default Timer (seconds)</label>
              <input type="number" style={inp} min={5} max={300} value={config.timer_secs} onChange={(e) => setConfig((c) => ({ ...c, timer_secs: Number(e.target.value) }))} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={label}>Points: Correct Answer</label>
              <input type="number" style={inp} min={0} value={config.points_correct} onChange={(e) => setConfig((c) => ({ ...c, points_correct: Number(e.target.value) }))} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={label}>Points: Incorrect Answer</label>
              <input type="number" style={inp} value={config.points_incorrect} onChange={(e) => setConfig((c) => ({ ...c, points_incorrect: Number(e.target.value) }))} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={label}>Points: Unanswered</label>
              <input type="number" style={inp} value={config.points_unanswered} onChange={(e) => setConfig((c) => ({ ...c, points_unanswered: Number(e.target.value) }))} />
            </div>
          </div>

          {[
            ["allow_late_join", "Allow participants to join after quiz starts"],
            ["show_leaderboard_live", "Show live leaderboard during quiz"],
            ["results_released_by_admin", "Results require admin to publish (otherwise shown immediately)"],
            ["allow_pause", "Allow admin to pause the quiz"],
            ["allow_early_end", "Allow admin to end quiz early"],
          ].map(([key, lbl]) => (
            <label key={key} style={{ display: "flex", alignItems: "center", gap: 10, margin: "12px 0", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={config[key as keyof QuizConfig] as boolean}
                onChange={(e) => setConfig((c) => ({ ...c, [key]: e.target.checked }))}
              />
              <span style={{ fontSize: 14 }}>{lbl}</span>
            </label>
          ))}

          <div style={{ display: "flex", gap: 8, marginTop: 24 }}>
            <button style={btn} onClick={() => setStep(2)}>← Back</button>
            <button style={btnPrimary} onClick={async () => { await saveProgress(); setStep(4); }}>Save & Continue →</button>
          </div>
        </div>
      )}

      {/* Step 5: Review & Publish */}
      {step === 4 && (
        <div>
          <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 8, padding: 24, marginBottom: 20 }}>
            <h3 style={{ margin: "0 0 12px" }}>{title || "Untitled Quiz"}</h3>
            <p style={{ margin: "0 0 8px", color: "var(--muted)", fontSize: 14 }}>{description}</p>
            <div style={{ display: "flex", gap: 20, flexWrap: "wrap", fontSize: 14 }}>
              {modules.map((m, i) => (
                <div key={i}>
                  <strong>{m.title}</strong>: {m.questions.length} questions
                </div>
              ))}
            </div>
            <div style={{ marginTop: 12, fontSize: 14, color: "var(--muted)" }}>
              Timer: {config.timer_secs}s · Correct: +{config.points_correct}pts · Wrong: {config.points_incorrect}pts
            </div>
          </div>

          {quizStatus === "published" ? (
            <div>
              <div style={{ background: "var(--correct-bg)", color: "var(--correct-text)", padding: "12px 16px", borderRadius: 8, marginBottom: 16, fontWeight: 600 }}>
                ✓ Quiz is published
              </div>
              <button style={btnPrimary} onClick={createSession} disabled={saving}>
                {saving ? "Creating…" : "Create Live Session"}
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", gap: 8 }}>
              <button style={btn} onClick={() => setStep(3)}>← Back</button>
              <button style={btnPrimary} onClick={publish} disabled={saving}>
                {saving ? "Publishing…" : "Publish Quiz"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
