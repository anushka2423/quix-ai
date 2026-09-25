"use client";

import Link from "next/link";

const CALENDLY_URL = "https://calendly.com/d/dtdk-7jq-xwm/1-1";

export default function Header({ moduleTitle }: { moduleTitle?: string }) {
  return (
    <header
      style={{
        height: "64px",
        background: "#ffffff",
        borderBottom: "1px solid var(--border)",
        position: "relative",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 48px",
          height: "100%",
          display: "flex",
          alignItems: "center",
        }}
      >
        {/* Wordmark */}
        <Link
          href="/"
          style={{
            fontSize: "17px",
            fontWeight: 700,
            color: "var(--navy)",
            textDecoration: "none",
            letterSpacing: "-0.02em",
            flexShrink: 0,
          }}
        >
          Quix AI
        </Link>

        {/* Module title — centered absolutely */}
        {moduleTitle && (
          <span
            style={{
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
              fontSize: "14px",
              fontWeight: 500,
              color: "var(--ink-2)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              maxWidth: "360px",
              pointerEvents: "none",
            }}
          >
            {moduleTitle}
          </span>
        )}

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Book 1-on-1 pill */}
        <a
          href={CALENDLY_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-block",
            padding: "8px 18px",
            border: "1px solid var(--border)",
            borderRadius: "var(--r-pill)",
            fontSize: "14px",
            fontWeight: 500,
            color: "var(--ink)",
            textDecoration: "none",
            transition: "border-color 0.15s ease",
            flexShrink: 0,
            whiteSpace: "nowrap",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.borderColor =
              "var(--border-hover)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.borderColor =
              "var(--border)";
          }}
        >
          Book 1-on-1 feedback
        </a>
      </div>
    </header>
  );
}
