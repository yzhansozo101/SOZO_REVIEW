export type Snapshot = {
  listing_id: string;
  title: string | undefined;
  description_html: string | undefined;
  description_text: string | undefined;
  amenities: Array<{ title: string; available: boolean }>;
  photos: { count: number; categories: Record<string, number>; cover_category: string | undefined };
  rating: { overall: number | undefined; count: number | undefined; subscores: Record<string, number> };
  review_tags: Array<{ name: string; count: number }>;
  highlights: string[];
  house_rules: string[];
  api_key: string | undefined;
  reviews_persisted_hash: string | undefined;
};

const DEFAULT_AIRBNB_API_KEY = "d306zoyjsyarp7ifhu67rjxn52tv0t20";

/** Recursive walker. Cheap deep search by predicate; bounded depth. */
function walk(obj: unknown, hit: (n: unknown) => boolean, depth = 32): unknown {
  if (depth < 0 || obj == null) return undefined;
  if (hit(obj)) return obj;
  if (typeof obj === "object") {
    for (const v of Array.isArray(obj) ? obj : Object.values(obj as Record<string, unknown>)) {
      const r = walk(v, hit, depth - 1);
      if (r !== undefined) return r;
    }
  }
  return undefined;
}

function isObj(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null;
}

function pickString(o: unknown, key: string): string | undefined {
  return isObj(o) && typeof o[key] === "string" ? (o[key] as string) : undefined;
}

function pickNumber(o: unknown, key: string): number | undefined {
  if (!isObj(o)) return undefined;
  const value = o[key];
  if (typeof value === "number") return Number.isFinite(value) ? value : undefined;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value);
    return Number.isFinite(n) ? n : undefined;
  }
  return undefined;
}

function htmlToText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}

