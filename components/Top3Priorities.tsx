type Item = { issue: string; action: string; impact: string };

export function Top3Priorities({ items }: { items: Item[] }) {
  if (!items?.length) return null;

  return (
    <section style={{ margin: "var(--s-5) 0" }}>
      <h3 className="t-h3" style={{ marginBottom: "var(--s-3)" }}>
        Top 3 改善優先度
      </h3>
      <ol
        style={{
          display: "grid",
          gap: "var(--s-3)",
          padding: 0,
          listStyle: "none",
          counterReset: "top3",
        }}
      >
        {items.map((it, i) => (
          <li
            key={i}
            style={{
              counterIncrement: "top3",
              background: "var(--card)",
              border: "1px solid var(--ink-100)",
              borderRadius: "var(--r-lg)",
              padding: "var(--s-4) var(--s-5)",
              display: "grid",
              gap: "var(--s-2)",
              position: "relative",
            }}
          >
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                top: "var(--s-4)",
                right: "var(--s-5)",
                fontFamily: "var(--font-serif)",
                fontStyle: "italic",
                fontSize: "var(--t-lg)",
                color: "var(--ink-300)",
              }}
            >
              0{i + 1}
            </div>
            <div className="t-small" style={{ color: "var(--ink-500)" }}>
              問題
            </div>
            <div className="t-body" style={{ margin: 0, fontWeight: "var(--w-medium)" }}>
              {it.issue}
            </div>
            <div className="t-small" style={{ color: "var(--ink-500)", marginTop: "var(--s-2)" }}>
              アクション
            </div>
            <div className="t-body" style={{ margin: 0 }}>
              {it.action}
            </div>
            <div className="t-small" style={{ color: "var(--ink-500)", marginTop: "var(--s-2)" }}>
              期待効果
            </div>
            <div className="t-body" style={{ margin: 0, color: "var(--grade-a-ink)" }}>
              {it.impact}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
