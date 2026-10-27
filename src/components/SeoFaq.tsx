import Link from "next/link";
import { SEO_PAGES } from "@/lib/seo-pages";
import { TRACKS } from "@/lib/blueprint";
import type { TrackId } from "@/types/quiz";

interface Faq {
  q: string;
  a: string;
}

function faqs(track?: TrackId): Faq[] {
  const a = TRACKS.associate;
  const d = TRACKS.developer;
  if (track) {
    const t = TRACKS[track];
    return [
      {
        q: `What is the ${t.name} (${t.code}) certification?`,
        a: `The ${t.name} exam is part of the Claude certification program. It has ${t.items} questions in ${t.minutes} minutes and is aimed at: ${t.audience}`,
      },
      {
        q: `Is there a free ${t.short} Claude mock test?`,
        a: `Yes. This site offers a free ${t.short} mock test with ${t.items} questions, plus a readiness diagnostic, quick sprints and domain drills, with instant feedback on every answer.`,
      },
      {
        q: "How is my readiness estimated?",
        a: "Your answers are mapped to the domains of the exam blueprint and converted to an estimate on the 1,000-point scale. It is a practice estimate, not an official score.",
      },
    ];
  }
  return [
    {
      q: "What is the Claude certification?",
      a: `The Claude certification program from Anthropic has two exams: the ${a.name} (${a.code}, ${a.items} questions) for non-coders who use Claude daily, and the ${d.name} (${d.code}, ${d.items} questions) for engineers building on the Claude API.`,
    },
    {
      q: "Is there a free Claude mock test?",
      a: "Yes. Take a free Claude mock test for either exam, with full-length mocks, readiness diagnostics, quick sprints and domain drills. Every answer gets instant feedback.",
    },
    {
      q: "How do I prepare for the Claude Developer certification mock test?",
      a: `Start with the readiness diagnostic to find weak domains, drill those domains, then take the full ${d.items}-question ${d.short} mock under exam timing.`,
    },
    {
      q: "Is this an official Anthropic certification site?",
      a: "No. This is an independent practice resource and is not affiliated with or endorsed by Anthropic.",
    },
  ];
}

/** Server-rendered, crawlable Q&A so search engines can read the page's topic without running JavaScript */
export default function SeoFaq({ track }: { track?: TrackId }) {
  return (
    <section className="container" aria-labelledby="seo-faq-title" style={{ padding: "48px 0" }}>
      <h2 className="t-h1" id="seo-faq-title">
        {track ? `${TRACKS[track].name} practice: common questions` : "Claude certification: common questions"}
      </h2>
      {faqs(track).map((f) => (
        <div key={f.q} style={{ marginTop: 20 }}>
          <h3 className="t-h3">{f.q}</h3>
          <p>{f.a}</p>
        </div>
      ))}
      <h3 className="t-h3" style={{ marginTop: 28 }}>Claude certification study resources</h3>
      <ul>
        {Object.values(SEO_PAGES).map((p) => (
          <li key={p.slug}>
            <Link href={`/${p.slug}`}>{p.h1}</Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
