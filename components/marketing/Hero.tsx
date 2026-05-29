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
        width: "min(880px, calc(100vw - 32px))",
        margin: "0 auto",
        padding: "var(--s-8) 0 var(--s-5)",
        textAlign: "center",
      }}
    >
      <span className="eyebrow-chip" style={{ marginBottom: "var(--s-4)" }}>
        SOZONEXT REVIEW
      </span>
      <h1
        className="t-h1"
        style={{
          margin: "var(--s-4) auto var(--s-4)",
          maxWidth: 820,
          fontSize: "clamp(40px, 7vw, 76px)",
          lineHeight: 1.05,
          letterSpacing: "-0.025em",
          fontWeight: 600,
        }}
      >
        <span style={{ display: "block" }}>Airbnb リスティングを</span>
        <span
          style={{
            display: "block",
            background: "linear-gradient(120deg, var(--sozonext-navy) 0%, var(--sozonext-sky) 90%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          25 秒で健康診断。
        </span>
      </h1>
      <p
        style={{
          maxWidth: 620,
          margin: "0 auto",
          fontSize: 18,
          lineHeight: 1.6,
          color: "var(--ink-600)",
        }}
      >
        URL を貼るだけで、写真・タイトル・紹介文・設備・レビューの 5
        維度評価と AI 改善レポート。スーパーホスト維持や Airbnb
        検索順位向上を目指す民泊運営者のための、SOZONEXT 製ツール。
      </p>
    </section>
  );
}