export function extractSnapshot(deferred: unknown, listingId: string): Snapshot {
  // Title
  const embedNode = walk(
    deferred,
    (n) => isObj(n) && isObj(n.embedData) && n.embedData.id === listingId && typeof n.embedData.name === "string",
  );
  const titleNode = walk(deferred, (n) => isObj(n) && isObj(n.content) && typeof n.content.localizedString === "string");
  const title =
    isObj(embedNode) && isObj(embedNode.embedData)
      ? (embedNode.embedData.name as string)
      : isObj(titleNode) && isObj(titleNode.content)
        ? (titleNode.content.localizedString as string)
        : undefined;

  // Description (single block of HTML)
  const descSection = walk(deferred, (n) => isObj(n) && n.sectionId === "DESCRIPTION_DEFAULT");
  const descHtml =
    isObj(descSection) && isObj(descSection.section) && isObj(descSection.section.htmlDescription)
      ? pickString(descSection.section.htmlDescription, "htmlText")
      : undefined;
  const descText = descHtml ? htmlToText(descHtml) : undefined;

  // Amenities: seeAllAmenitiesGroups[].amenities[]
  const amen: Array<{ title: string; available: boolean }> = [];
  const amenitiesNode = walk(deferred, (n) => isObj(n) && Array.isArray(n.seeAllAmenitiesGroups));
  if (isObj(amenitiesNode) && Array.isArray(amenitiesNode.seeAllAmenitiesGroups)) {
    for (const g of amenitiesNode.seeAllAmenitiesGroups) {
      if (isObj(g) && Array.isArray(g.amenities)) {
        for (const a of g.amenities) {
          if (isObj(a) && typeof a.title === "string") {
            amen.push({ title: a.title, available: a.available !== false });
          }
        }
      }
    }
  }

  // Photos: PHOTO_TOUR_SCROLLABLE_MODAL.mediaItems[]
  const photoSection = walk(deferred, (n) => isObj(n) && n.sectionId === "PHOTO_TOUR_SCROLLABLE_MODAL");
  const mediaItems =
    isObj(photoSection) && isObj(photoSection.section) && Array.isArray(photoSection.section.mediaItems)
      ? photoSection.section.mediaItems
      : [];

  // Photo categories: roomTourLayoutInfos
  const layoutInfos = walk(deferred, (n) => isObj(n) && Array.isArray(n.roomTourLayoutInfos));
  const categories: Record<string, number> = {};
  let coverCategory: string | undefined;
  if (isObj(layoutInfos) && Array.isArray(layoutInfos.roomTourLayoutInfos) && layoutInfos.roomTourLayoutInfos[0]) {
    const items = layoutInfos.roomTourLayoutInfos[0];
    if (isObj(items) && Array.isArray(items.roomTourItems)) {
      for (const it of items.roomTourItems) {
        if (isObj(it) && typeof it.title === "string" && Array.isArray(it.imageIds)) {
          categories[it.title] = it.imageIds.length;
        }
      }
    }
  }
  if (mediaItems[0] && isObj(mediaItems[0])) {
    const firstId = mediaItems[0].id;
    if (firstId != null && isObj(layoutInfos) && Array.isArray(layoutInfos.roomTourLayoutInfos)) {
      for (const items of layoutInfos.roomTourLayoutInfos[0]?.roomTourItems ?? []) {
        if (isObj(items) && Array.isArray(items.imageIds) && items.imageIds.includes(firstId)) {
          coverCategory = items.title as string;
          break;
        }
      }
    }
  }

  // Rating overall + count
  const ratingStats = walk(deferred, (n) => isObj(n) && isObj(n.overallRatingStats));
  const reviewsSection = walk(deferred, (n) => isObj(n) && n.sectionId === "REVIEWS_DEFAULT");
  const reviewsPayload = isObj(reviewsSection) && isObj(reviewsSection.section) ? reviewsSection.section : undefined;
  const overallStats =
    isObj(ratingStats) && isObj(ratingStats.overallRatingStats) ? ratingStats.overallRatingStats : undefined;
  const overallRating =
    pickNumber(reviewsPayload, "overallRating") ??
    pickNumber(overallStats, "overallRating") ??
    pickNumber(overallStats, "ratingAverage");
  const reviewCount =
    pickNumber(reviewsPayload, "overallCount") ??
    pickNumber(overallStats, "reviewCount") ??
    pickNumber(overallStats, "ratingCount");

  // 6 subscores: REVIEWS_DEFAULT.section.ratings[]
  const subscores: Record<string, number> = {};
  const reviewTags: Array<{ name: string; count: number }> = [];
  if (isObj(reviewsPayload)) {
    const sec = reviewsPayload;
    if (Array.isArray(sec.ratings)) {
      for (const r of sec.ratings) {
        if (isObj(r) && typeof r.label === "string" && typeof r.localizedRating === "string") {
          subscores[r.label] = Number(r.localizedRating);
        }
      }
    }
    if (Array.isArray(sec.reviewTags)) {
      for (const t of sec.reviewTags) {
        if (isObj(t) && typeof t.text === "string") {
          reviewTags.push({ name: t.text, count: Number(t.count ?? 0) });
        }
      }
    }
  }

  // Highlights
  const highlightsSection = walk(deferred, (n) => isObj(n) && n.sectionId === "HIGHLIGHTS_COMPACT");
  const highlights: string[] = [];
  if (
    isObj(highlightsSection) &&
    isObj(highlightsSection.section) &&
    Array.isArray((highlightsSection.section as Record<string, unknown>).highlights)
  ) {
    for (const h of (highlightsSection.section as Record<string, unknown>).highlights as unknown[]) {
      if (isObj(h) && typeof h.title === "string") highlights.push(h.title);
    }
  }

  // House rules (concat strings under POLICIES_DEFAULT)
  const policiesSection = walk(deferred, (n) => isObj(n) && n.sectionId === "POLICIES_DEFAULT");
  const houseRules: string[] = [];
  if (isObj(policiesSection) && isObj(policiesSection.section)) {
    const rulesNode = (policiesSection.section as Record<string, unknown>).houseRulesSections;
    if (Array.isArray(rulesNode)) {
      for (const sec of rulesNode) {
        if (isObj(sec) && Array.isArray(sec.items)) {
          for (const it of sec.items) {
            if (isObj(it) && typeof it.title === "string") houseRules.push(it.title);
          }
        }
      }
    }
  }

  // X-Airbnb-API-Key
  const apiNode = walk(
    deferred,
    (n) => isObj(n) && typeof n.key === "string" && (n.key as string).length >= 24 && /^[a-z0-9]+$/i.test(n.key as string),
  );
  const apiKey = isObj(apiNode) ? (apiNode.key as string) : DEFAULT_AIRBNB_API_KEY;

  // Reviews persistedQuery hash
  const reviewsQueryNode = walk(deferred, (n) => isObj(n) && n.operationName === "StaysPdpReviewsQuery");
  let reviewsHash: string | undefined;
  if (isObj(reviewsQueryNode) && isObj(reviewsQueryNode.extensions)) {
    const ext = reviewsQueryNode.extensions as Record<string, unknown>;
    if (isObj(ext.persistedQuery)) reviewsHash = pickString(ext.persistedQuery, "sha256Hash");
  }

  return {
    listing_id: listingId,
    title,
    description_html: descHtml,
    description_text: descText,
    amenities: amen,
    photos: { count: mediaItems.length, categories, cover_category: coverCategory },
    rating: { overall: overallRating, count: reviewCount, subscores },
    review_tags: reviewTags,
    highlights,
    house_rules: houseRules,
    api_key: apiKey,
    reviews_persisted_hash: reviewsHash,
  };
}
