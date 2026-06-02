import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { and, desc, eq, ne } from "drizzle-orm";
import { db, schema } from "@/lib/db/client";
import { AIReport } from "@/components/AIReport";
import { SupportCta } from "@/components/SupportCta";
import { DiffArrow } from "@/components/DiffArrow";
import { DimensionGrid } from "@/components/DimensionGrid";
import { PdfDownloadButton } from "@/components/PdfDownloadButton";
import { QualityStatusLadder } from "@/components/QualityStatusLadder";
import { ScoreCard } from "@/components/ScoreCard";
import { TrendChart } from "@/components/TrendChart";
import type { QualityStatus } from "@/lib/util/quality";

// User-private diagnostic result page — must not be indexed.
// Belt-and-suspenders with robots.txt disallow on `/d/`.
// Design: docs/system-design-geo.md §4.9
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

type Params = { params: Promise<{ id: string }> };

function formatDate(d: Date | null | undefined) {
  if (!d) return "";
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d);
}

function SectionLabel({ n, title }: { n: string; title: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        marginBottom: 2,
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-sans)",
          fontFeatureSettings: "'tnum' 1",
          fontSize: 12,
          fontWeight: 600,
          color: "var(--sozonext-navy)",
          background: "var(--sozonext-navy-50)",
          border: "1px solid var(--sozonext-navy-100)",
          padding: "2px 8px",
          borderRadius: "var(--r-pill)",
          letterSpacing: 0.4,
        }}
      >
        {n}
      </span>
      <span
        style={{
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: 0.8,
          textTransform: "uppercase",
          color: "var(--ink-500)",
        }}
      >
        {title}
      </span>
      <span
        aria-hidden="true"
        style={{
          flex: 1,
          height: 1,
          background: "var(--ink-100)",
          marginLeft: 4,
        }}
      />
    </div>
  );
}

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

  const previousRows = await db
    .select({ score: schema.diagnoses.overallScore })
    .from(schema.diagnoses)
    .where(and(eq(schema.diagnoses.listingId, d.listingId), ne(schema.diagnoses.id, d.id)))
    .orderBy(desc(schema.diagnoses.createdAt))
    .limit(1);
  const previousScore = previousRows[0]?.score ?? null;

  const listingRows = await db
    .select()
    .from(schema.listings)
    .where(eq(schema.listings.id, d.listingId))
    .limit(1);
  const listing = listingRows[0];

  const createdAt = d.createdAt instanceof Date ? d.createdAt : d.createdAt ? new Date(d.createdAt as unknown as string) : null;

  return (
    <main>
      <section className="report-header">
        <div
          style={{
            maxWidth: "var(--content-max)",
            margin: "0 auto",
            padding: "var(--s-7) var(--gutter) var(--s-6)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: "var(--s-4)",
              flexWrap: "wrap",
            }}
          >
            <div style={{ minWidth: 0, flex: "1 1 320px" }}>
              <span className="eyebrow-chip" style={{ marginBottom: "var(--s-3)" }}>
                診断レポート
              </span>
              <h1
                className="t-h1"
                style={{
                  margin: "var(--s-3) 0 var(--s-2)",
                  fontSize: "clamp(28px, 3.6vw, 40px)",
                  letterSpacing: "-0.015em",
                  lineHeight: 1.2,
                }}
              >
                {listing?.title ?? d.listingId}
              </h1>
              {listing?.url && (
                <a
                  href={listing.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="t-mono"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    color: "var(--ink-500)",
                    fontSize: 13,
                    textDecoration: "none",
                    wordBreak: "break-all",
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M10 13a5 5 0 0 0 7.07 0l2.12-2.12a5 5 0 0 0-7.07-7.07l-1.22 1.22"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M14 11a5 5 0 0 0-7.07 0l-2.12 2.12a5 5 0 0 0 7.07 7.07l1.22-1.22"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {listing.url}
                </a>
              )}
              {createdAt && (
                <div
                  className="t-small"
                  style={{ color: "var(--ink-500)", marginTop: "var(--s-2)" }}
                >
                  診断日: {formatDate(createdAt)}
                </div>
              )}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--s-3)",
                flexShrink: 0,
              }}
            >
              <DiffArrow current={d.overallScore} previous={previousScore} />
              <PdfDownloadButton diagnosisId={id} />
            </div>
          </div>
        </div>
      </section>

      <div
        style={{
          maxWidth: "var(--content-max)",
          margin: "0 auto",
          padding: "var(--s-6) var(--gutter) var(--s-8)",
        }}
      >
        <div className="result-grid">
          <div style={{ display: "grid", gap: "var(--s-6)", minWidth: 0 }}>
            <section style={{ display: "grid", gap: "var(--s-3)" }}>
              <SectionLabel n="01" title="概要" />
              <ScoreCard
                score={d.overallScore}
                dimensions={d.dimensions as Parameters<typeof DimensionGrid>[0]["dimensions"]}
              />
            </section>

            <section style={{ display: "grid", gap: "var(--s-3)" }}>
              <SectionLabel n="02" title="品質ステータス" />
              <QualityStatusLadder current={(d.qualityStatus as QualityStatus) ?? "Good"} />
            </section>

            <a
              href="#top3-priorities"
              className="next-step-banner"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "var(--s-3)",
                padding: "var(--s-4) var(--s-5)",
                background:
                  "linear-gradient(135deg, var(--sozonext-navy) 0%, var(--sozonext-navy-700) 100%)",
                color: "var(--text-on-navy)",
                borderRadius: "var(--r-lg)",
                textDecoration: "none",
                boxShadow: "0 10px 28px -16px rgba(2, 66, 128, 0.55)",
              }}
            >
              <div style={{ display: "grid", gap: 2 }}>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: 1,
                    textTransform: "uppercase",
                    opacity: 0.7,
                  }}
                >
                  Next step
                </span>
                <span style={{ fontSize: 16, fontWeight: 600 }}>
                  AI レポートで Top 3 改善アクションを確認
                </span>
              </div>
              <span
                aria-hidden="true"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "var(--r-pill)",
                  background: "rgba(255, 255, 255, 0.18)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M5 12h14M13 6l6 6-6 6"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </a>

            <section style={{ display: "grid", gap: "var(--s-3)" }}>
              <SectionLabel n="03" title="5 項目内訳" />
              <DimensionGrid
                dimensions={d.dimensions as Parameters<typeof DimensionGrid>[0]["dimensions"]}
              />
            </section>

            <section style={{ display: "grid", gap: "var(--s-3)" }}>
              <SectionLabel n="04" title="評価推移" />
              <TrendChart current={d.overallScore} />
            </section>

            <section style={{ display: "grid", gap: "var(--s-3)" }}>
              <SectionLabel n="05" title="サポート" />
              <SupportCta />
            </section>
          </div>
          <div className="result-report" style={{ minWidth: 0 }}>
            <AIReport
              diagnosisId={id}
              reportMd={d.aiReportMd}
              top3={(d.aiTop3 as Parameters<typeof AIReport>[0]["top3"] | null) ?? []}
              negativeKeywords={
                (d.aiNegativeKw as Parameters<typeof AIReport>[0]["negativeKeywords"] | null) ?? []
              }
              status={d.aiStatus === "ok" ? "ok" : "fallback"}
            />
          </div>
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

        .next-step-banner {
          transition: transform var(--t-base-d) var(--ease-out), box-shadow var(--t-base-d) var(--ease-out);
        }
        .next-step-banner:hover {
          transform: translateY(-2px);
          box-shadow: 0 16px 36px -16px rgba(2, 66, 128, 0.7);
        }
        .next-step-banner:focus-visible {
          outline: none;
          box-shadow: var(--shadow-focus);
        }

        @media (min-width: 1024px) {
          .result-grid {
            grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr);
          }

          .result-report > aside {
            position: sticky !important;
            top: var(--s-5) !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .next-step-banner:hover { transform: none; }
        }
      `}</style>
    </main>
  );
}
