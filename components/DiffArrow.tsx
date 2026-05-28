type Props = { current: number; previous: number | null };

export function DiffArrow({ current, previous }: Props) {
  if (previous == null) {
    return (
      <span className="t-small" style={{ color: "var(--ink-400)" }}>
        初回診断
      </span>
    );
  }

  const delta = current - previous;
  if (delta === 0) {
    return (
      <span className="t-small" style={{ color: "var(--ink-400)" }}>
        = 維持
      </span>
    );
  }

  const up = delta > 0;
  return (
    <span className="t-small" style={{ color: up ? "var(--grade-a)" : "var(--grade-d)" }}>
      {up ? "↑" : "↓"} {Math.abs(delta)} 点
    </span>
  );
}
