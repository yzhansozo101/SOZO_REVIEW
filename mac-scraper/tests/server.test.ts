import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { createApp } from "../src/server.js";

beforeAll(() => {
  process.env.SCRAPER_SECRET = "test-secret";
});

describe("auth", () => {
  it("rejects unauthenticated POST /diagnose with 401", async () => {
    const app = createApp();
    const res = await request(app).post("/diagnose").send({ url: "x" });
    expect(res.status).toBe(401);
  });

  it("rejects wrong bearer with 401", async () => {
    const app = createApp();
    const res = await request(app)
      .post("/diagnose")
      .set("Authorization", "Bearer wrong")
      .send({ url: "x" });
    expect(res.status).toBe(401);
  });

  it("accepts correct bearer (forwards to handler; expect 400 since body is invalid)", async () => {
    const app = createApp();
    const res = await request(app)
      .post("/diagnose")
      .set("Authorization", "Bearer test-secret")
      .send({});
    // Task 11 handler validates body with zod -> 400 invalid_request
    expect(res.status).toBe(400);
  });

  it("/healthz is open(no auth)", async () => {
    const app = createApp();
    const res = await request(app).get("/healthz");
    expect(res.status).toBe(200);
  });
});
