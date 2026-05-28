import { describe, expect, it } from "vitest";
import { render } from "@react-email/components";
import { F7WeeklyEmail } from "@/lib/email/weekly";

describe("F7WeeklyEmail", () => {
  it("renders weekly summary HTML", async () => {
    const html = await render(
      F7WeeklyEmail({
        weekOf: "2026-05-28",
        totalDiagnosed: 5,
        distribution: { A: 2, B: 1, C: 1, D: 1 },
        top3Worst: [{ title: "物件 1", grade: "D", score: 52, mainIssue: "設備不足" }],
      })
    );

    expect(html).toContain("2026-05-28");
    expect(html).toContain("5");
    expect(html).toContain("物件 1");
    expect(html).toContain("52");
    expect(html).toContain("SOZONEXT 物件ヘルス週次サマリー");
    expect(html).toContain("来週月曜 09:00");
  });
});
