import { render } from "@react-email/components";
import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { diagnoses, listings } from "@/lib/db/schema";
import { sendEmail } from "@/lib/email/resend";
import { F7WeeklyEmail } from "@/lib/email/weekly";

export async function POST() {
  const recent = await db
    .select({
      id: diagnoses.id,
      overallScore: diagnoses.overallScore,
      grade: diagnoses.grade,
      listingTitle: listings.title,
      reportMd: diagnoses.aiReportMd,
    })
    .from(diagnoses)
    .leftJoin(listings, eq(diagnoses.listingId, listings.id))
    .orderBy(desc(diagnoses.createdAt))
    .limit(50);

  const distribution = { A: 0, B: 0, C: 0, D: 0 };
  for (const r of recent) {
    const g = r.grade as "A" | "B" | "C" | "D";
    if (g in distribution) distribution[g]++;
  }

  const sorted = [...recent].sort((a, b) => a.overallScore - b.overallScore).slice(0, 3);
  const top3Worst = sorted.map((r) => ({
    title: r.listingTitle ?? "(不明)",
    grade: r.grade,
    score: r.overallScore,
    mainIssue: (r.reportMd ?? "").slice(0, 80).replace(/\n/g, " "),
  }));

  const weekOf = new Date().toISOString().slice(0, 10);
  const html = await render(
    F7WeeklyEmail({
      weekOf,
      totalDiagnosed: recent.length,
      distribution,
      top3Worst,
    })
  );

  const result = await sendEmail({
    to: process.env.ALERT_EMAIL_TO ?? "alerts@example.com",
    subject: `SOZONEXT 物件ヘルス週次サマリー · ${weekOf}`,
    html,
  });

  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 502 });
  return NextResponse.json({
    ok: true,
    dev: "dev" in result ? result.dev : false,
    recent_count: recent.length,
  });
}
