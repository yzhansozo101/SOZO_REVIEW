import { describe, it, expect } from "vitest";
import sitemap from "../app/sitemap";

describe("sitemap.xml generator", () => {
  const entries = sitemap();

  it("contains exactly one URL today (homepage)", () => {
    expect(entries).toHaveLength(1);
    expect(entries[0].url).toBe("https://sozonext-review.vercel.app/");
  });

  it("homepage has highest priority + monthly changeFrequency", () => {
    expect(entries[0].priority).toBe(1.0);
    expect(entries[0].changeFrequency).toBe("monthly");
  });

  it("homepage lastModified is a Date instance", () => {
    expect(entries[0].lastModified).toBeInstanceOf(Date);
  });

  it("does NOT include /d/ or /api/ paths (privacy + internal)", () => {
    for (const e of entries) {
      expect(e.url).not.toMatch(/\/d\//);
      expect(e.url).not.toMatch(/\/api\//);
    }
  });
});
