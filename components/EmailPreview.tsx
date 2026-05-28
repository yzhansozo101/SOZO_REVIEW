"use client";

import { useEffect, useMemo } from "react";

export type EmailPreviewKind = "f1" | "f7";

type Props = {
  kind: EmailPreviewKind;
  score: number;
  alertEmailTo: string;
  diagnosisId: string;
  onClose: () => void;
};

type Grade = "A" | "B" | "C" | "D";

const SAMPLE_ISSUES = [
  "写真の明るさと枚数を見直すと、初回閲覧での離脱を減らせます。",
  "タイトルに最寄り駅・強み・滞在用途を短く入れる余地があります。",
  "説明文の設備情報を整理し、予約前の不安を減らしてください。",
];

const SAMPLE_WEEKLY_RISKS = [
  { title: "浅草リバーサイド 402", grade: "D" as Grade, score: 48, issue: "写真品質と説明文の不足" },
  { title: "新宿ワークステイ 7F", grade: "C" as Grade, score: 57, issue: "レビュー返信と設備表記" },
  { title: "渋谷ミニマルルーム", grade: "C" as Grade, score: 59, issue: "タイトル訴求の弱さ" },
];

export function EmailPreview({ kind, score, alertEmailTo, diagnosisId, onClose }: Props) {
  const isF1 = kind === "f1";
  const title = isF1 ? "F1 · アラートメール" : "F7 · 週次サマリーメール";
  const emailHtml = useMemo(
    () =>
      isF1
        ? buildF1Html({ score, alertEmailTo, diagnosisId })
        : buildF7Html({ alertEmailTo }),
    [alertEmailTo, diagnosisId, isF1, score],
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div className="email-preview-overlay" onClick={onClose} role="presentation">
      <div
        className="email-preview-modal"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <header className="email-preview-head">
          <div>
            <span className="email-preview-eyebrow">メールプレビュー</span>
            <span className="email-preview-title">{title}</span>
          </div>
          <button className="email-preview-close" type="button" onClick={onClose}>
            閉じる x
          </button>
        </header>

        <div className="email-preview-envelope" dangerouslySetInnerHTML={{ __html: emailHtml }} />
      </div>

      <style>{`
        .email-preview-overlay {
          position: fixed;
          inset: 0;
          z-index: 80;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 28px;
          background: rgba(14, 17, 22, 0.42);
          backdrop-filter: blur(3px);
        }

        .email-preview-modal {
          width: min(100%, 800px);
          max-height: min(860px, calc(100vh - 56px));
          overflow: hidden;
          border-radius: var(--r-xl);
          background: var(--card);
          box-shadow: var(--shadow-pop);
          display: flex;
          flex-direction: column;
        }

        .email-preview-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 16px 18px;
          border-bottom: 1px solid var(--ink-100);
          background: var(--card);
        }

        .email-preview-eyebrow {
          display: block;
          color: var(--ink-500);
          font-family: var(--font-sans);
          font-size: 11px;
          font-weight: var(--w-medium);
          letter-spacing: var(--track-caps);
          text-transform: uppercase;
        }

        .email-preview-title {
          display: block;
          margin-top: 2px;
          color: var(--ink-900);
          font-family: var(--font-sans);
          font-size: 16px;
          font-weight: var(--w-semibold);
          line-height: var(--lh-snug);
        }

        .email-preview-close {
          border: 1px solid transparent;
          border-radius: var(--r-md);
          background: transparent;
          color: var(--ink-700);
          cursor: pointer;
          font-family: var(--font-sans);
          font-size: 12px;
          line-height: 1;
          padding: 7px 12px;
        }

        .email-preview-close:hover {
          background: var(--ink-50);
        }

        .email-preview-envelope {
          width: min(720px, calc(100vw - 56px));
          margin: 0 auto;
          padding: 20px 0 24px;
          overflow: auto;
        }

        .mail-preview-body {
          overflow: hidden;
          border: 1px solid var(--ink-100);
          border-radius: var(--r-lg);
          background: var(--card);
          color: var(--ink-800);
          font-family: var(--font-sans);
          box-shadow: var(--shadow-card);
        }

        .mail-preview-headers {
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding: 14px 18px;
          border-bottom: 1px solid var(--ink-100);
          background: var(--ink-50);
          font-size: 12px;
        }

        .mail-preview-headers-row {
          display: grid;
          grid-template-columns: 70px minmax(0, 1fr);
          gap: 12px;
        }

        .mail-preview-headers-k {
          color: var(--ink-400);
          font-family: var(--font-mono);
          font-size: 11px;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        .mail-preview-headers-v {
          min-width: 0;
          overflow-wrap: anywhere;
          color: var(--ink-800);
          font-family: var(--font-mono);
        }

        .mail-preview-headers-v b {
          color: var(--ink-900);
        }

        .mail-preview-content {
          padding: 22px 24px 28px;
        }

        .mail-preview-hero {
          display: flex;
          align-items: center;
          gap: 22px;
          margin-bottom: 18px;
          padding: 16px 18px;
          border-radius: var(--r-md);
        }

        .mail-preview-hero.grade-a { background: var(--grade-a-fill); color: var(--grade-a-ink); }
        .mail-preview-hero.grade-b { background: var(--grade-b-fill); color: var(--grade-b-ink); }
        .mail-preview-hero.grade-c { background: var(--grade-c-fill); color: var(--grade-c-ink); }
        .mail-preview-hero.grade-d { background: var(--grade-d-fill); color: var(--grade-d-ink); }

        .mail-preview-hero-letter {
          font-size: 64px;
          font-weight: var(--w-semibold);
          letter-spacing: var(--track-normal);
          line-height: 0.85;
        }

        .mail-preview-hero-score {
          font-size: 22px;
          font-variant-numeric: tabular-nums;
          font-weight: var(--w-semibold);
          line-height: var(--lh-tight);
        }

        .mail-preview-hero-delta {
          margin-top: 6px;
          font-family: var(--font-mono);
          font-size: 12px;
          opacity: 0.85;
        }

        .mail-preview-hero-note {
          margin-top: 4px;
          font-size: 12px;
          opacity: 0.9;
        }

        .mail-preview-h3 {
          margin: 20px 0 10px;
          color: var(--ink-900);
          font-size: 13px;
          font-weight: var(--w-semibold);
          letter-spacing: 0.06em;
          line-height: var(--lh-snug);
          text-transform: uppercase;
        }

        .mail-preview-h3:first-child {
          margin-top: 0;
        }

        .mail-preview-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
        }

        .mail-preview-table th {
          padding: 6px 8px;
          border-bottom: 1px solid var(--ink-100);
          color: var(--ink-500);
          font-size: 11px;
          font-weight: var(--w-medium);
          letter-spacing: 0.04em;
          text-align: left;
          text-transform: uppercase;
        }

        .mail-preview-table td {
          padding: 10px 8px;
          border-bottom: 1px solid var(--ink-100);
          line-height: 1.5;
          vertical-align: top;
        }

        .mail-preview-table tr:last-child td {
          border-bottom: 0;
        }

        .mail-preview-table-n {
          width: 32px;
          color: var(--sozonext-navy);
          font-family: var(--font-mono);
          font-weight: var(--w-semibold);
        }

        .mail-preview-table-mute {
          color: var(--ink-500);
          font-size: 12px;
        }

        .mail-preview-cta {
          display: inline-flex;
          align-items: center;
          margin-top: 18px;
          border-radius: var(--r-md);
          background: var(--sozonext-navy);
          color: #fff;
          font-size: 13px;
          font-weight: var(--w-medium);
          line-height: 1;
          padding: 11px 16px;
          text-decoration: none;
        }

        .mail-preview-dist {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .mail-preview-dist-row {
          display: grid;
          grid-template-columns: 24px minmax(0, 1fr) 32px;
          align-items: center;
          gap: 12px;
        }

        .mail-preview-dist-label,
        .mail-preview-dist-n {
          font-size: 12px;
          font-weight: var(--w-semibold);
        }

        .mail-preview-dist-bar {
          height: 10px;
          overflow: hidden;
          border-radius: var(--r-pill);
          background: var(--ink-50);
        }

        .mail-preview-dist-fill {
          height: 100%;
          border-radius: var(--r-pill);
        }

        .mail-preview-dist-row.g-a .mail-preview-dist-fill { background: var(--grade-a); }
        .mail-preview-dist-row.g-b .mail-preview-dist-fill { background: var(--grade-b); }
        .mail-preview-dist-row.g-c .mail-preview-dist-fill { background: var(--grade-c); }
        .mail-preview-dist-row.g-d .mail-preview-dist-fill { background: var(--grade-d); }

        .mail-preview-grade {
          display: inline-block;
          white-space: nowrap;
          border-radius: var(--r-pill);
          font-size: 12px;
          font-variant-numeric: tabular-nums;
          font-weight: var(--w-semibold);
          padding: 2px 8px;
        }

        .mail-preview-grade.g-c { background: var(--grade-c-fill); color: var(--grade-c-ink); }
        .mail-preview-grade.g-d { background: var(--grade-d-fill); color: var(--grade-d-ink); }

        .mail-preview-foot {
          margin: 20px 0 0;
          color: var(--ink-500);
          font-size: 11px;
          line-height: 1.6;
        }

        @media (max-width: 640px) {
          .email-preview-overlay {
            padding: 12px;
          }

          .email-preview-modal {
            max-height: calc(100vh - 24px);
          }

          .email-preview-head {
            align-items: flex-start;
          }

          .email-preview-envelope {
            width: calc(100vw - 24px);
            padding: 12px 0;
          }

          .mail-preview-content {
            padding: 18px 16px 22px;
          }

          .mail-preview-hero {
            align-items: flex-start;
            gap: 14px;
          }

          .mail-preview-hero-letter {
            font-size: 48px;
          }
        }
      `}</style>
    </div>
  );
}

