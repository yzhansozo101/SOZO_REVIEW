import { describe, expect, it } from "vitest";
import { scoreDescription } from "../src/score/description.js";

describe("scoreDescription B8 locale status", () => {
  it("marks ok when ja and en descriptions are available", () => {
    const r = scoreDescription("寝室とリビングがあります。", ["ja", "en"]);

    expect(r.locales).toEqual(["ja", "en"]);
    expect(r.b8_status).toBe("ok");
  });

  it("marks missing_critical when only ja is available", () => {
    const r = scoreDescription("寝室とリビングがあります。", ["ja"]);

    expect(r.locales).toEqual(["ja"]);
    expect(r.b8_status).toBe("missing_critical");
  });

  it("marks missing_critical when en exists without ja", () => {
    const r = scoreDescription("Bedroom and living room.", ["en"]);

    expect(r.locales).toEqual(["en"]);
    expect(r.b8_status).toBe("missing_critical");
  });
});
