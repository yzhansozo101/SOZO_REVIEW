function DiagnosticForm({ onDiagnose, history = [] }) {
  const [url, setUrl] = React.useState('');
  const [error, setError] = React.useState('');

  const validate = (v) => {
    if (!v.trim()) return '有効なAirbnbのURLを入力してください';
    if (!/airbnb\.[a-z.]+\/rooms\/\d+/i.test(v)) return '有効なAirbnbのURLを入力してください';
    return '';
  };

  const submit = (e) => {
    e.preventDefault();
    const err = validate(url);
    if (err) { setError(err); return; }
    setError('');
    onDiagnose(url);
  };

  const pickHistory = (item) => {
    setError('');
    setUrl(item.url);
    onDiagnose(item.url);
  };

  const fillExample = () => {
    setUrl('https://www.airbnb.com/rooms/12345678');
    setError('');
  };

  return (
    <div className="kit-form-screen" data-screen-label="01 Diagnostic Input (1C)">
      <div className="kit-form-eyebrow">SOZONEXT · 物件ヘルスチェック</div>
      <h1 className="kit-form-title">
        Airbnb物件の<span className="accent">健康状態</span>を、30秒で。
      </h1>
      <p className="kit-form-lead">
        URLを貼り付けるか、最近の診断履歴から再診断してください。
      </p>

      <form className="kit-form-row" onSubmit={submit}>
        <div className={`kit-field ${error ? 'error' : ''}`}>
          <IconLink className="kit-field-ico" size={18} />
          <input
            type="text"
            value={url}
            onChange={(e) => { setUrl(e.target.value); if (error) setError(''); }}
            placeholder="https://www.airbnb.com/rooms/..."
          />
        </div>
        <button type="submit" className="kit-btn kit-btn-primary">診断する</button>
      </form>
      {error && <div className="kit-error-msg">⚠️ {error}</div>}
      <div className="kit-form-hint">
        試してみる：<button type="button" className="kit-alert-link" onClick={fillExample}>サンプルURLを入力</button>
      </div>

      {/* 1C — Recent diagnoses list */}
      <section className="kit-history">
        <div className="kit-history-head">
          <span className="kit-history-title">最近の診断</span>
          <span className="kit-history-meta">{history.length} 件 · クリックで再診断</span>
        </div>
        <ul className="kit-history-list">
          {history.map((it) => (
            <li
              key={it.id}
              className="kit-history-row"
              onClick={() => pickHistory(it)}
              tabIndex={0}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && pickHistory(it)}
            >
              <div className="kit-history-main">
                <span className="kit-history-name">{it.name}</span>
                <span className="kit-history-url">{it.url.replace(/^https?:\/\//, '')}</span>
              </div>
              <div className="kit-history-meta-col">
                <span className="kit-history-when">{it.diagnosedAt}</span>
                <span className={`kit-history-grade g-${it.grade.toLowerCase()}`}>
                  {it.grade} · {it.score}
                </span>
              </div>
              <IconChevronRight size={16} className="kit-history-chev" />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
Object.assign(window, { DiagnosticForm });
