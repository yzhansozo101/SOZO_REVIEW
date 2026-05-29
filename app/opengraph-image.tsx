import { ImageResponse } from "next/og";

/**
 * Open Graph image — 1200×630, brand-colored, edge-runtime generated.
 *
 * Renders to /opengraph-image (URL chosen by Next.js convention) and is
 * referenced by openGraph.images + twitter.images in layout metadata.
 *
 * Design: docs/system-design-geo.md §4.5
 *
 * Why we load fonts explicitly: ImageResponse on Vercel edge ships with a
 * default Latin sans, but Japanese characters fall back to .notdef boxes
 * (or worse — silent render failure returning 0-byte PNG). We pull a
 * subsetted Noto Sans JP via the Google Fonts `text=` parameter so the
 * font payload only contains the glyphs we actually use (~30 chars).
 *
 * Colors:
 *   - background: Paper       #FAF8F4 (CLAUDE.md §7)
 *   - foreground: SOZONEXT Navy #024280
 *   - subdued:    ink-600     #525a67 (approx, for tagline)
 */

export const runtime = "edge";
export const alt = "SOZONEXT Review · Airbnb リスティング診断";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// All characters that appear in the OG image, deduped. Keep in sync with
// the JSX below if you change visible text.
const OG_TEXT_FOR_SUBSET = [
  "SOZONEXT REVIEW",
  "Airbnb リスティング診断",
  "5 維度評価 + AI 改善レポート · スーパーホスト維持と Airbnb 検索順位向上に",
].join(" ");

async function loadNotoSansJp(text: string, weight: 400 | 700): Promise<ArrayBuffer> {
  // Google Fonts CSS API returns a CSS payload with a font-face src URL.
  // Passing `text=` returns a subset containing only those glyphs (tiny).
  const cssUrl =
    `https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@${weight}` +
    `&text=${encodeURIComponent(text)}&display=swap`;

  // Satori (next/og's rasterizer) does NOT support WOFF2 — it needs TTF.
  // Google sends WOFF2 to modern-UA, WOFF to old-Firefox UA, but TTF to
  // requests with NO User-Agent. So we send an empty UA to force TTF.
  const cssResp = await fetch(cssUrl, {
    headers: { "User-Agent": "" },
  });
  if (!cssResp.ok) {
    throw new Error(`Google Fonts CSS fetch failed: ${cssResp.status}`);
  }
  const css = await cssResp.text();

  // Match the TTF URL — Google emits format('truetype') on no-UA. The URL
  // itself is a /l/font?kit=... reference (no .ttf suffix), so we match
  // the format suffix instead of the URL extension.
  const fontUrlMatch = css.match(
    /src:\s*url\((https:\/\/[^)]+)\)\s*format\(['"]truetype['"]\)/,
  );
  if (!fontUrlMatch) {
    throw new Error("Could not extract TTF font URL from Google Fonts CSS");
  }
  const fontResp = await fetch(fontUrlMatch[1]);
  if (!fontResp.ok) {
    throw new Error(`Font binary fetch failed: ${fontResp.status}`);
  }
  return fontResp.arrayBuffer();
}

export default async function Image() {
  // Load two weights so we can keep typographic hierarchy
  // (bold for the title, regular for the subtitle/eyebrow).
  const [regular, bold] = await Promise.all([
    loadNotoSansJp(OG_TEXT_FOR_SUBSET, 400),
    loadNotoSansJp(OG_TEXT_FOR_SUBSET, 700),
  ]);

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
          fontFamily: "Noto Sans JP",
        }}
      >
        <div
          style={{
            fontSize: 28,
            letterSpacing: "0.18em",
            color: "#024280",
            opacity: 0.75,
            marginBottom: 36,
            fontWeight: 400,
          }}
        >
          SOZONEXT REVIEW
        </div>
        <div
          style={{
            fontSize: 96,
            fontWeight: 700,
            lineHeight: 1.05,
            color: "#024280",
            maxWidth: 1020,
          }}
        >
          Airbnb リスティング診断
        </div>
        <div
          style={{
            fontSize: 28,
            marginTop: 44,
            color: "#525a67",
            lineHeight: 1.4,
            maxWidth: 1020,
            fontWeight: 400,
          }}
        >
          5 維度評価 + AI 改善レポート · スーパーホスト維持と Airbnb 検索順位向上に
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Noto Sans JP", data: regular, weight: 400, style: "normal" },
        { name: "Noto Sans JP", data: bold, weight: 700, style: "normal" },
      ],
    },
  );
}
