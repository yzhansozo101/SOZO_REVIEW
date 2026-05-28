export type ParseDeferredResult =
  | { ok: true; data: unknown }
  | { ok: false; error: "no_script_block" | "invalid_json" };

const SCRIPT_RE = /<script[^>]*id="data-deferred-state-0"[^>]*>([\s\S]*?)<\/script>/i;

export function parseDeferredState(html: string): ParseDeferredResult {
  const m = html.match(SCRIPT_RE);
  if (!m) return { ok: false, error: "no_script_block" };

  try {
    return { ok: true, data: JSON.parse(m[1]) };
  } catch {
    return { ok: false, error: "invalid_json" };
  }
}
