export type FetchPdpResult =
  | { ok: true; html: string }
  | { ok: false; error: "not_found" | "blocked" | "network" };

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36";

export async function fetchPdpHtml(
  url: string,
  init: { signal?: AbortSignal } = {},
): Promise<FetchPdpResult> {
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "user-agent": UA,
        accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "accept-language": "ja,en-US;q=0.7,en;q=0.3",
      },
      signal: init.signal,
    });

    if (res.ok) {
      const html = await res.text();
      return { ok: true, html };
    }

    if (res.status === 404) return { ok: false, error: "not_found" };
    if (res.status === 403 || res.status === 429) return { ok: false, error: "blocked" };
    return { ok: false, error: "network" };
  } catch {
    return { ok: false, error: "network" };
  }
}
