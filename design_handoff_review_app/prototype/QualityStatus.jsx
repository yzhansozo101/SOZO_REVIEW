function QualityStatus({ qs }) {
  return (
    <div className="kit-qs">
      <div className="kit-qs-header">
        <span className="kit-qs-title">QUALITY STATUS</span>
        <span className="kit-qs-meta">A5 · Airbnb 8段階</span>
      </div>
      <div className="kit-qs-steps">
        {qs.labels.map((lbl, i) => {
          const n = i + 1;
          const active = n === qs.current;
          return (
            <div key={n} className={`kit-qs-step ${active ? 'kit-qs-active' : ''} s-${n}`}>
              <span className="kit-qs-n">{String(n).padStart(2, '0')}</span>
              <span className="kit-qs-label-en">{lbl.ja}</span>
            </div>
          );
        })}
      </div>
      <div className="kit-qs-explain">
        現在 <b>{qs.labels[qs.current - 1].ja}</b> · {qs.explain}
      </div>
    </div>
  );
}
Object.assign(window, { QualityStatus });
