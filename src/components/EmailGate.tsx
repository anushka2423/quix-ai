"use client";

import { useState, useEffect } from "react";
import { saveLead } from "@/lib/supabase";

const EMAIL_KEY = "quix_user_email";

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
    if (stored) {
      setEmail(stored);
    } else {
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
            background: "rgba(4, 39, 94, 0.72)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            padding: "24px",
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "20px",
              padding: "48px",
              maxWidth: "480px",
              width: "100%",
              boxShadow: "0 32px 80px rgba(0,0,0,0.25)",
              animation: "fade-in-up 0.35s ease both",
            }}
          >
            {/* Icon */}
            <div
              style={{
                width: "52px",
                height: "52px",
                borderRadius: "14px",
                background: "var(--color-surface-blue-soft)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "24px",
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="#006FFF" strokeWidth="1.6" strokeLinejoin="round"/>
                <path d="M22 6l-10 7L2 6" stroke="#006FFF" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>

            {/* Eyebrow */}
            <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "12px" }}>
              <div style={{ width: "7px", height: "7px", borderRadius: "2px", background: "#FF6F00" }} />
              <span style={{ fontFamily: "var(--font-geist)", fontSize: "12px", fontWeight: 600, letterSpacing: "0.6px", textTransform: "uppercase", color: "var(--color-steel)" }}>
                Gen AI · Skills Assessment
              </span>
            </div>

            <h2
              style={{
                fontFamily: "var(--font-golos)",
                fontSize: "26px",
                fontWeight: 700,
                color: "var(--color-ink)",
                margin: "0 0 10px",
                lineHeight: 1.25,
              }}
            >
              Before we begin
            </h2>
            <p
              style={{
                fontFamily: "var(--font-geist)",
                fontSize: "15px",
                lineHeight: 1.6,
                color: "var(--color-slate)",
                margin: "0 0 28px",
              }}
            >
              Enter your email to access the assessment and receive your personalised results.
            </p>

            <form onSubmit={handleSubmit}>
              <label
                style={{
                  display: "block",
                  fontFamily: "var(--font-geist)",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "var(--color-ink)",
                  marginBottom: "8px",
                }}
              >
                Email address
              </label>
              <input
                type="email"
                placeholder="you@company.com"
                value={input}
                onChange={(e) => { setInput(e.target.value); setError(""); }}
                autoFocus
                style={{
                  width: "100%",
                  padding: "13px 16px",
                  borderRadius: "var(--radius-md)",
                  border: error ? "1.5px solid #EF4444" : "1.5px solid var(--color-hairline)",
                  fontFamily: "var(--font-geist)",
                  fontSize: "15px",
                  color: "var(--color-ink)",
                  outline: "none",
                  boxSizing: "border-box",
                  background: "#fff",
                  transition: "border-color 0.15s",
                }}
                onFocus={(e) => { if (!error) e.target.style.borderColor = "var(--color-primary)"; }}
                onBlur={(e) => { if (!error) e.target.style.borderColor = "var(--color-hairline)"; }}
              />
              {error && (
                <p style={{ fontFamily: "var(--font-geist)", fontSize: "13px", color: "#EF4444", marginTop: "6px", marginBottom: 0 }}>
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
                  borderRadius: "var(--radius-md)",
                  border: "none",
                  background: loading ? "var(--color-steel)" : "var(--color-navy-900)",
                  color: "#fff",
                  fontFamily: "var(--font-golos)",
                  fontSize: "16px",
                  fontWeight: 600,
                  cursor: loading ? "not-allowed" : "pointer",
                  transition: "background 0.15s",
                }}
              >
                {loading ? "Saving…" : "Start Assessment →"}
              </button>

              <p style={{ fontFamily: "var(--font-geist)", fontSize: "12px", color: "var(--color-stone)", textAlign: "center", marginTop: "14px", marginBottom: 0 }}>
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