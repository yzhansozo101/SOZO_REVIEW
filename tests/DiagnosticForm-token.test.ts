import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("DiagnosticForm error-ring token", () => {
  const src = readFileSync(resolve(__dirname, "../components/DiagnosticForm.tsx"), "utf8");

  it("does not hardcode the grade-d rgba for the error ring", () => {
    expect(src).not.toMatch(/rgba\(199,\s*56,\s*43,\s*0\.14\)/);
  });

  it("uses --shadow-focus-error token on the error boxShadow", () => {
    expect(src).toMatch(/boxShadow:\s*error\s*\?\s*["'`]var\(--shadow-focus-error\)["'`]/);
  });
});
