type Item = { keyword: string; count: number; quote: string };

export function NegativeKeywords({ items }: { items: Item[] }) {
  if (!items?.length) {
    return (
      <section style={{ margin: "var(--s-5) 0" }}>
        <h3 className="t-h3" style={{ marginBottom: "var(--s-2)" }}>
          否定キーワード
        </h3>
        <p className="t-small" style={{ color: "var(--ink-500)" }}>
          高頻度の否定キーワードは検出されませんでした
        </p>
      </section>
    );
  }

  return (
    <section style={{ margin: "var(--s-5) 0" }}>
      <h3 className="t-h3" style={{ marginBottom: "var(--s-3)" }}>
        否定キーワード Top {items.length}
      </h3>
      <ul style={{ display: "grid", gap: "var(--s-3)", padding: 0, listStyle: "none" }}>
        {items.map((it, i) => (
          <li
            key={i}
            style={{
              display: "grid",
              gridTemplateColumns: "auto 1fr",
              gap: "var(--s-3)",
              alignItems: "baseline",
            }}
          >
            <span
              style={{
                background: "var(--grade-d-fill)",
                color: "var(--grade-d-ink)",
                padding: "2px 10px",
                borderRadius: "var(--r-pill)",
                fontSize: "var(--t-sm)",
                fontWeight: "var(--w-semibold)",
                whiteSpace: "nowrap",
              }}
            >
              {it.keyword} ×{it.count}
            </span>
            <span className="t-small" style={{ color: "var(--ink-500)", fontStyle: "italic" }}>
              “{it.quote.slice(0, 140)}
              {it.quote.length > 140 ? "…" : ""}”
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
