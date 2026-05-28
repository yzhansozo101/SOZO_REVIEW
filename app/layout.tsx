import type { Metadata } from "next";
import { ja } from "@/lib/i18n/ja";
import "./globals.css";
import { geist, geistMono, newsreader, notoSansJP, notoSerifJP } from "./fonts";

export const metadata: Metadata = {
  title: ja.app.title,
  description: ja.app.description,
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
