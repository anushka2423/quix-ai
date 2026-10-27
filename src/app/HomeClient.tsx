"use client";

import "./design/home.css";
import { useEffect, useState } from "react";
import Link from "next/link";
import { BOOKING_URL } from "@/lib/config";
import { TRACKS, TRACK_IDS } from "@/lib/blueprint";
import type { TrackMeta } from "@/lib/bank";
import type { TrackId } from "@/types/quiz";
import { track as trackEvent } from "@/lib/analytics";
import Header from "@/components/Header";
import SiteFooter from "@/components/SiteFooter";
import Icon from "@/components/Icon";

const CALENDLY_URL = BOOKING_URL;
const INSTRUCTOR_PHOTO = "https://framerusercontent.com/images/UGcM0D2QVpSlgE1so8RC8VHnndA.jpeg?width=512&height=512";

type Meta = Record<TrackId, TrackMeta>;

const bar = (v: string) => ({ "--value": v }) as React.CSSProperties;
const pass = (v: string) => ({ "--pass": v }) as React.CSSProperties;

const OUTCOMES = [
  {
    n: "01",
    h: "Instant Feedback on Every Answer",
    p: "Wrong picks turn red, the right answer turns green, and a written explanation opens straight away.",
  },
  {
    n: "02",
    h: "A Readiness Estimate Out of 1,000",
    p: "See your estimate on the official scale with the 720 pass line marked, plus percent correct for every domain. It is an estimate, not an official score.",
  },
  {
    n: "03",
    h: "A Plan If You Fall Short",
    p: "Score under 720 on a full mock or the diagnostic and you get a detailed report, a day-by-day study plan, a PDF and an offer of a free review call.",
  },
];

const STEPS = [
  {
    n: "1",
    h: "Pick Your Track and Any Module",
    p: "Start with the diagnostic, or jump to a quick sprint, a domain drill or a full mock. Nothing is locked.",
  },
  {
    n: "2",
    h: "Answer and Learn on the Spot",
    p: "Get red and green feedback with an explanation after every question, and ask the Claude-powered tutor to explain it differently.",
  },
  {
    n: "3",
    h: "See How Ready You Are",
    p: "Get your readiness estimate, your weakest domain and what to practise next. Retake until it stays at 800 or higher.",
  },
];

const FAQS = [
  {
    q: "Which exams does this cover?",
    a: "The Claude Certified Associate (CCAO-F) and the Claude Certified Developer (CCDV-F). Both tracks are here, with topic modules that follow the official exam-guide domains and weights.",
  },
  {
    q: "Is it free? Why do you ask for my email?",
    a: "Every module is free and open. We ask for your email once, after your first answered question, to save your progress and send your report. You can skip it twice before it is required.",
  },
  {
    q: "How is the readiness estimate calculated?",
    a: "It is your domain-weighted percent correct mapped onto the 100–1,000 scale, with 720 marked as the pass line. Anthropic does not publish how percent maps to the scaled score, so it is labelled an estimate everywhere. We call you ready when it stays at 800 or higher across 2 full mocks.",
  },
  {
    q: "Is this an official Anthropic exam?",
    a: "No. This is an independent practice resource from Agentic AI Institute, not affiliated with or endorsed by Anthropic. It does not reproduce real exam questions, award a certification or guarantee a pass.",
  },
  {
    q: "Will I have to book a call or buy the course?",
    a: "No. You can use the quizzes and your study plan on your own. If you score under 720 you are offered a free 30-minute review call, and the course is an optional next step.",
  },
];

