"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type Props = {
  current: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function TrendChart({ current }: Props) {
  const today = clamp(current / 20, 0, 5);
  const lastYear = clamp(today + (today >= 3 ? -0.24 : 0.24), 0, 5);
  const data = [
    { date: "1 年前", value: Number(lastYear.toFixed(2)) },
    { date: "現在", value: Number(today.toFixed(2)) },
  ];

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
          alignItems: "center",
          justifyContent: "space-between",
          gap: "var(--s-3)",
        }}
      >
        <span className="t-small" style={{ color: "var(--ink-600)", fontSize: 13 }}>
          過去 12 ヶ月の平均レビュー評価
        </span>
        <span
          className="t-mono"
          style={{ color: "var(--ink-400)", fontSize: 11 }}
        >
          0 – 5
        </span>
      </header>
      <div
        style={{
          width: "100%",
          height: 200,
          background: "var(--ink-50)",
          borderRadius: "var(--r-md)",
          padding: "var(--s-3)",
        }}
      >
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: "#595E66" }}
              axisLine={{ stroke: "#C8CCD1" }}
              tickLine={false}
            />
            <YAxis
              domain={[0, 5]}
              tick={{ fontSize: 11, fill: "#595E66" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                background: "#FFFFFF",
                border: "1px solid #E7E9EC",
                borderRadius: 8,
                fontSize: 12,
                boxShadow: "0 8px 24px -8px rgba(14, 17, 22, 0.18)",
              }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="var(--sozonext-navy)"
              strokeWidth={2.5}
              dot={{ r: 5, fill: "var(--sozonext-navy)", strokeWidth: 0 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="t-caption" style={{ margin: 0, color: "var(--ink-400)" }}>
        ※ 近 1 年の評価はデモ用データです。次バージョンで実履歴を表示します。
      </p>
    </section>
  );
}
