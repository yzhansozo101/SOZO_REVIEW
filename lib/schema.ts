/**
 * JSON-LD structured data builders for AI/search engines.
 *
 * Returns plain JSON objects ready to be JSON.stringify'd into a
 * <script type="application/ld+json"> tag. Schema.org compliant.
 *
 * Design: docs/system-design-geo.md §4.6
 */

export const SITE_URL = "https://sozonext-review.vercel.app";

const ORG_ID = `${SITE_URL}/#org`;
const WEBSITE_ID = `${SITE_URL}/#site`;
const WEBAPP_ID = `${SITE_URL}/#app`;

const organization = {
  "@type": "Organization",
  "@id": ORG_ID,
  name: "SOZONEXT",
  url: `${SITE_URL}/`,
  description:
    "民泊運営支援を専門とする会社。Airbnb ホスト向けの診断ツール SOZONEXT Review を運営。",
} as const;

const website = {
  "@type": "WebSite",
  "@id": WEBSITE_ID,
  url: `${SITE_URL}/`,
  name: "SOZONEXT Review",
  publisher: { "@id": ORG_ID },
  inLanguage: "ja-JP",
} as const;

const webApplication = {
  "@type": "WebApplication",
  "@id": WEBAPP_ID,
  name: "SOZONEXT Review",
  url: `${SITE_URL}/`,
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  publisher: { "@id": ORG_ID },
  description:
    "Airbnb リスティング診断ツール。リスティング URL から 25 秒で 5 維度評価と AI 改善レポート。スーパーホスト維持や Airbnb 検索順位向上を目指す民泊運営者向け。",
  inLanguage: "ja-JP",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "JPY",
  },
} as const;

/**
 * Graph for the homepage `/`. Returns the @graph array for
 * @context: https://schema.org wrapping.
 */
export function homepageGraph(): readonly object[] {
  return [organization, website, webApplication];
}
