import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { PdfDownloadButton } from "@/components/PdfDownloadButton";

afterEach(() => cleanup());

describe("PdfDownloadButton", () => {
  it("declares a :hover background change", () => {
    const { container } = render(<PdfDownloadButton diagnosisId="abc123" />);
    const css = Array.from(container.querySelectorAll("style"))
      .map((s) => s.textContent ?? "")
      .join("\n");
    expect(css).toMatch(/\.pdf-download-btn:hover[^{]*\{[^}]*background:\s*var\(--ink-50\)/);
  });
});
