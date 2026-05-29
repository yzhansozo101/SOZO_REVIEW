import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { AlertBar } from "@/components/AlertBar";

afterEach(() => cleanup());

const baseProps = {
  score: 50,
  alertSent: false,
  alertEmailTo: "test@example.com",
  diagnosisId: "test-id-001",
};

describe("AlertBar", () => {
  it("buttons have padding meeting 44px touch-target minimum", () => {
    render(<AlertBar {...baseProps} />);
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThanOrEqual(2);
    for (const btn of buttons) {
      const style = btn.getAttribute("style") ?? "";
      expect(style).toMatch(/padding:\s*10px 16px/);
    }
  });

  it("buttons declare a hover transition", () => {
    render(<AlertBar {...baseProps} />);
    const btn = screen.getAllByRole("button")[0];
    const style = btn.getAttribute("style") ?? "";
    expect(style).toMatch(/transition:[^;]*background/);
  });

  it("renders mock-data marker for the demo schedule line", () => {
    render(<AlertBar {...baseProps} />);
    const marker = screen.getByTestId("alert-bar-mock-schedule");
    expect(marker).toHaveAttribute("data-mock", "true");
    expect(marker.textContent).toMatch(/デモ表示/);
  });
});
