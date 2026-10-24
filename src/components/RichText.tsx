import type { ReactNode } from "react";

/** Question and option text: keeps line breaks, shows ``` fences as code blocks and `inline` code as code. */
export default function RichText({ text }: { text: string }) {
  const parts = text.split(/```[a-z]*\n?([\s\S]*?)```/);
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <pre key={i} style={{ margin: "12px 0", padding: "12px 14px", background: "var(--canvas)", border: "1px solid var(--border)", borderRadius: "8px", overflowX: "auto", fontSize: "13px", lineHeight: 1.55, fontWeight: 400, whiteSpace: "pre" }}>
            <code>{part.replace(/\n$/, "")}</code>
          </pre>
        ) : (
          <span key={i} style={{ whiteSpace: "pre-wrap" }}>{inline(part)}</span>
        )
      )}
    </>
  );
}

function inline(text: string): ReactNode[] {
  return text.split(/(`[^`\n]+`)/).map((seg, i) =>
    seg.length > 2 && seg.startsWith("`") && seg.endsWith("`") ? (
      <code key={i} style={{ fontSize: "0.92em", padding: "1px 5px", borderRadius: "4px", background: "rgba(15,27,51,.07)", fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>{seg.slice(1, -1)}</code>
    ) : (
      seg
    )
  );
}
