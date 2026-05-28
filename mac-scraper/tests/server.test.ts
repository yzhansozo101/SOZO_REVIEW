import { readFileSync } from "node:fs";
import { describe, it, expect, beforeAll, beforeEach, vi } from "vitest";
import request from "supertest";

vi.mock("../src/airbnb/fetch-pdp.js", () => ({
  fetchPdpHtml: vi.fn(),
}));
vi.mock("../src/airbnb/fetch-reviews.js", () => ({
  fetchReviews: vi.fn(),
}));
vi.mock("../src/ai/claude-agent.js", () => ({
  generateReport: vi.fn().mockResolvedValue({
    status: "ok",
    data: {
      report_md: "## 総評\nテスト用レポート。" + "x".repeat(60),
      negative_keywords: [],
      top3: [{ issue: "test issue", action: "test action", impact: "test impact" }],
    },
  }),
}));

import { createApp } from "../src/server.js";
import { fetchPdpHtml } from "../src/airbnb/fetch-pdp.js";
import { fetchReviews } from "../src/airbnb/fetch-reviews.js";
import { generateReport } from "../src/ai/claude-agent.js";

const aiOkResult = {
  status: "ok" as const,
  data: {
    report_md: "## 総評\nテスト用レポート。" + "x".repeat(60),
    negative_keywords: [],
    top3: [{ issue: "test issue", action: "test action", impact: "test impact" }],
  },
};

const deferredJson = JSON.parse(readFileSync("tests/fixtures/airbnb-pdp-deferred.json", "utf8"));
const deferredJsonWithReviewsHash = {
  ...deferredJson,
  __testReviewsQuery: {
    operationName: "StaysPdpReviewsQuery",
    extensions: {
      persistedQuery: {
        version: 1,
        sha256Hash: "0a44b1b4012f88a6b8e7a7e85d0b9a4d99f47fc5ad44b21d83b4f0ab36e3f1aa",
      },
    },
  },
};
const htmlWrapper = `<script id="data-deferred-state-0">${JSON.stringify(deferredJsonWithReviewsHash)}</script>`;

beforeAll(() => {
  process.env.SCRAPER_SECRET = "test-secret";
});

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(generateReport).mockResolvedValue(aiOkResult);
});

describe("auth", () => {
  it("rejects unauthenticated POST /diagnose with 401", async () => {
    const app = createApp();
    const res = await request(app).post("/diagnose").send({ url: "x" });
    expect(res.status).toBe(401);
  });

  it("rejects wrong bearer with 401", async () => {
    const app = createApp();
    const res = await request(app)
      .post("/diagnose")
      .set("Authorization", "Bearer wrong")
      .send({ url: "x" });
    expect(res.status).toBe(401);
  });

  it("accepts correct bearer (forwards to handler; expect 400 since body is invalid)", async () => {
    const app = createApp();
    const res = await request(app)
      .post("/diagnose")
      .set("Authorization", "Bearer test-secret")
      .send({});
    // Task 11 handler validates body with zod -> 400 invalid_request
    expect(res.status).toBe(400);
  });

  it("/healthz is open(no auth)", async () => {
    const app = createApp();
    const res = await request(app).get("/healthz");
    expect(res.status).toBe(200);
  });
});

describe("POST /diagnose (real flow)", () => {
  it("returns Diagnosis with real grade for valid URL", async () => {
    vi.mocked(fetchPdpHtml).mockResolvedValue({ ok: true, html: htmlWrapper });
    vi.mocked(fetchReviews).mockResolvedValue({ ok: true, reviews: [] });

    const app = createApp();
    const res = await request(app)
      .post("/diagnose")
      .set("Authorization", "Bearer test-secret")
      .send({ url: "https://www.airbnb.jp/rooms/1174411978184206231" });
    expect(res.status).toBe(200);
    expect(res.body.listing_id).toBe("1174411978184206231");
    expect(["A", "B", "C", "D"]).toContain(res.body.grade);
    expect(res.body.dimensions.photos.score).toBeGreaterThan(0);
    expect(res.body.dimensions.description.length).toBeGreaterThan(0);
    expect(res.body.ai.status).toBe("ok");
    expect(res.body.ai.top3).toEqual([{ issue: "test issue", action: "test action", impact: "test impact" }]);
    expect(fetchReviews).toHaveBeenCalledWith({
      listingId: "1174411978184206231",
      apiKey: expect.any(String),
      persistedHash: "0a44b1b4012f88a6b8e7a7e85d0b9a4d99f47fc5ad44b21d83b4f0ab36e3f1aa",
    });
    expect(generateReport).toHaveBeenCalledWith(
      expect.objectContaining({ listing_id: "1174411978184206231" }),
      expect.objectContaining({
        photos: expect.objectContaining({ score: expect.any(Number) }),
        reviews: expect.objectContaining({ score: expect.any(Number) }),
      }),
      [],
    );
  });

  it("returns 502 when fetchPdpHtml fails", async () => {
    vi.mocked(fetchPdpHtml).mockResolvedValue({ ok: false, error: "not_found" });

    const app = createApp();
    const res = await request(app)
      .post("/diagnose")
      .set("Authorization", "Bearer test-secret")
      .send({ url: "https://www.airbnb.jp/rooms/1174411978184206231" });
    expect(res.status).toBe(502);
  });

  it("marks scrape_status=partial when reviews fail", async () => {
    vi.mocked(fetchPdpHtml).mockResolvedValue({ ok: true, html: htmlWrapper });
    vi.mocked(fetchReviews).mockResolvedValue({ ok: false, error: "hash_expired" });

    const app = createApp();
    const res = await request(app)
      .post("/diagnose")
      .set("Authorization", "Bearer test-secret")
      .send({ url: "https://www.airbnb.jp/rooms/1174411978184206231" });
    expect(res.status).toBe(200);
    expect(res.body.scrape_status).toBe("partial");
  });
});
