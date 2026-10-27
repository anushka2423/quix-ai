"use client";

import { useEffect, useId, useRef, useState } from "react";
import Icon from "@/components/Icon";

export interface ListboxOption {
  value: string;
  label: string;
  /** Trailing text, e.g. a weight */
  hint?: string;
  disabled?: boolean;
}

/** Custom select (prototype `.listbox`): button + role=listbox popup, arrow/Home/End/Enter/Esc keys. */
export default function Listbox({ label, options, value, onChange, up = false }: {
  label: string;
  options: ListboxOption[];
  value: string;
  onChange: (value: string) => void;
  up?: boolean;
}) {
  const uid = useId();
  const labelId = `${uid}-label`;
  const valueId = `${uid}-value`;
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const selected = options.find((o) => o.value === value);

  const step = (from: number, dir: 1 | -1) => {
    for (let i = 1; i <= options.length; i++) {
      const n = (from + dir * i + options.length * 2) % options.length;
      if (!options[n].disabled) return n;
    }
    return from;
  };

  function openList() {
    const i = options.findIndex((o) => o.value === value);
    setActive(i >= 0 ? i : step(-1, 1));
    setOpen(true);
  }
  function close(refocus = true) {
    setOpen(false);
    if (refocus) buttonRef.current?.focus();
  }
  function choose(i: number) {
    const o = options[i];
    if (!o || o.disabled) return;
    onChange(o.value);
    close();
  }

  useEffect(() => {
    if (open) listRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (open) listRef.current?.querySelector<HTMLElement>(`[id="${uid}-o${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [open, active, uid]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, [open]);

  function onListKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => step(a, 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => step(a, -1)); }
    else if (e.key === "Home") { e.preventDefault(); setActive(step(-1, 1)); }
    else if (e.key === "End") { e.preventDefault(); setActive(step(options.length, -1)); }
    else if (e.key === "Enter" || e.key === " ") { e.preventDefault(); choose(active); }
    else if (e.key === "Escape") { e.preventDefault(); close(true); }
    else if (e.key === "Tab") close(false);
    e.stopPropagation();
  }

  return (
    <div className="field">
      <span className="field__label" id={labelId}>{label}</span>
      <div className={`listbox${up ? " listbox--up" : ""}`} ref={rootRef}>
        <button
          ref={buttonRef}
          className="listbox__button"
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-labelledby={`${labelId} ${valueId}`}
          onClick={() => (open ? close() : openList())}
          onKeyDown={(e) => { if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); openList(); } }}
        >
          <span className="listbox__value" id={valueId}>{selected?.label ?? ""}</span>
          <Icon name="chevron-down" />
        </button>
        <ul
          ref={listRef}
          className="listbox__list"
          role="listbox"
          tabIndex={-1}
          aria-labelledby={labelId}
          aria-activedescendant={open ? `${uid}-o${active}` : undefined}
          hidden={!open}
          onKeyDown={onListKey}
        >
          {options.map((o, i) => (
            <li
              key={o.value}
              id={`${uid}-o${i}`}
              className={`listbox__option${i === active ? " is-active" : ""}`}
              role="option"
              aria-selected={o.value === value}
              aria-disabled={o.disabled || undefined}
              onClick={() => choose(i)}
            >
              {o.label}
              {o.hint && <span className="weight">{o.hint}</span>}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
