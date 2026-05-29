import { ImageResponse } from "next/og";

/**
 * Open Graph image — 1200×630, brand-colored, build-time generated.
 *
 * Renders to /opengraph-image (URL chosen by Next.js convention) and is
 * referenced by openGraph.images + twitter.images in layout metadata.
 *
 * Design: docs/system-design-geo.md §4.5
 *
 * Colors:
 *   - background: Paper       #FAF8F4 (CLAUDE.md §7)
 *   - foreground: SOZONEXT Navy #024280
 *   - subdued:    ink-600     #525a67 (approx, for tagline)
 */

export const runtime = "edge";
export const alt = "SOZONEXT Review · Airbnb 物件 ヘルスチェック";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          background: "#FAF8F4",
          color: "#024280",
          padding: "80px 100px",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 28,
            letterSpacing: "0.18em",
            color: "#024280",
            opacity: 0.75,
            marginBottom: 36,
          }}
        >
          SOZONEXT REVIEW
        </div>
        <div
          style={{
            fontSize: 76,
            fontWeight: 600,
            lineHeight: 1.08,
            color: "#024280",
            maxWidth: 920,
          }}
        >
          Airbnb 物件の
          <br />
          健康診断を 25 秒で。
        </div>
        <div
          style={{
            fontSize: 26,
            marginTop: 44,
            color: "#525a67",
            lineHeight: 1.4,
            maxWidth: 920,
          }}
        >
          5 維度評価 + AI 改善レポート · スーパーホスト維持と Airbnb 検索順位向上に
        </div>
      </div>
    ),
    { ...size },
  );
}
