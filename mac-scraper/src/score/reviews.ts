import type { Review } from "../airbnb/fetch-reviews.js";

export type ReviewsScoreInput = {
  overall: number | undefined;
  count: number | undefined;
  subscores: Record<string, number>;
};

export type ReviewsScore = {
  score: number;
  rating: number | undefined;
  count: number | undefined;
  subscores: Record<string, number>;
  sparse: boolean;
  texts: string[];
  note: string | undefined;
};

export function scoreReviews(input: ReviewsScoreInput, reviews: Review[]): ReviewsScore {
  const texts = reviews.map((r) => r.comments);

  if (input.overall == null) {
    return {
      score: 70,
      rating: undefined,
      count: input.count,
      subscores: input.subscores,
      sparse: true,
      texts,
      note: "レビューデータが取得できませんでした",
    };
  }

  return {
    score: Math.round((input.overall / 5) * 100),
    rating: input.overall,
    count: input.count,
    subscores: input.subscores,
    sparse: (input.count ?? 0) < 3,
    texts,
    note: undefined,
  };
}
