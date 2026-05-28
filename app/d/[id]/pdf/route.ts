import { renderToStream } from "@react-pdf/renderer";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { diagnoses, listings } from "@/lib/db/schema";
import { DiagnosisReport } from "@/lib/pdf/report";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) {
    return new Response("Not Found", { status: 404 });
  }

  const rows = await db
    .select()
    .from(diagnoses)
    .where(eq(diagnoses.id, id))
    .limit(1);
  const d = rows[0];
  if (!d) return new Response("Not Found", { status: 404 });

  const listingRows = await db
    .select()
    .from(listings)
    .where(eq(listings.id, d.listingId))
    .limit(1);
  const listing = listingRows[0];

  const stream = await renderToStream(
    DiagnosisReport({
      listingId: d.listingId,
      listingTitle: listing?.title ?? null,
      url: listing?.url ?? null,
      diagnosedAt: d.createdAt,
      overallScore: d.overallScore,
      grade: d.grade,
      qualityStatus: d.qualityStatus,
      dimensions: d.dimensions as Parameters<typeof DiagnosisReport>[0]["dimensions"],
      reportMd: d.aiReportMd,
      top3: (d.aiTop3 as Parameters<typeof DiagnosisReport>[0]["top3"] | null) ?? [],
    })
  );

  const yyyymmdd = new Date(d.createdAt)
    .toISOString()
    .slice(0, 10)
    .replace(/-/g, "");
  const filename = `SOZO_REVIEW_${d.listingId}_${yyyymmdd}.pdf`;

  return new Response(stream as unknown as ReadableStream, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
