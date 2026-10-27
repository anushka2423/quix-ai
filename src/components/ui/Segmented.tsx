"use client";

import { useRef } from "react";
import Icon from "@/components/Icon";

export interface SegmentedOption {
  value: number;
  label: string;
  disabled?: boolean;
  /** Shown as title/tooltip on a disabled option */
  note?: string;
  describedBy?: string;
}

/** Radio-style segmented control (prototype `.segmented`): check follows selection, lock on disabled, arrow keys. */
export default function Segmented({ options, value, onChange, labelledBy, ariaLabel }: {
  options: SegmentedOption[];
  value: number;
  onChange: (value: number) => void;
  labelledBy?: string;
  ariaLabel?: string;
}) {
  const refs = useRef<Record<number, HTMLButtonElement | null>>({});
  const enabled = options.filter((o) => !o.disabled);

  function onKey(e: React.KeyboardEvent, v: number) {
    const d = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const i = enabled.findIndex((o) => o.value === v);
    const next = enabled[(i + d + enabled.length) % enabled.length];
    refs.current[next.value]?.focus();
    onChange(next.value);
  }

  return (
    <div className="segmented segmented--block" role="radiogroup" aria-labelledby={labelledBy} aria-label={labelledBy ? undefined : ariaLabel}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            ref={(el) => { refs.current[o.value] = el; }}
            className="segmented__opt"
            type="button"
            role="radio"
            aria-checked={on}
            tabIndex={on ? 0 : -1}
            disabled={o.disabled}
            title={o.disabled ? o.note : undefined}
            aria-describedby={o.describedBy}
            onClick={() => onChange(o.value)}
            onKeyDown={(e) => onKey(e, o.value)}
          >
            {o.label}
            {on && <Icon name="check" size="sm" />}
            {o.disabled && <Icon name="lock" size="sm" />}
          </button>
        );
      })}
    </div>
  );
}
