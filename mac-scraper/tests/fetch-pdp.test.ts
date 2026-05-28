import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { fetchPdpHtml } from "../src/airbnb/fetch-pdp.js";

const originalFetch = global.fetch;

beforeEach(() => {
  vi.restoreAllMocks();
});

afterEach(() => {
  global.fetch = originalFetch;
});

describe("fetchPdpHtml", () => {
  it("returns { ok: true, html } on 200", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => "<html><body>x</body></html>",
    }) as unknown as typeof fetch;
    const r = await fetchPdpHtml("https://www.airbnb.jp/rooms/123");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.html).toContain("<html>");
  });

  it("returns { ok: false, error: 'not_found' } on 404", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      text: async () => "",
    }) as unknown as typeof fetch;
    const r = await fetchPdpHtml("https://www.airbnb.jp/rooms/x");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe("not_found");
  });

  it("returns { ok: false, error: 'blocked' } on 403/429", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
      text: async () => "",
    }) as unknown as typeof fetch;
    const r = await fetchPdpHtml("https://www.airbnb.jp/rooms/x");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe("blocked");
  });

  it("sets browser-like UA + ja accept-language", async () => {
    const mock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => "",
    });
    global.fetch = mock as unknown as typeof fetch;
    await fetchPdpHtml("https://www.airbnb.jp/rooms/1");
    expect(mock).toHaveBeenCalledWith(
      "https://www.airbnb.jp/rooms/1",
      expect.objectContaining({
        headers: expect.objectContaining({
          "user-agent": expect.stringContaining("Mozilla/5.0"),
          "accept-language": expect.stringContaining("ja"),
        }),
      }),
    );
  });
});
