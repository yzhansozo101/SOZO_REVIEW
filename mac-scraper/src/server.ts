import "dotenv/config";
import express from "express";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import { generateReport } from "./ai/claude-agent.js";
import { fetchPdpHtml } from "./airbnb/fetch-pdp.js";
import { parseDeferredState } from "./airbnb/parse-deferred.js";
import { extractSnapshot } from "./airbnb/extract.js";
import { fetchReviews } from "./airbnb/fetch-reviews.js";
import { detectLocales, hashDescription } from "./airbnb/locales.js";
import { bearerAuth } from "./auth.js";
import { log } from "./log.js";
import { scorePhotos } from "./score/photos.js";
import { scoreDescription } from "./score/description.js";
import { scoreAmenities } from "./score/amenities.js";
import { scoreReviews } from "./score/reviews.js";
import { aggregate } from "./score/index.js";
import type { Diagnosis } from "./types.js";

const diagnoseSchema = z.object({
  url: z.string().url(),
  compare_to_listing_id: z.string().optional(),
});

export function createApp() {
  const app = express();
  app.use(express.json({ limit: "1mb" }));

  app.get("/healthz", (_req, res) => {
    res.json({ ok: true });
  });

  app.post("/diagnose", bearerAuth(), async (req, res) => {
    const parsed = diagnoseSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "invalid_request" });
      return;
    }

    const url = parsed.data.url;
    const m = url.match(/\/rooms\/(\d+)/);
    if (!m) {
      res.status(400).json({ error: "invalid_url" });
      return;
    }
    const listingId = m[1];

    const pdp = await fetchPdpHtml(url);
    if (!pdp.ok) {
      res.status(502).json({ error: pdp.error });
      return;
    }

    const parsedDeferred = parseDeferredState(pdp.html);
    if (!parsedDeferred.ok) {
      res.status(502).json({ error: parsedDeferred.error });
      return;
    }

    const snapshot = extractSnapshot(parsedDeferred.data, listingId);
    const jaHash = snapshot.description_text ? hashDescription(snapshot.description_text) : "";
    const locales = jaHash ? await detectLocales(url, jaHash) : ["ja"];

    let reviews: Awaited<ReturnType<typeof fetchReviews>> = { ok: true, reviews: [] };
    if (snapshot.api_key && snapshot.reviews_persisted_hash) {
      reviews = await fetchReviews({
        listingId,
        apiKey: snapshot.api_key,
        persistedHash: snapshot.reviews_persisted_hash,
      });
    }
    const reviewList = reviews.ok ? reviews.reviews : [];

    const photosScore = scorePhotos(snapshot.photos);
    const descScore = scoreDescription(snapshot.description_text ?? "", locales);
    const amenScore = scoreAmenities(snapshot.amenities, snapshot.description_text ?? "");
    const reviewsScore = scoreReviews(snapshot.rating, reviewList);
    const titleScore = { score: 70 };

    const agg = aggregate({
      photos: photosScore,
      title: titleScore,
      description: descScore,
      amenities: amenScore,
      reviews: reviewsScore,
    });

    const ai = await generateReport(
      snapshot,
      {
        photos: photosScore,
        title: titleScore,
        description: descScore,
        amenities: amenScore,
        reviews: reviewsScore,
      },
      reviewList,
    );

    const aiBlock =
      ai.status === "ok"
        ? {
            report_md: ai.data.report_md,
            negative_keywords: ai.data.negative_keywords,
            top3: ai.data.top3,
            status: "ok" as const,
          }
        : {
            report_md: "AI 分析は現在利用できません。後ほどお試しください。",
            negative_keywords: [],
            top3: [],
            status: "fallback" as const,
          };

    const diagnosis: Diagnosis = {
      listing_id: listingId,
      title: snapshot.title ?? listingId,
      snapshot: snapshot as unknown as Record<string, unknown>,
      dimensions: {
        photos: photosScore,
        title: { score: 70, placeholder: true },
        description: descScore,
        amenities: amenScore,
        reviews: reviewsScore,
      },
      overall_score: agg.overall_score,
      grade: agg.grade,
      quality_status: agg.quality_status,
      ai: aiBlock,
      scrape_status: !reviews.ok ? "partial" : "ok",
    };

    log.info({ url, listingId, scrape_status: diagnosis.scrape_status }, "real diagnose");
    res.json(diagnosis);
  });

  return app;
}

const PORT = Number(process.env.PORT ?? 8787);

// Directly start the server when this file is run outside tests.
const isMain = fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  const app = createApp();
  app.listen(PORT, () => log.info({ port: PORT }, "mac-scraper listening"));
}
