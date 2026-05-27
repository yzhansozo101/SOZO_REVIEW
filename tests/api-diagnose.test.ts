import { describe, it, expect, beforeEach, vi } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/scraper/client", () => ({
  fetchDiagnosis: vi.fn(),
}));
vi.mock("@/lib/db/client", () => {
  const inserted = { id: "00000000-0000-0000-0000-000000000001" };
  const onConflictDoUpdate = vi.fn().mockResolvedValue(undefined);
  const valuesOnInsertListings = vi.fn().mockReturnValue({ onConflictDoUpdate });
  const valuesOnInsertDiagnoses = vi.fn().mockReturnValue({
    returning: vi.fn().mockResolvedValue([inserted]),
  });
  const insert = vi.fn().mockImplementation((table) => {
    const nameSymbol = Object.getOwnPropertySymbols(table).find(
      (symbol) => symbol.description === "drizzle:Name"
    );
    const tableName = (table as { _: { name?: string } })._?.name ?? table[nameSymbol!];
    if (tableName === "listings") {
      return { values: valuesOnInsertListings };
    }
    return { values: valuesOnInsertDiagnoses };
  });
  return { db: { insert }, schema: {} };
});

import { fetchDiagnosis } from "@/lib/scraper/client";
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
});
