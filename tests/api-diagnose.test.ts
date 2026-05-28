import { describe, it, expect, beforeEach, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  listingValues: vi.fn(),
  listingOnConflictDoUpdate: vi.fn().mockResolvedValue(undefined),
  diagnosisValues: vi.fn(),
  diagnosisReturning: vi.fn().mockResolvedValue([{ id: "00000000-0000-0000-0000-000000000001" }]),
  alertValues: vi.fn(),
  alertOnConflictDoNothing: vi.fn().mockResolvedValue(undefined),
  sendEmail: vi.fn(),
}));

vi.mock("@/lib/scraper/client", () => ({
  fetchDiagnosis: vi.fn(),
}));
vi.mock("@/lib/db/client", () => {
  mocks.listingValues.mockReturnValue({ onConflictDoUpdate: mocks.listingOnConflictDoUpdate });
  mocks.diagnosisValues.mockReturnValue({ returning: mocks.diagnosisReturning });
  mocks.alertValues.mockReturnValue({ onConflictDoNothing: mocks.alertOnConflictDoNothing });

  const insert = vi.fn().mockImplementation((table) => {
    const nameSymbol = Object.getOwnPropertySymbols(table).find(
      (symbol) => symbol.description === "drizzle:Name"
    );
    const tableName = (table as { _: { name?: string } })._?.name ?? table[nameSymbol!];
    if (tableName === "listings") {
      return { values: mocks.listingValues };
    }
    if (tableName === "alerts_sent") {
      return { values: mocks.alertValues };
    }
    return { values: mocks.diagnosisValues };
  });
  return { db: { insert }, schema: {} };
});
vi.mock("@/lib/email/resend", () => ({
  sendEmail: mocks.sendEmail,
}));

import { fetchDiagnosis } from "@/lib/scraper/client";
import { sendEmail } from "@/lib/email/resend";
import { POST } from "@/app/api/diagnose/route";
import type { Diagnosis } from "@/lib/types/diagnosis";

const sample: Diagnosis = {
  listing_id: "9999",
  title: "Test",
  snapshot: {},
  dimensions: {
    photos: { score: 95 },
    title: { score: 70 },
    description: { score: 88 },
    amenities: { score: 75 },
    reviews: { score: 99 },
  },
  overall_score: 86,
  grade: "B",
  quality_status: "Good",
  ai: { report_md: "", negative_keywords: [], top3: [], status: "fallback" },
  scrape_status: "ok",
};

function mkReq(body: unknown) {
  return new NextRequest("http://localhost/api/diagnose", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

beforeEach(() => {
  vi.mocked(fetchDiagnosis).mockReset();
  mocks.listingValues.mockClear();
  mocks.listingOnConflictDoUpdate.mockClear();
  mocks.diagnosisValues.mockClear();
  mocks.diagnosisReturning.mockClear();
  mocks.alertValues.mockClear();
  mocks.alertOnConflictDoNothing.mockClear();
  vi.mocked(sendEmail).mockReset();
  vi.mocked(sendEmail).mockResolvedValue({ ok: true, id: "resend_123", dev: false });
});

describe("POST /api/diagnose", () => {
  it("400 on missing url", async () => {
    const res = await POST(mkReq({}));
    expect(res.status).toBe(400);
  });

  it("400 on non-airbnb url", async () => {
    const res = await POST(mkReq({ url: "https://booking.com/foo" }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("invalid_url");
  });

  it("502 when scraper fails", async () => {
    vi.mocked(fetchDiagnosis).mockResolvedValue({ ok: false, error: "scrape_failed" });
    const res = await POST(mkReq({ url: "https://www.airbnb.jp/rooms/9999" }));
    expect(res.status).toBe(502);
  });

  it("200 with diagnosis_id and redirect on success", async () => {
    vi.mocked(fetchDiagnosis).mockResolvedValue({ ok: true, data: sample });
    const res = await POST(mkReq({ url: "https://www.airbnb.jp/rooms/9999" }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.diagnosis_id).toBe("00000000-0000-0000-0000-000000000001");
    expect(body.redirect).toBe("/d/00000000-0000-0000-0000-000000000001");
  });

  it("sends an F1 alert and records it when overall_score is below 60", async () => {
    const lowScore = {
      ...sample,
      overall_score: 55,
      grade: "D" as const,
      ai: {
        ...sample.ai,
        top3: [{ issue: "写真が少ない", action: "リビング写真を追加", impact: "予約率改善" }],
      },
    };
    vi.mocked(fetchDiagnosis).mockResolvedValue({ ok: true, data: lowScore });

    const res = await POST(mkReq({ url: "https://www.airbnb.jp/rooms/9999" }));

    expect(res.status).toBe(200);
    expect(sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "alerts@example.com",
        subject: "⚠️ 物件アラート · Test · 評価 55",
        html: expect.stringContaining("リビング写真を追加"),
        tags: [{ name: "diagnosis_id", value: "00000000-0000-0000-0000-000000000001" }],
      })
    );
    expect(mocks.alertValues).toHaveBeenCalledWith({
      diagnosisId: "00000000-0000-0000-0000-000000000001",
      emailTo: "alerts@example.com",
      resendId: "resend_123",
    });
    expect(mocks.alertOnConflictDoNothing).toHaveBeenCalled();
  });

  it("still returns the diagnosis response when F1 alert sending throws", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    vi.mocked(sendEmail).mockRejectedValue(new Error("email down"));
    vi.mocked(fetchDiagnosis).mockResolvedValue({
      ok: true,
      data: { ...sample, overall_score: 55, grade: "D" },
    });

    const res = await POST(mkReq({ url: "https://www.airbnb.jp/rooms/9999" }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.redirect).toBe("/d/00000000-0000-0000-0000-000000000001");
    expect(mocks.alertValues).not.toHaveBeenCalled();
  });
});
