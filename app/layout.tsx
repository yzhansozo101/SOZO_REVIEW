import type { Metadata } from "next";
import { ja } from "@/lib/i18n/ja";
import "./globals.css";
import { geist, geistMono, newsreader, notoSansJP, notoSerifJP } from "./fonts";

const SITE_URL = "https://sozonext-review.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: ja.app.title,
    template: "%s | SOZONEXT Review",
  },
  description:
    "Airbnb 物件の URL から 25 秒で 5 維度評価と AI 改善レポート。スーパーホスト維持や Airbnb 検索順位向上を目指す民泊運営者向けの診断ツール。SOZONEXT が運営。",
  keywords: [
    // brand
    "SOZONEXT",
    "SOZO Review",
    "SOZONEXT Review",
    // unique product feature names (extremely low competition)
    "5維度評価",
    "5維度スコアリング",
    "Quality Status",
    // host pain points (low competition)
    "Airbnb 検索順位",
    "スーパーホスト維持",
    "ゲスト評価向上",
    // 5-dimension specific (low competition)
    "Airbnb タイトル 最適化",
    "Airbnb 紹介文 添削",
    "Airbnb 写真 改善",
    // B2B / industry
    "民泊サブリース",
    "民泊 運営代行",
    "OTA リスティング最適化",
    // baseline
    "Airbnb",
    "民泊",
    "ヘルスチェック",
    "健康診断",
    "リスティング",
  ],
  authors: [{ name: "SOZONEXT" }],
  creator: "SOZONEXT",
  publisher: "SOZONEXT",
  openGraph: {
    type: "website",
    locale: "ja_JP",
    alternateLocale: ["en_US", "zh_CN"],
    siteName: "SOZONEXT Review",
    title: "SOZONEXT Review · Airbnb 物件 ヘルスチェック",
    description:
      "Airbnb 物件の URL から 25 秒で 5 維度評価 + AI 改善レポート。スーパーホスト維持・検索順位向上に。",
    url: `${SITE_URL}/`,
  },
  twitter: {
    card: "summary_large_image",
    title: "SOZONEXT Review · Airbnb 物件 ヘルスチェック",
    description:
      "Airbnb 物件の URL から 25 秒で 5 維度評価 + AI 改善レポート。スーパーホスト維持・検索順位向上に。",
  },
  alternates: { canonical: `${SITE_URL}/` },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  verification: {
    other: {
      "msvalidate.01": "050C453F1AC4CDC35FDCCF5B2B0063A6",
    },
  },
  category: "business",
};

const fontVars = [geist, geistMono, newsreader, notoSansJP, notoSerifJP]
  .map((f) => f.variable)
  .join(" ");

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={fontVars}>
      <body>{children}</body>
    </html>
  );
}
