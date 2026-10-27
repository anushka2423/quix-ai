import { DISCLAIMER } from "@/lib/config";

/** Persistent site-wide banner (PRD: shown on every page). */
export default function DisclaimerBanner() {
  return (
    <p role="note" className="notice-bar">
      {DISCLAIMER}
    </p>
  );
}
