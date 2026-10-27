"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { EMAIL_MODAL_AFTER, MAX_EMAIL_SKIPS, flags } from "@/lib/config";
import { EMAIL_KEY, answeredTotal, getEmail, getLearner, getProfile, saveProfile } from "@/lib/client/store";
import { track } from "@/lib/analytics";
import Icon from "@/components/Icon";
import Modal from "@/components/Modal";
import "@/app/design/quiz.css";

const SKIPS_KEY = "quix_email_skips";

interface OpenOptions {
  /** Cannot be dismissed (used when the report needs an address) */
  required?: boolean;
  title?: string;
  body?: string;
}

interface EmailGateApi {
  email: string | null;
  /** True while the capture modal is on screen (the quiz pauses behind it) */
  modalOpen: boolean;
  /** Call after every checked answer. Shows the modal once per person (after Q1 by default). */
  onAnswered: () => void;
  /** Ask for an email on demand, e.g. to unlock the full report. Resolves with the email or null. */
  open: (opts?: OpenOptions) => Promise<string | null>;
}

const Ctx = createContext<EmailGateApi>({ email: null, modalOpen: false, onAnswered: () => {}, open: async () => null });
export const useEmailGate = () => useContext(Ctx);

const getSkips = () => {
  try {
    return Number(localStorage.getItem(SKIPS_KEY) ?? 0);
  } catch {
    return 0;
  }
};

export function EmailGateProvider({ children }: { children: React.ReactNode }) {
  const [email, setEmail] = useState<string | null>(null);
  const [modal, setModal] = useState<{ required: boolean; opts: OpenOptions; counted: boolean } | null>(null);
  const resolver = useRef<((v: string | null) => void) | null>(null);

  const [input, setInput] = useState("");
  const [name, setName] = useState("");
  const [examDate, setExamDate] = useState("");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate from localStorage after mount
    setEmail(getEmail());
    const p = getProfile();
    setName(p.name ?? "");
    setExamDate(p.examDate ?? "");
  }, []);

  const close = useCallback((value: string | null) => {
    setModal(null);
    resolver.current?.(value);
    resolver.current = null;
  }, []);

  const open = useCallback((opts: OpenOptions = {}) => {
    if (getEmail()) return Promise.resolve(getEmail());
    setModal({ required: !!opts.required, opts, counted: false });
    return new Promise<string | null>((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const onAnswered = useCallback(() => {
    if (!flags.emailModal || getEmail() || modal) return;
    const answered = answeredTotal();
    if (answered < EMAIL_MODAL_AFTER) return;
    // Skippable twice, then the modal becomes required
    const required = getSkips() >= MAX_EMAIL_SKIPS;
    setModal({ required, opts: {}, counted: true });
    resolver.current = null;
    track("email_modal_shown", { afterAnswers: answered, required });
  }, [modal]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = input.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed, name, examDate: examDate || null, consent, source: "modal", sessionId: getLearner().sessionId }),
      });
    } catch {
      /* the lead is also kept locally; the quiz must never be blocked by a network error */
    }
    try {
      localStorage.setItem(EMAIL_KEY, trimmed);
    } catch {}
    saveProfile({ name: name || undefined, examDate: examDate || undefined });
    setEmail(trimmed);
    track("email_submitted", { consent, hasName: !!name, hasExamDate: !!examDate });
    setLoading(false);
    close(trimmed);
  }

  function handleSkip() {
    if (modal?.counted) {
      try {
        localStorage.setItem(SKIPS_KEY, String(getSkips() + 1));
      } catch {}
      track("email_skipped", { skips: getSkips() });
    }
    close(null);
  }

  const required = modal?.required ?? false;

  return (
    <Ctx.Provider value={{ email, modalOpen: !!modal, onAnswered, open }}>
      {modal && (
        <Modal labelledBy="email-modal-title" describedBy="email-modal-desc" required={required} onClose={handleSkip}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="modal__logo" src="/logo-on-light.png" alt="Agentic AI Institute" width={90} height={40} />
          <div className="stack modal__head">
            <span className="eyebrow t-sm">Claude Certification Practice Quiz</span>
            <h2 className="modal__title modal__title--flush" id="email-modal-title">
              {modal.opts.title ?? "Save Your Progress"}
            </h2>
            <p className="modal__text" id="email-modal-desc">
              {modal.opts.body ??
                (required
                  ? "Add your email to keep going. It keeps your progress and sends your readiness report."
                  : "Add your email to keep your progress and get your readiness report. You can skip this for now.")}
            </p>
          </div>

          <form className="stack modal__form" onSubmit={handleSubmit} noValidate>
            <div className={`field${error ? " is-invalid" : ""}`}>
              <label className="field__label" htmlFor="gate-email">Email Address</label>
              <input
                className="input"
                id="gate-email"
                type="email"
                placeholder="you@company.com"
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  setError("");
                }}
                data-autofocus
                autoComplete="email"
                required
                aria-invalid={!!error}
                aria-describedby="gate-email-error"
              />
              <span className="field__error" id="gate-email-error" role="alert">
                <Icon name="info" size="sm" />
                {error}
              </span>
            </div>

            <div className="field-row">
              <div className="field">
                <label className="field__label" htmlFor="gate-name">Name <span className="optional">(Optional)</span></label>
                <input className="input" id="gate-name" type="text" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
              </div>
              <div className="field">
                <label className="field__label" htmlFor="gate-date">Exam Date <span className="optional">(Optional)</span></label>
                <input className="input" id="gate-date" type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} />
              </div>
            </div>

            <label className="checkbox">
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
              <span>Send me study tips and course updates by email. I&apos;ll confirm my address first and can unsubscribe in one click. (Optional)</span>
            </label>

            <button className="btn btn--accent btn--lg btn--block" type="submit" disabled={loading}>
              {loading ? "Saving…" : "Save My Progress and Keep Going"}
            </button>

            {!required && (
              <div className="modal__foot modal__foot--center">
                <button type="button" className="btn btn--link" onClick={handleSkip}>
                  {modal.counted ? "Skip for Now" : "Not Now"}
                </button>
              </div>
            )}
          </form>

          <p className="modal__foot modal__foot--center">
            See our <Link href="/privacy">privacy policy</Link>. Independent practice resource, not affiliated with Anthropic.
          </p>
        </Modal>
      )}
      {children}
    </Ctx.Provider>
  );
}
