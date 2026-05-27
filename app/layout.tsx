import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SOZO Review · 物件ヘルスチェック",
  description: "Airbnb 物件の健康診断システム",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
