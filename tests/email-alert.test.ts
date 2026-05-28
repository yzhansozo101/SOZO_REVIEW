import { describe, expect, it } from "vitest";
import { render } from "@react-email/components";
import { F1AlertEmail } from "@/lib/email/alert";

describe("F1AlertEmail", () => {
  it("renders to HTML with the listing title and grade", async () => {
    const html = await render(
      F1AlertEmail({
        listingTitle: "テスト物件",
        score: 55,
        grade: "D",
        reportUrl: "https://example.com/d/abc",
        top3: [{ issue: "x", action: "y", impact: "z" }],
      })
    );

    expect(html).toContain("テスト物件");
    expect(html).toContain("D 級");
    expect(html).toContain("55");
    expect(html).toContain("y");
  });
});
