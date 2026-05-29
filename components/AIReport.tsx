import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Top3Priorities } from "./Top3Priorities";
import { NegativeKeywords } from "./NegativeKeywords";

type Props = {
  diagnosisId: string;
  reportMd: string | null;
  top3: Array<{ issue: string; action: string; impact: string }>;
  negativeKeywords: Array<{ keyword: string; count: number; quote: string }>;
  status: "ok" | "fallback";
};

function ReportSectionLabel({ n, label }: { n: string; label: string }) {
  return (
    <header className="report-section-label" style={{ marginBottom: 2 }}>
      <span className="num">{n}</span>
      <span className="label">{label}</span>
      <span aria-hidden="true" className="rule" />
    </header>
  );
}

export function AIReport({ reportMd, top3, negativeKeywords, status }: Props) {
  return (
    <aside
      style={{
        background: "var(--card)",
        border: "1px solid var(--ink-100)",
        borderRadius: "var(--r-lg)",
        padding: "var(--s-6)",
        boxShadow: "var(--shadow-card)",
        position: "sticky",
        top: "var(--s-5)",
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "var(--s-3)",
          marginBottom: "var(--s-5)",
          paddingBottom: "var(--s-4)",
          borderBottom: "1px solid var(--ink-100)",
        }}
      >
        <div style={{ display: "grid", gap: 4 }}>
          <h2
            className="t-h2"
            style={{ margin: 0, fontSize: "var(--t-lg)", letterSpacing: "-0.01em" }}
          >
            改善アクションプラン
          </h2>
          <span
            className="t-small"
            style={{ color: "var(--ink-500)", fontSize: 13 }}
          >
            写真・タイトル・紹介文・設備・レビューから自動生成
          </span>
        </div>
        {status === "fallback" && (
          <span
            className="t-small"
            style={{
              color: "var(--grade-c-ink)",
              background: "var(--grade-c-fill)",
              padding: "4px 10px",
              borderRadius: "var(--r-pill)",
              fontSize: 12,
              fontWeight: 500,
              border: "1px solid rgba(217, 139, 31, 0.18)",
            }}
          >
            フォールバック
          </span>
        )}
      </header>

      <section style={{ display: "grid", gap: "var(--s-3)" }}>
        <ReportSectionLabel n="01" label="概要" />
        <article className="ai-report-body">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {reportMd ?? "AI 分析は現在利用できません。"}
          </ReactMarkdown>
        </article>
      </section>

      <Top3Priorities items={top3} />
      <NegativeKeywords items={negativeKeywords} />
    </aside>
  );
}
