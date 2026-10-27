"use client";

import { useState } from "react";
import Link from "next/link";

import { BOOKING_URL } from "@/lib/config";
import Icon from "@/components/Icon";

/**
 * Site header: navy bar with logo, in-page nav and one accent CTA.
 * `moduleTitle` switches to the compact variant used on quiz / results / live screens.
 */
export default function Header({ moduleTitle, hideBooking }: { moduleTitle?: string; hideBooking?: boolean }) {
  const [open, setOpen] = useState(false);
  const compact = !!moduleTitle;
  const onQuizPage = compact && !hideBooking;
  const close = () => setOpen(false);

  return (
    <header className={`site-header${compact ? " site-header--compact" : ""}`}>
      <div className="container site-header__inner">
        <Link href="/" className="site-header__logo" aria-label="Agentic AI Institute — Home" onClick={close}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-on-navy.png" alt="Agentic AI Institute" width={81} height={36} />
        </Link>

        {compact ? (
          <span className="site-header__context">{moduleTitle}</span>
        ) : (
          <nav className="site-nav" aria-label="Main">
            <Link className="site-nav__link" href="/#tracks">Exams</Link>
            <Link className="site-nav__link" href="/#how">How It Works</Link>
            <Link className="site-nav__link" href="/#report">Revision Plan</Link>
            <Link className="site-nav__link" href="/#faq">FAQ</Link>
          </nav>
        )}

        <div className="site-header__actions">
          {onQuizPage ? (
            <a
              className="btn btn--outline-light btn--sm"
              href={BOOKING_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              Book 1-on-1 Feedback
            </a>
          ) : (
            <Link className="btn btn--accent btn--sm" href="/#tracks">
              Choose Your Exam
            </Link>
          )}
          {!compact && (
            <button
              type="button"
              className="nav-toggle"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close Menu" : "Open Menu"}
              onClick={() => setOpen((v) => !v)}
            >
              <Icon name={open ? "x" : "menu"} size="lg" />
            </button>
          )}
        </div>
      </div>

      {!compact && (
        <div className={`mobile-menu${open ? " is-open" : ""}`} id="mobile-menu">
          <Link href="/associate" onClick={close}>Associate (CCAO-F)</Link>
          <Link href="/developer" onClick={close}>Developer (CCDV-F)</Link>
          <Link href="/#how" onClick={close}>How It Works</Link>
          <Link href="/#faq" onClick={close}>FAQ</Link>
          <Link className="btn btn--accent" href="/#tracks" onClick={close}>Choose Your Exam</Link>
        </div>
      )}
    </header>
  );
}
