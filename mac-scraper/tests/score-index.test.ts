import { describe, it, expect } from "vitest";
import { aggregate } from "../src/score/index.js";

describe("aggregate", () => {
  it("averages 5 dimensions and maps to grade", () => {
    const r = aggregate({
      photos: { score: 95 },
      title: { score: 70 },
      description: { score: 88 },
      amenities: { score: 75 },
      reviews: { score: 99, rating: 4.95 },
    });
    expect(r.overall_score).toBe(85); // (95+70+88+75+99)/5 = 85.4 -> 85
    expect(r.grade).toBe("B");
  });

  it("rating 4.85 -> Good quality status", () => {
    const r = aggregate({
      photos: { score: 50 },
      title: { score: 50 },
      description: { score: 50 },
      amenities: { score: 50 },
      reviews: { score: 80, rating: 4.85 },
    });
    expect(r.quality_status).toBe("Good");
  });

  it("low rating -> Warn", () => {
    const r = aggregate({
      photos: { score: 50 },
      title: { score: 50 },
      description: { score: 50 },
      amenities: { score: 50 },
      reviews: { score: 80, rating: 4.2 },
    });
    expect(r.quality_status).toBe("Warn");
  });

  it("undefined rating defaults to Good", () => {
    const r = aggregate({
      photos: { score: 50 },
      title: { score: 50 },
      description: { score: 50 },
      amenities: { score: 50 },
      reviews: { score: 70, rating: undefined },
    });
    expect(r.quality_status).toBe("Good");
  });
});
