import { describe, it, expect } from "vitest";
import { scoreDescription } from "../src/score/description.js";

describe("scoreDescription", () => {
  it("returns lowest score for empty", () => {
    const r = scoreDescription("");
    expect(r.score).toBeLessThanOrEqual(20);
    expect(r.length).toBe(0);
    expect(r.sections_hit).toEqual([]);
  });

  it("detects all 6 sections in a long description", () => {
    const text =
      "寝室は広いです。リビングからキッチンへ。バスルーム完備。駅まで5分。周辺は静か。" +
      "x".repeat(900);
    const r = scoreDescription(text);
    expect(r.sections_hit.sort()).toEqual(
      ["アクセス", "キッチン", "バスルーム", "リビング", "寝室", "周辺"].sort(),
    );
    expect(r.score).toBeGreaterThanOrEqual(90);
  });

  it("partial match (3 sections, 500 chars) → 良好", () => {
    const text = "寝室は2つあります。リビングが広い。キッチンに調理器具。" + "x".repeat(500);
    const r = scoreDescription(text);
    expect(r.sections_hit.length).toBeGreaterThanOrEqual(3);
    expect(r.score).toBeGreaterThanOrEqual(60);
    expect(r.score).toBeLessThan(90);
  });

  it("short description → 需改進", () => {
    const r = scoreDescription("寝室1つ。");
    expect(r.score).toBeLessThan(60);
  });
});
