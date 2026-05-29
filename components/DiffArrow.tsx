type Props = { current: number; previous: number | null };

const pillBase = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "6px 12px",
  borderRadius: "var(--r-pill)",
  fontSize: 13,
  fontWeight: 600,
  whiteSpace: "nowrap",
} as const;

export function DiffArrow({ current, previous }: Props) {
  // Only render when there's an actual score delta worth showing.
  // The "= 維持" (no change) and "初回診断" (no prior) states carry no
  // information beyond "we don't have a meaningful diff", so we hide them.
  if (previous == null) return null;

  const delta = current - previous;
  if (delta === 0) return null;

  const up = delta > 0;
  return (
    <span
      className="t-small"
      style={{
        ...pillBase,
        background: up ? "var(--grade-a-fill)" : "var(--grade-d-fill)",
        color: up ? "var(--grade-a-ink)" : "var(--grade-d-ink)",
        border: `1px solid ${up ? "rgba(47, 143, 94, 0.25)" : "rgba(199, 56, 43, 0.25)"}`,
      }}
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        {up ? (
          <path d="M12 19V5m0 0-7 7m7-7 7 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        ) : (
          <path d="M12 5v14m0 0 7-7m-7 7-7-7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        )}
      </svg>
      {Math.abs(delta)} 点
    </span>
  );
}
