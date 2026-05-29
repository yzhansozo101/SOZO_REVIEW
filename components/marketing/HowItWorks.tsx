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
        width: "min(760px, calc(100vw - 32px))",
        margin: "0 auto",
        padding: "var(--s-7) 0 var(--s-5)",
      }}
    >
      <h2
        className="t-h2"
        style={{
          margin: "0 0 var(--s-4)",
          fontSize: 24,
          letterSpacing: "0.02em",
        }}
      >
        使い方
      </h2>
      <ol
        style={{
          listStyle: "none",
          padding: 0,
          margin: 0,
          display: "grid",
          gap: "var(--s-3)",
        }}
      >
        {STEPS.map((s) => (
          <li
            key={s.n}
            style={{
              display: "grid",
              gridTemplateColumns: "auto 1fr",
              gap: "var(--s-3)",
              padding: "var(--s-3) 0",
              borderTop: "1px solid var(--ink-200)",
            }}
          >
            <span
              className="t-mono"
              style={{
                color: "var(--ink-400)",
                fontSize: 14,
                paddingTop: 2,
              }}
            >
              {s.n}
            </span>
            <div>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  marginBottom: 4,
                  color: "var(--ink-900)",
                }}
              >
                {s.title}
              </div>
              <div style={{ fontSize: 15, color: "var(--ink-700)", lineHeight: 1.5 }}>
                {s.body}
              </div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
