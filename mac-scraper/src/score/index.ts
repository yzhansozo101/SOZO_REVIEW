type DimScore = { score: number };
type ReviewsDim = DimScore & { rating: number | undefined };

export type AggregateInput = {
  photos: DimScore;
  title: DimScore;
  description: DimScore;
  amenities: DimScore;
  reviews: ReviewsDim;
};

export type Grade = "A" | "B" | "C" | "D";
export type QualityStatus =
  | "Good"
  | "Educate"
  | "Warn"
  | "Probation"
  | "Additional Warn"
  | "Pending Removal";

export type AggregateResult = {
  overall_score: number;
  grade: Grade;
  quality_status: QualityStatus;
};

export function scoreToGrade(s: number): Grade {
  if (s >= 90) return "A";
  if (s >= 75) return "B";
  if (s >= 60) return "C";
  return "D";
}

function ratingToQuality(rating: number | undefined): QualityStatus {
  if (rating == null) return "Good";
  if (rating >= 4.8) return "Good";
  if (rating >= 4.5) return "Educate";
  if (rating >= 4.0) return "Warn";
  if (rating >= 3.5) return "Probation";
  if (rating >= 3.0) return "Additional Warn";
  return "Pending Removal";
}

export function aggregate(input: AggregateInput): AggregateResult {
  const sum =
    input.photos.score + input.title.score + input.description.score + input.amenities.score + input.reviews.score;
  const overall = Math.round(sum / 5);
  return {
    overall_score: overall,
    grade: scoreToGrade(overall),
    quality_status: ratingToQuality(input.reviews.rating),
  };
}
