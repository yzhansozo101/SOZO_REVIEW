import { describe, expect, it } from "vitest";
import { FAQ_ITEMS } from "@/lib/marketing/faq";

describe("FAQ_ITEMS", () => {
  it("contains six Japanese-first FAQ items", () => {
    expect(FAQ_ITEMS).toHaveLength(6);
    expect(FAQ_ITEMS.map((item) => item.question)).toEqual([
      "SOZONEXT Review とは何ですか？",
      "どのような項目を診断しますか？",
      "Airbnb の公式評価と同じですか？",
      "Airbnb アカウントへのログインは必要ですか？",
      "検索順位やスーパーホスト維持に役立ちますか？",
      "料金はかかりますか？",
    ]);
  });

  it("states the Airbnb score is not official", () => {
    const official = FAQ_ITEMS.find((item) => item.question.includes("公式評価"));

    expect(official?.answer).toContain("Airbnb の内部判定や公式評価ではありません");
  });

  it("does not guarantee search ranking or badge outcomes", () => {
    const ranking = FAQ_ITEMS.find((item) => item.question.includes("検索順位"));

    expect(ranking?.answer).toContain("保証するものではありません");
    expect(ranking?.answer).not.toContain("必ず");
  });
});
