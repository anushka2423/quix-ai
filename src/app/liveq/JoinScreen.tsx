"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const inp: React.CSSProperties = {
  width: "100%", padding: "12px 14px", borderRadius: 8,
  border: "1.5px solid var(--border)", fontFamily: "inherit",
  fontSize: 16, color: "var(--ink)", background: "#fff", boxSizing: "border-box",
};
const btnPrimary: React.CSSProperties = {
  width: "100%", padding: "13px 20px", borderRadius: 8,
  background: "var(--navy)", border: "none", color: "#fff",
  fontFamily: "inherit", fontSize: 16, fontWeight: 700, cursor: "pointer",
};

export default function JoinScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [code, setCode] = useState(searchParams.get("code") ?? "");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Restore saved participant if they refresh
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
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "var(--canvas)", padding: "20px",
    }}>
      <div style={{ width: "100%", maxWidth: 440 }}>
        {/* Logo / brand */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>⚡</div>
          <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0, color: "var(--navy)" }}>Quiz Mode</h1>
          <p style={{ color: "var(--muted)", margin: "8px 0 0", fontSize: 15 }}>Join a live quiz session</p>
        </div>

        <form onSubmit={join} style={{ background: "#fff", borderRadius: 12, padding: 28, boxShadow: "var(--shadow-card)" }}>
          <label style={{ display: "block", fontWeight: 700, marginBottom: 6, fontSize: 14 }}>Join Code</label>
          <input
            style={{ ...inp, letterSpacing: "0.15em", textTransform: "uppercase", fontSize: 20, textAlign: "center", fontWeight: 700 }}
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            maxLength={8}
            placeholder="ABC123"
            autoComplete="off"
            autoFocus
          />

          <label style={{ display: "block", fontWeight: 700, margin: "16px 0 6px", fontSize: 14 }}>Your Name</label>
          <input
            style={inp}
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={32}
            placeholder="How others will see you"
            autoComplete="given-name"
          />

          {error && (
            <div style={{ background: "var(--incorrect-bg)", color: "var(--incorrect-text)", padding: "10px 14px", borderRadius: 6, marginTop: 12, fontSize: 14 }}>
              {error}
            </div>
          )}

          <button style={{ ...btnPrimary, marginTop: 20 }} type="submit" disabled={loading}>
            {loading ? "Joining…" : "Join Quiz"}
          </button>
        </form>
      </div>
    </div>
  );
}