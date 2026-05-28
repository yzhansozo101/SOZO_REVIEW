export type ParseResult =
  | { ok: true; listingId: string }
  | { ok: false; error: "not_airbnb" | "no_listing_id" | "invalid_url" };

const AIRBNB_HOST = /(^|\.)airbnb\.[a-z.]+$/i;
const ROOMS_PATH = /^\/rooms\/(\d+)/;

export function parseAirbnbUrl(input: string): ParseResult {
  let url: URL;
  try {
    url = new URL(input);
  } catch {
    return { ok: false, error: "invalid_url" };
  }
  if (!AIRBNB_HOST.test(url.hostname)) {
    return { ok: false, error: "not_airbnb" };
  }
  const m = url.pathname.match(ROOMS_PATH);
  if (!m) return { ok: false, error: "no_listing_id" };
  return { ok: true, listingId: m[1] };
}
