import type { Metadata } from "next";
import "./globals.css";
import { geist, geistMono, newsreader, notoSansJP, notoSerifJP } from "./fonts";

export const metadata: Metadata = {
  title: "SOZO Review · 物件ヘルスチェック",
  description: "Airbnb 物件の健康診断システム",
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
