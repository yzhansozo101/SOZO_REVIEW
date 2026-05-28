import { describe, it, expect } from "vitest";
import { scorePhotos } from "../src/score/photos.js";

describe("scorePhotos", () => {
  it("B1 marks <5 as insufficient", () => {
    const r = scorePhotos({ count: 4, categories: {}, cover_category: undefined });
    expect(r.b1_status).toBe("insufficient");
    expect(r.score).toBeLessThan(60);
  });

  it("B1 marks 10-19 as adequate", () => {
    const r = scorePhotos({ count: 12, categories: {}, cover_category: undefined });
    expect(r.b1_status).toBe("adequate");
  });

  it("B1 marks 20+ as rich", () => {
    const r = scorePhotos({ count: 30, categories: {}, cover_category: undefined });
    expect(r.b1_status).toBe("rich");
  });

  it("B2 marks living/bedroom cover as ok", () => {
    const r = scorePhotos({ count: 10, categories: {}, cover_category: "リビング" });
    expect(r.b2_cover_ok).toBe(true);
  });

  it("B2 marks bathroom cover as not ok", () => {
    const r = scorePhotos({ count: 10, categories: {}, cover_category: "バスルーム" });
    expect(r.b2_cover_ok).toBe(false);
  });

  it("B3 reports coverage like '4/5'", () => {
    const r = scorePhotos({
      count: 10,
      categories: { 寝室: 2, リビング: 3, キッチン: 1, バスルーム: 1 },
      cover_category: "リビング",
    });
    expect(r.b3_coverage).toBe("4/5");
    expect(r.b3_missing).toContain("外景");
  });

  it("score is high when everything good", () => {
    const r = scorePhotos({
      count: 25,
      categories: { 寝室: 4, リビング: 5, キッチン: 3, バスルーム: 2, 外景: 1 },
      cover_category: "リビング",
    });
    expect(r.score).toBeGreaterThanOrEqual(90);
  });
});
