"use client";

import Link from "next/link";

const CALENDLY_URL = "https://calendly.com/d/dtdk-7jq-xwm/1-1";

export default function Header({ moduleTitle }: { moduleTitle?: string }) {
  return (
    <header style={{
      background: "#ffffff",
      borderBottom: "1px solid var(--border)",
      position: "sticky",
      top: 0,
      zIndex: 50,
      flexShrink: 0,
    }}>
      <div className="page-wrap" style={{
        height: "88px",
        display: "flex",
        alignItems: "center",
        gap: "20px",
      }}>
        {/* Brand */}
        <Link
          href="/"
          style={{
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            flexShrink: 0,
          }}
          aria-label="Agentic AI Institute home"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/agentic-ai-logo-cropped.png"
            alt="Agentic AI Institute"
            className="nav-logo-img"
            style={{ height: "52px", width: "auto" }}
          />
        </Link>

        {/* Center label */}
        <span className="nav-label-center">
          {moduleTitle ?? "AI PM Readiness Quiz"}
        </span>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* CTA */}
        <a
          href={CALENDLY_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="nav-book-btn"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "11px 18px",
            border: "1px solid var(--border)",
            borderRadius: "9px",
            fontSize: "14px",
            fontWeight: 700,
            color: "var(--ink)",
            textDecoration: "none",
            transition: "border-color 0.15s, background 0.15s",
            whiteSpace: "nowrap",
            minHeight: "42px",
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--border-hover)";
            (e.currentTarget as HTMLAnchorElement).style.background = "var(--canvas)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--border)";
            (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
          }}
        >
          Book 1-on-1 feedback
        </a>
      </div>
    </header>
  );
}
