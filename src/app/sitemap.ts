import type { MetadataRoute } from "next";
import { TRACK_IDS } from "@/lib/blueprint";
import { SEO_PAGES } from "@/lib/seo-pages";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    ...TRACK_IDS.map((track) => ({ url: `${SITE_URL}/${track}`, changeFrequency: "weekly" as const, priority: 0.8 })),
    ...Object.keys(SEO_PAGES).map((slug) => ({ url: `${SITE_URL}/${slug}`, changeFrequency: "monthly" as const, priority: 0.7 })),
    { url: `${SITE_URL}/privacy`, changeFrequency: "yearly", priority: 0.2 },
  ];
}
