import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import { SupportCta } from "@/components/SupportCta";

afterEach(() => cleanup());

describe("SupportCta", () => {
  it("renders headline and description", () => {
    render(<SupportCta />);
    expect(screen.getByText("もっと結果を出しませんか？")).toBeInTheDocument();
    expect(
      screen.getByText(/SOZONEXT は民泊運営代行の専門会社/),
    ).toBeInTheDocument();
  });

  it("renders all 3 service bullets with titles and captions", () => {
    render(<SupportCta />);
    expect(screen.getByText("リスティング最適化代行")).toBeInTheDocument();
    expect(
      screen.getByText("写真・タイトル・紹介文を SOZONEXT が制作"),
    ).toBeInTheDocument();
    expect(screen.getByText("24h 運営代行")).toBeInTheDocument();
    expect(
      screen.getByText("ゲスト対応・清掃・チェックイン代行"),
    ).toBeInTheDocument();
    expect(screen.getByText("収益改善コンサル")).toBeInTheDocument();
    expect(
      screen.getByText("価格戦略・RevPAR 改善・複数物件運用"),
    ).toBeInTheDocument();
  });

  it("email CTA uses prefilled mailto link to minpaku_info@sozonext.com", () => {
    render(<SupportCta />);
    const email = screen.getByRole("link", {
      name: /minpaku_info@sozonext\.com にメール相談する/,
    });
    expect(email.getAttribute("href")).toMatch(
      /^mailto:minpaku_info@sozonext\.com\?/,
    );
    expect(email.getAttribute("href")).toContain("subject=");
    expect(email.getAttribute("href")).toContain("body=");
  });

  it("phone link uses international tel: URI", () => {
    render(<SupportCta />);
    const tel = screen.getByRole("link", { name: /03-3842-1552/ });
    expect(tel).toHaveAttribute("href", "tel:+81338421552");
  });

  it("website link opens sozonext.com in a new tab safely", () => {
    render(<SupportCta />);
    const site = screen.getByRole("link", { name: /^sozonext\.com/ });
    expect(site).toHaveAttribute("href", "https://sozonext.com");
    expect(site).toHaveAttribute("target", "_blank");
    expect(site).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("decorative icons are marked aria-hidden", () => {
    const { container } = render(<SupportCta />);
    const svgs = container.querySelectorAll("svg");
    expect(svgs.length).toBeGreaterThan(0);
    for (const svg of svgs) {
      expect(svg.getAttribute("aria-hidden")).toBe("true");
    }
  });

  it("email CTA reuses the navy primary CTA token (background: sozonext-navy)", () => {
    render(<SupportCta />);
    const email = screen.getByRole("link", {
      name: /minpaku_info@sozonext\.com にメール相談する/,
    });
    const style = email.getAttribute("style") ?? "";
    expect(style).toMatch(/background:\s*var\(--sozonext-navy\)/);
  });
});
