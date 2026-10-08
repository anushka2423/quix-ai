"use client";

import Link from "next/link";

const CALENDLY_URL = "https://calendly.com/d/dtdk-7jq-xwm/1-1";

export default function Header({ moduleTitle }: { moduleTitle?: string }) {
  const onQuizPage = !!moduleTitle;

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
        minHeight: "88px",
        display: "flex",
        alignItems: "center",
        gap: "20px",
        position: "relative",
      }}>

        {/* Brand mark + wordmark */}
        <Link
          href="/"
          style={{
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            flexShrink: 0,
            fontSize: "15px",
            lineHeight: "1.15",
            color: "var(--ink)",
          }}
          aria-label="Agentic AI Institute home"
        >
          {/* Coded "Ai" mark matching reference HTML */}
          <span style={{
            width: "42px",
            height: "42px",
            background: "#071b39",
            color: "#ff9b50",
            borderRadius: "11px",
            fontFamily: "var(--font-manrope), Arial, sans-serif",
            fontWeight: 800,
            fontSize: "26px",
            display: "grid",
            placeContent: "center",
            position: "relative",
            flexShrink: 0,
          }} aria-hidden="true">
            A
            <span style={{
              fontSize: "14px",
              position: "absolute",
              right: "7px",
              bottom: "5px",
              color: "white",
              fontWeight: 800,
              lineHeight: 1,
            }}>
              i
            </span>
          </span>

          {/* Wordmark */}
          <span style={{ color: "var(--ink)" }}>
            Agentic AI<br />
            <strong style={{ fontWeight: 800 }}>Institute</strong>
          </span>
        </Link>

        {/* Center label */}
        <span className="nav-label-center" style={{
          position: "absolute",
          left: "50%",
          transform: "translateX(-50%)",
          fontSize: "14px",
          color: "var(--muted)",
          whiteSpace: "nowrap",
          pointerEvents: "none",
          overflow: "hidden",
          textOverflow: "ellipsis",
          maxWidth: "360px",
        }}>
          {moduleTitle ?? "Claude Developer preparation"}
        </span>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* CTA */}
        {onQuizPage ? (
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
        ) : (
          <Link
            href="/quiz/1"
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
            Start the full practice test
          </Link>
        )}
      </div>
    </header>
  );
}
