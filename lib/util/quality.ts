export const QUALITY_STEPS = [
  "Good",
  "Educate",
  "Warn",
  "Probation",
  "Additional Warn",
  "Pending Removal",
  "Suspended",
  "Removed",
] as const;

export type QualityStatus = (typeof QUALITY_STEPS)[number];

export function ratingToQuality(rating: number | null | undefined): QualityStatus {
  if (rating == null) return "Good";
  if (rating >= 4.8) return "Good";
  if (rating >= 4.5) return "Educate";
  if (rating >= 4.0) return "Warn";
  if (rating >= 3.5) return "Probation";
  if (rating >= 3.0) return "Additional Warn";
  return "Pending Removal";
}
