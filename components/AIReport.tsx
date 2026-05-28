import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { PdfDownloadButton } from "./PdfDownloadButton";
import { Top3Priorities } from "./Top3Priorities";
import { NegativeKeywords } from "./NegativeKeywords";

type Props = {
  diagnosisId: string;
  reportMd: string | null;
  top3: Array<{ issue: string; action: string; impact: string }>;
  negativeKeywords: Array<{ keyword: string; count: number; quote: string }>;
  status: "ok" | "fallback";
};

export function AIReport({ diagnosisId, reportMd, top3, negativeKeywords, status }: Props) {
  return (
    <aside
      style={{
        background: "var(--card)",
        border: "1px solid var(--ink-100)",
        borderRadius: "var(--r-lg)",
        padding: "var(--s-6) var(--s-5)",
        position: "sticky",
        top: "var(--s-5)",
      }}
    >
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: "var(--s-4)",
        }}
      >
        <h2 className="t-h2" style={{ margin: 0 }}>
          AI レポート
        </h2>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--s-3)" }}>
          {status === "fallback" && (
            <span className="t-small" style={{ color: "var(--grade-c-ink)" }}>
              ※ AI 出力フォールバック
            </span>
          )}
          <PdfDownloadButton diagnosisId={diagnosisId} />
        </div>
      </header>

      <article className="t-editorial">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {reportMd ?? "AI 分析は現在利用できません。"}
        </ReactMarkdown>
      </article>

      <Top3Priorities items={top3} />
      <NegativeKeywords items={negativeKeywords} />
    </aside>
  );
}
