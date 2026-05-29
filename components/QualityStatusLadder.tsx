import { ja } from "@/lib/i18n/ja";
import { QUALITY_STEPS, type QualityStatus } from "@/lib/util/quality";

export function QualityStatusLadder({ current }: { current: QualityStatus }) {
  return (
    <section
      style={{
        background: "var(--card)",
        border: "1px solid var(--ink-100)",
        borderRadius: "var(--r-lg)",
        padding: "var(--s-5)",
        display: "grid",
        gap: "var(--s-3)",
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: "var(--s-3)",
        }}
      >
        <span
          className="t-small"
          style={{ color: "var(--ink-600)", fontSize: 13 }}
        >
          現在: <strong style={{ color: "var(--ink-900)" }}>{ja.result.qualityStatus[current].label}</strong>
        </span>
        <span
          className="t-mono"
          style={{ color: "var(--ink-400)", fontSize: 11 }}
        >
          8 段階
        </span>
      </header>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(8, minmax(0, 1fr))",
          gap: "var(--s-1)",
        }}
      >
        {QUALITY_STEPS.map((step) => {
          const active = step === current;
          return (
            <div
              key={step}
              title={ja.result.qualityStatus[step].label}
              style={{
                minHeight: 32,
                background: active ? "var(--sozonext-navy)" : "var(--ink-50)",
                color: active ? "var(--text-on-navy)" : "var(--ink-500)",
                fontSize: "var(--t-xs)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "var(--r-sm)",
                fontWeight: active ? "var(--w-semibold)" : "var(--w-regular)",
                lineHeight: 1.2,
                padding: "0 var(--s-1)",
                textAlign: "center",
                overflowWrap: "anywhere",
                border: active
                  ? "1px solid var(--sozonext-navy)"
                  : "1px solid var(--ink-100)",
                boxShadow: active ? "0 4px 12px -6px rgba(2, 66, 128, 0.45)" : "none",
              }}
            >
              {ja.result.qualityStatus[step].label}
            </div>
          );
        })}
      </div>
      <div className="t-small" style={{ color: "var(--ink-600)", margin: 0, fontSize: 13 }}>
        {ja.result.qualityStatus[current].desc}
      </div>
      <div className="t-caption" style={{ color: "var(--ink-400)" }}>
        {ja.result.qualityStatus.reference}
      </div>
    </section>
  );
}
