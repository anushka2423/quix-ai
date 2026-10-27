/** Canonical origin of the site; set NEXT_PUBLIC_SITE_URL in each environment */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://ccprepquiz.agenticaiinstitute.ai").replace(/\/$/, "");
export const SITE_NAME = "Agentic AI Institute";