function buildF1Html({
  score,
  alertEmailTo,
  diagnosisId,
}: {
  score: number;
  alertEmailTo: string;
  diagnosisId: string;
}) {
  const grade = gradeForScore(score);
  const prevScore = Math.min(100, score + 7);
  const delta = score - prevScore;
  const reportUrl = `/d/${encodeURIComponent(diagnosisId)}`;
  const listingName = "診断対象物件";

  return `
    <article class="mail-preview-body">
      ${emailHeaders({
        from: "sozo-review@sozonext.co",
        to: alertEmailTo,
        subject: `アラート · ${listingName} · ${score}点 (${grade})`,
      })}
      <div class="mail-preview-content">
        <div class="mail-preview-hero grade-${grade.toLowerCase()}">
          <div class="mail-preview-hero-letter">${grade}</div>
          <div>
            <div class="mail-preview-hero-score">${score} 点</div>
            <div class="mail-preview-hero-delta">前回 ${prevScore} -> 現在 ${score} (${delta})</div>
            <div class="mail-preview-hero-note">しきい値 60 点を下回りました</div>
          </div>
        </div>

        <h3 class="mail-preview-h3">Top 3 課題</h3>
        <table class="mail-preview-table">
          <tbody>
            ${SAMPLE_ISSUES.map(
              (issue, index) => `
                <tr>
                  <td class="mail-preview-table-n">${String(index + 1).padStart(2, "0")}</td>
                  <td>${escapeHtml(issue)}</td>
                </tr>
              `,
            ).join("")}
          </tbody>
        </table>

        <a class="mail-preview-cta" href="${escapeAttr(reportUrl)}">レポートを開く</a>

        <p class="mail-preview-foot">
          このメールは SOZO Review が自動送信したものです。同一診断で再送はされません。
        </p>
      </div>
    </article>
  `;
}

