export type Amenity = { title: string; available: boolean };

export type AmenitiesScore = {
  score: number;
  match_ratio: string;
  matched: string[];
  missing: string[];
};

export function scoreAmenities(amenities: Amenity[], descriptionText: string): AmenitiesScore {
  const available = amenities.filter((a) => a.available);
  const matched: string[] = [];
  const missing: string[] = [];

  for (const a of available) {
    const head = a.title.split(/[\s/(（]/, 1)[0];
    if (head && descriptionText.includes(head)) matched.push(a.title);
    else missing.push(a.title);
  }

  const total = available.length || 1;
  const score = Math.round((matched.length / total) * 100);
  return {
    score,
    match_ratio: `${matched.length}/${available.length}`,
    matched,
    missing,
  };
}
