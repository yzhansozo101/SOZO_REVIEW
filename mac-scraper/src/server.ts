import "dotenv/config";
import express from "express";
import { fileURLToPath } from "node:url";
import { log } from "./log.js";

export function createApp() {
  const app = express();
  app.use(express.json({ limit: "1mb" }));

  app.get("/healthz", (_req, res) => {
    res.json({ ok: true });
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
