"use client";

import { useRef, useState } from "react";
import type { PublicQuestion } from "@/types/quiz";
import { TUTOR_MAX_TURNS } from "@/lib/config";
import { track } from "@/lib/analytics";
import { getEmail } from "@/lib/client/store";
import Icon from "@/components/Icon";
import "@/app/design/quiz.css";

interface Msg {
  role: "user" | "assistant";
  content: string;
}

const CHIPS = ["Explain It Like I'm Not Technical", "Why Are the Other Options Wrong?", "Give Me an Example"];

/**
 * "Explain it differently" tutor. Never blocks the quiz: if the model is unavailable the static
 * explanation above stays and a short notice appears here.
 */
export default function TutorPanel({
  question,
  seed,
  answered,
}: {
  question: PublicQuestion;
  seed: string;
  answered: boolean;
}) {
  const [open, setOpen] = useState(false);
  const bodyId = `tutor-body-${question.id}`;
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const [reported, setReported] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const turns = msgs.filter((m) => m.role === "user").length;
  const capped = turns >= TUTOR_MAX_TURNS;

  async function send(text: string) {
    const content = text.trim();
    if (!content || busy || capped) return;
    const next: Msg[] = [...msgs, { role: "user", content }];
    setMsgs([...next, { role: "assistant", content: "" }]);
    setInput("");
    setBusy(true);
    setUnavailable(false);
    track("tutor_message", { questionId: question.id, turn: turns + 1 });
    try {
      const res = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seed, questionId: question.id, answered, messages: next }),
      });
      if (!res.ok || !res.body) throw new Error("unavailable");
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let acc = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += dec.decode(value, { stream: true });
        setMsgs([...next, { role: "assistant", content: acc }]);
        endRef.current?.scrollIntoView({ block: "nearest" });
      }
      if (!acc.trim()) throw new Error("empty");
    } catch {
      setMsgs(next);
      setUnavailable(true);
    } finally {
      setBusy(false);
    }
  }

  async function report() {
    setReported(true);
    track("question_reported", { questionId: question.id });
    try {
      await fetch("/api/report-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: question.id, email: getEmail() ?? undefined }),
      });
    } catch {
      /* reporting is best effort */
    }
  }

  return (
    <div className="tutor">
      <div className="tutor__bar">
        <button
          type="button"
          className="btn btn--secondary btn--sm"
          onClick={() => {
            if (!open) track("tutor_opened", { questionId: question.id });
            setOpen(!open);
          }}
          aria-expanded={open}
          aria-controls={bodyId}
        >
          {open ? "Hide Tutor" : "Explain It Differently"}
        </button>
        <button type="button" className="btn btn--link" onClick={report} disabled={reported}>
          {reported ? "Thanks, Sent for Review" : "Report This Question"}
        </button>
      </div>

      {open && (
        <div className="card tutor__body" id={bodyId}>
          <p className="tutor__intro">
            {answered
              ? "Ask a follow-up about this question. The answer key never changes; if you think it's wrong, report it."
              : "This question isn't answered yet, so the tutor will only give you a hint about the concept."}{" "}
            {turns} of {TUTOR_MAX_TURNS} follow-ups used.
          </p>

          <div className="tutor__msgs" aria-live="polite">
            {msgs.map((m, i) => (
              <div key={i} className={`tutor__msg tutor__msg--${m.role}`}>
                {m.content || "…"}
              </div>
            ))}
            <div ref={endRef} />
          </div>

          {unavailable && (
            <p role="status" className="tutor__note is-error">
              <Icon name="x" size="sm" />
              <span>Tutor unavailable, try again shortly. The written explanation above still applies and the quiz is not affected.</span>
            </p>
          )}

          {capped ? (
            <p className="tutor__note">
              You&apos;ve used the {TUTOR_MAX_TURNS} follow-ups for this question. Try a domain drill on &ldquo;{question.subSkill}&rdquo; to keep practising.
            </p>
          ) : (
            <>
              {msgs.length === 0 && (
                <div className="tutor__chips">
                  {CHIPS.map((c) => (
                    <button key={c} type="button" className="btn btn--secondary btn--sm" onClick={() => send(c)}>
                      {c}
                    </button>
                  ))}
                </div>
              )}
              <form
                className="tutor__form"
                onSubmit={(e) => {
                  e.preventDefault();
                  void send(input);
                }}
              >
                <label htmlFor={`tutor-${question.id}`} className="sr-only">
                  Ask the Tutor
                </label>
                <input
                  id={`tutor-${question.id}`}
                  className="input"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Why B and not D?"
                  maxLength={500}
                />
                <button type="submit" className="btn btn--accent" disabled={busy || !input.trim()}>
                  Ask
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </div>
  );
}
