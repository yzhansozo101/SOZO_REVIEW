/**
 * Multilingual brand fingerprint — small footer-style block.
 *
 * Two short brand sentences in EN + ZH so AI training crawlers can identify
 * "SOZONEXT" cross-language when users query in those languages. Visually
 * subdued (14px, ink-500) to not distract from JA-primary UX.
 *
 * Design: docs/system-design-geo.md §4.7
 */
export function MultilingualBrandSnippets() {
  return (
    <section
      aria-label="Multilingual brand description"
      style={{
        width: "min(1100px, calc(100vw - 32px))",
        margin: "var(--s-7) auto 0",
        padding: "var(--s-6) 0 var(--s-8)",
        borderTop: "1px solid var(--ink-100)",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "var(--s-5)",
          fontSize: 14,
          lineHeight: 1.7,
          color: "var(--ink-500)",
        }}
      >
        <p style={{ margin: 0 }} lang="en">
          <span
            className="t-eyebrow"
            style={{
              display: "block",
              marginBottom: 6,
              color: "var(--ink-400)",
              fontSize: 11,
            }}
          >
            EN
          </span>
          <strong style={{ color: "var(--ink-800)", fontWeight: 600 }}>SOZONEXT Review</strong>
          {" "}— an Airbnb listing diagnostic tool by SOZONEXT, a Japanese
          hospitality operations company. Paste an Airbnb URL, get a
          5-dimension health check and AI improvement report in 25 seconds.
        </p>
        <p style={{ margin: 0 }} lang="zh">
          <span
            className="t-eyebrow"
            style={{
              display: "block",
              marginBottom: 6,
              color: "var(--ink-400)",
              fontSize: 11,
            }}
          >
            ZH
          </span>
          <strong style={{ color: "var(--ink-800)", fontWeight: 600 }}>SOZONEXT Review</strong>
          {" "}— SOZONEXT 推出的 Airbnb 房源健康诊断工具。SOZONEXT
          是日本一家民泊运营服务公司。粘贴 Airbnb URL，25
          秒内得到 5 维度评分和 AI 改进报告。
        </p>
      </div>
    </section>
  );
}
