"use client";

import { useRef } from "react";

export interface TabItem<T extends string> {
  id: T;
  label: string;
}

/** Tab strip with roving tabindex (prototype `.tabs`). Panels are rendered by the caller with id `${idBase}-panel-${id}`. */
export default function Tabs<T extends string>({ tabs, value, onChange, idBase, ariaLabel }: {
  tabs: TabItem<T>[];
  value: T;
  onChange: (id: T) => void;
  idBase: string;
  ariaLabel: string;
}) {
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});

  function onKey(e: React.KeyboardEvent, i: number) {
    const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const next = tabs[(i + d + tabs.length) % tabs.length];
    refs.current[next.id]?.focus();
    onChange(next.id);
  }

  return (
    <div role="tablist" className="tabs" aria-label={ariaLabel}>
      {tabs.map((t, i) => {
        const on = t.id === value;
        return (
          <button
            key={t.id}
            ref={(el) => { refs.current[t.id] = el; }}
            role="tab"
            type="button"
            className="tabs__tab"
            id={`${idBase}-tab-${t.id}`}
            aria-controls={`${idBase}-panel-${t.id}`}
            aria-selected={on}
            tabIndex={on ? 0 : -1}
            onClick={() => onChange(t.id)}
            onKeyDown={(e) => onKey(e, i)}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
