// 4B — Email preview modal (F1 alert + F7 weekly). Compact tabular layout.

function EmailPreview({ kind, data, onClose }) {
  // kind: 'f1' | 'f7'
  const isF1 = kind === 'f1';
  const title = isF1 ? 'F1 · アラートメール' : 'F7 · 週次サマリーメール';

  return (
    <div className="kit-mail-overlay" onClick={onClose} role="presentation">
      <div
        className="kit-mail-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <header className="kit-mail-modal-head">
          <div>
            <span className="kit-mail-modal-eyebrow">メールプレビュー</span>
            <span className="kit-mail-modal-title">{title}</span>
          </div>
          <button className="kit-btn kit-btn-ghost kit-btn-sm" onClick={onClose}>閉じる ✕</button>
        </header>

        <div className="kit-mail-envelope">
          {isF1 ? <EmailF1 data={data} /> : <EmailF7 data={data} />}
        </div>
      </div>
    </div>
  );
}

function EmailHeader({ from, to, subj }) {
  return (
    <div className="kit-mail-headers">
      <div className="kit-mail-headers-row"><span className="kit-mail-headers-k">From</span><span className="kit-mail-headers-v">{from}</span></div>
      <div className="kit-mail-headers-row"><span className="kit-mail-headers-k">To</span><span className="kit-mail-headers-v">{to}</span></div>
      <div className="kit-mail-headers-row"><span className="kit-mail-headers-k">Subject</span><span className="kit-mail-headers-v"><b>{subj}</b></span></div>
    </div>
  );
}

function EmailF1({ data }) {
  const { listingName, score, grade, prevScore, threshold, email, topIssues, reportUrl } = data;
  const delta = (score - prevScore).toFixed(1);
  return (
    <article className="kit-mail-body">
      <EmailHeader
        from="sozo-review@sozonext.co"
        to={email}
        subj={`⚠️ アラート · ${listingName} · ${score}点 (${grade})`}
      />
      <div className="kit-mail-content">
        <div className={`kit-mail-hero grade-${grade.toLowerCase()}`}>
          <div className="kit-mail-hero-letter">{grade}</div>
          <div className="kit-mail-hero-side">
            <div className="kit-mail-hero-score">{score} 点</div>
            <div className="kit-mail-hero-delta">前回 {prevScore} → 現在 {score} （{delta >= 0 ? '+' : ''}{delta}）</div>
            <div className="kit-mail-hero-note">しきい値 {threshold} 点を下回りました</div>
          </div>
        </div>

        <h3 className="kit-mail-h3">Top 3 課題</h3>
        <table className="kit-mail-table">
          <tbody>
            {topIssues.map((issue, i) => (
              <tr key={i}>
                <td className="kit-mail-table-n">{String(i + 1).padStart(2, '0')}</td>
                <td>{issue}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <a className="kit-mail-cta" href={reportUrl}>→ レポートを開く</a>

        <p className="kit-mail-foot">
          このメールは SOZONEXT 物件ヘルスチェックから自動送信されました。
          同一物件・同一診断につき1通のみ送信されます。
        </p>
      </div>
    </article>
  );
}

function EmailF7({ data }) {
  const { weekTag, totalDiagnosed, distribution, topRisks, nextSendAt, email } = data;
  const total = distribution.A + distribution.B + distribution.C + distribution.D;
  return (
    <article className="kit-mail-body">
      <EmailHeader
        from="sozo-review@sozonext.co"
        to={email}
        subj={`📊 週次サマリー · ${weekTag} · ${totalDiagnosed}件 診断`}
      />
      <div className="kit-mail-content">
        <h3 className="kit-mail-h3">グレード分布</h3>
        <div className="kit-mail-dist">
          {['A', 'B', 'C', 'D'].map((g) => {
            const n = distribution[g];
            const pct = Math.round((n / total) * 100);
            return (
              <div key={g} className={`kit-mail-dist-row g-${g.toLowerCase()}`}>
                <span className="kit-mail-dist-label">{g}</span>
                <div className="kit-mail-dist-bar">
                  <div className="kit-mail-dist-fill" style={{ width: `${pct}%` }}></div>
                </div>
                <span className="kit-mail-dist-n">{n}</span>
              </div>
            );
          })}
        </div>

        <h3 className="kit-mail-h3">⚠️ 要対応 Top 3</h3>
        <table className="kit-mail-table">
          <thead>
            <tr><th>物件</th><th style={{ textAlign: 'right' }}>スコア</th><th>主な課題</th></tr>
          </thead>
          <tbody>
            {topRisks.map((r, i) => (
              <tr key={i}>
                <td><b>{r.name}</b></td>
                <td style={{ textAlign: 'right' }}>
                  <span className={`kit-mail-grade g-${r.grade.toLowerCase()}`}>{r.grade} · {r.score}</span>
                </td>
                <td className="kit-mail-table-mute">{r.issue}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <p className="kit-mail-foot">
          次回 自動送信：<b>{nextSendAt}</b> （毎週月曜 09:00）
        </p>
      </div>
    </article>
  );
}

Object.assign(window, { EmailPreview });
