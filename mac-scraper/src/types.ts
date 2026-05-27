export type Grade = "A" | "B" | "C" | "D";

export type QualityStatus =
  | "Good"
  | "Educate"
  | "Warn"
  | "Probation"
  | "Additional Warn"
  | "Pending Removal"
  | "Suspended"
  | "Removed";

export type DimensionScore = {
  score: number;
  note?: string;
  [key: string]: unknown;
};

export type Dimensions = {
  photos: DimensionScore;
  title: DimensionScore;
  description: DimensionScore;
  amenities: DimensionScore;
  reviews: DimensionScore;
};

export type AiResult = {
  report_md: string;
  negative_keywords: Array<{ keyword: string; count: number; quote: string }>;
  top3: Array<{ issue: string; action: string; impact: string }>;
  status: "ok" | "fallback";
};

export type Diagnosis = {
  listing_id: string;
  title: string;
  snapshot: Record<string, unknown>;
  dimensions: Dimensions;
  overall_score: number;
  grade: Grade;
  quality_status: QualityStatus;
  ai: AiResult;
  scrape_status: "ok" | "cache" | "partial";
};
