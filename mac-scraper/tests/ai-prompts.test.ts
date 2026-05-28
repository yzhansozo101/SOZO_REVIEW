import { describe, it, expect } from "vitest";
import { aiOutputSchema, submitDiagnosisReportSchema, TOOL_NAME } from "../src/ai/prompts/tools.js";
import { buildUserPrompt } from "../src/ai/prompts/build.js";

describe("aiOutputSchema", () => {
  it("accepts valid output", () => {
    const ok = aiOutputSchema.safeParse({
      report_md: "## 総評\n" + "a".repeat(100),
      negative_keywords: [{ keyword: "汚れ", count: 3, quote: "汚かった" }],
      top3: [{ issue: "写真不足", action: "写真を追加", impact: "予約率改善" }],
    });
    expect(ok.success).toBe(true);
  });

  it("rejects empty top3", () => {
    const r = aiOutputSchema.safeParse({
      report_md: "a".repeat(80),
      negative_keywords: [],
      top3: [],
    });
    expect(r.success).toBe(false);
  });

  it("rejects > 5 negative keywords", () => {
    const r = aiOutputSchema.safeParse({
      report_md: "a".repeat(80),
      negative_keywords: Array(6).fill({ keyword: "x", count: 1, quote: "x" }),
      top3: [{ issue: "写真不足", action: "写真を追加", impact: "予約率改善" }],
    });
    expect(r.success).toBe(false);
  });
});

describe("submitDiagnosisReportSchema", () => {
  it("has the expected top-level shape", () => {
    expect(submitDiagnosisReportSchema.type).toBe("object");
    expect(submitDiagnosisReportSchema.required).toEqual(["report_md", "negative_keywords", "top3"]);
    expect(TOOL_NAME).toBe("submit_diagnosis_report");
  });
});

describe("buildUserPrompt", () => {
  it("includes title, rating, dim scores", () => {
    const p = buildUserPrompt(
      {
        listing_id: "999",
        title: "テスト物件",
        description_html: undefined,
        description_text: "寝室。リビング。",
        amenities: [{ title: "Wi-Fi", available: true }],
        photos: { count: 12, categories: {}, cover_category: "リビング" },
        rating: { overall: 4.8, count: 50, subscores: {} },
        review_tags: [],
        highlights: [],
        house_rules: [],
        api_key: "x",
        reviews_persisted_hash: "x",
      },
      {
        photos: { score: 95, total: 12, b1_status: "adequate", b3_coverage: "5/5" },
        title: { score: 70, placeholder: true },
        description: { score: 75, length: 8, sections_hit: [], locales: ["ja"] },
        amenities: { score: 100, match_ratio: "1/1" },
        reviews: { score: 96, rating: 4.8, count: 50, sparse: false },
      },
      [{ id: "r1", comments: "good", rating: 5, language: "en" }],
    );
    expect(p).toContain("テスト物件");
    expect(p).toContain("4.8");
    expect(p).toContain("submit_diagnosis_report");
  });
});
