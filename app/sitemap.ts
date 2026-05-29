import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/schema";

/**
 * /sitemap.xml — public URL list for search engines.
 *
 * Only `/` is indexable today. `/d/[id]` is per-user private (disallowed in
 * robots + noindex meta). When marketing pages or articles are added later,
 * extend this array.
 *
 * Design: docs/system-design-geo.md §4.2
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${SITE_URL}/`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1.0,
    },
  ];
}
