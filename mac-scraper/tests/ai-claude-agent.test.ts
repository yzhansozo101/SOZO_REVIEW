import { describe, expect, it, vi } from "vitest";
import { generateReportWith, type SdkInjector } from "../src/ai/claude-agent.js";
import type { Snapshot } from "../src/airbnb/extract.js";
import type { Dimensions } from "../src/ai/prompts/build.js";

const snap: Snapshot = {
  listing_id: "1",
  title: "x",
  description_html: undefined,
  description_text: "寝室。リビング。キッチン。",
  amenities: [],
  photos: { count: 10, categories: {}, cover_category: "リビング" },
  rating: { overall: 4.5, count: 10, subscores: {} },
  review_tags: [],
  highlights: [],
  house_rules: [],
  api_key: undefined,
  reviews_persisted_hash: undefined,
};

const dims: Dimensions = {
  photos: { score: 90 },
  title: { score: 70 },
  description: { score: 80 },
  amenities: { score: 70 },
  reviews: { score: 90, rating: 4.5, count: 10 },
};

const validOutput = {
  report_md: "## 総評\n" + "x".repeat(80),
  negative_keywords: [{ keyword: "汚れ", count: 2, quote: "汚かった" }],
  top3: [
    { issue: "写真不足", action: "リビング写真を追加", impact: "クリック率向上" },
    { issue: "設備記述漏れ", action: "Wi-Fi を明記", impact: "問い合わせ削減" },
    { issue: "アクセス情報不足", action: "駅から徒歩X分を追加", impact: "予約率向上" },
  ],
};

describe("generateReportWith", () => {
  it("returns ok with parsed data when SDK returns valid output", async () => {
    const injector: SdkInjector = { callSdk: vi.fn().mockResolvedValue(validOutput) };
    const r = await generateReportWith(snap, dims, [], injector);
    expect(r.status).toBe("ok");
    if (r.status === "ok") expect(r.data.top3.length).toBe(3);
  });

  it("retries once on first failure, succeeds on second", async () => {
    const callSdk = vi.fn().mockRejectedValueOnce(new Error("transient")).mockResolvedValueOnce(validOutput);
    const r = await generateReportWith(snap, dims, [], { callSdk });
    expect(r.status).toBe("ok");
    expect(callSdk).toHaveBeenCalledTimes(2);
  });

  it("falls back when both attempts throw", async () => {
    const callSdk = vi.fn().mockRejectedValue(new Error("nope"));
    const r = await generateReportWith(snap, dims, [], { callSdk });
    expect(r.status).toBe("fallback");
    expect(callSdk).toHaveBeenCalledTimes(2);
  });

  it("falls back when SDK returns schema-invalid object", async () => {
    const callSdk = vi.fn().mockResolvedValue({ report_md: "too short", negative_keywords: [], top3: [] });
    const r = await generateReportWith(snap, dims, [], { callSdk });
    expect(r.status).toBe("fallback");
    expect(callSdk).toHaveBeenCalledTimes(2);
  });
});
