import { gradeColors, scoreToGrade } from "@/lib/util/grade";

type Props = {
  label: string;
  score: number;
  primaryStat: string;
  note?: string;
  placeholder?: boolean;
};

export function DimensionCard({ label, score, primaryStat, note, placeholder }: Props) {
  const grade = scoreToGrade(score);
  const colors = gradeColors(grade);

  return (
    <div
      style={{
        background: "var(--card)",
        border: "1px solid var(--ink-100)",
        borderRadius: "var(--r-lg)",
        padding: "14px",
        display: "grid",
        gap: "var(--s-2)",
        minWidth: 0,
        boxShadow: "0 1px 2px rgba(14, 17, 22, 0.03)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "var(--s-2)" }}>
        <h3 className="t-h3" style={{ margin: 0, fontSize: "var(--t-sm)" }}>
          {label}
        </h3>
        <span
          style={{
            background: colors.fill,
            color: colors.ink,
            padding: "2px 8px",
            borderRadius: "var(--r-pill)",
            fontSize: "var(--t-xs)",
            fontWeight: "var(--w-semibold)",
            lineHeight: 1.4,
          }}
        >
          {grade}
        </span>
      </div>
      <div
        className="t-tabular"
        style={{
          fontSize: "var(--t-lg)",
          fontWeight: "var(--w-semibold)",
          lineHeight: 1,
          color: "var(--ink-900)",
        }}
      >
        {primaryStat}
      </div>
      {note && (
        <p
          className="t-small"
          style={{
            margin: 0,
            minHeight: 30,
            color: placeholder ? "var(--ink-400)" : "var(--ink-500)",
            fontSize: "var(--t-xs)",
            lineHeight: 1.4,
          }}
        >
          {note}
        </p>
      )}
    </div>
  );
}
