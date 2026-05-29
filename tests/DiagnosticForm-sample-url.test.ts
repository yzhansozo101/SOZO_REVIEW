import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { parseAirbnbUrl } from "@/lib/util/url";

const src = readFileSync(
  resolve(__dirname, "../components/DiagnosticForm.tsx"),
  "utf8",
);

const match = src.match(/const SAMPLE_URL\s*=\s*["']([^"']+)["']/);
const sampleUrl = match?.[1];

describe("DiagnosticForm SAMPLE_URL", () => {
  it("is defined", () => {
    expect(sampleUrl).toBeTruthy();
  });

  it("is not the legacy 12345678 placeholder", () => {
    expect(sampleUrl).not.toMatch(/\/rooms\/12345678(\b|$)/);
  });

  it("parses as a valid Airbnb listing URL", () => {
    const parsed = parseAirbnbUrl(sampleUrl!);
    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(parsed.listingId).toMatch(/^\d{6,}$/);
    }
  });

  it("has no session query string (clean canonical form)", () => {
    expect(sampleUrl).not.toContain("source_impression_id");
    expect(sampleUrl).not.toContain("check_in");
  });
});
