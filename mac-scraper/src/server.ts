import "dotenv/config";
import express from "express";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import { bearerAuth } from "./auth.js";
import { sampleDiagnosis } from "./fixtures/sample.js";
import { log } from "./log.js";

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

  app.post("/diagnose", bearerAuth(), (req, res) => {
    const parsed = diagnoseSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "invalid_request" });
      return;
    }

    log.info({ url: parsed.data.url }, "fixture diagnose");
    res.json(sampleDiagnosis);
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
