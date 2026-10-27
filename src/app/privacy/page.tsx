import Link from "next/link";
import Header from "@/components/Header";
import SiteFooter from "@/components/SiteFooter";
import Icon from "@/components/Icon";
import { DISCLAIMER } from "@/lib/config";

export const metadata = { title: "Privacy | Claude Certification Practice Quiz", alternates: { canonical: "/privacy" } };

/** DRAFT: needs legal review before public launch (GDPR / CAN-SPAM wording, controller details). */
export default function Privacy() {
  return (
    <>
      <Header />
      <main id="main">
        <section className="page-head" aria-labelledby="privacy-title">
          <div className="container container--narrow">
            <Link className="page-head__crumb" href="/">
              <Icon name="arrow-left" size="sm" /> Back to the Quiz
            </Link>
            <div className="stack">
              <span className="eyebrow">Legal</span>
              <h1 className="t-display" id="privacy-title">Privacy</h1>
              <p className="t-lead hero__lead">Draft policy, pending legal review. {DISCLAIMER}</p>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container container--narrow stack">
            <h2 className="t-h3">What We Collect</h2>
            <p className="t-body t-muted measure">
              Your email address, and optionally your name and target exam date, when you give them. We also record
              which questions you answer and your results, so we can show your progress and readiness estimate and
              write your study plan.
            </p>

            <h2 className="t-h3">How We Use It</h2>
            <p className="t-body t-muted measure">
              To save your progress, to produce your report and study plan, and to offer you a free review call with an
              advisor. If you tick the optional box, we also send study tips and course updates. We ask you to confirm
              your address before any marketing email, and every marketing email has a one-click unsubscribe.
            </p>

            <h2 className="t-h3">The AI Tutor</h2>
            <p className="t-body t-muted measure">
              Questions you type into the tutor are sent to an AI model provider to generate a reply. Please
              don&apos;t enter personal data there.
            </p>

            <h2 className="t-h3">Your Choices</h2>
            <p className="t-body t-muted measure">
              You can ask us to access or delete your data, or withdraw marketing consent, at any time by replying to
              any email from us.
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
