type Item = { keyword: string; count: number; quote: string };

function SectionLabel({ n, label, right }: { n: string; label: string; right?: React.ReactNode }) {
  return (
    <header className="report-section-label" style={{ marginBottom: 2 }}>
      <span className="num">{n}</span>
      <span className="label">{label}</span>
      <span aria-hidden="true" className="rule" />
      {right}
    </header>
  );
}

export function NegativeKeywords({ items }: { items: Item[] }) {
  if (!items?.length) {
    return (
      <section style={{ margin: "var(--s-5) 0 0", display: "grid", gap: "var(--s-3)" }}>
        <SectionLabel n="03" label="否定キーワード" />
        <p
          className="t-small"
          style={{
            color: "var(--ink-500)",
            background: "var(--ink-50)",
            border: "1px solid var(--ink-100)",
            padding: "12px 14px",
            borderRadius: "var(--r-md)",
            margin: 0,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span
            aria-hidden="true"
            style={{
              width: 18,
              height: 18,
              borderRadius: 999,
              background: "var(--grade-a)",
              color: "var(--card)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
              <path
                d="M20 6 9 17l-5-5"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          高頻度の否定キーワードは検出されませんでした
        </p>
      </section>
    );
  }

  return (
    <section style={{ margin: "var(--s-5) 0 0", display: "grid", gap: "var(--s-3)" }}>
      <SectionLabel
        n="03"
        label="否定キーワード"
        right={
          <span className="t-mono" style={{ color: "var(--ink-400)", fontSize: 11 }}>
            Top {items.length}
          </span>
        }
      />

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 6,
          paddingBottom: "var(--s-2)",
        }}
      >
        {items.map((it) => (
          <span
            key={it.keyword}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "var(--grade-d-fill)",
              color: "var(--grade-d-ink)",
              padding: "4px 10px",
              borderRadius: "var(--r-pill)",
              fontSize: 12.5,
              fontWeight: 600,
              border: "1px solid rgba(199, 56, 43, 0.22)",
              whiteSpace: "nowrap",
            }}
          >
            {it.keyword}
            <span
              style={{
                fontSize: 11,
                fontWeight: 500,
                opacity: 0.7,
                padding: "0 6px",
                background: "rgba(255, 255, 255, 0.55)",
                borderRadius: 999,
                fontFeatureSettings: "'tnum' 1",
              }}
            >
              ×{it.count}
            </span>
          </span>
        ))}
      </div>

      <ul
        style={{
          display: "grid",
          gap: "var(--s-3)",
          padding: 0,
          listStyle: "none",
          margin: 0,
        }}
      >
        {items.map((it, i) => (
          <li
            key={`q-${i}`}
            style={{
              display: "grid",
              gridTemplateColumns: "auto 1fr",
              gap: 10,
              alignItems: "start",
              padding: "10px 12px",
              background: "var(--ink-50)",
              border: "1px solid var(--ink-100)",
              borderRadius: "var(--r-md)",
            }}
          >
            <span
              aria-hidden="true"
              style={{
                color: "var(--grade-d)",
                fontSize: 14,
                fontWeight: 700,
                lineHeight: 1.55,
              }}
            >
              ＂
            </span>
            <span
              style={{
                color: "var(--ink-700)",
                fontSize: 13.5,
                lineHeight: 1.6,
                fontStyle: "normal",
              }}
            >
              {it.quote.slice(0, 160)}
              {it.quote.length > 160 ? "…" : ""}
              <span
                style={{
                  display: "inline-block",
                  marginLeft: 8,
                  padding: "1px 8px",
                  borderRadius: "var(--r-pill)",
                  background: "var(--grade-d-fill)",
                  color: "var(--grade-d-ink)",
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: 0.2,
                  verticalAlign: "middle",
                }}
              >
                {it.keyword}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
