"use client";

import { useEffect, useState } from "react";

const PHASES = [
  { until: 5_000, label: "物件データを取得中…" },
  { until: 25_000, label: "5 項目を分析中…" },
  { until: 120_000, label: "AI レポートを生成中…" },
];

const skeletonBar = {
  background: "linear-gradient(90deg, var(--ink-50) 0%, var(--ink-100) 50%, var(--ink-50) 100%)",
  backgroundSize: "1600px 100%",
  animation: "progress-shimmer 1.5s linear infinite",
} as const;

export function ProgressView() {
  const [start] = useState(() => Date.now());
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      const elapsed = Date.now() - start;
      const nextPhase = PHASES.findIndex((p) => elapsed < p.until);
      setPhase(nextPhase === -1 ? PHASES.length - 1 : nextPhase);
    }, 500);

    return () => clearInterval(timer);
  }, [start]);

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "var(--s-7) var(--gutter)" }}>
      <div
        className="progress-status"
        role="status"
        aria-live="polite"
        style={{
          background: "var(--card)",
          border: "1px solid var(--ink-100)",
          borderRadius: "var(--r-lg)",
          padding: "var(--s-5)",
          display: "flex",
          alignItems: "center",
          gap: "var(--s-3)",
          marginBottom: "var(--s-6)",
          boxShadow: "var(--shadow-card)",
        }}
      >
        <span
          aria-hidden="true"
          style={{
            width: 16,
            height: 16,
            flex: "0 0 16px",
            border: "2px solid var(--ink-200)",
            borderTopColor: "var(--sozonext-navy)",
            borderRadius: "50%",
            animation: "progress-spin 1s linear infinite",
          }}
        />
        <div className="t-body" style={{ fontWeight: "var(--w-medium)", margin: 0 }}>
          {PHASES[phase].label}
        </div>
        <div className="t-small" style={{ marginLeft: "auto", color: "var(--ink-400)", whiteSpace: "nowrap" }}>
          {phase + 1}/{PHASES.length}
        </div>
      </div>

      <div aria-hidden="true" style={{ display: "grid", gap: "var(--s-4)" }}>
        <div
          style={{
            ...skeletonBar,
            height: 160,
            borderRadius: "var(--r-xl)",
          }}
        />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: "var(--s-3)",
          }}
        >
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              style={{
                ...skeletonBar,
                height: 100,
                borderRadius: "var(--r-lg)",
              }}
            />
          ))}
        </div>
        <div
          style={{
            ...skeletonBar,
            height: 220,
            borderRadius: "var(--r-lg)",
          }}
        />
      </div>

      <style>{`
        @keyframes progress-spin {
          to { transform: rotate(360deg); }
        }

        @keyframes progress-shimmer {
          0% { background-position: -800px 0; }
          100% { background-position: 800px 0; }
        }

        @media (max-width: 640px) {
          .progress-status {
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
}
