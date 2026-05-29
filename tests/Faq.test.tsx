import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Faq } from "@/components/marketing/Faq";

describe("Faq", () => {
  it("renders the Japanese FAQ section and key safety copy", () => {
    render(<Faq />);

    expect(screen.getByRole("heading", { name: "よくある質問" })).toBeInTheDocument();
    expect(screen.getByText("SOZONEXT Review とは何ですか？")).toBeInTheDocument();
    expect(screen.getByText(/Airbnb の内部判定や公式評価ではありません/)).toBeInTheDocument();
    expect(screen.getByText(/保証するものではありません/)).toBeInTheDocument();
  });
});
