import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db/client";
import { DimensionGrid } from "@/components/DimensionGrid";
import { ScoreCard } from "@/components/ScoreCard";

type Params = { params: Promise<{ id: string }> };

export default async function ResultPage({ params }: Params) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const rows = await db
    .select()
    .from(schema.diagnoses)
    .where(eq(schema.diagnoses.id, id))
    .limit(1);

  const d = rows[0];
  if (!d) notFound();

  const listingRows = await db
    .select()
    .from(schema.listings)
    .where(eq(schema.listings.id, d.listingId))
    .limit(1);
  const listing = listingRows[0];

  return (
    <main style={{ maxWidth: "var(--content-max)", margin: "0 auto", padding: "var(--s-6) var(--gutter)" }}>
      <div className="t-small" style={{ color: "var(--ink-500)", marginBottom: "var(--s-2)" }}>
        {listing?.url}
      </div>
      <h1 className="t-h1" style={{ marginBottom: "var(--s-5)" }}>{listing?.title ?? d.listingId}</h1>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: "var(--s-6)" }}>
        <div>
          <ScoreCard score={d.overallScore} />
          <DimensionGrid dimensions={d.dimensions as Parameters<typeof DimensionGrid>[0]["dimensions"]} />
        </div>
        <aside>
          <h2 className="t-h2">AI レポート</h2>
          <p className="t-editorial">
            {d.aiReportMd || "Plan 3 で AI レポートを実装します。"}
          </p>
        </aside>
      </div>
    </main>
  );
}
