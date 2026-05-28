import type { Diagnosis } from "../types.js";

export const sampleDiagnosis: Diagnosis = {
  listing_id: "1174411978184206231",
  title: "【贅沢な和モダン貸切1軒家】京都駅徒歩10分・最大8名",
  snapshot: {
    note: "Plan 1 fixture — real PDP parsing arrives in Plan 2",
    photoCount: 92,
    rating: 4.87,
    reviewsCount: 106,
  },
  dimensions: {
    photos: { score: 95, total: 92, cover_ok: true, coverage: "5/5" },
    title: { score: 70, placeholder: true, note: "B6 開発中" },
    description: {
      score: 88,
      length: 1240,
      sections_hit: ["寝室", "リビング", "キッチン", "バスルーム", "アクセス"],
    },
    amenities: { score: 75, match_ratio: "18/24", missing: ["Wi-Fi 速度の記述"] },
    reviews: { score: 99, rating: 4.87, count: 106 },
  },
  overall_score: 86,
  grade: "B",
  quality_status: "Good",
  ai: {
    report_md: "## 総評\n\nPlan 1 fixture です。実際の AI レポートは Plan 3 で生成されます。",
    negative_keywords: [],
    top3: [
      { issue: "Plan 1 fixture", action: "Plan 3 で実装", impact: "AI レポートが本物になる" },
    ],
    status: "fallback",
  },
  scrape_status: "ok",
};
