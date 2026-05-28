import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db/client";
import { AIReport } from "@/components/AIReport";
import { AlertBar } from "@/components/AlertBar";
import { DimensionGrid } from "@/components/DimensionGrid";
import { QualityStatusLadder } from "@/components/QualityStatusLadder";
import { ScoreCard } from "@/components/ScoreCard";
import { TrendChart } from "@/components/TrendChart";
import type { QualityStatus } from "@/lib/util/quality";

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

  const alertRows = await db
    .select()
    .from(schema.alertsSent)
    .where(eq(schema.alertsSent.diagnosisId, id))
    .limit(1);
  const alert = alertRows[0];

  return (
    <main style={{ maxWidth: "var(--content-max)", margin: "0 auto", padding: "var(--s-6) var(--gutter)" }}>
      <div className="t-small" style={{ color: "var(--ink-500)", marginBottom: "var(--s-2)" }}>
        {listing?.url}
      </div>
      <h1 className="t-h1" style={{ marginBottom: "var(--s-6)" }}>{listing?.title ?? d.listingId}</h1>

      <div className="result-grid">
        <div>
          <ScoreCard score={d.overallScore} />
          <QualityStatusLadder current={(d.qualityStatus as QualityStatus) ?? "Good"} />
          <DimensionGrid dimensions={d.dimensions as Parameters<typeof DimensionGrid>[0]["dimensions"]} />
          <TrendChart current={d.overallScore} />
          <AlertBar
            score={d.overallScore}
            alertSent={!!alert}
            alertEmailTo={alert?.emailTo ?? process.env.ALERT_EMAIL_TO ?? "(未設定)"}
            diagnosisId={id}
          />
        </div>
        <div className="result-report">
          <AIReport
            diagnosisId={id}
            reportMd={d.aiReportMd}
            top3={(d.aiTop3 as Parameters<typeof AIReport>[0]["top3"] | null) ?? []}
            negativeKeywords={(d.aiNegativeKw as Parameters<typeof AIReport>[0]["negativeKeywords"] | null) ?? []}
            status={d.aiStatus === "ok" ? "ok" : "fallback"}
          />
        </div>
      </div>

      <style>{`
        .result-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr);
          gap: var(--s-6);
        }

        .result-report > aside {
          position: static !important;
        }

        @media (min-width: 1024px) {
          .result-grid {
            grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
          }

          .result-report > aside {
            position: sticky !important;
            top: var(--s-5) !important;
          }
        }
      `}</style>
    </main>
  );
}
