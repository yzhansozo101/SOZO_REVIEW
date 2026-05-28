import { ja } from "@/lib/i18n/ja";
import { gradeColors, pointsToNextGrade, scoreToGrade, type Grade } from "@/lib/util/grade";

type Props = {
  score: number | null;
};

const cardShell = {
  borderRadius: "var(--r-xl)",
  padding: "var(--s-6)",
  boxShadow: "var(--shadow-card)",
} as const;

export function ScoreCard({ score }: Props) {
  if (score === null) {
    return (
      <div
        data-testid="score-card"
        style={{
          ...cardShell,
          background: "var(--grade-x-fill)",
          color: "var(--grade-x-ink)",
        }}
      >
        <div data-testid="score-letter" className="t-display">
          ?
        </div>
        <p className="t-small" style={{ color: "inherit", margin: 0 }}>
          {ja.result.scoreCard.neutralStatus}
        </p>
      </div>
    );
  }

  const grade: Grade = scoreToGrade(score);
  const colors = gradeColors(grade);
  const next = pointsToNextGrade(score);
  const upgradeText = next.atMax
    ? ja.result.scoreCard.upgradeAtMax
    : ja.result.scoreCard.upgradeHintTpl
        .replace("{points}", String(next.points))
        .replace("{grade}", next.target);

  return (
    <div
      data-testid="score-card"
      style={{
        ...cardShell,
        background: colors.fill,
        color: colors.ink,
        display: "grid",
        gap: "var(--s-3)",
      }}
    >
      <div
        data-testid="score-letter"
        className="t-display"
        style={{ color: colors.base }}
      >
        {grade}
      </div>
      <div
        className="t-tabular"
        data-testid="score-number"
        style={{ fontSize: "var(--t-xl)", lineHeight: "var(--lh-tight)" }}
      >
        {score}
        <span style={{ fontSize: "var(--t-sm)", marginLeft: "var(--s-1)" }}>点</span>
      </div>
      <div className="t-small" data-testid="score-upgrade" style={{ color: "inherit" }}>
        {upgradeText}
      </div>
    </div>
  );
}
