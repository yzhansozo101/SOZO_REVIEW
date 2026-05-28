import { describe, it, expect } from "vitest";
import { scoreAmenities } from "../src/score/amenities.js";

describe("scoreAmenities", () => {
  it("returns ratio + missing list when partial match", () => {
    const amenities = [
      { title: "Wi-Fi", available: true },
      { title: "洗濯機", available: true },
      { title: "エアコン", available: true },
      { title: "コーヒーメーカー", available: true },
    ];
    const desc = "高速Wi-Fi完備。エアコンあり。";
    const r = scoreAmenities(amenities, desc);
    expect(r.match_ratio).toBe("2/4");
    expect(r.missing.sort()).toEqual(["コーヒーメーカー", "洗濯機"].sort());
  });

  it("returns 100% score when all amenities mentioned", () => {
    const amenities = [{ title: "Wi-Fi", available: true }];
    const desc = "高速Wi-Fi.";
    const r = scoreAmenities(amenities, desc);
    expect(r.score).toBeGreaterThanOrEqual(95);
  });

  it("ignores unavailable amenities", () => {
    const amenities = [
      { title: "Wi-Fi", available: true },
      { title: "プール", available: false },
    ];
    const desc = "Wi-Fi完備。";
    const r = scoreAmenities(amenities, desc);
    expect(r.match_ratio).toBe("1/1"); // 不计 unavailable
  });

  it("returns 0% score when nothing matches", () => {
    const r = scoreAmenities([{ title: "Wi-Fi", available: true }], "no amenities mentioned");
    expect(r.score).toBeLessThan(40);
  });
});
