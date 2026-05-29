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
    // PDF download is rendered as the primary CTA in the report header, so its
    // hover swaps to the deeper navy token rather than the ghost-button ink-50.
    expect(css).toMatch(/\.pdf-download-btn:hover[^{]*\{[^}]*background:\s*var\(--sozonext-navy-700\)\s*!important/);
  });
});
