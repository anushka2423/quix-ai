import type { Metadata } from "next";

// Personal or session-specific pages should not appear in search results
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
