"use client";

import { useState } from "react";

const CALENDLY_URL = "https://calendly.com/d/dtdk-7jq-xwm/1-1";
const TIME_SLOTS = [
  "9:00 AM",
  "10:00 AM",
  "11:00 AM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
];

function getNextWeekdays(): string[] {
  const days: string[] = [];
  const d = new Date();
  const fmt = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  let checked = 0;
  while (days.length < 5) {
    checked++;
    d.setDate(d.getDate() + 1);
    const dow = d.getDay();
    if (dow !== 0 && dow !== 6) {
      days.push(fmt.format(new Date(d)));
    }
    if (checked > 30) break;
  }
  return days;
}

interface BookingModalProps {
  open: boolean;
  onClose: () => void;
}

export default function BookingModal({ open, onClose }: BookingModalProps) {
  const [step, setStep] = useState<"pick" | "success">("pick");
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [emailError, setEmailError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const weekdays = getNextWeekdays();

  function handleClose() {
    setStep("pick");
    setSelectedDay("");
    setSelectedTime("");
    setEmail("");
    setNote("");
    setEmailError("");
    setLoading(false);
    onClose();
  }

  function handleConfirm() {
    setEmailError("");
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setEmailError("Please enter a valid work email address.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      window.open(CALENDLY_URL, "_blank", "noopener,noreferrer");
      setLoading(false);
      setStep("success");
    }, 1200);
  }

  const canConfirm = selectedDay && selectedTime && email.trim() && !loading;

  const pillStyle = (active: boolean) => ({
    display: "inline-block",
    padding: "7px 16px",
    borderRadius: "var(--r-pill)" as const,
    border: active ? "none" : "1px solid var(--border)",
    background: active ? "var(--navy)" : "var(--canvas)",
    color: active ? "#ffffff" : "var(--ink)",
    fontSize: "13px",
    fontWeight: 500 as const,
    cursor: "pointer" as const,
    whiteSpace: "nowrap" as const,
    transition: "all 0.15s",
  });

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9998,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(15,27,51,0.6)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        padding: "24px",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        className="card-enter"
        style={{
          background: "#ffffff",
          borderRadius: "var(--r-feature)",
          padding: "40px",
          maxWidth: "480px",
          width: "calc(100% - 48px)",
          boxShadow: "var(--shadow-feature)",
          position: "relative",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            border: "1px solid var(--border)",
            background: "transparent",
            color: "var(--muted)",
            fontSize: "18px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            lineHeight: 1,
          }}
          aria-label="Close"
        >
          ×
        </button>

        {step === "pick" ? (
          <>
            <h2
              style={{
                fontSize: "22px",
                fontWeight: 600,
                color: "var(--ink)",
                margin: "0 0 6px",
                letterSpacing: "-0.02em",
              }}
            >
              Book your 1-on-1
            </h2>
            <p style={{ fontSize: "14px", color: "var(--muted)", margin: "0 0 28px" }}>
              Free 30-min session with a Gen AI PM expert
            </p>

            {/* Day selection */}
            <label
              style={{
                display: "block",
                fontSize: "13px",
                fontWeight: 600,
                color: "var(--ink-2)",
                marginBottom: "10px",
              }}
            >
              Choose a day
            </label>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "8px",
                marginBottom: "24px",
              }}
            >
              {weekdays.map((day) => (
                <button
                  key={day}
                  style={pillStyle(selectedDay === day)}
                  onClick={() => setSelectedDay(day)}
                >
                  {day}
                </button>
              ))}
            </div>

            {/* Time selection */}
            <label
              style={{
                display: "block",
                fontSize: "13px",
                fontWeight: 600,
                color: "var(--ink-2)",
                marginBottom: "10px",
              }}
            >
              Choose a time
            </label>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "8px",
                marginBottom: "24px",
              }}
            >
              {TIME_SLOTS.map((t) => (
                <button
                  key={t}
                  style={pillStyle(selectedTime === t)}
                  onClick={() => setSelectedTime(t)}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Email */}
            <label
              style={{
                display: "block",
                fontSize: "13px",
                fontWeight: 600,
                color: "var(--ink-2)",
                marginBottom: "8px",
              }}
            >
              Work email *
            </label>
            <input
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError("");
              }}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "var(--r-input)",
                border: emailError
                  ? "1.5px solid var(--incorrect-text)"
                  : "1px solid var(--border)",
                fontSize: "15px",
                color: "var(--ink)",
                outline: "none",
                boxSizing: "border-box",
                transition: "border-color 0.15s",
              }}
              onFocus={(e) => {
                if (!emailError)
                  (e.target as HTMLInputElement).style.borderColor = "var(--navy)";
              }}
              onBlur={(e) => {
                if (!emailError)
                  (e.target as HTMLInputElement).style.borderColor = "var(--border)";
              }}
            />
            {emailError && (
              <p
                style={{
                  fontSize: "13px",
                  color: "var(--incorrect-text)",
                  margin: "6px 0 0",
                }}
              >
                {emailError}
              </p>
            )}

            {/* Note */}
            <label
              style={{
                display: "block",
                fontSize: "13px",
                fontWeight: 600,
                color: "var(--ink-2)",
                marginTop: "16px",
                marginBottom: "8px",
              }}
            >
              Note (optional)
            </label>
            <textarea
              placeholder="Anything you'd like us to know beforehand…"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "var(--r-input)",
                border: "1px solid var(--border)",
                fontSize: "15px",
                color: "var(--ink)",
                outline: "none",
                boxSizing: "border-box",
                minHeight: "80px",
                resize: "vertical",
                transition: "border-color 0.15s",
                fontFamily: "inherit",
              }}
              onFocus={(e) => {
                (e.target as HTMLTextAreaElement).style.borderColor = "var(--navy)";
              }}
              onBlur={(e) => {
                (e.target as HTMLTextAreaElement).style.borderColor = "var(--border)";
              }}
            />

            {/* Confirm button */}
            <button
              onClick={handleConfirm}
              disabled={!canConfirm}
              style={{
                marginTop: "24px",
                width: "100%",
                padding: "14px",
                borderRadius: "var(--r-card)",
                border: "none",
                background: canConfirm ? "var(--navy)" : "var(--disabled)",
                color: "#ffffff",
                fontSize: "16px",
                fontWeight: 600,
                cursor: canConfirm ? "pointer" : "not-allowed",
                transition: "background 0.2s",
              }}
            >
              {loading ? "Booking…" : "Confirm booking"}
            </button>
          </>
        ) : (
          /* Success step */
          <div style={{ textAlign: "center", padding: "8px 0" }}>
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                background: "var(--correct-bg)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 24px",
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M5 12l4.5 4.5L19 7"
                  stroke="var(--correct-text)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h2
              style={{
                fontSize: "22px",
                fontWeight: 600,
                color: "var(--ink)",
                margin: "0 0 12px",
                letterSpacing: "-0.02em",
              }}
            >
              You&apos;re booked!
            </h2>
            <p style={{ fontSize: "15px", color: "var(--muted)", lineHeight: 1.6, margin: "0 0 32px" }}>
              Check your email for confirmation. We&apos;ve also opened Calendly to let
              you pick your exact slot.
            </p>
            <button
              onClick={handleClose}
              style={{
                padding: "11px 32px",
                borderRadius: "var(--r-pill)",
                border: "none",
                background: "var(--navy)",
                color: "#ffffff",
                fontSize: "15px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
