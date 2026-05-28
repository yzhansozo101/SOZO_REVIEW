import type { Diagnosis } from "@/lib/types/diagnosis";

export type FetchResult =
  | { ok: true; data: Diagnosis }
  | { ok: false; error: "scrape_failed" | "timeout" | "config_missing" };

export type FetchOptions = {
  timeoutMs?: number;
};

export async function fetchDiagnosis(url: string, opts: FetchOptions = {}): Promise<FetchResult> {
  const base = process.env.SCRAPER_URL;
  const secret = process.env.SCRAPER_SECRET;
  if (!base || !secret) return { ok: false, error: "config_missing" };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), opts.timeoutMs ?? 45_000);

  try {
    const res = await fetch(`${base}/diagnose`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${secret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url }),
      signal: controller.signal,
    });
    if (!res.ok) return { ok: false, error: "scrape_failed" };
    const data = (await res.json()) as Diagnosis;
    return { ok: true, data };
  } catch (e) {
    if (e instanceof Error && e.name === "AbortError") {
      return { ok: false, error: "timeout" };
    }
    return { ok: false, error: "scrape_failed" };
  } finally {
    clearTimeout(timer);
  }
}
