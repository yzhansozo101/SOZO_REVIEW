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
  const accent = triggered ? "var(--grade-d)" : "var(--grade-a)";
  const title = triggered
    ? alertSent
      ? `アラートを送信しました → ${alertEmailTo}`
      : `アラート対象です（${score} 点 < 60）、送信記録はまだありません`
    : `評価健全（${score} 点 ≥ 60）、アラートはトリガーされていません`;

  const buttonStyle = {
    padding: "10px 16px",
    background: "var(--card)",
    border: "1px solid var(--ink-200)",
    borderRadius: "var(--r-md)",
    cursor: "pointer",
    fontSize: "var(--t-sm)",
    color: "var(--ink-800)",
    fontFamily: "var(--font-sans)",
    fontWeight: 500,
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    transition: "background var(--t-fast) var(--ease-out), border-color var(--t-fast) var(--ease-out)",
  } as const;

  return (
    <>
      <section
        style={{
          background: bg,
          color: fg,
          padding: "var(--s-5)",
          borderRadius: "var(--r-lg)",
          border: `1px solid ${accent}33`,
          display: "grid",
          gap: "var(--s-3)",
        }}
      >
        <header style={{ display: "flex", alignItems: "flex-start", gap: "var(--s-3)" }}>
          <span
            aria-hidden="true"
            style={{
              flex: "0 0 28px",
              width: 28,
              height: 28,
              borderRadius: "var(--r-pill)",
              background: accent,
              color: "var(--card)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              {triggered ? (
                <path
                  d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ) : (
                <path
                  d="M20 6 9 17l-5-5"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
            </svg>
          </span>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div
              style={{
                fontWeight: "var(--w-semibold)",
                fontSize: 15,
                lineHeight: 1.4,
                margin: 0,
              }}
            >
              {title}
            </div>
            <div className="t-small" style={{ color: "inherit", opacity: 0.85, marginTop: 4 }}>
              週次サマリー配信設定: 毎週月曜 09:00、登録メール宛に自動送信。
            </div>
          </div>
        </header>

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
              週次サマリーを今すぐテスト送信
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
          border-color: var(--ink-300) !important;
        }

        .alert-bar-button:focus-visible {
          outline: none;
          box-shadow: var(--shadow-focus);
        }
      `}</style>
    </>
  );
}
