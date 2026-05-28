import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db/client";
import { listings, diagnoses } from "@/lib/db/schema";
import { fetchDiagnosis } from "@/lib/scraper/client";
import { parseAirbnbUrl } from "@/lib/util/url";

const reqSchema = z.object({ url: z.string().min(1) });

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const parsed = reqSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const urlResult = parseAirbnbUrl(parsed.data.url);
  if (!urlResult.ok) {
    return NextResponse.json({ error: "invalid_url" }, { status: 400 });
  }

  // Plan 3 note: real Claude AI call can take 30-60s; bump from 45s default.
  // Plan 4 polish should revisit (Vercel Hobby caps at 60s — we'll need to optimize prompt).
  const scraped = await fetchDiagnosis(parsed.data.url, { timeoutMs: 120_000 });
  if (!scraped.ok) {
    const status = scraped.error === "timeout" ? 504 : 502;
    return NextResponse.json({ error: scraped.error }, { status });
  }

  const d = scraped.data;

  await db
    .insert(listings)
    .values({ id: d.listing_id, url: parsed.data.url, title: d.title })
    .onConflictDoUpdate({
      target: listings.id,
      set: { url: parsed.data.url, title: d.title, updatedAt: new Date() },
    });

  const inserted = await db
    .insert(diagnoses)
    .values({
      listingId: d.listing_id,
      overallScore: d.overall_score,
      grade: d.grade,
      qualityStatus: d.quality_status,
      dimensions: d.dimensions,
      snapshot: d.snapshot,
      aiReportMd: d.ai.report_md,
      aiNegativeKw: d.ai.negative_keywords,
      aiTop3: d.ai.top3,
      aiStatus: d.ai.status,
      scrapeStatus: d.scrape_status,
    })
    .returning({ id: diagnoses.id });

  const id = inserted[0].id;
  return NextResponse.json({ diagnosis_id: id, redirect: `/d/${id}` });
}
