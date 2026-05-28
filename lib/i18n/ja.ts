export const ja = {
  app: {
    title: "SOZO Review · 物件ヘルスチェック",
    description: "Airbnb 物件の健康診断システム",
  },
  form: {
    eyebrow: "物件ヘルスチェック",
    headline: "Airbnb 物件 URL を入力してください",
    placeholder: "https://www.airbnb.jp/rooms/...",
    submit: "診断する",
    submitting: "診断中…",
    errors: {
      invalid_url: "無効な Airbnb URL です。確認してください。",
      not_airbnb: "Airbnb の物件 URL を入力してください。",
      no_listing_id: "URL に物件 ID が含まれていません。",
      scrape_failed: "物件データを取得できませんでした。",
      timeout: "処理がタイムアウトしました。再度お試しください。",
    },
  },
  result: {
    scoreCard: {
      titleSuffix: "級",
      neutralStatus: "データなし",
      upgradeAtMax: "最高等級です",
      upgradeHintTpl: "あと {points} 点で {grade} 級にアップ",
    },
    dimensions: {
      photos: { label: "写真", placeholder: "" },
      title: { label: "タイトル", placeholder: "⏳ v1 で実装" },
      description: { label: "説明文", placeholder: "" },
      amenities: { label: "設備", placeholder: "" },
      reviews: { label: "レビュー", placeholder: "" },
    },
    qualityStatus: {
      Good: { label: "健全", desc: "品質問題はありません" },
      Educate: { label: "指導", desc: "1 件の品質指摘あり" },
      Warn: { label: "警告", desc: "複数の品質問題、要対応" },
      Probation: { label: "保留", desc: "繰り返し問題あり、削除リスク" },
      "Additional Warn": { label: "追加警告", desc: "累積過多" },
      "Pending Removal": { label: "削除予定", desc: "30 日後に削除" },
      Suspended: { label: "一時停止", desc: "現在停止中" },
      Removed: { label: "削除済み", desc: "既に削除されました" },
      reference: "※ Airbnb の内部判定とは異なる参考値です",
    },
  },
} as const;

export type JaMessages = typeof ja;
