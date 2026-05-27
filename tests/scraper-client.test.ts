import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { fetchDiagnosis } from "@/lib/scraper/client";

describe("fetchDiagnosis", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    process.env.SCRAPER_URL = "http://localhost:8787";
    process.env.SCRAPER_SECRET = "test-secret";
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("posts URL with Bearer auth", async () => {
    const mock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        listing_id: "abc",
        title: "T",
        snapshot: {},
        dimensions: {
          photos: { score: 90 },
          title: { score: 70 },
          description: { score: 80 },
          amenities: { score: 70 },
          reviews: { score: 95 },
        },
        overall_score: 86,
        grade: "B",
        quality_status: "Good",
        ai: { report_md: "", negative_keywords: [], top3: [], status: "fallback" },
        scrape_status: "ok",
      }),
    });
    global.fetch = mock as unknown as typeof fetch;

    const r = await fetchDiagnosis("https://www.airbnb.jp/rooms/abc");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.data.listing_id).toBe("abc");

    expect(mock).toHaveBeenCalledWith(
      "http://localhost:8787/diagnose",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "Authorization": "Bearer test-secret",
          "Content-Type": "application/json",
        }),
      }),
    );
  });

  it("returns {ok:false, error:'scrape_failed'} on non-2xx", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 502,
      json: async () => ({ error: "boom" }),
    }) as unknown as typeof fetch;
    const r = await fetchDiagnosis("https://www.airbnb.jp/rooms/x");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe("scrape_failed");
  });

  it("returns timeout error when fetch rejects with AbortError", async () => {
    global.fetch = vi.fn().mockImplementation(() => {
      const err = new Error("aborted");
      err.name = "AbortError";
      return Promise.reject(err);
    }) as unknown as typeof fetch;
    const r = await fetchDiagnosis("https://www.airbnb.jp/rooms/x", { timeoutMs: 5 });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe("timeout");
  });
});
