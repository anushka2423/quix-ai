import type { Metadata } from "next";
import StudyPage from "@/components/StudyPage";
import { SEO_PAGES } from "@/lib/seo-pages";

const page = SEO_PAGES["claude-certification-study-guide"];

export const metadata: Metadata = {
  title: page.title,
  description: page.description,
  alternates: { canonical: "/" + page.slug },
  openGraph: { type: "article", url: "/" + page.slug, title: page.title, description: page.description, images: ["/agentic-ai-logo.png"] },
};

export default function Page() {
  return <StudyPage page={page} />;
}
