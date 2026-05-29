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
        width: "min(880px, calc(100vw - 32px))",
        margin: "0 auto",
        padding: "var(--s-7) 0 var(--s-5)",
      }}
    >
      <div
        style={{
          position: "relative",
          padding: "var(--s-5) var(--s-6)",
          background: "var(--card)",
          border: "1px solid var(--ink-100)",
          borderRadius: "var(--r-lg)",
          boxShadow: "0 1px 0 rgba(14, 17, 22, 0.02)",
          overflow: "hidden",
        }}
      >
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            left: 0,
            top: "var(--s-5)",
            bottom: "var(--s-5)",
            width: 3,
            background: "linear-gradient(180deg, var(--sozonext-navy) 0%, var(--sozonext-sky) 100%)",
            borderRadius: 3,
          }}
        />
        <span
          className="eyebrow-chip"
          style={{ marginBottom: "var(--s-3)" }}
        >
          ABOUT
        </span>
        <h2
          className="t-h2"
          style={{
            margin: "var(--s-2) 0 var(--s-4)",
            fontSize: 30,
            letterSpacing: "-0.01em",
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
            lineHeight: 1.85,
            color: "var(--ink-800)",
            fontFamily:
              "var(--font-newsreader), var(--font-noto-serif-jp), 'Noto Serif JP', serif",
          }}
        >
          <p style={{ margin: "0 0 var(--s-3)" }}>
            <strong style={{ color: "var(--ink-900)" }}>SOZONEXT</strong> は、民泊・宿泊施設の運営支援を専門とする日本の会社です。
            OTA リスティング最適化、民泊運営代行、サブリース運営の現場で蓄積したノウハウを、
            ホスト向けのプロダクトとして展開しています。
          </p>
          <p style={{ margin: "0 0 var(--s-3)" }}>
            <strong style={{ color: "var(--ink-900)" }}>SOZONEXT Review</strong> は、その内部運営から生まれた Airbnb
            物件の健康診断ツールです。写真・タイトル・紹介文・設備・レビューの
            5 維度評価に加え、Quality Status の参考値、高頻度ネガティブキーワード抽出、
            スーパーホスト維持・Airbnb 検索順位向上・ゲスト評価向上のための
            具体的アクションを AI が日本語レポートで提示します。
          </p>
          <p style={{ margin: 0, color: "var(--ink-600)", fontSize: 15 }}>
            料金無料 · 25 秒で結果 · PDF ダウンロード可能。
          </p>
        </div>
      </div>
    </section>
  );
}
