import type { RequestHandler } from "express";

export function bearerAuth(): RequestHandler {
  return (req, res, next) => {
    const expected = process.env.SCRAPER_SECRET;
    if (!expected) {
      res.status(500).json({ error: "scraper_secret_not_set" });
      return;
    }

    const header = req.header("authorization") ?? "";
    const match = header.match(/^Bearer\s+(.+)$/i);
    if (!match || match[1] !== expected) {
      res.status(401).json({ error: "unauthorized" });
      return;
    }

    next();
  };
}
