import { describe, it, expect } from "vitest";
import { parseDeferredState } from "../src/airbnb/parse-deferred.js";

const html = `
<!doctype html>
<html><body>
<script id="data-deferred-state-0" type="application/json">{"foo":"bar","n":1}</script>
</body></html>`;

describe("parseDeferredState", () => {
  it("returns parsed JSON when script block present", () => {
    const r = parseDeferredState(html);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.data).toEqual({ foo: "bar", n: 1 });
  });

  it("returns error when script block missing", () => {
    const r = parseDeferredState("<html><body>no</body></html>");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe("no_script_block");
  });

  it("returns error on malformed JSON", () => {
    const bad = '<script id="data-deferred-state-0">{ "x": }</script>';
    const r = parseDeferredState(bad);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe("invalid_json");
  });

  it("handles HTML entities in JSON (e.g. \\u003c)", () => {
    const ok = '<script id="data-deferred-state-0">{"x":"a\\u003cb"}</script>';
    const r = parseDeferredState(ok);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.data).toEqual({ x: "a<b" });
  });
});
