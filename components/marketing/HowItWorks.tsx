/**
 * "How it works" section — 3 numbered steps below the form.
 *
 * Pure presentational. Light brand keyword embed.
 *
 * Design: docs/system-design-geo.md §4.7
 */

const STEPS = [
  {
    n: "01",
    title: "URL を貼り付け",
    body: "Airbnb 物件 URL（airbnb.com / .jp）を入力。アカウント不要。",
  },
  {
    n: "02",
    title: "25 秒で 5 維度評価",
    body: "写真・タイトル・紹介文・設備・レビューを自動診断、AI が改善レポートを生成。",
  },
  {
    n: "03",
    title: "PDF でダウンロード",
    body: "結果と改善案を日本語 PDF で保存。チーム共有 / クライアント提案にそのまま使えます。",
  },
] as const;

export function HowItWorks() {
  return (
    <section
      style={{
        width: "min(1100px, calc(100vw - 32px))",
        margin: "0 auto",
        padding: "var(--s-8) 0 var(--s-6)",
      }}
    >
      <header
        style={{
          textAlign: "center",
          marginBottom: "var(--s-6)",
          display: "grid",
          justifyItems: "center",
          gap: "var(--s-3)",
        }}
      >
        <span className="eyebrow-chip">使い方</span>
        <h2
          className="t-h2"
          style={{
            margin: 0,
            fontSize: "clamp(28px, 3.4vw, 40px)",
            letterSpacing: "-0.015em",
            lineHeight: 1.15,
          }}
        >
          3 ステップで、運営判断に必要な答えが揃う
        </h2>
      </header>

      <ol
        style={{
          listStyle: "none",
          padding: 0,
          margin: 0,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "var(--s-4)",
        }}
      >
        {STEPS.map((s) => (
          <li key={s.n} className="step-card">
            <div className="step-num">{s.n}</div>
            <div className="step-rule" />
            <div
              style={{
                fontSize: 18,
                fontWeight: 600,
                marginBottom: "var(--s-2)",
                color: "var(--ink-900)",
                letterSpacing: "-0.005em",
              }}
            >
              {s.title}
            </div>
            <div
              style={{
                fontSize: 14.5,
                color: "var(--ink-600)",
                lineHeight: 1.65,
              }}
            >
              {s.body}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
