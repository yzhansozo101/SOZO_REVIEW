import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { EmailPreview } from "@/components/EmailPreview";

afterEach(() => cleanup());

const baseProps = {
  kind: "f1" as const,
  score: 50,
  alertEmailTo: "test@example.com",
  diagnosisId: "test-id-001",
  onClose: () => {},
};

describe("EmailPreview", () => {
  it("overlay background uses --overlay-bg token", () => {
    const { container } = render(<EmailPreview {...baseProps} />);
    const css = Array.from(container.querySelectorAll("style"))
      .map((s) => s.textContent ?? "")
      .join("\n");
    expect(css).toMatch(/background:\s*var\(--overlay-bg\)/);
    expect(css).not.toMatch(/rgba\(14,\s*17,\s*22,\s*0\.42\)/);
  });

  it("close button padding meets 44px touch-target minimum", () => {
    const { container } = render(<EmailPreview {...baseProps} />);
    const css = Array.from(container.querySelectorAll("style"))
      .map((s) => s.textContent ?? "")
      .join("\n");
    expect(css).toMatch(/\.email-preview-close[^{]*\{[^}]*padding:\s*12px 18px/);
    expect(css).toMatch(/\.email-preview-close[^{]*\{[^}]*min-height:\s*44px/);
  });
});
