import type { Resource } from "@/types/quiz";

const HIDDEN: React.CSSProperties = { position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap" };

/**
 * "Read more" links shown with an answer explanation. They point at the Skill Jar course behind the question's
 * submodule. Skill Jar needs an account to open a course, so the note says so; renders nothing without links.
 */
export default function SkillJarLinks({ resources }: { resources?: Resource[] }) {
  if (!resources?.length) return null;
  return (
    <div style={{ marginTop: "12px", paddingTop: "10px", borderTop: "1px solid var(--border)", fontSize: "14px", lineHeight: 1.6 }}>
      <strong style={{ display: "block", fontSize: "13px", letterSpacing: ".4px", textTransform: "uppercase", color: "var(--muted)" }}>
        Read more on Skill Jar
      </strong>
      <ul style={{ margin: "4px 0 0", paddingLeft: "18px" }}>
        {resources.map((r) => (
          <li key={r.url}>
            <a href={r.url} target="_blank" rel="noopener noreferrer" style={{ color: "#214f91", fontWeight: 600 }}>
              {r.title}
              <span style={HIDDEN}> (opens in a new tab)</span>
            </a>
          </li>
        ))}
      </ul>
      <span style={{ display: "block", marginTop: "4px", fontSize: "12px", color: "var(--muted)" }}>Opens in a new tab. You need a Skill Jar account to open the course.</span>
    </div>
  );
}
