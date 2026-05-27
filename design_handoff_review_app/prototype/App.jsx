function App() {
  const [view, setView] = React.useState('input'); // input | progress | result
  const [url, setUrl] = React.useState('');
  const [mailOpen, setMailOpen] = React.useState(null); // null | 'f1' | 'f7'

  const fx = window.FIXTURE;
  const history = window.FIXTURE_HISTORY || [];
  const weekly = window.FIXTURE_WEEKLY;

  const reset = () => { setView('input'); setUrl(''); };

  const onDiagnose = (u) => {
    setUrl(u);
    setView('progress');
  };

  const onDownload = () => {
    alert(`PDF をダウンロード中…\n（demo：実際の生成は未実装）\nファイル名：sozonext-${fx.listingId}-${fx.diagnosedAt.slice(0,10)}.pdf`);
  };
  const onTestWeekly = () => {
    setMailOpen('f7');
  };

  // Data for the F1 preview, derived from current fixture + a synthetic low-score scenario
  // so users can see the alert mail even when the current diagnosis is healthy.
  const f1Data = {
    listingName: fx.total.score < fx.alert.threshold ? fx.listingName : '渋谷 1K Loft',
    score: fx.total.score < fx.alert.threshold ? fx.total.score : 54,
    grade: fx.total.score < fx.alert.threshold ? fx.total.grade : 'D',
    prevScore: fx.total.score < fx.alert.threshold ? fx.total.prevScore : 62,
    threshold: fx.alert.threshold,
    email: fx.alert.email,
    topIssues: fx.total.score < fx.alert.threshold
      ? fx.report.priorities.map((p) => p.title)
      : [
          '写真がわずか3枚（最低5枚を推奨）',
          '紹介文 4/7 項目が未入力',
          '「汚い」というレビューが3件 検出',
        ],
    reportUrl: `https://review.sozonext.co/d/${fx.listingId}`,
  };

  const f7Data = { ...weekly, email: fx.alert.email };

  return (
    <div className="kit-shell" data-screen-label={`Review App · ${view}`}>
      <AppHeader email={fx.alert.email} onReset={view !== 'input' ? reset : null} />
      <main className="kit-page">
        {view === 'input' && <DiagnosticForm onDiagnose={onDiagnose} history={history} />}
        {view === 'progress' && <ProgressView url={url} onDone={() => setView('result')} />}
        {view === 'result' && (
          <>
            <div className="kit-result-meta">
              <div>
                <h1 className="kit-listing-name">{fx.listingName}</h1>
                <span className="kit-listing-url">
                  <a href={fx.listingUrl} target="_blank" rel="noreferrer">
                    {fx.listingUrl}
                  </a>
                  <IconExternal size={12} />
                </span>
              </div>
              <div className="kit-meta-actions">
                <span className="kit-diagnosed-at">診断日時 · {fx.diagnosedAt}</span>
              </div>
            </div>

            <div className="kit-result">
              <div className="kit-result-left">
                <ScoreCard total={fx.total} />
                <QualityStatus qs={fx.qualityStatus} />
                <DimensionGrid dimensions={fx.dimensions} />
                <TrendChart trend={fx.trend} />
                <AlertBar
                  score={fx.total.score}
                  alert={fx.alert}
                  onTestWeekly={onTestWeekly}
                  onPreviewF1={() => setMailOpen('f1')}
                  onPreviewF7={() => setMailOpen('f7')}
                />
              </div>
              <div className="kit-result-right">
                <AIReport
                  report={fx.report}
                  listingName={fx.listingName}
                  diagnosedAt={fx.diagnosedAt}
                  onDownload={onDownload}
                />
              </div>
            </div>
          </>
        )}
      </main>
      <footer className="kit-footer">
        Sozonext Review App · demo v0.2 · <button className="reset" onClick={reset}>状態をリセット</button>
      </footer>

      {mailOpen && (
        <EmailPreview
          kind={mailOpen}
          data={mailOpen === 'f1' ? f1Data : f7Data}
          onClose={() => setMailOpen(null)}
        />
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
