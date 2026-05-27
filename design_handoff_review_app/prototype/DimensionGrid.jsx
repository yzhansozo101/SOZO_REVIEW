function DimensionGrid({ dimensions }) {
  return (
    <div>
      <div className="kit-section-header">
        <h2 className="kit-section-title">5項目スコア分析</h2>
        <span className="kit-section-meta">B series · クリックで詳細展開</span>
      </div>
      <div className="kit-dim-grid">
        {dimensions.map((d) => (
          <div key={d.id} className="kit-dim-card">
            <div className="kit-dim-head">
              <span className="kit-dim-ico">{d.icon}</span>
              <span className={`kit-dim-grade g-${d.grade.toLowerCase()}`}>{d.grade}</span>
            </div>
            <span className="kit-dim-title">{d.label}</span>
            <span className="kit-dim-stat">{d.value}<span className="u">{d.unit}</span></span>
            <span className="kit-dim-note">{d.note}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
Object.assign(window, { DimensionGrid });