export default function HomeClient({ meta }: { meta: Meta }) {
  const totalQ = TRACK_IDS.reduce((n, t) => n + meta[t].total, 0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    trackEvent("landing_view");
  }, []);

  return (
    <>
      <Header />

      <main id="main">
        {/* Hero */}
        <section className="hero" aria-labelledby="hero-title">
          <div className="container hero__inner">
            <div className="hero__copy">
              <span className="eyebrow">Claude Certification Preparation</span>
              <h1 className="t-display" id="hero-title">
                Claude Certification <span className="t-accent">Practice Quiz</span>
              </h1>
              <p className="t-lead hero__lead">
                Find out whether you are ready for the Claude Certified Associate or Developer exam. Get instant red and
                green feedback on every answer and a readiness estimate on the official 1,000-point scale.
              </p>
              <div className="hero__actions">
                {TRACK_IDS.map((id, i) => (
                  <Link key={id} className={`btn ${i === 0 ? "btn--accent" : "btn--white"} btn--lg`} href={`/${id}`}>
                    {TRACKS[id].short} ({TRACKS[id].code})
                  </Link>
                ))}
              </div>
              <ul className="hero__meta">
                <li><Icon name="check" size="sm" />{TRACK_IDS.length} exam tracks</li>
                <li><Icon name="check" size="sm" />{totalQ} questions</li>
                <li><Icon name="check" size="sm" />Free</li>
                <li><Icon name="check" size="sm" />Every module open</li>
              </ul>
              <div className="hero__trust">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={INSTRUCTOR_PHOTO} alt="Mahesh Yadav" width={48} height={48} />
                <p>
                  <strong>Created by Agentic AI Institute</strong>
                  <br />
                  From Mahesh Yadav&apos;s Claude certification preparation program
                </p>
              </div>
            </div>

            {/* Prep card */}
            <aside className="prep-card" aria-label="Your Claude Certification Prep">
              <div className="prep-card__head">
                <span className="prep-card__title">Your Claude Certification Prep</span>
                <span className="tag tag--neutral">{TRACK_IDS.map((id) => TRACKS[id].code).join(" · ")}</span>
              </div>
              <div className="prep-card__stats">
                <div className="stat stat--light"><span className="stat__value">{totalQ}</span><span className="stat__label">Practice questions</span></div>
                <div className="stat stat--light"><span className="stat__value">{TRACK_IDS.length}</span><span className="stat__label">Exam tracks</span></div>
              </div>
              <p className="callout-orange"><strong>Every module open · Free to start</strong>Diagnostic, sprints, drills, full mocks</p>
              <nav className="prep-list" aria-label="Exam tracks">
                {TRACK_IDS.map((id) => (
                  <Link key={id} href={`/${id}`}>
                    <span className="prep-list__code">{TRACKS[id].code}</span>
                    <span className="prep-list__name">{TRACKS[id].name}</span>
                    <span className="prep-list__count">{meta[id].total}Q</span>
                  </Link>
                ))}
              </nav>
              <div className="callout-orange">
                <span className="callout-orange__label">Personalised to Your Answers</span>
                <strong>Get a readiness estimate and study plan.</strong>
                Finish a module to see where to focus next.
              </div>
              <p className="t-xs t-muted">Every module is free. An email unlocks your full report.</p>
            </aside>
          </div>
        </section>

        {/* Proof strip */}
        <section className="proof-strip" aria-label="Highlights">
          <div className="container proof-strip__inner">
            <p className="proof-strip__item proof-strip__intro">Claude Associate and Developer practice from <strong>Agentic AI Institute</strong></p>
            <div className="proof-strip__item"><strong>Detailed Practice</strong>{totalQ} original questions</div>
            <div className="proof-strip__item"><strong>Both Exams, One Site</strong>Associate and Developer, all modules open</div>
            <div className="proof-strip__item"><strong>Instant Feedback</strong>Readiness estimate out of 1,000</div>
          </div>
        </section>

        {/* Exam tracks */}
        <section className="section" id="tracks" aria-labelledby="tracks-title">
          <div className="container">
            <div className="section-head">
              <span className="eyebrow">Choose Your Exam</span>
              <h2 className="t-h1" id="tracks-title">Two Exams.<br />Every Module Open.</h2>
              <p className="t-muted measure">
                Each track offers a readiness diagnostic, quick sprints, domain drills and a full mock that copies the real
                exam format and domain weights.
              </p>
            </div>

            <div className="grid grid--2">
              {TRACK_IDS.map((id) => {
                const t = TRACKS[id];
                return (
                  <article key={id} className="card card--lg card--interactive track-card">
                    <div className="cluster">
                      <span className="tag">{t.code}</span>
                      <span className="tag tag--neutral">Open Access</span>
                    </div>
                    <div className="stack">
                      <h3 className="card__title">{t.name}</h3>
                      <p className="t-muted t-sm">{t.audience}</p>
                    </div>
                    <dl className="track-card__facts">
                      <div><dt>Real Exam</dt><dd>{t.items} Q</dd></div>
                      <div><dt>Time</dt><dd>{t.minutes} Min</dd></div>
                      <div><dt>Domains</dt><dd>{meta[id].domains.length}</dd></div>
                    </dl>
                    <ul className="rules">
                      <li><Icon name="check" /><span>{meta[id].total} practice questions</span></li>
                      <li><Icon name="check" /><span>Diagnostic, sprint, drill, full mock</span></li>
                    </ul>
                    <div className="card__foot">
                      <Link
                        className="btn btn--accent btn--block card__link"
                        href={`/${id}`}
                        onClick={() => trackEvent("track_selected", { track: id, via: "home" })}
                      >
                        Practice {t.short}
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
            <p className="t-xs t-muted measure">
              Topic modules follow the official exam-guide domains and weights (v1.0, July 2026). Practice questions are
              original and independent; the readiness score is an estimate.
            </p>
          </div>
        </section>

        {/* Revision plan */}
        <section className="section" id="report" aria-labelledby="report-title">
          <div className="container report">
            <div className="stack">
              <span className="eyebrow">Turn Your Score Into a Revision Plan</span>
              <h2 className="t-h1" id="report-title">Know What to<br />Revise Next.</h2>
              <p className="t-muted measure">Use your answers to focus your certification preparation on the areas that need more practice.</p>
              <div>
                {OUTCOMES.map(({ n, h, p }) => (
                  <div key={n} className="feature">
                    <span className="feature__num">{n}</span>
                    <div>
                      <h3 className="feature__title">{h}</h3>
                      <p className="feature__text">{p}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <figure className="report-card report-card--simple" aria-label="Sample readiness estimate">
              <figcaption className="report-card__head">Sample Report · Full Mock Exam</figcaption>
              <div className="report-card__score">
                <p className="score__value"><strong>684</strong><span>/ 1000</span></p>
                <p className="t-sm t-muted">36 points below the 720 pass line</p>
              </div>
              <div className="scale scale--light scale--thin" role="img" aria-label="684 out of 1000, pass line 720">
                <div className="scale__track">
                  <div className="scale__fill" style={bar("64.9%")} />
                  <div className="scale__pass" style={pass("68.9%")} />
                </div>
                <span className="scale__pass-label" style={pass("68.9%")}>720</span>
              </div>
              <ul className="report-card__domains">
                <li><span>Product and Model Selection</span><span className="t-num">83%</span><div className="progress"><div className="progress__fill" style={bar("83%")} /></div></li>
                <li><span>Output Evaluation and Validation</span><span className="t-num">62%</span><div className="progress"><div className="progress__fill" style={bar("62%")} /></div></li>
                <li className="is-weakest"><span>Troubleshooting and Optimization<span className="sr-only"> (weakest domain)</span></span><span className="t-num">40%</span><div className="progress"><div className="progress__fill" style={bar("40%")} /></div></li>
              </ul>
            </figure>
          </div>
        </section>

        {/* How it works */}
        <section className="section section--muted" id="how" aria-labelledby="how-title">
          <div className="container">
            <div className="section-head">
              <span className="eyebrow">How It Works</span>
              <h2 className="t-h1" id="how-title">Take the Test.<br />Learn From Every Answer.</h2>
            </div>
            <ol className="steps">
              {STEPS.map(({ n, h, p }) => (
                <li key={n} className="step">
                  <span className="step__num">Step {n}</span>
                  <h3 className="step__title">{h}</h3>
                  <p className="step__text">{p}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Instructor */}
        <section className="section" id="instructor" aria-labelledby="instructor-title">
          <div className="container instructor">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="instructor__photo" src={INSTRUCTOR_PHOTO} alt="Mahesh Yadav" width={340} height={340} loading="lazy" />
            <div className="stack">
              <span className="eyebrow">Meet Your Instructor</span>
              <div className="stack">
                <h2 className="t-h1" id="instructor-title">Mahesh Yadav</h2>
                <p className="instructor__role">AI Lead, Early Agents · Google, Meta, AWS · Founder, Agentic AI Institute</p>
              </div>
              <p className="t-body measure">
                20+ years building production AI systems at Google, Meta, AWS and Microsoft. Architected early agentic
                infrastructure, including an AWS Bedrock agent featured in Andy Jassy&apos;s CEO keynote, and holds 12 patents
                in AI training and computer vision.
              </p>
              <div className="instructor__facts">
                <div className="stat stat--light"><span className="stat__value">20+</span><span className="stat__label">Years in AI</span></div>
                <div className="stat stat--light"><span className="stat__value">12</span><span className="stat__label">AI Patents</span></div>
                <div className="stat stat--light"><span className="stat__value">4.8</span><span className="stat__label">Rating on Maven</span></div>
              </div>
            </div>
          </div>
        </section>

        {/* Guided prep CTA */}
        <section className="section section--flush-top" id="guided" aria-labelledby="guided-title">
          <div className="container">
            <div className="cta-band on-navy">
              <div className="stack">
                <span className="eyebrow">Want Guided Certification Preparation?</span>
                <h2 className="t-h2" id="guided-title">
                  Prepare for Claude Certification.<br />
                  <span className="t-accent t-nowrap">Build With Claude Code.</span>
                </h2>
                <p className="t-sm measure home-on-navy-muted">
                  Score under 720 and get a free 30-minute 1-on-1 review of your results, with a personal study plan for
                  Claude Certified Associate or Developer.
                </p>
                <a className="btn btn--link-light" href={CALENDLY_URL} target="_blank" rel="noopener noreferrer">
                  Book a Free 1-on-1 Call <Icon name="arrow-up-right" size="sm" />
                </a>
              </div>
              <div className="cta-band__aside">
                <span className="t-sm home-on-navy-muted">Start With a Practice Score</span>
                <p className="t-h3">Put your Claude knowledge to the test.</p>
                <a className="btn btn--accent home-self-start" href="#tracks">Choose Your Exam</a>
                <p className="t-xs home-on-navy-faint">No purchase or call booking required.</p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="section section--muted" id="faq" aria-labelledby="faq-title">
          <div className="container faq">
            <div className="stack">
              <span className="eyebrow">Before You Start</span>
              <h2 className="t-h1" id="faq-title">A Few Answers.</h2>
            </div>
            <div className="accordion">
              {FAQS.map(({ q, a }, i) => {
                const open = openFaq === i;
                return (
                  <div key={q} className="accordion__item">
                    <button
                      type="button"
                      className="accordion__trigger"
                      id={`faq-trigger-${i + 1}`}
                      aria-expanded={open}
                      aria-controls={`faq-${i + 1}`}
                      onClick={() => setOpenFaq(open ? null : i)}
                    >
                      {q}
                      <span className="accordion__icon"><Icon name="plus" size="sm" /></span>
                    </button>
                    <div className="accordion__panel" id={`faq-${i + 1}`} role="region" aria-labelledby={`faq-trigger-${i + 1}`}>
                      <div><p className="accordion__body">{a}</p></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Closing CTA */}
        <section className="section section--navy" aria-labelledby="close-title">
          <div className="container closing">
            <span className="eyebrow">Prepare With a Clear Revision Plan</span>
            <h2 className="t-h1" id="close-title">Find Out If You Are <span className="t-accent">Ready to Certify.</span></h2>
            <a className="btn btn--accent btn--lg" href="#tracks">Choose Your Exam</a>
            <p className="t-sm home-on-navy-muted">Every module open · Instant explanations · Free retakes</p>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
