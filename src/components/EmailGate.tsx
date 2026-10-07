"use client";

import { useState, useEffect } from "react";
import { saveLead } from "@/lib/supabase";

const EMAIL_KEY = "quix_user_email";
const SKIP_KEY = "quix_skipped_email";

export function getStoredEmail(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(EMAIL_KEY);
}

export function EmailGateProvider({ children }: { children: React.ReactNode }) {
  const [email, setEmail] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(EMAIL_KEY);
    const skipped = localStorage.getItem(SKIP_KEY);
    if (stored) {
      setEmail(stored);
    } else if (!skipped) {
      setShowModal(true);
    }
    setReady(true);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = input.trim().toLowerCase();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    setError("");
    await saveLead(trimmed);
    localStorage.setItem(EMAIL_KEY, trimmed);
    setEmail(trimmed);
    setShowModal(false);
    setLoading(false);
  }

  function handleDismiss() {
    localStorage.setItem(SKIP_KEY, "true");
    setShowModal(false);
  }

  if (!ready) return null;

  return (
    <>
      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(15,27,51,.7)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            padding: "24px",
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "var(--r-feature)",
              padding: "48px",
              maxWidth: "480px",
              width: "100%",
              boxShadow: "var(--shadow-feature)",
              position: "relative",
            }}
          >
            {/* Close button */}
            <button
              onClick={handleDismiss}
              aria-label="Skip and close"
              style={{
                position: "absolute",
                top: "16px",
                right: "16px",
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                border: "1px solid var(--border)",
                background: "#fff",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "18px",
                lineHeight: 1,
                color: "var(--muted)",
                transition: "background 0.15s, color 0.15s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "var(--canvas)";
                (e.currentTarget as HTMLButtonElement).style.color = "var(--ink)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "#fff";
                (e.currentTarget as HTMLButtonElement).style.color = "var(--muted)";
              }}
            >
              ×
            </button>

            {/* Icon */}
            <div
              style={{
                width: "52px",
                height: "52px",
                borderRadius: "14px",
                background: "#fff3e8",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "24px",
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
                  stroke="var(--accent)"
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                />
                <path
                  d="M22 6l-10 7L2 6"
                  stroke="var(--accent)"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            {/* Eyebrow */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "7px",
                marginBottom: "12px",
              }}
            >
              <div
                style={{
                  width: "7px",
                  height: "7px",
                  borderRadius: "2px",
                  background: "var(--accent)",
                }}
              />
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  letterSpacing: "0.6px",
                  textTransform: "uppercase",
                  color: "var(--muted)",
                }}
              >
                Claude Certification · Module Assessment
              </span>
            </div>

            <h2
              style={{
                fontSize: "26px",
                fontWeight: 700,
                color: "var(--ink)",
                margin: "0 0 10px",
                lineHeight: 1.25,
                letterSpacing: "-0.02em",
              }}
            >
              Before we begin
            </h2>
            <p
              style={{
                fontSize: "15px",
                lineHeight: 1.6,
                color: "var(--muted)",
                margin: "0 0 28px",
              }}
            >
              Enter your email to receive your personalised results — or skip to
              start right away.
            </p>

            <form onSubmit={handleSubmit}>
              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "var(--ink)",
                  marginBottom: "8px",
                }}
              >
                Email address
              </label>
              <input
                type="email"
                placeholder="you@company.com"
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  setError("");
                }}
                autoFocus
                style={{
                  width: "100%",
                  padding: "13px 16px",
                  borderRadius: "var(--r-input)",
                  border: error
                    ? "1.5px solid var(--incorrect-text)"
                    : "1.5px solid var(--border)",
                  fontSize: "15px",
                  color: "var(--ink)",
                  outline: "none",
                  boxSizing: "border-box",
                  background: "#fff",
                  transition: "border-color 0.15s",
                  fontFamily: "inherit",
                }}
                onFocus={(e) => {
                  if (!error)
                    (e.target as HTMLInputElement).style.borderColor = "var(--accent)";
                }}
                onBlur={(e) => {
                  if (!error)
                    (e.target as HTMLInputElement).style.borderColor = "var(--border)";
                }}
              />
              {error && (
                <p
                  style={{
                    fontSize: "13px",
                    color: "var(--incorrect-text)",
                    marginTop: "6px",
                    marginBottom: 0,
                  }}
                >
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  marginTop: "16px",
                  width: "100%",
                  padding: "14px",
                  borderRadius: "9px",
                  border: "none",
                  background: "var(--accent)",
                  color: "var(--navy)",
                  fontSize: "16px",
                  fontWeight: 700,
                  cursor: loading ? "not-allowed" : "pointer",
                  transition: "opacity 0.15s, background 0.15s",
                  opacity: loading ? 0.7 : 1,
                  fontFamily: "inherit",
                  letterSpacing: "-0.01em",
                  minHeight: "52px",
                }}
              >
                {loading ? "Saving…" : "Start Assessment →"}
              </button>

              <button
                type="button"
                onClick={handleDismiss}
                style={{
                  marginTop: "10px",
                  width: "100%",
                  padding: "10px",
                  borderRadius: "var(--r-card)",
                  border: "1px solid var(--border)",
                  background: "#fff",
                  color: "var(--muted)",
                  fontSize: "14px",
                  fontWeight: 500,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Skip for now
              </button>

              <p
                style={{
                  fontSize: "12px",
                  color: "var(--faint)",
                  textAlign: "center",
                  marginTop: "14px",
                  marginBottom: 0,
                }}
              >
                No spam. Your email is only used to send your results.
              </p>
            </form>
          </div>
        </div>
      )}
      {children}
    </>
  );
}
