function ProgressView({ url, onDone }) {
  // 2B — skeleton preview of the result page
  const [phase, setPhase] = React.useState(0); // 0=fetching, 1=analyzing, 2=ai
  const phases = [
    'データ取得中…',
    '5項目を分析中…',
    'AIレポートを生成中…',
  ];

  React.useEffect(() => {
    if (phase >= phases.length) { onDone(); return; }
    const t = setTimeout(() => setPhase(phase + 1), 900 + Math.random() * 500);
    return () => clearTimeout(t);
  }, [phase]);

  // Skeleton "shimmer" tiles — fade-in tiles in order as phases advance
  const isFilled = (atPhase) => phase > atPhase;

  return (
    <div className="kit-progress-screen-2b" data-screen-label="02 Progress (2B · skeleton)">
      <div className="kit-progress-banner">
        <span className="kit-progress-banner-spinner" aria-hidden="true">
          <IconLoader size={16} stroke={2} className="kit-spin" />
        </span>
        <div className="kit-progress-banner-text">
          <span className="kit-progress-banner-title">{phases[Math.min(phase, phases.length - 1)]}</span>
          <span className="kit-progress-banner-url">{url}</span>
        </div>
        <span className="kit-progress-banner-step">{Math.min(phase + 1, phases.length)} / {phases.length}</span>
      </div>

      {/* Skeleton result layout */}
      <div className="kit-result-meta sk">
        <div>
          <div className={`sk-bar w-260 h-22 ${isFilled(0) ? 'fade' : ''}`}></div>
          <div className={`sk-bar w-200 h-12 mt-6 ${isFilled(0) ? 'fade' : ''}`}></div>
        </div>
        <div className={`sk-bar w-160 h-12 ${isFilled(0) ? 'fade' : ''}`}></div>
      </div>

      <div className="kit-result sk">
        <div className="kit-result-left">
          {/* Score card skeleton */}
          <div className={`kit-score-skel ${isFilled(1) ? 'fade' : ''}`}>
            <div className="kit-score-skel-letter sk-bar"></div>
            <div className="kit-score-skel-right">
              <div className="sk-bar w-100 h-32"></div>
              <div className="sk-bar w-140 h-14 mt-8"></div>
              <div className="sk-bar w-120 h-12 mt-6"></div>
            </div>
          </div>
          {/* Quality status skeleton */}
          <div className={`kit-qs-skel ${isFilled(1) ? 'fade' : ''}`}>
            <div className="sk-bar w-140 h-14 mb-12"></div>
            <div className="kit-qs-skel-row">
              {Array.from({ length: 8 }).map((_, i) => <div key={i} className="sk-bar h-44"></div>)}
            </div>
          </div>
          {/* Dimensions skeleton */}
          <div>
            <div className="sk-bar w-180 h-18 mb-12"></div>
            <div className="kit-dim-grid-skel">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className={`kit-dim-card-skel ${isFilled(1) ? 'fade' : ''}`}>
                  <div className="sk-bar w-32 h-18 mb-8"></div>
                  <div className="sk-bar w-60 h-12 mb-8"></div>
                  <div className="sk-bar w-50 h-22"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="kit-result-right">
          <div className={`kit-report-skel ${isFilled(2) ? 'fade' : ''}`}>
            <div className="sk-bar w-180 h-18 mb-12"></div>
            <div className="sk-bar w-full h-12 mb-6"></div>
            <div className="sk-bar w-full h-12 mb-6"></div>
            <div className="sk-bar w-3-4 h-12 mb-16"></div>
            <div className="sk-bar w-120 h-12 mb-10"></div>
            <div className="sk-bar w-full h-32 mb-6"></div>
            <div className="sk-bar w-full h-32 mb-6"></div>
            <div className="sk-bar w-full h-32"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
Object.assign(window, { ProgressView });
