import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { fetchReviews } from "../src/airbnb/fetch-reviews.js";

const originalFetch = global.fetch;

beforeEach(() => vi.restoreAllMocks());

afterEach(() => {
  global.fetch = originalFetch;
});

describe("fetchReviews", () => {
  it("posts to GraphQL endpoint with API key, returns reviews array", async () => {
    const mock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        data: {
          presentation: {
            stayProductDetailPage: {
              reviews: {
                reviews: [
                  { id: "r1", comments: "good place", rating: 5, language: "ja" },
                  { id: "r2", comments: "汚かった", rating: 2, language: "ja" },
                ],
              },
            },
          },
        },
      }),
    });
    global.fetch = mock as unknown as typeof fetch;
    const r = await fetchReviews({
      listingId: "1174411978184206231",
      apiKey: "d3xxx",
      persistedHash: "abcd",
    });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.reviews.length).toBe(2);
    expect(mock).toHaveBeenCalledWith(
      expect.stringContaining("StaysPdpReviewsQuery/abcd"),
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ "x-airbnb-api-key": "d3xxx" }),
      }),
    );
  });

  it("returns { ok: false, error } on non-2xx", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({}),
    }) as unknown as typeof fetch;
    const r = await fetchReviews({ listingId: "1", apiKey: "x", persistedHash: "h" });
    expect(r.ok).toBe(false);
  });
});
