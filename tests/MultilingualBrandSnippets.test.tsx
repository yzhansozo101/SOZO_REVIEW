import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MultilingualBrandSnippets } from "@/components/marketing/MultilingualBrandSnippets";

describe("MultilingualBrandSnippets", () => {
  it("renders English and Chinese brand aliases", () => {
    render(<MultilingualBrandSnippets />);

    expect(screen.getByText(/also known as SOZO Review/)).toBeInTheDocument();
    expect(screen.getByText(/也可称为 SOZO Review/)).toBeInTheDocument();
  });
});
