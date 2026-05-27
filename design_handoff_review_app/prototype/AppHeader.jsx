function AppHeader({ email, onReset }) {
  return (
    <header className="kit-header" data-screen-label="App Header">
      <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
        <img src="../../assets/sozonext-logo.png" alt="SOZONEXT" style={{ height: 28, display: 'block' }} />
        <span className="kit-wordmark-sep">/</span>
        <span className="kit-app-name">物件ヘルスチェック</span>
      </div>
      <div className="kit-header-right">
        <span className="kit-email-config">📧 {email}</span>
        {onReset && (
          <button className="kit-btn kit-btn-ghost kit-btn-sm" onClick={onReset}>新規診断</button>
        )}
      </div>
    </header>
  );
}
Object.assign(window, { AppHeader });
