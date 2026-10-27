"use client";

import { useEffect } from "react";

const STAGGER_MS = 90;
const MAX_STEPS = 6;

/**
 * Scroll reveal: `data-reveal` reveals the element, `data-reveal="children"` reveals each child.
 * Items entering the viewport together stagger in document order. Content is only hidden once
 * `.js-reveal` is on <html>, a 2.5s fallback shows everything if the observer never reports,
 * and prefers-reduced-motion is handled in CSS.
 */
export function useReveal() {
  useEffect(() => {
    const items: Element[] = [];
    document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => {
      if (el.dataset.reveal === "children") items.push(...Array.from(el.children));
      else items.push(el);
    });
    if (!items.length || !("IntersectionObserver" in window)) return;

    let fired = false;
    const io = new IntersectionObserver(
      (entries) => {
        fired = true;
        entries
          .filter((e) => e.isIntersecting)
          .map((e) => e.target)
          .sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1))
          .forEach((el, i) => {
            (el as HTMLElement).style.setProperty("--reveal-delay", `${Math.min(i, MAX_STEPS) * STAGGER_MS}ms`);
            el.classList.add("is-visible");
            io.unobserve(el);
          });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    );
    items.forEach((el) => {
      el.classList.add("reveal");
      io.observe(el);
    });
    document.documentElement.classList.add("js-reveal");
    const fallback = window.setTimeout(() => {
      if (!fired) items.forEach((el) => el.classList.add("is-visible"));
    }, 2500);

    return () => {
      window.clearTimeout(fallback);
      io.disconnect();
      document.documentElement.classList.remove("js-reveal");
      items.forEach((el) => el.classList.remove("reveal", "is-visible"));
    };
  }, []);
}
