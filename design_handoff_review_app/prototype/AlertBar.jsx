function AlertBar({ score, alert, onTestWeekly, onPreviewF1, onPreviewF7 }) {
  const triggered = score < alert.threshold;
  return (
    <div className="kit-alerts">
      {triggered ? (
        <div className="kit-alert kit-alert-warn">
          <span className="ico">⚠️</span>
          <span className="text">
            <b>アラートメール送信済み</b> — スコア {score} 点 &lt; しきい値 {alert.threshold} · 送信先 {alert.email}
          </span>
          <button className="kit-alert-link" onClick={onPreviewF1}>メールをプレビュー</button>
          <span className="meta">F1</span>
        </div>
      ) : (
        <div className="kit-alert kit-alert-good">
          <span className="ico">✅</span>
          <span className="text">
            <b>スコア健全</b> — {score} 点 &gt; しきい値 {alert.threshold} · アラート未発動
          </span>
          <button className="kit-alert-link" onClick={onPreviewF1}>F1サンプル</button>
          <span className="meta">F1</span>
        </div>
      )}
      <div className="kit-alert kit-alert-info">
        <span className="ico">📧</span>
        <span className="text">
          次回自動送信：<b>来週月曜 09:00</b> · 毎週月曜のサマリーメール
        </span>
        <button className="kit-alert-link" onClick={onPreviewF7}>プレビュー</button>
        <button className="kit-alert-link" onClick={onTestWeekly}>テスト送信</button>
        <span className="meta">F7</span>
      </div>
    </div>
  );
}
Object.assign(window, { AlertBar });
