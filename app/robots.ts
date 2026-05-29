import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/schema";

/**
 * /robots.txt — controls crawler access.
 *
 * Strategy: allow all crawlers on public surfaces (`/`), explicitly enumerate
 * AI + search crawlers (intent-clear + handles crawlers that read only their
 * own UA section). Disallow user-private diagnostic results (`/d/`) and
 * internal API (`/api/`).
 *
 * Design: docs/system-design-geo.md §4.1
 */

const AI_AND_SEARCH_UAS: readonly string[] = [
  // OpenAI
  "GPTBot",
  "ChatGPT-User",
  "OAI-SearchBot",
  // Anthropic
  "ClaudeBot",
  "Claude-Web",
  "anthropic-ai",
  // Perplexity
  "PerplexityBot",
  "Perplexity-User",
  // Google
  "Google-Extended",
  "Googlebot",
  // Apple
  "Applebot-Extended",
  "Applebot",
  // Bing
  "Bingbot",
];

function sharedRule() {
  return { allow: "/", disallow: ["/d/", "/api/"] };
}

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", ...sharedRule() },
      ...AI_AND_SEARCH_UAS.map((ua) => ({ userAgent: ua, ...sharedRule() })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
