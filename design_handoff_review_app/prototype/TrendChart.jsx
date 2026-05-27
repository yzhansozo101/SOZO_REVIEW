function TrendChart({ trend }) {
  // C1 — 2 points, historic → current. SVG is fixed-viewBox; container scales.
  return (
    <div className="kit-trend">
      <div className="kit-section-header" style={{ marginBottom: 6 }}>
        <h2 className="kit-section-title" style={{ fontSize: 14 }}>スコア履歴</h2>
        <span className="kit-section-meta">C1 · 1年前 → 現在</span>
      </div>
      <svg viewBox="0 0 500 140" preserveAspectRatio="none">
        <line x1="20" y1="20" x2="500" y2="20" stroke="var(--ink-100)" strokeDasharray="2 3"/>
        <line x1="20" y1="70" x2="500" y2="70" stroke="var(--ink-100)" strokeDasharray="2 3"/>
        <line x1="20" y1="120" x2="500" y2="120" stroke="var(--ink-100)" strokeDasharray="2 3"/>
        <text x="0" y="24" fontFamily="var(--font-mono)" fontSize="10" fill="var(--ink-400)">5.0</text>
        <text x="0" y="74" fontFamily="var(--font-mono)" fontSize="10" fill="var(--ink-400)">4.5</text>
        <text x="0" y="124" fontFamily="var(--font-mono)" fontSize="10" fill="var(--ink-400)">4.0</text>
        <path d="M 100 70 L 440 50" stroke="#024280" strokeWidth="2" fill="none" />
        <circle cx="100" cy="70" r="5" fill="#024280" />
        <circle cx="440" cy="50" r="5" fill="#024280" />
        <text x="100" y="95" fontFamily="'Noto Sans JP', sans-serif" fontSize="11" fontWeight="600" fill="var(--ink-700)" textAnchor="middle">{trend.historic} · 1年前</text>
        <text x="440" y="40" fontFamily="'Noto Sans JP', sans-serif" fontSize="11" fontWeight="600" fill="var(--ink-700)" textAnchor="middle">{trend.current} · 現在</text>
      </svg>
      <div className="kit-trend-foot">
        スコア履歴（データ蓄積中・v1で完全12週グラフを表示）
      </div>
    </div>
  );
}
Object.assign(window, { TrendChart });
