import { createHash } from "node:crypto";
import { extractSnapshot } from "./extract.js";
import { fetchPdpHtml } from "./fetch-pdp.js";
import { parseDeferredState } from "./parse-deferred.js";

const LOCALES = ["en", "zh-CN", "ko"] as const;

export async function detectLocales(baseUrl: string, jaDescriptionHash: string): Promise<string[]> {
  const listingId = baseUrl.match(/\/rooms\/(\d+)/)?.[1];
  if (!listingId) return ["ja"];

  const detected = await Promise.all(
    LOCALES.map(async (loc) => {
      try {
        const url = new URL(baseUrl);
        url.searchParams.set("locale", loc);

        const res = await fetchPdpHtml(url.toString());
        if (!res.ok) return undefined;

        const parsed = parseDeferredState(res.html);
        if (!parsed.ok) return undefined;

        const snap = extractSnapshot(parsed.data, listingId);
        if (!snap.description_text) return undefined;

        return hashDescription(snap.description_text) !== jaDescriptionHash ? loc : undefined;
      } catch {
        return undefined;
      }
    }),
  );

  return ["ja", ...detected.filter((loc): loc is (typeof LOCALES)[number] => loc !== undefined)];
}

export function hashDescription(text: string): string {
  return createHash("sha1").update(text).digest("hex");
}
