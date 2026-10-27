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
    <section className="section" aria-labelledby="seo-faq-title">
      <div className="container faq">
        <div className="stack">
          <span className="eyebrow">Common Questions</span>
          <h2 className="t-h2" id="seo-faq-title">
            {track ? `${TRACKS[track].name} Practice: Common Questions` : "Claude Certification: Common Questions"}
          </h2>
        </div>
        <div>
          <dl className="seo-faq__list">
            {faqs(track).map((f) => (
              <div key={f.q} className="seo-faq__item">
                <dt className="seo-faq__q">{f.q}</dt>
                <dd className="seo-faq__a">{f.a}</dd>
              </div>
            ))}
          </dl>
          <h3 className="seo-faq__resources-title">Claude Certification Study Resources</h3>
          <ul className="seo-faq__links">
            {Object.values(SEO_PAGES).map((p) => (
              <li key={p.slug}>
                <Link className="btn btn--link" href={`/${p.slug}`}>{p.h1}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
