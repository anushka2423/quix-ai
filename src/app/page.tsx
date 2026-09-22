import Link from "next/link";
import { modules } from "@/lib/quiz-data";

const CALENDLY_URL = "https://calendly.com/d/dtdk-7jq-xwm/1-1";
const COMPLETED = 0;
const UNLOCKED_MODULES = modules.filter((m) => !m.locked);
const TOTAL = UNLOCKED_MODULES.length;

function quizDuration(questionCount: number) {
  return `~${Math.round(questionCount * 1.5)} min`;
}

export default function Home() {
  return (
    <main style={{ minHeight: "100vh" }}>
      {/* ── Hero ── */}
      <section
        style={{
          background: "var(--color-navy-900)",
          padding: "88px 0 80px",
        }}
      >
        <div style={{ maxWidth: "900px", margin: "0 auto", padding: "0 48px" }}>
          {/* Eyebrow */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "2px",
                background: "var(--color-orange-500)",
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontFamily: "var(--font-geist)",
                fontSize: "13px",
                fontWeight: 500,
                color: "var(--color-on-dark-muted)",
                letterSpacing: "0.2px",
              }}
            >
              Gen AI · Skills Assessment
            </span>
          </div>

          {/* Title */}
          <h1
            style={{
              fontFamily: "var(--font-geist)",
              fontSize: "clamp(38px, 5.5vw, 58px)",
              fontWeight: 500,
              lineHeight: 1.05,
              letterSpacing: "-2px",
              color: "var(--color-on-dark)",
              maxWidth: "700px",
              margin: 0,
            }}
          >
            Are you an AI-ready Product Manager?
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontFamily: "var(--font-geist)",
              fontSize: "17px",
              lineHeight: 1.65,
              color: "var(--color-on-dark-muted)",
              marginTop: "18px",
              maxWidth: "580px",
            }}
          >
            Test your knowledge across agentic AI, product roadmapping,
            evaluation, and observability. Get a personalized skills breakdown
            in under 15 minutes.
          </p>

          {/* CTA row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginTop: "32px",
              flexWrap: "wrap",
            }}
          >
            {/* Primary CTA */}
            <Link
              href="/quiz/1"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                fontFamily: "var(--font-golos)",
                fontSize: "16px",
                fontWeight: 500,
                padding: "13px 20px 13px 28px",
                borderRadius: "var(--radius-md)",
                background: "var(--color-canvas)",
                color: "var(--color-ink-button)",
                textDecoration: "none",
                lineHeight: 1.2,
              }}
            >
              Start Assessment
              <span
                style={{
                  width: "30px",
                  height: "30px",
                  borderRadius: "var(--radius-sm)",
                  background: "var(--color-primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <ArrowIcon />
              </span>
            </Link>

            {/* Bookmark */}
            <button
              style={{
                background: "var(--color-canvas)",
                border: "none",
                borderRadius: "var(--radius-md)",
                padding: "12px 13px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <BookmarkSVG />
            </button>

            {/* Progress text */}
            <span
              style={{
                fontFamily: "var(--font-geist)",
                fontSize: "13px",
                color: "var(--color-on-dark-muted)",
                marginLeft: "4px",
              }}
            >
              {COMPLETED} of {TOTAL} completed
            </span>
          </div>

        </div>
      </section>

      {/* ── Modules section ── */}
      <section
        style={{
          background: "var(--color-surface-deep)",
          padding: "64px 0 96px",
        }}
      >
        <div style={{ maxWidth: "900px", margin: "0 auto", padding: "0 48px" }}>
          {/* Section eyebrow */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "8px",
            }}
          >
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "2px",
                background: "var(--color-orange-500)",
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontFamily: "var(--font-geist)",
                fontSize: "13px",
                fontWeight: 500,
                color: "var(--color-steel)",
              }}
            >
              Modules
            </span>
          </div>

          <h2
            style={{
              fontFamily: "var(--font-golos)",
              fontSize: "28px",
              fontWeight: 600,
              letterSpacing: "-0.3px",
              color: "var(--color-ink)",
              margin: "0 0 32px",
            }}
          >
            Choose your track
          </h2>

          {/* Unlocked module cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {modules.filter((m) => !m.locked).map((mod) => (
              <Link
                key={mod.id}
                href={`/quiz/${mod.id}`}
                style={{ textDecoration: "none" }}
              >
                <div
                  className="module-card"
                  style={{
                    background: "var(--color-canvas)",
                    border: "1px solid var(--color-hairline)",
                    borderRadius: "var(--radius-lg)",
                    padding: "28px",
                    display: "flex",
                    gap: "24px",
                    alignItems: "flex-start",
                    cursor: "pointer",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      width: "80px",
                      height: "80px",
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "var(--color-surface-blue-tint)",
                      borderRadius: "var(--radius-lg)",
                    }}
                  >
                    {mod.id === 1 ? <FoundationsIcon /> : mod.id === 2 ? <AgentsIcon /> : <MetricsIcon />}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span
                        style={{
                          fontFamily: "var(--font-geist)",
                          fontSize: "11px",
                          fontWeight: 700,
                          letterSpacing: "1px",
                          color: "var(--color-primary)",
                          background: "var(--color-surface-blue-soft)",
                          padding: "3px 8px",
                          borderRadius: "var(--radius-sm)",
                        }}
                      >
                        0{mod.id}
                      </span>
                      {mod.status && (
                        <span
                          style={{
                            marginLeft: "auto",
                            fontFamily: "var(--font-geist)",
                            fontSize: "12px",
                            color: "var(--color-ink)",
                            border: "1px solid var(--color-hairline)",
                            borderRadius: "var(--radius-full)",
                            padding: "4px 14px",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {mod.status}
                        </span>
                      )}
                    </div>

                    <h3
                      style={{
                        fontFamily: "var(--font-golos)",
                        fontSize: "22px",
                        fontWeight: 600,
                        lineHeight: 1.25,
                        color: "var(--color-ink)",
                        margin: "10px 0 6px",
                      }}
                    >
                      {mod.title}
                    </h3>

                    <p
                      style={{
                        fontFamily: "var(--font-geist)",
                        fontSize: "15px",
                        lineHeight: 1.55,
                        color: "var(--color-slate)",
                        margin: "0 0 16px",
                      }}
                    >
                      {mod.description}
                    </p>

                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                      <span
                        style={{
                          fontFamily: "var(--font-geist)",
                          fontSize: "13px",
                          color: "var(--color-steel)",
                          display: "flex",
                          alignItems: "center",
                          gap: "5px",
                        }}
                      >
                        <QuestionDotIcon />
                        {mod.questions.length} Questions
                      </span>
                      <span style={{ fontFamily: "var(--font-geist)", fontSize: "13px", color: "var(--color-stone)" }}>
                        {quizDuration(mod.questions.length)}
                      </span>
                      <span style={{ marginLeft: "auto" }}>
                        <ChevronRightIcon />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* ── Unlock CTA ── */}
          <div
            style={{
              margin: "40px 0 24px",
              background: "var(--color-navy-900)",
              borderRadius: "var(--radius-xl)",
              padding: "32px 36px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "24px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "2px",
                    background: "var(--color-orange-500)",
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontFamily: "var(--font-geist)",
                    fontSize: "12px",
                    fontWeight: 600,
                    letterSpacing: "0.5px",
                    textTransform: "uppercase",
                    color: "var(--color-on-dark-muted)",
                  }}
                >
                  More modules available
                </span>
              </div>
              <p
                style={{
                  fontFamily: "var(--font-golos)",
                  fontSize: "20px",
                  fontWeight: 600,
                  color: "var(--color-on-dark)",
                  margin: 0,
                  lineHeight: 1.3,
                }}
              >
                Unlock the full assessment
              </p>
              <p
                style={{
                  fontFamily: "var(--font-geist)",
                  fontSize: "14px",
                  color: "var(--color-on-dark-muted)",
                  margin: "6px 0 0",
                  lineHeight: 1.5,
                }}
              >
                Book a free 1-on-1 to get access to all modules and a personalised review of your results.
              </p>
            </div>
            <a
              href={CALENDLY_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                fontFamily: "var(--font-golos)",
                fontSize: "16px",
                fontWeight: 500,
                padding: "13px 20px 13px 28px",
                borderRadius: "var(--radius-md)",
                background: "var(--color-canvas)",
                color: "var(--color-ink-button)",
                textDecoration: "none",
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              Book a call
              <span
                style={{
                  width: "30px",
                  height: "30px",
                  borderRadius: "var(--radius-sm)",
                  background: "var(--color-primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ArrowIcon />
              </span>
            </a>
          </div>

          {/* Locked module cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {modules.filter((m) => m.locked).map((mod) => (
              <a
                key={mod.id}
                href={CALENDLY_URL}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: "none" }}
              >
                <div
                  style={{
                    background: "var(--color-canvas)",
                    border: "1px solid var(--color-hairline)",
                    borderRadius: "var(--radius-lg)",
                    padding: "28px",
                    display: "flex",
                    gap: "24px",
                    alignItems: "flex-start",
                    cursor: "pointer",
                    opacity: 0.65,
                    position: "relative",
                    transition: "opacity 0.2s",
                  }}
                >
                  {/* Illustration — greyscale tint */}
                  <div
                    style={{
                      width: "80px",
                      height: "80px",
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "var(--color-hairline)",
                      borderRadius: "var(--radius-lg)",
                    }}
                  >
                    <LockIcon />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                      {/* Lock number badge */}
                      <span
                        style={{
                          fontFamily: "var(--font-geist)",
                          fontSize: "11px",
                          fontWeight: 700,
                          letterSpacing: "1px",
                          color: "var(--color-stone)",
                          background: "var(--color-hairline)",
                          padding: "3px 8px",
                          borderRadius: "var(--radius-sm)",
                        }}
                      >
                        0{mod.id}
                      </span>
                      {/* Locked badge */}
                      <span
                        style={{
                          marginLeft: "auto",
                          fontFamily: "var(--font-geist)",
                          fontSize: "12px",
                          fontWeight: 600,
                          color: "var(--color-stone)",
                          border: "1px solid var(--color-hairline)",
                          borderRadius: "var(--radius-full)",
                          padding: "4px 14px",
                          display: "flex",
                          alignItems: "center",
                          gap: "5px",
                          whiteSpace: "nowrap",
                        }}
                      >
                        🔒 Locked
                      </span>
                    </div>

                    <h3
                      style={{
                        fontFamily: "var(--font-golos)",
                        fontSize: "22px",
                        fontWeight: 600,
                        lineHeight: 1.25,
                        color: "var(--color-ink)",
                        margin: "0 0 6px",
                      }}
                    >
                      {mod.title}
                    </h3>

                    <p
                      style={{
                        fontFamily: "var(--font-geist)",
                        fontSize: "15px",
                        lineHeight: 1.55,
                        color: "var(--color-slate)",
                        margin: "0 0 16px",
                      }}
                    >
                      {mod.description}
                    </p>

                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span
                        style={{
                          fontFamily: "var(--font-geist)",
                          fontSize: "13px",
                          color: "var(--color-primary)",
                          fontWeight: 500,
                        }}
                      >
                        Book a call to unlock →
                      </span>
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

/* ── Icons ── */

function LockIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="11" width="18" height="11" rx="2" stroke="#999999" strokeWidth="1.5" />
      <path d="M7 11V7a5 5 0 0110 0v4" stroke="#999999" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="12" cy="16" r="1.5" fill="#999999" />
    </svg>
  );
}

function FoundationsIcon() {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
      <rect x="5" y="28" width="14" height="11" rx="2" stroke="#006FFF" strokeWidth="1.5" />
      <rect x="15" y="19" width="14" height="11" rx="2" stroke="#6D7382" strokeWidth="1.5" />
      <rect x="25" y="10" width="14" height="11" rx="2" stroke="#6D7382" strokeWidth="1.5" />
    </svg>
  );
}

function AgentsIcon() {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
      <circle cx="22" cy="22" r="5" stroke="#006FFF" strokeWidth="1.5" />
      <circle cx="7" cy="13" r="4" stroke="#6D7382" strokeWidth="1.5" />
      <circle cx="37" cy="13" r="4" stroke="#6D7382" strokeWidth="1.5" />
      <circle cx="7" cy="31" r="4" stroke="#6D7382" strokeWidth="1.5" />
      <circle cx="37" cy="31" r="4" stroke="#6D7382" strokeWidth="1.5" />
      <line x1="11" y1="15" x2="17" y2="19" stroke="#6D7382" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="33" y1="15" x2="27" y2="19" stroke="#6D7382" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="11" y1="29" x2="17" y2="25" stroke="#6D7382" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="33" y1="29" x2="27" y2="25" stroke="#6D7382" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function MetricsIcon() {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
      <rect x="5" y="5" width="34" height="34" rx="3" stroke="#6D7382" strokeWidth="1.5" />
      <polyline points="11,30 18,20 24,25 33,14" stroke="#006FFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="33" cy="14" r="2" fill="#006FFF" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M3 11L11 3M11 3H5M11 3V9" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BookmarkSVG() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M5 3h14a1 1 0 011 1v17l-8-4-8 4V4a1 1 0 011-1z" stroke="#006FFF" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M7 5l4 4-4 4" stroke="#006FFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function QuestionDotIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <circle cx="6" cy="6" r="5" stroke="#6D7382" strokeWidth="1.2" />
      <path d="M6 7.5V8" stroke="#6D7382" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M4.5 5c0-1 .67-1.5 1.5-1.5s1.5.5 1.5 1.5c0 .75-.5 1-1 1.25S6 6.75 6 7" stroke="#6D7382" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}
