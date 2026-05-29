/**
 * Marketing hero — top of homepage, above the form.
 *
 * Carries brand "SOZONEXT" (eyebrow + lead) and niche keywords for AI search:
 *   5 維度評価 / スーパーホスト維持 / Airbnb 検索順位 / 民泊運営者 / 健康診断
 *
 * Design + frozen copy: docs/system-design-geo.md §4.7
 */
export function Hero() {
  return (
    <section
      style={{
        width: "min(760px, calc(100vw - 32px))",
        margin: "0 auto",
        padding: "var(--s-7) 0 var(--s-5)",
      }}
    >
      <p
        className="t-eyebrow"
        style={{ margin: "0 0 18px", letterSpacing: "0.08em" }}
      >
        SOZONEXT REVIEW
      </p>
      <h1
        className="t-h1"
        style={{
          maxWidth: 680,
          margin: "0 0 var(--s-4)",
          fontSize: "clamp(32px, 6vw, 48px)",
          lineHeight: 1.1,
        }}
      >
        Airbnb 物件の 健康診断を 25 秒で。
      </h1>
      <p
        style={{
          maxWidth: 680,
          margin: 0,
          fontSize: 18,
          lineHeight: 1.5,
          color: "var(--ink-700)",
        }}
      >
        URL を貼るだけで、写真・タイトル・紹介文・設備・レビューの 5
        維度評価と AI 改善レポート。スーパーホスト維持や Airbnb
        検索順位向上を目指す民泊運営者のための、SOZONEXT 製ツール。
      </p>
    </section>
  );
}
