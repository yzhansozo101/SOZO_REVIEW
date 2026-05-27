function AIReport({ report, listingName, diagnosedAt, onDownload }) {
  // Re-highlight the configured emphasized phrase inside the lead.
  const renderLead = () => {
    const { lead, leadEm } = report;
    if (!leadEm || !lead.includes(leadEm)) return <span>{lead}</span>;
    const [pre, post] = lead.split(leadEm);
    return <>{pre}<em>{leadEm}</em>{post}</>;
  };

  return (
    <div className="kit-report">
      <div className="kit-report-header">
        <div>
          <span className="kit-report-title">AI診断レポート</span>
          <span className="kit-report-meta">{listingName} · {diagnosedAt}</span>
        </div>
        <button className="kit-btn kit-btn-secondary" onClick={onDownload}>
          <IconDownload size={14} />
          PDFをダウンロード
        </button>
      </div>

      <p className="kit-report-lead">{renderLead()}</p>

      <div className="kit-report-h3">Top 3 改善優先度</div>
      {report.priorities.map((p, i) => (
        <div key={i} className="kit-pri-item">
          <span className="kit-pri-n">{String(i + 1).padStart(2, '0')}</span>
          <div className="kit-pri-body">
            <b>{p.title}</b>
            <div style={{ marginTop: 4 }}>{p.body}</div>
            {p.gain && <span className="kit-pri-gain">{p.gain}</span>}
          </div>
        </div>
      ))}

      <div className="kit-report-h3">5項目別の分析</div>
      <p className="kit-section-prose">
        <strong>写真</strong> · 12枚は<em>十分</em>な量だが、浴室カテゴリが欠落。優先度02の補足撮影を推奨。
      </p>
      <p className="kit-section-prose">
        <strong>紹介文</strong> · 7項目すべて入力済み、JAおよびENの両方をカバー。バイリンガル運用として理想的。
      </p>
      <p className="kit-section-prose">
        <strong>アメニティ</strong> · 18件中14件は紹介文で言及されている。未言及の4件（Wi-Fi、洗濯機、コーヒーメーカー、エアコン）について、紹介文への追記を強く推奨。
      </p>

      <div className="kit-report-h3">リスク</div>
      {report.risks.map((r, i) => (
        <div key={i} className="kit-risk">⚠️ {r}</div>
      ))}
    </div>
  );
}
Object.assign(window, { AIReport });
