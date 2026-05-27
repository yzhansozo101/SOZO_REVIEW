function ScoreCard({ total }) {
  const { score, grade, prevScore, nextGrade, pointsToNext } = total;
  const cls = `kit-score grade-${grade.toLowerCase()}`;
  const delta = (score - prevScore).toFixed(1);
  const deltaPos = score > prevScore;
  const deltaNeg = score < prevScore;
  const deltaSymbol = deltaPos ? '↑' : deltaNeg ? '↓' : '=';
  const deltaSign = deltaPos ? '+' : '';
  const upgradeLabel = grade === 'A'
    ? '最高評価に到達'
    : `${nextGrade}まであと${pointsToNext}点`;
  const statusLabel = { A: '安心', B: '良好', C: '要注意', D: '危険' }[grade];

  return (
    <div className={cls}>
      <div className="kit-score-top">
        <span className="kit-score-letter">{grade}</span>
        <span className="kit-score-num">
          {score}<span className="kit-score-unit"> 点</span>
        </span>
        <div className="kit-score-side">
          <span className="kit-score-status-pill">{statusLabel}</span>
          <span className="kit-score-delta">{deltaSymbol} {deltaSign}{delta} 前回比</span>
        </div>
      </div>
      <div className="kit-score-row">
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, opacity: 0.75 }}>
          5項目平均・等加重 (demo)
        </span>
        <span className="kit-score-upgrade">{upgradeLabel}</span>
      </div>
    </div>
  );
}
Object.assign(window, { ScoreCard });
