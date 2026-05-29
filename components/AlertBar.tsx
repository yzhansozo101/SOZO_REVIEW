"use client";

import { useState } from "react";
import { EmailPreview, type EmailPreviewKind } from "@/components/EmailPreview";

type Props = {
  score: number;
  alertSent: boolean;
  alertEmailTo: string;
  diagnosisId: string;
};

export function AlertBar({ score, alertSent, alertEmailTo, diagnosisId }: Props) {
  const [preview, setPreview] = useState<EmailPreviewKind | null>(null);
  const triggered = score < 60;
  const bg = triggered ? "var(--grade-d-fill)" : "var(--grade-a-fill)";
  const fg = triggered ? "var(--grade-d-ink)" : "var(--grade-a-ink)";
  const title = triggered
    ? alertSent
      ? `アラートを送信しました -> ${alertEmailTo}`
      : `アラート対象です(${score} 点 < 60)、送信記録はまだありません`
    : `評価健全(${score} 点 >= 60)、アラートはトリガーされていません`;

  const buttonStyle = {
    padding: "10px 16px",
    background: "var(--card)",
    border: "1px solid var(--ink-200)",
    borderRadius: "var(--r-md)",
    cursor: "pointer",
    fontSize: "var(--t-sm)",
    color: "var(--ink-800)",
    fontFamily: "var(--font-sans)",
    transition: "background var(--t-fast) var(--ease-out)",
  } as const;

  return (
    <>
      <section
        style={{
          background: bg,
          color: fg,
          padding: "var(--s-4)",
          borderRadius: "var(--r-lg)",
          margin: "var(--s-5) 0",
          display: "grid",
          gap: "var(--s-2)",
        }}
      >
        <div style={{ fontWeight: "var(--w-semibold)" }}>{title}</div>
        <div className="t-small" style={{ color: "inherit" }}>
          デモ段階では定時送信なし。週次サマリーは手動テスト送信のみです。
        </div>
        <div
          className="t-small"
          data-testid="alert-bar-mock-schedule"
          data-mock="true"
          style={{
            color: "inherit",
            background: "var(--ink-50)",
            border: "1px dashed var(--ink-200)",
            borderRadius: "var(--r-sm)",
            padding: "6px 10px",
            display: "inline-flex",
            alignItems: "center",
            gap: "var(--s-2)",
            fontStyle: "italic",
          }}
        >
          <span aria-hidden="true">ⓘ</span>
          次回自動送信予定: 来週月曜 09:00(デモ表示)
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--s-2)", alignItems: "center" }}>
          <button className="alert-bar-button" type="button" style={buttonStyle} onClick={() => setPreview("f1")}>
            アラートメール プレビュー
          </button>
          <button className="alert-bar-button" type="button" style={buttonStyle} onClick={() => setPreview("f7")}>
            週次サマリー プレビュー
          </button>
          <form action="/api/weekly/test" method="POST">
            <input type="hidden" name="diagnosisId" value={diagnosisId} />
            <button className="alert-bar-button" type="submit" style={buttonStyle}>
              🧪 週次サマリーを今すぐテスト送信
            </button>
          </form>
        </div>
      </section>

      {preview && (
        <EmailPreview
          kind={preview}
          score={score}
          alertEmailTo={alertEmailTo}
          diagnosisId={diagnosisId}
          onClose={() => setPreview(null)}
        />
      )}
      <style jsx>{`
        .alert-bar-button:hover {
          background: var(--ink-50) !important;
        }

        .alert-bar-button:focus-visible {
          outline: none;
          box-shadow: var(--shadow-focus);
        }
      `}</style>
    </>
  );
}
