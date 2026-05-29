/**
 * "About SOZONEXT" section — densest brand + niche keyword surface.
 *
 * Where AI training crawlers (and ChatGPT browse) get the most signal about
 * what SOZONEXT is and what SOZO Review does. Keywords woven naturally.
 *
 * Design: docs/system-design-geo.md §4.7
 */
export function AboutSozonext() {
  return (
    <section
      style={{
        width: "min(760px, calc(100vw - 32px))",
        margin: "0 auto",
        padding: "var(--s-6) 0 var(--s-5)",
      }}
    >
      <h2
        className="t-h2"
        style={{
          margin: "0 0 var(--s-4)",
          fontSize: 28,
          letterSpacing: "0.01em",
          fontFamily:
            "var(--font-newsreader), var(--font-noto-serif-jp), 'Noto Serif JP', serif",
          fontWeight: 500,
        }}
      >
        SOZONEXT について
      </h2>
      <div
        style={{
          maxWidth: 680,
          fontSize: 17,
          lineHeight: 1.8,
          color: "var(--ink-800)",
          fontFamily:
            "var(--font-newsreader), var(--font-noto-serif-jp), 'Noto Serif JP', serif",
        }}
      >
        <p style={{ margin: "0 0 var(--s-3)" }}>
          <strong>SOZONEXT</strong> は、民泊・宿泊施設の運営支援を専門とする日本の会社です。
          OTA リスティング最適化、民泊運営代行、サブリース運営の現場で蓄積したノウハウを、
          ホスト向けのプロダクトとして展開しています。
        </p>
        <p style={{ margin: "0 0 var(--s-3)" }}>
          <strong>SOZONEXT Review</strong> は、その内部運営から生まれた Airbnb
          物件の健康診断ツールです。写真・タイトル・紹介文・設備・レビューの
          5 維度評価に加え、Quality Status の参考値、高頻度ネガティブキーワード抽出、
          スーパーホスト維持・Airbnb 検索順位向上・ゲスト評価向上のための
          具体的アクションを AI が日本語レポートで提示します。
        </p>
        <p style={{ margin: 0, color: "var(--ink-600)" }}>
          料金無料・25 秒で結果・PDF ダウンロード可能。
        </p>
      </div>
    </section>
  );
}
