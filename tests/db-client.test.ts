import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("db client", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("DATABASE_URL", "");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("does not require DATABASE_URL while importing the module", async () => {
    await expect(import("@/lib/db/client")).resolves.toMatchObject({
      schema: expect.any(Object),
    });
  });

  it("requires DATABASE_URL when the database client is used", async () => {
    const { db } = await import("@/lib/db/client");

    expect(() => db.select()).toThrow("DATABASE_URL is not set");
  });
});
