import Link from "next/link";
import Header from "@/components/Header";
import Icon from "@/components/Icon";
import SiteFooter from "@/components/SiteFooter";
import { DISCLAIMER } from "@/lib/config";
import { TRACKS, TRACK_IDS } from "@/lib/blueprint";
import { CONTENT_UPDATED, SEO_PAGES, type SeoPage } from "@/lib/seo-pages";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import type { TrackId } from "@/types/quiz";

const TIPS = [
  "Take the readiness diagnostic first so you know your starting point.",
  "Study the highest-weight domains you are weakest in before anything else.",
  "Drill one domain at a time, then mix domains in quick sprints.",
  "Read the explanation for every wrong answer, not just the right one.",
  "Finish with full timed mocks and aim to stay above the pass line twice in a row.",
];

function DomainList({ id }: { id: TrackId }) {
  const t = TRACKS[id];
  return (
    <>
      <h3 className="t-h3">{t.name} ({t.code}) exam domains</h3>
      <p className="t-body t-muted measure">
        {t.items} questions in {t.minutes} minutes. Weights are the share of the exam each domain carries.
      </p>
      <ul className="study-list measure">
        {t.domains.map((d) => (
          <li key={d.name}>
            <strong>{d.name}</strong> ({d.weight}%): {d.objective}
          </li>
        ))}
      </ul>
    </>
  );
}

/** Server-rendered landing page for one search topic */
export default function StudyPage({ page }: { page: SeoPage }) {
  const url = `${SITE_URL}/${page.slug}`;
  const others = Object.values(SEO_PAGES).filter((p) => p.slug !== page.slug);
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Course",
        name: page.h1,
        description: page.description,
        url,
        provider: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
        isAccessibleForFree: true,
      },
      {
        "@type": "FAQPage",
        mainEntity: page.faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: page.h1, item: url },
        ],
      },
    ],
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <Header />
      <main id="main">
        <section className="page-head" aria-labelledby="page-title">
          <div className="container container--narrow">
            <Link className="page-head__crumb" href="/">
              <Icon name="arrow-left" size="sm" /> Back to the Quiz
            </Link>
            <div className="stack">
              <span className="eyebrow">Claude Certification Exam Prep</span>
              <h1 className="t-display" id="page-title">{page.h1}</h1>
              <p className="t-lead hero__lead">{page.intro}</p>
              <p className="t-body">{DISCLAIMER}</p>
              <div className="hero__actions">
                {(page.track ? [page.track] : TRACK_IDS).map((id) => (
                  <Link key={id} className="btn btn--accent btn--lg" href={`/${id}`}>
                    Start the {TRACKS[id].short} practice test ({TRACKS[id].code})
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container container--narrow stack">
            <h2 className="t-h2">Exam Domains and What to Study</h2>
            {(page.track ? [page.track] : TRACK_IDS).map((id) => (
              <DomainList key={id} id={id} />
            ))}

            <h2 className="t-h2">Study Tips for Exam Prep</h2>
            <ul className="study-list measure">
              {TIPS.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>

            <h2 className="t-h2">Frequently Asked Questions</h2>
            {page.faqs.map((f) => (
              <div key={f.q}>
                <h3 className="t-h3">{f.q}</h3>
                <p className="t-body t-muted measure">{f.a}</p>
              </div>
            ))}

            <h2 className="t-h2">More Claude Certification Resources</h2>
            <ul className="study-links">
              <li><Link className="btn btn--link" href="/">Claude certification practice quiz (home)</Link></li>
              {TRACK_IDS.map((id) => (
                <li key={id}><Link className="btn btn--link" href={`/${id}`}>{TRACKS[id].name} ({TRACKS[id].code}) free mock test</Link></li>
              ))}
              {others.map((p) => (
                <li key={p.slug}><Link className="btn btn--link" href={`/${p.slug}`}>{p.h1}</Link></li>
              ))}
            </ul>
            <p className="t-body t-muted">Last updated: {CONTENT_UPDATED}. {DISCLAIMER}</p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
