/** Icon set from the design system (16px grid, 1.75 stroke). Sizing and stroke come from the `.icon` CSS class. */
const PATHS = {
  "arrow-right": <path d="M3 8h10M9 4l4 4-4 4" />,
  "arrow-left": <path d="M13 8H3M7 4 3 8l4 4" />,
  "arrow-up-right": <path d="M5 11 11 5M6 5h5v5" />,
  check: <path d="m3.5 8.5 3 3 6-7" />,
  x: <path d="m4 4 8 8M12 4l-8 8" />,
  plus: <path d="M8 3v10M3 8h10" />,
  "chevron-down": <path d="m4 6 4 4 4-4" />,
  clock: <><circle cx="8" cy="8" r="6" /><path d="M8 5v3l2 1.5" /></>,
  info: <><circle cx="8" cy="8" r="6" /><path d="M8 7.5V11M8 5h.01" /></>,
  external: <path d="M9 3h4v4M13 3 7.5 8.5M11 9.5V13H3V5h3.5" />,
  menu: <path d="M2.5 5h11M2.5 11h11" />,
  list: <path d="M6 4h7.5M6 8h7.5M6 12h7.5M2.5 4h.01M2.5 8h.01M2.5 12h.01" />,
  target: <><circle cx="8" cy="8" r="6" /><circle cx="8" cy="8" r="2.5" /></>,
  refresh: <path d="M13 4.5V2M13 4.5h-2.5M13 4.5A5.5 5.5 0 1 0 13.5 9" />,
  inbox: <path d="M2.5 9.5 4 3.5h8l1.5 6v3h-11zM2.5 9.5H6l.5 1.5h3l.5-1.5h3.5" />,
  lock: <><rect x="3" y="7" width="10" height="7" rx="1" /><path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" /></>,
  "arrow-down": <path d="M8 3v10M4 9l4 4 4-4" />,
  unlock: <><rect x="3" y="7" width="10" height="7" rx="1" /><path d="M5.5 7V5a2.5 2.5 0 0 1 4.8-1" /></>,
  keyboard: <><rect x="1.5" y="4" width="13" height="8" rx="1" /><path d="M4 6.5h.01M6.5 6.5h.01M9 6.5h.01M11.5 6.5h.01M5 9.5h6" /></>,
  layers: <path d="m8 2 6 3-6 3-6-3zM2 8l6 3 6-3M2 11l6 3 6-3" />,
  zap: <path d="M9 1.5 3 9h4.5L7 14.5 13 7H8.5z" />,
  flag: <path d="M3.5 14V2.5M3.5 3h8l-1.5 3 1.5 3h-8" />,
  calendar: <><rect x="2.5" y="3.5" width="11" height="10" rx="1" /><path d="M2.5 6.5h11M5.5 2v3M10.5 2v3" /></>,
  file: <path d="M9 1.5H4v13h8V4.5zM9 1.5v3h3" />,
  sparkle: <path d="M8 2v3M8 11v3M2 8h3M11 8h3M4 4l1.8 1.8M10.2 10.2 12 12M4 12l1.8-1.8M10.2 5.8 12 4" />,
} as const;

export type IconName = keyof typeof PATHS;

export default function Icon({ name, size, className = "" }: { name: IconName; size?: "sm" | "lg"; className?: string }) {
  const cls = ["icon", size ? `icon--${size}` : "", className].filter(Boolean).join(" ");
  return (
    <svg className={cls} viewBox="0 0 16 16" aria-hidden="true">
      {PATHS[name]}
    </svg>
  );
}
