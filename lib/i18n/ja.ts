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
  },
} as const;

export type JaMessages = typeof ja;
