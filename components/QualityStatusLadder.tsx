import { ja } from "@/lib/i18n/ja";
import { QUALITY_STEPS, type QualityStatus } from "@/lib/util/quality";

export function QualityStatusLadder({ current }: { current: QualityStatus }) {
  return (
    <section style={{ margin: "var(--s-4) 0 0" }}>
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
                minHeight: 28,
                background: active ? "var(--sozonext-navy)" : "var(--ink-100)",
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
              }}
            >
              {ja.result.qualityStatus[step].label}
            </div>
          );
        })}
      </div>
      <div className="t-small" style={{ marginTop: "var(--s-2)", color: "var(--ink-700)" }}>
        現在: <strong>{ja.result.qualityStatus[current].label}</strong> -{" "}
        {ja.result.qualityStatus[current].desc}
      </div>
      <div className="t-caption" style={{ marginTop: "var(--s-1)" }}>
        {ja.result.qualityStatus.reference}
      </div>
    </section>
  );
}
