type Props = {
  score: number;
  alertSent: boolean;
  alertEmailTo: string;
  diagnosisId: string;
};

export function AlertBar({ score, alertSent, alertEmailTo, diagnosisId }: Props) {
  const triggered = score < 60;
  const bg = triggered ? "var(--grade-d-fill)" : "var(--grade-a-fill)";
  const fg = triggered ? "var(--grade-d-ink)" : "var(--grade-a-ink)";
  const title = triggered
    ? alertSent
      ? `アラートを送信しました -> ${alertEmailTo}`
      : `アラート対象です(${score} 点 < 60)、送信記録はまだありません`
    : `評価健全(${score} 点 >= 60)、アラートはトリガーされていません`;

  return (
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
        次回自動送信予定: 来週月曜日 09:00 ※ demo 段階では定時送信なし
      </div>
      <div>
        <form action="/api/weekly/test" method="POST">
          <input type="hidden" name="diagnosisId" value={diagnosisId} />
          <button
            type="submit"
            style={{
              padding: "6px 12px",
              background: "var(--card)",
              border: "1px solid var(--ink-200)",
              borderRadius: "var(--r-md)",
              cursor: "pointer",
              fontSize: "var(--t-sm)",
            }}
          >
            立即测试发送週次サマリー
          </button>
        </form>
      </div>
    </section>
  );
}
