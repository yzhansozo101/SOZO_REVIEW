import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("app/globals.css design tokens", () => {
  const css = readFileSync(resolve(__dirname, "../app/globals.css"), "utf8");

  it("defines --shadow-focus-error for form error states", () => {
    expect(css).toMatch(/--shadow-focus-error:\s*0 0 0 3px/);
  });

  it("defines --overlay-bg for modal scrims", () => {
    expect(css).toMatch(/--overlay-bg:\s*rgba\(14,\s*17,\s*22,\s*0\.42\)/);
  });

  it("defines --text-on-navy for content on sozonext-navy fills", () => {
    expect(css).toMatch(/--text-on-navy:\s*var\(--card\)/);
  });
});
