import { gradeColors, scoreToGrade } from "@/lib/util/grade";

type Props = {
  label: string;
  score: number;
  primaryStat: string;
  note?: string;
  placeholder?: boolean;
};

function MiniRing({
  score,
  base,
  ink,
  placeholder,
}: {
  score: number;
  base: string;
  ink: string;
  placeholder?: boolean;
}) {
  const size = 56;
  const stroke = 5;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = placeholder ? 0 : Math.max(0, Math.min(100, score));
  const offset = c * (1 - pct / 100);
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ transform: "rotate(-90deg)", display: "block" }}
        aria-hidden="true"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`${ink}14`}
          strokeWidth={stroke}
        />
        {!placeholder && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={base}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 420ms var(--ease-out)" }}
          />
        )}
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 14,
          fontWeight: 600,
          color: placeholder ? "var(--ink-400)" : "var(--ink-900)",
          fontFeatureSettings: "'tnum' 1",
          letterSpacing: "-0.01em",
        }}
      >
        {placeholder ? "—" : score}
      </div>
    </div>
  );
}

export function DimensionCard({ label, score, primaryStat, note, placeholder }: Props) {
  const grade = scoreToGrade(score);
  const colors = gradeColors(grade);

  return (
    <div
      className="lift-on-hover"
      style={{
        position: "relative",
        background: "var(--card)",
        border: "1px solid var(--ink-100)",
        borderRadius: "var(--r-lg)",
        padding: "var(--s-4) var(--s-4) var(--s-4) calc(var(--s-4) + 4px)",
        display: "grid",
        gridTemplateRows: "auto 1fr auto",
        gap: "var(--s-3)",
        minWidth: 0,
        overflow: "hidden",
      }}
    >
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 4,
          background: colors.base,
          opacity: placeholder ? 0.3 : 1,
        }}
      />

      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "var(--s-2)",
        }}
      >
        <div style={{ display: "grid", gap: 2, minWidth: 0 }}>
          <h3
            className="t-h3"
            style={{
              margin: 0,
              fontSize: 13,
              fontWeight: 600,
              color: "var(--ink-700)",
              letterSpacing: 0.3,
              textTransform: "uppercase",
            }}
          >
            {label}
          </h3>
          <span
            style={{
              fontSize: 10,
              letterSpacing: 0.6,
              fontWeight: 600,
              color: colors.ink,
              background: colors.fill,
              padding: "2px 7px",
              borderRadius: "var(--r-pill)",
              width: "fit-content",
            }}
          >
            {placeholder ? "—" : grade}
          </span>
        </div>
        <MiniRing
          score={score}
          base={colors.base}
          ink="var(--ink-900)"
          placeholder={placeholder}
        />
      </header>

      <div
        className="t-tabular"
        style={{
          fontSize: 22,
          fontWeight: 600,
          lineHeight: 1.1,
          color: placeholder ? "var(--ink-400)" : "var(--ink-900)",
          letterSpacing: "-0.015em",
        }}
      >
        {primaryStat}
      </div>
      {note && (
        <p
          className="t-small"
          style={{
            margin: 0,
            color: placeholder ? "var(--ink-400)" : "var(--ink-500)",
            fontSize: 12,
            lineHeight: 1.45,
          }}
        >
          {note}
        </p>
      )}
    </div>
  );
}
