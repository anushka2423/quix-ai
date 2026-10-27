"use client";

import { useId, useState } from "react";

/** Slider + number input kept in sync (prototype `.range-field`). Number is clamped on commit (blur/Enter). */
export default function RangeField({ label, value, min, max, onChange, endNote }: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  /** Text at the right end of the track; defaults to the max */
  endNote?: string;
}) {
  const uid = useId();
  const hi = Math.max(min, max);
  const [draft, setDraft] = useState<string | null>(null);
  const pct = hi === min ? 0 : ((Math.min(hi, Math.max(min, value)) - min) / (hi - min)) * 100;

  function commit() {
    if (draft === null) return;
    const n = Number(draft);
    onChange(Math.min(hi, Math.max(min, Number.isFinite(n) && draft.trim() !== "" ? Math.round(n) : min)));
    setDraft(null);
  }

  return (
    <div className="range-field">
      <div className="range-field__head">
        <label className="field__label" htmlFor={`${uid}-num`}>{label}</label>
        <input
          className="input range-field__num"
          id={`${uid}-num`}
          type="number"
          min={min}
          max={hi}
          inputMode="numeric"
          value={draft ?? value}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => { if (e.key === "Enter") commit(); }}
        />
      </div>
      <input
        className="range"
        type="range"
        min={min}
        max={hi}
        value={Math.min(hi, Math.max(min, value))}
        aria-label={label}
        style={{ "--pct": `${pct}%` } as React.CSSProperties}
        onChange={(e) => { setDraft(null); onChange(Number(e.target.value)); }}
      />
      <div className="range-field__ends"><span>{min}</span><span>{endNote ?? hi}</span></div>
    </div>
  );
}
