import type { Metadata } from "next";
import { bankMeta } from "@/lib/bank";
import SeoFaq from "@/components/SeoFaq";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import HomeClient from "./HomeClient";

export const metadata: Metadata = { alternates: { canonical: "/" } };

export const revalidate = 60;

export default async function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Organization", name: SITE_NAME, url: SITE_URL, logo: `${SITE_URL}/agentic-ai-logo.png` },
      { "@type": "WebSite", name: "Claude Certification Practice Quiz", url: SITE_URL, publisher: { "@type": "Organization", name: SITE_NAME } },
    ],
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <HomeClient meta={await bankMeta()} />
      <SeoFaq />
    </>
  );
}
