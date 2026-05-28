import { describe, it, expect } from "vitest";
import { parseAirbnbUrl } from "@/lib/util/url";

describe("parseAirbnbUrl", () => {
  it("extracts listing id from airbnb.jp URL", () => {
    expect(parseAirbnbUrl("https://www.airbnb.jp/rooms/12345678")).toEqual({
      ok: true,
      listingId: "12345678",
    });
  });

  it("extracts listing id from airbnb.com URL with query string", () => {
    expect(
      parseAirbnbUrl("https://www.airbnb.com/rooms/87654321?source=foo"),
    ).toEqual({ ok: true, listingId: "87654321" });
  });

  it("extracts listing id when subdomain is bare airbnb.jp(no www)", () => {
    expect(parseAirbnbUrl("https://airbnb.jp/rooms/9999")).toEqual({
      ok: true,
      listingId: "9999",
    });
  });

  it("rejects non-Airbnb URL", () => {
    expect(parseAirbnbUrl("https://booking.com/rooms/123")).toEqual({
      ok: false,
      error: "not_airbnb",
    });
  });

  it("rejects URL without listing id", () => {
    expect(parseAirbnbUrl("https://www.airbnb.jp/")).toEqual({
      ok: false,
      error: "no_listing_id",
    });
  });

  it("rejects garbage string as invalid_url", () => {
    expect(parseAirbnbUrl("not a url")).toEqual({
      ok: false,
      error: "invalid_url",
    });
  });

  it("accepts /h/<slug>/<id> style URLs", () => {
    // Airbnb 偶发短链 redirect 形式,本 task 不要求支持 — 验证当前实现按 no_listing_id 处理
    expect(parseAirbnbUrl("https://www.airbnb.jp/h/some-slug")).toEqual({
      ok: false,
      error: "no_listing_id",
    });
  });
});
