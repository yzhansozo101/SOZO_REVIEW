import { afterEach, describe, it, expect } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { ScoreCard } from "@/components/ScoreCard";

afterEach(() => {
  cleanup();
});

describe("ScoreCard", () => {
  it("renders letter grade and score", () => {
    render(<ScoreCard score={86} />);
    expect(screen.getByTestId("score-letter")).toHaveTextContent("B");
    expect(screen.getByTestId("score-number")).toHaveTextContent("86");
  });

  it("applies grade-a colors when score >= 90", () => {
    render(<ScoreCard score={92} />);
    const card = screen.getByTestId("score-card");
    expect(card.style.background).toContain("--grade-a-fill");
  });

  it("shows upgrade hint when not at max", () => {
    render(<ScoreCard score={78} />);
    expect(screen.getByTestId("score-upgrade")).toHaveTextContent("あと 12 点で A 級にアップ");
  });

  it("shows at-max copy when already A", () => {
    render(<ScoreCard score={95} />);
    expect(screen.getByTestId("score-upgrade")).toHaveTextContent("最高等級です");
  });

  it("renders ? for null score", () => {
    render(<ScoreCard score={null} />);
    expect(screen.getByTestId("score-letter")).toHaveTextContent("?");
  });
});
