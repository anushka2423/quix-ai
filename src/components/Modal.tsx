"use client";

import { useEffect, useRef } from "react";

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * Dialog shell using the design system's .modal pattern (see prototype js/ui.js).
 * Focus moves in on mount (`data-autofocus` wins, else first control, else the panel), Tab is trapped,
 * Esc / backdrop call `onClose` unless `required`, and focus returns to the opener on unmount.
 * Mount it only while it should be open.
 */
export default function Modal({
  role = "dialog",
  labelledBy,
  describedBy,
  label,
  required = false,
  onClose,
  children,
}: {
  role?: "dialog" | "alertdialog";
  labelledBy?: string;
  describedBy?: string;
  label?: string;
  /** Can only be completed: Esc and backdrop clicks do nothing */
  required?: boolean;
  onClose?: () => void;
  children: React.ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  });

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const panel = panelRef.current;
    const first = panel?.querySelector<HTMLElement>("[data-autofocus]") ?? panel?.querySelector<HTMLElement>(FOCUSABLE) ?? panel;
    first?.focus();
    return () => {
      document.body.style.overflow = prevOverflow;
      opener?.focus?.();
    };
  }, []);

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      e.stopPropagation();
      if (!required) closeRef.current?.();
      return;
    }
    if (e.key !== "Tab") return;
    const panel = panelRef.current;
    if (!panel) return;
    const f = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el.offsetParent !== null);
    if (!f.length) {
      e.preventDefault();
      panel.focus();
      return;
    }
    const active = document.activeElement;
    if (e.shiftKey && (active === f[0] || active === panel)) {
      e.preventDefault();
      f[f.length - 1].focus();
    } else if (!e.shiftKey && active === f[f.length - 1]) {
      e.preventDefault();
      f[0].focus();
    }
  }

  return (
    <div className="modal" role={role} aria-modal="true" aria-labelledby={labelledBy} aria-describedby={describedBy} aria-label={label} onKeyDown={onKeyDown}>
      <div className="modal__backdrop" onClick={() => !required && closeRef.current?.()} />
      <div className="modal__panel" ref={panelRef} tabIndex={-1}>
        {children}
      </div>
    </div>
  );
}
