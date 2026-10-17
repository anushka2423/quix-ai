"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/Header";

const inp: React.CSSProperties = {
  width: "100%", padding: "12px 14px", borderRadius: 8,
  border: "1.5px solid var(--border)", fontFamily: "inherit",
  fontSize: 16, color: "var(--ink)", background: "#fff", boxSizing: "border-box",
};

export default function JoinScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [code, setCode] = useState(searchParams.get("code") ?? "");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const savedToken = localStorage.getItem("liveq_token");
    const savedSession = localStorage.getItem("liveq_session_id");
    if (savedToken && savedSession) {
      router.replace(`/liveq/${savedSession}?token=${savedToken}`);
    }
  }, [router]);

  const join = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const trimCode = code.trim().toUpperCase();
    const trimName = name.trim();
    if (!trimCode) { setError("Enter a join code"); return; }
    if (!trimName) { setError("Enter your name"); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/liveq/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ join_code: trimCode, display_name: trimName }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Could not join"); setLoading(false); return; }
      localStorage.setItem("liveq_token", data.token);
      localStorage.setItem("liveq_session_id", data.session_id);
      router.push(`/liveq/${data.session_id}?token=${data.token}`);
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <>
      <Header />

      {/* Navy band */}
      <div style={{ background: "var(--gradient)", padding: "36px 0 44px" }}>
        <div style={{ maxWidth: "860px", margin: "0 auto", padding: "0 48px", textAlign: "center" }}>
          <h1 style={{ fontSize: "32px", fontWeight: 800, color: "#ffffff", margin: "0 0 8px", letterSpacing: "-0.02em" }}>
            Live Quiz
          </h1>
          <p style={{ color: "var(--on-navy-2)", margin: 0, fontSize: "16px" }}>
            Enter your join code to participate in a live session
          </p>
        </div>
      </div>

      {/* Form */}
      <div style={{ flex: 1, padding: "48px 20px 80px", background: "var(--canvas)" }}>
        <div style={{ maxWidth: "440px", margin: "0 auto" }}>
          <form
            onSubmit={join}
            style={{
              background: "#ffffff",
              borderRadius: "var(--r-quiz-card)",
              boxShadow: "var(--shadow-feature)",
              padding: "40px",
            }}
          >
            <label style={{ display: "block", fontWeight: 700, marginBottom: 6, fontSize: 14, color: "var(--ink)" }}>
              Join Code
            </label>
            <input
              style={{ ...inp, letterSpacing: "0.15em", textTransform: "uppercase", fontSize: 22, textAlign: "center", fontWeight: 800 }}
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              maxLength={8}
              placeholder="ABC123"
              autoComplete="off"
              autoFocus
            />

            <label style={{ display: "block", fontWeight: 700, margin: "20px 0 6px", fontSize: 14, color: "var(--ink)" }}>
              Your Name
            </label>
            <input
              style={inp}
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={32}
              placeholder="How others will see you"
              autoComplete="given-name"
            />

            {error && (
              <div style={{
                background: "var(--incorrect-bg)", color: "var(--incorrect-text)",
                padding: "10px 14px", borderRadius: 8, marginTop: 14, fontSize: 14,
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%", marginTop: 24, padding: "15px 20px",
                borderRadius: "9px", border: "none",
                background: loading ? "var(--disabled)" : "var(--accent)",
                color: loading ? "#fff" : "var(--navy)",
                fontFamily: "inherit", fontSize: 16, fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                transition: "background 0.2s",
              }}
            >
              {loading ? "Joining…" : "Join Quiz →"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
