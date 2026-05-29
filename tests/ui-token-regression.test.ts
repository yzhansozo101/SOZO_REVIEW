import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const read = (p: string) => readFileSync(resolve(__dirname, "..", p), "utf8");

describe("UI token regression - no hardcoded values where tokens exist", () => {
  it("DimensionCard has no inline boxShadow (border-only per spec §7)", () => {
    const src = read("components/DimensionCard.tsx");
    expect(src).not.toMatch(/boxShadow:\s*["'`]0 1px 2px rgba\(14, 17, 22, 0\.03\)/);
  });

  it("DimensionGrid uses spacing token --s-3 instead of literal 10px", () => {
    const src = read("components/DimensionGrid.tsx");
    expect(src).not.toMatch(/gap:\s*["'`]10px/);
    expect(src).toMatch(/gap:\s*["'`]var\(--s-3\)/);
  });

  it("QualityStatusLadder uses --text-on-navy instead of hardcoded #fff", () => {
    const src = read("components/QualityStatusLadder.tsx");
    expect(src).not.toMatch(/color:\s*active\s*\?\s*["'`]#fff/);
    expect(src).toMatch(/var\(--text-on-navy\)/);
  });
});
