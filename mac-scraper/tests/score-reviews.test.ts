import { describe, it, expect } from "vitest";
import { scoreReviews } from "../src/score/reviews.js";

describe("scoreReviews", () => {
  it("rating 4.87 -> score ~= 97", () => {
    const r = scoreReviews({ overall: 4.87, count: 106, subscores: {} }, []);
    expect(r.score).toBeGreaterThanOrEqual(95);
    expect(r.score).toBeLessThanOrEqual(100);
  });

  it("missing rating -> neutral score 70 with note", () => {
    const r = scoreReviews({ overall: undefined, count: undefined, subscores: {} }, []);
    expect(r.score).toBe(70);
    expect(r.note).toContain("レビューデータ");
  });

  it("review count < 3 sets sparse flag", () => {
    const r = scoreReviews({ overall: 5, count: 2, subscores: {} }, [
      { id: "r1", comments: "good", rating: 5, language: "en" },
    ]);
    expect(r.sparse).toBe(true);
  });

  it("collects review comments as texts[] for AI consumption", () => {
    const r = scoreReviews({ overall: 4.5, count: 5, subscores: {} }, [
      { id: "r1", comments: "very good place", rating: 5, language: "en" },
      { id: "r2", comments: "汚かった", rating: 2, language: "ja" },
    ]);
    expect(r.texts).toEqual(["very good place", "汚かった"]);
  });
});
