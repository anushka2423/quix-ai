import { PASS_SCORE } from "@/lib/config";
import { TRACKS } from "@/lib/blueprint";
import type { TrackId } from "@/types/quiz";

export const CONTENT_UPDATED = "2026-10-27";

export type SeoSlug =
  | "claude-certified-associate-practice-test"
  | "claude-certified-developer-practice-test"
  | "claude-certification-study-guide";

export interface Faq {
  q: string;
  a: string;
}

export interface SeoPage {
  slug: SeoSlug;
  /** Under about 60 characters */
  title: string;
  /** Under about 155 characters, keyword first */
  description: string;
  h1: string;
  intro: string;
  /** Present for a single-track page; the study guide covers both */
  track?: TrackId;
  faqs: Faq[];
}

const DEV = TRACKS.developer;
const ASSOC = TRACKS.associate;

function trackFaqs(id: TrackId): Faq[] {
  const t = TRACKS[id];
  return [
    { q: `What is the ${t.name} (${t.code}) exam?`, a: `It is the ${t.short} exam in the Claude certification program. It has ${t.items} questions in ${t.minutes} minutes and is aimed at: ${t.audience}` },
    { q: `How many questions are on the ${t.code} exam?`, a: `${t.items} questions in ${t.minutes} minutes, spread across ${t.domains.length} exam domains.` },
    { q: `What is the passing score for ${t.code}?`, a: `This site marks ${PASS_SCORE} on the 100 to 1,000 scale as the pass line for its readiness estimate. Anthropic does not publish how percent correct maps to the scaled score, so treat it as an estimate and confirm the official passing score in the exam guide.` },
    { q: `How much does the ${t.code} exam cost?`, a: `The exam fee in the exam guide is $${t.fee} at the time of writing. Check Anthropic's official exam page for current pricing. This practice quiz is free.` },
    { q: `How long should I study for ${t.code}?`, a: `It depends on your starting point. Take the readiness diagnostic first, drill the lowest-scoring domains, then sit full ${t.items}-question mocks. Most people are ready when their estimate stays above ${PASS_SCORE + 80} across two full mocks.` },
    { q: `Is the ${t.short} certification worth it?`, a: `It gives you a structured way to show verified skill with Claude. Whether it is worth it depends on your role: ${t.audience.toLowerCase()}` },
    { q: "Is this an official Anthropic practice test?", a: "No. This is an independent practice resource, not affiliated with or endorsed by Anthropic. It does not reproduce real exam questions or guarantee a pass." },
  ];
}

export const SEO_PAGES: Record<SeoSlug, SeoPage> = {
  "claude-certified-associate-practice-test": {
    slug: "claude-certified-associate-practice-test",
    track: "associate",
    title: "Claude Certified Associate Practice Test (CCAO-F) | Free",
    description: `Claude Certified Associate practice test for CCAO-F: ${ASSOC.items}-question mock exam, domain breakdown, study tips and FAQ. Free, independent exam prep.`,
    h1: "Claude Certified Associate Practice Test (CCAO-F)",
    intro: `Prepare for the Claude Certified Associate (CCAO-F) exam with free practice questions, a ${ASSOC.items}-question mock exam and a readiness estimate. This Claude Certified Associate practice test follows the ${ASSOC.domains.length} official exam domains and their weights.`,
    faqs: trackFaqs("associate"),
  },
  "claude-certified-developer-practice-test": {
    slug: "claude-certified-developer-practice-test",
    track: "developer",
    title: "Claude Certified Developer Practice Test (CCDV-F) | Free",
    description: `Claude Certified Developer practice test for CCDV-F: ${DEV.items}-question mock exam, exam domains, study tips and FAQ. Free, independent exam prep.`,
    h1: "Claude Certified Developer Practice Test (CCDV-F)",
    intro: `Prepare for the Claude Certified Developer (CCDV-F) exam with free practice questions, a ${DEV.items}-question mock exam and a readiness estimate. This Claude developer certification mock test follows the ${DEV.domains.length} official exam domains and their weights.`,
    faqs: trackFaqs("developer"),
  },
  "claude-certification-study-guide": {
    slug: "claude-certification-study-guide",
    title: "Claude Certification Study Guide: CCAO-F & CCDV-F",
    description: "Claude certification study guide: exam domains, weights, question counts and a study plan for the Associate (CCAO-F) and Developer (CCDV-F) exams.",
    h1: "Claude Certification Study Guide",
    intro: "A study guide for the two Claude certification exams from Anthropic: the Claude Certified Associate (CCAO-F) and the Claude Certified Developer (CCDV-F). See what each exam covers, how the domains are weighted, and how to plan your exam prep.",
    faqs: [
      { q: "Which Claude certification should I take first?", a: `Take the Associate (CCAO-F) if you use Claude daily but do not code. Take the Developer (CCDV-F) if you are an engineer building on the Claude API.` },
      { q: "What is the difference between CCAO-F and CCDV-F?", a: `CCAO-F has ${ASSOC.items} questions across ${ASSOC.domains.length} domains for non-coders. CCDV-F has ${DEV.items} questions across ${DEV.domains.length} domains for engineers.` },
      { q: "How do I study for the Claude certification?", a: "Start with a readiness diagnostic, rank domains by weight and by your score, study the weakest high-weight domains first, then take timed full mocks." },
      { q: "Is this study guide official?", a: "No. It is independent and not affiliated with or endorsed by Anthropic. Always check the official exam guide." },
    ],
  },
};
