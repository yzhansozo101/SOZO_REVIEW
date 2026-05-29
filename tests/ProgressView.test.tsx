import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { ProgressView } from "@/components/ProgressView";

afterEach(() => cleanup());

describe("ProgressView", () => {
  it("disables spinner/shimmer animations when prefers-reduced-motion is reduce", () => {
    const { container } = render(<ProgressView />);
    const styleTags = Array.from(container.querySelectorAll("style"));
    const combined = styleTags.map((s) => s.textContent ?? "").join("\n");
    expect(combined).toMatch(/@media\s*\(prefers-reduced-motion:\s*reduce\)/);
    expect(combined).toMatch(/progress-spin[^{]*\{[^}]*animation:\s*none/);
    expect(combined).toMatch(/progress-shimmer[^{]*\{[^}]*animation:\s*none/);
  });
});
