type Item = { issue: string; action: string; impact: string };

function NumberBadge({ n }: { n: number }) {
  return (
    <div
      style={{
        flexShrink: 0,
        width: 44,
        height: 44,
        borderRadius: "var(--r-pill)",
        background:
          "linear-gradient(135deg, var(--sozonext-navy) 0%, var(--sozonext-navy-700) 100%)",
        color: "var(--text-on-navy)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--font-sans)",
        fontWeight: 600,
        fontSize: 16,
        letterSpacing: "-0.01em",
        fontFeatureSettings: "'tnum' 1",
        boxShadow: "0 6px 16px -8px rgba(2, 66, 128, 0.55)",
      }}
      aria-hidden="true"
    >
      {String(n).padStart(2, "0")}
    </div>
  );
}

function Row({
  icon,
  label,
  labelColor,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  labelColor: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "auto 1fr",
        gap: 10,
        alignItems: "start",
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: 22,
          height: 22,
          borderRadius: 999,
          background: `${labelColor}1A`,
          color: labelColor,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          marginTop: 1,
        }}
      >
        {icon}
      </span>
      <div style={{ display: "grid", gap: 3, minWidth: 0 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: 0.8,
            textTransform: "uppercase",
            color: labelColor,
          }}
        >
          {label}
        </div>
        <div style={{ fontSize: 14.5, lineHeight: 1.55, color: "var(--ink-800)" }}>
          {children}
        </div>
      </div>
    </div>
  );
}

export function Top3Priorities({ items }: { items: Item[] }) {
  if (!items?.length) return null;

  return (
    <section
      id="top3-priorities"
      style={{ margin: "var(--s-5) 0", scrollMarginTop: "var(--s-5)", display: "grid", gap: "var(--s-3)" }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 2,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-sans)",
            fontFeatureSettings: "'tnum' 1",
            fontSize: 12,
            fontWeight: 600,
            color: "var(--sozonext-navy)",
            background: "var(--sozonext-navy-50)",
            border: "1px solid var(--sozonext-navy-100)",
            padding: "2px 8px",
            borderRadius: "var(--r-pill)",
            letterSpacing: 0.4,
          }}
        >
          02
        </span>
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: 0.8,
            textTransform: "uppercase",
            color: "var(--ink-500)",
          }}
        >
          Top 3 改善アクション
        </span>
        <span
          aria-hidden="true"
          style={{
            flex: 1,
            height: 1,
            background: "var(--ink-100)",
            marginLeft: 4,
          }}
        />
        <span className="t-mono" style={{ color: "var(--ink-400)", fontSize: 11 }}>
          {items.length} / 3
        </span>
      </header>

      <ol
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
            key={i}
            className="lift-on-hover"
            style={{
              background: "var(--card)",
              border: "1px solid var(--ink-100)",
              borderRadius: "var(--r-lg)",
              padding: "var(--s-4) var(--s-5)",
              display: "grid",
              gridTemplateColumns: "auto 1fr",
              columnGap: "var(--s-4)",
              rowGap: "var(--s-3)",
            }}
          >
            <NumberBadge n={i + 1} />
            <div
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: "var(--ink-900)",
                letterSpacing: "-0.005em",
                alignSelf: "center",
                lineHeight: 1.4,
              }}
            >
              {it.issue}
            </div>
            <div style={{ gridColumn: "1 / -1", display: "grid", gap: "var(--s-3)" }}>
              <Row
                label="アクション"
                labelColor="var(--sozonext-navy)"
                icon={
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M5 12h14M13 6l6 6-6 6"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                }
              >
                {it.action}
              </Row>
              <div
                style={{
                  background: "var(--grade-a-fill)",
                  border: "1px solid rgba(47, 143, 94, 0.18)",
                  borderRadius: "var(--r-md)",
                  padding: "10px 14px",
                  display: "grid",
                  gridTemplateColumns: "auto 1fr",
                  gap: 10,
                  alignItems: "start",
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 999,
                    background: "var(--grade-a)",
                    color: "var(--card)",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    marginTop: 1,
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M20 6 9 17l-5-5"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <div style={{ display: "grid", gap: 2, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      letterSpacing: 0.8,
                      textTransform: "uppercase",
                      color: "var(--grade-a-ink)",
                    }}
                  >
                    期待効果
                  </div>
                  <div
                    style={{
                      fontSize: 14.5,
                      lineHeight: 1.55,
                      color: "var(--grade-a-ink)",
                      fontWeight: 500,
                    }}
                  >
                    {it.impact}
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
