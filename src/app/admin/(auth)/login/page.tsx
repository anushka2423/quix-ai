"use client";

import { useActionState } from "react";
import { loginAction } from "@/app/admin/actions";

export default function LoginPage() {
  const [state, action, pending] = useActionState(loginAction, undefined);

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--canvas)",
      }}
    >
      <div
        style={{
          background: "#fff",
          border: "1px solid var(--border)",
          borderRadius: "var(--r-card)",
          boxShadow: "var(--shadow-card)",
          padding: "40px",
          width: "100%",
          maxWidth: "400px",
        }}
      >
        {/* Logo mark */}
        <div
          style={{
            width: "36px",
            height: "36px",
            background: "var(--navy)",
            borderRadius: "8px",
            marginBottom: "16px",
          }}
        />

        <h1
          style={{
            fontSize: "20px",
            fontWeight: 700,
            color: "var(--ink)",
            margin: "0 0 4px",
            letterSpacing: "-0.02em",
          }}
        >
          Admin Sign In
        </h1>
        <p
          style={{
            fontSize: "14px",
            color: "var(--muted)",
            margin: "0 0 28px",
          }}
        >
          Quix Admin Dashboard
        </p>

        <form
          action={action}
          style={{ display: "flex", flexDirection: "column", gap: "16px" }}
        >
          <div>
            <label style={labelStyle} htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="admin@example.com"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle} htmlFor="password">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              placeholder="••••••••"
              style={inputStyle}
            />
          </div>

          {state?.error && (
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
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            style={{
              padding: "10px",
              background: "var(--navy)",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: 600,
              cursor: pending ? "not-allowed" : "pointer",
              opacity: pending ? 0.7 : 1,
              letterSpacing: "-0.01em",
              marginTop: "4px",
            }}
          >
            {pending ? "Signing in…" : "Sign in →"}
          </button>
        </form>
      </div>
    </main>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "13px",
  fontWeight: 500,
  color: "var(--ink-2)",
  marginBottom: "6px",
};

const inputStyle: React.CSSProperties = {
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
