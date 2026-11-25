"use client";

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div style={{ padding: "32px 40px" }}>
      <h1 style={{ fontSize: 22, margin: "0 0 8px" }}>Something went wrong</h1>
      <p style={{ margin: "0 0 16px" }}>This admin page failed to load.{error.digest ? ` (ref: ${error.digest})` : ""}</p>
      <button onClick={reset} style={{ padding: "8px 14px", cursor: "pointer" }}>Try again</button>
    </div>
  );
}