function buildF7Html({ alertEmailTo }: { alertEmailTo: string }) {
  const distribution = { A: 4, B: 7, C: 5, D: 2 };
  const total = distribution.A + distribution.B + distribution.C + distribution.D;

  return `
    <article class="mail-preview-body">
      ${emailHeaders({
        from: "sozo-review@sozonext.co",
        to: alertEmailTo,
        subject: `SOZONEXT 物件ヘルス週次サマリー · 2026-05-25 · ${total}件 診断`,
      })}
      <div class="mail-preview-content">
        <h3 class="mail-preview-h3">グレード分布</h3>
        <div class="mail-preview-dist">
          ${(["A", "B", "C", "D"] as const)
            .map((grade) => {
              const count = distribution[grade];
              const pct = Math.round((count / total) * 100);
              return `
                <div class="mail-preview-dist-row g-${grade.toLowerCase()}">
                  <span class="mail-preview-dist-label">${grade}</span>
                  <div class="mail-preview-dist-bar">
                    <div class="mail-preview-dist-fill" style="width: ${pct}%"></div>
                  </div>
                  <span class="mail-preview-dist-n">${count}</span>
                </div>
              `;
            })
            .join("")}
        </div>

        <h3 class="mail-preview-h3">要対応 Top 3</h3>
        <table class="mail-preview-table">
          <thead>
            <tr>
              <th>物件</th>
              <th style="text-align: right">スコア</th>
              <th>主な課題</th>
            </tr>
          </thead>
          <tbody>
            ${SAMPLE_WEEKLY_RISKS.map(
              (risk) => `
                <tr>
                  <td><b>${escapeHtml(risk.title)}</b></td>
                  <td style="text-align: right">
                    <span class="mail-preview-grade g-${risk.grade.toLowerCase()}">${risk.grade} · ${risk.score}</span>
                  </td>
                  <td class="mail-preview-table-mute">${escapeHtml(risk.issue)}</td>
                </tr>
              `,
            ).join("")}
          </tbody>
        </table>

        <p class="mail-preview-foot">
          ※ デモ段階では定時送信なし。次回自動送信予定「来週月曜 09:00」は画面上のデモ表示です。本プレビューは手動「テスト送信」の確認用です。
        </p>
      </div>
    </article>
  `;
}

function emailHeaders({
  from,
  to,
  subject,
}: {
  from: string;
  to: string;
  subject: string;
}) {
  return `
    <div class="mail-preview-headers">
      <div class="mail-preview-headers-row">
        <span class="mail-preview-headers-k">From</span>
        <span class="mail-preview-headers-v">${escapeHtml(from)}</span>
      </div>
      <div class="mail-preview-headers-row">
        <span class="mail-preview-headers-k">To</span>
        <span class="mail-preview-headers-v">${escapeHtml(to)}</span>
      </div>
      <div class="mail-preview-headers-row">
        <span class="mail-preview-headers-k">Subject</span>
        <span class="mail-preview-headers-v"><b>${escapeHtml(subject)}</b></span>
      </div>
    </div>
  `;
}

function gradeForScore(score: number): Grade {
  if (score >= 80) return "A";
  if (score >= 65) return "B";
  if (score >= 60) return "C";
  return "D";
}

function escapeHtml(value: string | number) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeAttr(value: string) {
  return escapeHtml(value);
}
