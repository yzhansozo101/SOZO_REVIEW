// Fixture data for the Sozonext Review App UI kit
// Mirrors the spec's dimensions but with fake, representative content (Japanese).

window.FIXTURE = {
  listingId: '12345678',
  listingName: '近藤の家 · 新宿2BR アパートメント',
  listingUrl: 'https://www.airbnb.com/rooms/12345678',
  diagnosedAt: '2026-05-27 14:32',
  total: {
    score: 78,
    grade: 'B',
    prevScore: 75.8,
    nextGrade: 'A',
    pointsToNext: 12,
  },
  qualityStatus: {
    // 1=Good 2=Educate 3=Warn 4=Probation 5=Add.Warn 6=Pending 7=Suspended 8=Removed
    current: 3,
    labels: [
      { en: 'Good',       ja: '健全' },
      { en: 'Educate',    ja: '指導' },
      { en: 'Warn',       ja: '警告' },
      { en: 'Probation',  ja: '保留' },
      { en: 'Add. Warn',  ja: '追加警告' },
      { en: 'Pending',    ja: '削除予定' },
      { en: 'Suspended',  ja: '一時停止' },
      { en: 'Removed',    ja: '削除済み' },
    ],
    explain: '複数の品質問題あり、改善が必要です。',
  },
  dimensions: [
    { id: 'photo',   icon: '📷', label: '写真',       grade: 'B', value: '12',  unit: ' 枚',   note: '🟢 十分 · 浴室カテゴリ不足' },
    { id: 'title',   icon: '🔤', label: 'タイトル',   grade: 'C', value: '42',  unit: ' 文字', note: '⏳ SEO分析はv1で実装予定' },
    { id: 'desc',    icon: '📝', label: '紹介文',     grade: 'A', value: '7',   unit: '/7',     note: '✅ 全項目入力済み · バイリンガル' },
    { id: 'amenity', icon: '🛋️', label: 'アメニティ', grade: 'B', value: '14',  unit: '/18',    note: '⚠️ 紹介文に未記載が4件' },
    { id: 'review',  icon: '💬', label: 'レビュー',   grade: 'C', value: '4.6', unit: '/5',     note: '「WiFiが遅い」が5件' },
  ],
  trend: { historic: 4.5, current: 4.7 },
  report: {
    lead: '全体的に良好な状態です。主な課題はレビューとアメニティの整合性。リビング写真をカバーに使用していない点と、Wi-Fi速度が紹介文に明記されていない点が、最も改善余地の大きい2つです。',
    leadEm: '主な課題はレビューとアメニティの整合性',
    priorities: [
      {
        title: 'リビング写真をカバーに設定',
        body: '現カバーは浴室の詳細写真。リビングまたは外観への差し替えを推奨。',
        gain: '想定リフト +0.4',
      },
      {
        title: '紹介文にWi-Fi速度を追記',
        body: 'アメニティは登録済みだが紹介文で未言及。「Wi-Fi ≥ 100 Mbps」と明記を推奨。',
        gain: '想定リフト +0.2',
      },
      {
        title: '浴室写真を2〜3枚追加撮影',
        body: '5部屋カテゴリ中4/5、浴室が不足。',
        gain: '想定リフト +0.15',
      },
    ],
    risks: [
      'レビューの中で「WiFiが遅い」が複数回言及されており、今後さらに低スコアの口コミが発生する可能性があります。',
    ],
  },
  alert: {
    threshold: 60,
    email: 'ops-test@sozonext.co',
  },
};

window.FIXTURE_HISTORY = [
  { id: '12345678', name: '近藤の家 · 新宿2BR アパートメント',  url: 'https://www.airbnb.com/rooms/12345678', diagnosedAt: '昨日 14:32', grade: 'B', score: 78 },
  { id: '98765432', name: '浅草 川沿いスタジオ',                url: 'https://www.airbnb.com/rooms/98765432', diagnosedAt: '3日前',     grade: 'A', score: 92 },
  { id: '55501234', name: '渋谷 1K Loft',                       url: 'https://www.airbnb.com/rooms/55501234', diagnosedAt: '5日前',     grade: 'D', score: 54 },
  { id: '23456789', name: '代々木 ガーデンハウス',              url: 'https://www.airbnb.com/rooms/23456789', diagnosedAt: '1週間前',   grade: 'C', score: 64 },
];

window.FIXTURE_WEEKLY = {
  weekTag: '2026-W22',
  totalDiagnosed: 12,
  distribution: { A: 3, B: 5, C: 3, D: 1 },
  topRisks: [
    { name: '渋谷 1K Loft',        grade: 'D', score: 54, issue: '写真3枚 · 紹介文4/7未入力' },
    { name: '代々木 Studio',       grade: 'C', score: 61, issue: '「汚い」レビューが増加傾向' },
    { name: '恵比寿 ハウス',       grade: 'C', score: 64, issue: 'Wi-Fi 関連の不満が複数' },
  ],
  nextSendAt: '2026-06-08 (月) 09:00',
};
