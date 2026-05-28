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
    <section style={{ margin: "var(--s-5) 0 0" }}>
      <h3 className="t-h3" style={{ margin: "0 0 var(--s-3)" }}>
        評価推移
      </h3>
      <div
        style={{
          width: "100%",
          height: 180,
          background: "var(--card)",
          border: "1px solid var(--ink-100)",
          borderRadius: "var(--r-lg)",
          padding: "var(--s-3)",
        }}
      >
        <ResponsiveContainer>
          <LineChart data={data}>
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis domain={[0, 5]} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="value"
              stroke="var(--sozonext-navy)"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="t-caption" style={{ marginTop: "var(--s-2)" }}>
        ※ 「1 年前」のデータは示例値です。次バージョンで実履歴を表示します。
      </p>
    </section>
  );
}
