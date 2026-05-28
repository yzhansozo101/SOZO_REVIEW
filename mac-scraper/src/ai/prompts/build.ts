import type { Snapshot } from "../../airbnb/extract.js";
import type { Review } from "../../airbnb/fetch-reviews.js";

export type Dimensions = {
  photos: { score: number; total?: number; b1_status?: string; b3_coverage?: string };
  title: { score: number; placeholder?: boolean };
  description: { score: number; length?: number; sections_hit?: string[]; locales?: string[] };
  amenities: { score: number; match_ratio?: string; missing?: string[] };
  reviews: { score: number; rating?: number; count?: number; sparse?: boolean };
};

export function buildUserPrompt(snapshot: Snapshot, dims: Dimensions, reviews: Review[]): string {
  const sampleReviews = reviews
    .slice(0, 30)
    .map((r) => `- (${r.rating}/5) ${r.comments.slice(0, 200)}`)
    .join("\n");

  return `# 物件情報

- リスティングID: ${snapshot.listing_id}
- タイトル: ${snapshot.title ?? "(取得失敗)"}
- 写真数: ${snapshot.photos.count}枚 / cover: ${snapshot.photos.cover_category ?? "?"}
- 評価: ${snapshot.rating.overall ?? "?"} (${snapshot.rating.count ?? "?"}件)
- 説明文長さ: ${snapshot.description_text?.length ?? 0}文字
- 設備数: ${snapshot.amenities.filter((a) => a.available).length}件

# 5 次元スコア(0-100)

- 写真: ${dims.photos.score} (B1=${dims.photos.b1_status ?? "?"}, B3 coverage=${dims.photos.b3_coverage ?? "?"})
- タイトル: ${dims.title.score}${dims.title.placeholder ? " ※プレースホルダー" : ""}
- 説明文: ${dims.description.score} (${dims.description.length ?? 0}文字, 章節 ${
    dims.description.sections_hit?.length ?? 0
  }/6, locales=${dims.description.locales?.join(",") ?? "ja"})
- 設備: ${dims.amenities.score} (${dims.amenities.match_ratio ?? "?"} 一致, 不足: ${(dims.amenities.missing ?? [])
    .slice(0, 5)
    .join("、")})
- レビュー: ${dims.reviews.score} (★${dims.reviews.rating ?? "?"}, ${dims.reviews.count ?? "?"}件${
    dims.reviews.sparse ? "、データ少" : ""
  })

# レビュー抜粋(直近${Math.min(reviews.length, 30)}件)

${sampleReviews || "(レビューを取得できませんでした)"}

上記に基づき、submit_diagnosis_report ツールで診断レポートを返してください。`;
}
