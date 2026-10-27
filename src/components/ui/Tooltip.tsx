"use client";

import { useEffect, useState } from "react";
import Icon from "@/components/Icon";

/** Info tooltip (prototype `.tip`): hover/focus via CSS, tap-to-toggle, Esc / outside click closes. */
export default function Tooltip({ label, children, end = false }: { label: string; children: React.ReactNode; end?: boolean }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("click", close);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", close);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <span className={`tip${end ? " tip--end" : ""}${open ? " is-open" : ""}`}>
      <button className="tip__trigger" type="button" aria-label={label} onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }}>
        <Icon name="info" size="sm" />
      </button>
      <span className="tip__bubble" role="tooltip">{children}</span>
    </span>
  );
}
