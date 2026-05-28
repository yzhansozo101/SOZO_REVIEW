export type Review = {
  id: string;
  comments: string;
  rating: number;
  language: string | undefined;
};

export type FetchReviewsResult =
  | { ok: true; reviews: Review[] }
  | { ok: false; error: "graphql_failed" | "no_data" | "hash_expired" };

export type FetchReviewsInput = {
  listingId: string;
  apiKey: string;
  persistedHash: string;
  limit?: number;
};

export async function fetchReviews(input: FetchReviewsInput): Promise<FetchReviewsResult> {
  const { listingId, apiKey, persistedHash, limit = 20 } = input;
  const idB64 = Buffer.from(`StayListing:${listingId}`).toString("base64");

  const body = {
    operationName: "StaysPdpReviewsQuery",
    variables: {
      id: idB64,
      pdpReviewsRequest: {
        fieldSelector: "for_p3_translation_only",
        limit,
        offset: "0",
        sortingPreference: "MOST_RECENT",
      },
    },
    extensions: { persistedQuery: { version: 1, sha256Hash: persistedHash } },
  };

  let res: Response;
  try {
    res = await fetch(`https://www.airbnb.jp/api/v3/StaysPdpReviewsQuery/${persistedHash}`, {
      method: "POST",
      headers: {
        "x-airbnb-api-key": apiKey,
        "content-type": "application/json",
        "accept-language": "ja",
      },
      body: JSON.stringify(body),
    });
  } catch {
    return { ok: false, error: "graphql_failed" };
  }

  if (!res.ok) {
    if (res.status === 410 || res.status === 400) return { ok: false, error: "hash_expired" };
    return { ok: false, error: "graphql_failed" };
  }

  const json = (await res.json()) as Record<string, unknown>;
  const reviews =
    (json.data as { presentation?: { stayProductDetailPage?: { reviews?: { reviews?: unknown[] } } } })?.presentation
      ?.stayProductDetailPage?.reviews?.reviews;
  if (!Array.isArray(reviews)) return { ok: false, error: "no_data" };

  const parsed: Review[] = [];
  for (const r of reviews) {
    if (r && typeof r === "object") {
      const rr = r as Record<string, unknown>;
      if (typeof rr.id === "string" && typeof rr.comments === "string") {
        parsed.push({
          id: rr.id,
          comments: rr.comments,
          rating: Number(rr.rating ?? 0),
          language: typeof rr.language === "string" ? rr.language : undefined,
        });
      }
    }
  }
  return { ok: true, reviews: parsed };
}
