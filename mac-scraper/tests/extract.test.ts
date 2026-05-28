import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { extractSnapshot } from "../src/airbnb/extract.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixturePath = resolve(__dirname, "fixtures/airbnb-pdp-deferred.json");
const deferred = JSON.parse(readFileSync(fixturePath, "utf8"));

describe("extractSnapshot", () => {
  const snap = extractSnapshot(deferred, "1174411978184206231");

  it("extracts the listing id back", () => {
    expect(snap.listing_id).toBe("1174411978184206231");
  });

  it("extracts non-empty title", () => {
    expect(typeof snap.title).toBe("string");
    expect((snap.title ?? "").length).toBeGreaterThan(2);
  });

  it("extracts description text > 100 chars", () => {
    expect(typeof snap.description_text).toBe("string");
    expect((snap.description_text ?? "").length).toBeGreaterThan(100);
  });

  it("extracts at least 5 amenities", () => {
    expect(snap.amenities.length).toBeGreaterThanOrEqual(5);
  });

  it("extracts overall rating between 0 and 5", () => {
    const r = snap.rating.overall;
    expect(typeof r).toBe("number");
    expect(r!).toBeGreaterThan(0);
    expect(r!).toBeLessThanOrEqual(5);
  });

  it("extracts api_key (24+ chars lowercase alphanumeric)", () => {
    expect(snap.api_key).toMatch(/^[a-z0-9]{24,}$/);
  });
});
