import { ja } from "@/lib/i18n/ja";
import {
  gradeColors,
  pointsToNextGrade,
  scoreToGrade,
  type Grade,
  type GradeColors,
} from "@/lib/util/grade";

type DimensionsShape = {
  photos: { score: number };
  title: { score: number; placeholder?: boolean };
  description: { score: number };
  amenities: { score: number };
  reviews: { score: number };
};

type Props = {
  score: number | null;
  dimensions?: DimensionsShape;
};

const cardShell = {
  position: "relative",
  borderRadius: "var(--r-xl)",
  padding: "var(--s-6)",
  boxShadow: "var(--shadow-card)",
  overflow: "hidden",
} as const;

const GRADE_BANDS: Record<Grade, { label: string; range: string }> = {
  A: { label: "優秀", range: "90 – 100" },
  B: { label: "良好", range: "75 – 89" },
  C: { label: "要改善", range: "60 – 74" },
  D: { label: "危険", range: "0 – 59" },
};

type Row = { key: keyof DimensionsShape; label: string; score: number; placeholder?: boolean };

function ScoreArc({
  score,
  grade,
  colors,
}: {
  score: number;
  grade: Grade;
  colors: GradeColors;
}) {
  const size = 132;
  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, score));
  const offset = c * (1 - pct / 100);
  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
        flexShrink: 0,
      }}
    >
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
          stroke={`${colors.ink}1F`}
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={colors.base}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 480ms var(--ease-out)" }}
        />
      </svg>
      <div
        data-testid="score-letter"
        className="t-display"
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: colors.base,
          fontSize: 72,
          lineHeight: 1,
          letterSpacing: "-0.03em",
          fontWeight: 600,
        }}
      >
        {grade}
      </div>
    </div>
  );
}

function buildRows(dims: DimensionsShape): Row[] {
  return [
    { key: "photos", label: ja.result.dimensions.photos.label, score: dims.photos.score },
    { key: "title", label: ja.result.dimensions.title.label, score: dims.title.score, placeholder: dims.title.placeholder },
    { key: "description", label: ja.result.dimensions.description.label, score: dims.description.score },
    { key: "amenities", label: ja.result.dimensions.amenities.label, score: dims.amenities.score },
    { key: "reviews", label: ja.result.dimensions.reviews.label, score: dims.reviews.score },
  ];
}

export function ScoreCard({ score, dimensions }: Props) {
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
  const band = GRADE_BANDS[grade];
  const rows = dimensions ? buildRows(dimensions) : [];

  return (
    <div
      data-testid="score-card"
      style={{
        ...cardShell,
        background: colors.fill,
        color: colors.ink,
      }}
    >
      <div
        style={{
          position: "relative",
          display: "grid",
          gridTemplateColumns: "auto 1fr",
          gap: "var(--s-5)",
          alignItems: "center",
        }}
      >
        <ScoreArc score={score} grade={grade} colors={colors} />

        <div style={{ display: "grid", gap: "var(--s-2)", minWidth: 0 }}>
          <div className="t-eyebrow" style={{ color: "inherit", opacity: 0.7 }}>
            総合スコア
          </div>
          <div
            className="t-tabular"
            data-testid="score-number"
            style={{
              fontSize: "var(--t-2xl)",
              lineHeight: 1,
              fontWeight: 600,
              letterSpacing: "-0.02em",
              color: colors.ink,
            }}
          >
            {score}
            <span
              style={{
                fontSize: "var(--t-md)",
                marginLeft: 6,
                fontWeight: 500,
                opacity: 0.7,
              }}
            >
              / 100 点
            </span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontSize: 13,
              opacity: 0.85,
            }}
          >
            <span
              style={{
                padding: "3px 10px",
                borderRadius: "var(--r-pill)",
                background: "rgba(255, 255, 255, 0.55)",
                color: colors.ink,
                fontWeight: 600,
                letterSpacing: "0.04em",
              }}
            >
              {band.label}
            </span>
            <span style={{ fontFeatureSettings: "'tnum' 1" }}>{band.range}</span>
          </div>
        </div>
      </div>

      {rows.length > 0 && (
        <div
          style={{
            position: "relative",
            marginTop: "var(--s-5)",
            paddingTop: "var(--s-4)",
            borderTop: `1px solid ${colors.ink}1F`,
            display: "grid",
            gap: 10,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              marginBottom: 2,
            }}
          >
            <span
              className="t-eyebrow"
              style={{ color: "inherit", opacity: 0.7, fontSize: 11 }}
            >
              内訳
            </span>
            <span
              className="t-mono"
              style={{ color: "inherit", opacity: 0.5, fontSize: 11 }}
            >
              5 維度
            </span>
          </div>
          {rows.map((row) => {
            const rowGrade = scoreToGrade(row.score);
            const rowBase = gradeColors(rowGrade).base;
            const muted = !!row.placeholder;
            const pct = Math.max(0, Math.min(100, row.score));
            return (
              <div
                key={row.key}
                style={{
                  display: "grid",
                  gridTemplateColumns: "64px minmax(0, 1fr) 34px",
                  alignItems: "center",
                  gap: 10,
                  color: "inherit",
                  opacity: muted ? 0.55 : 1,
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 500,
                    letterSpacing: 0.2,
                  }}
                >
                  {row.label}
                </span>
                <span
                  aria-hidden="true"
                  style={{
                    position: "relative",
                    height: 6,
                    borderRadius: 999,
                    background: `${colors.ink}1A`,
                    overflow: "hidden",
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      inset: 0,
                      width: `${pct}%`,
                      background: muted ? `${colors.ink}40` : rowBase,
                      borderRadius: 999,
                      transition: "width 320ms var(--ease-out)",
                    }}
                  />
                </span>
                <span
                  className="t-tabular"
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    textAlign: "right",
                    fontFeatureSettings: "'tnum' 1",
                  }}
                >
                  {muted ? "—" : row.score}
                </span>
              </div>
            );
          })}
        </div>
      )}

      <div
        style={{
          marginTop: "var(--s-5)",
          paddingTop: "var(--s-4)",
          borderTop: `1px solid ${colors.ink}1F`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "var(--s-3)",
          flexWrap: "wrap",
        }}
      >
        <div
          className="t-small"
          data-testid="score-upgrade"
          style={{ color: "inherit", margin: 0 }}
        >
          {upgradeText}
        </div>
        <a
          href="#top3-priorities"
          className="score-card-jump"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 12px",
            borderRadius: "var(--r-pill)",
            background: "rgba(255, 255, 255, 0.6)",
            color: colors.ink,
            fontSize: 12.5,
            fontWeight: 600,
            letterSpacing: 0.2,
            textDecoration: "none",
            border: `1px solid ${colors.ink}1F`,
            transition:
              "background var(--t-fast) var(--ease-out), transform var(--t-fast) var(--ease-out)",
          }}
        >
          Top 3 改善アクション
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M5 12h14M13 6l6 6-6 6"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </a>
        <style>{`
          .score-card-jump:hover {
            background: rgba(255, 255, 255, 0.85);
            transform: translateX(2px);
          }
          .score-card-jump:focus-visible {
            outline: none;
            box-shadow: var(--shadow-focus);
          }
          @media (prefers-reduced-motion: reduce) {
            .score-card-jump:hover { transform: none; }
          }
        `}</style>
      </div>
    </div>
  );
}
