import { describe, it, expect } from "vitest";
import { homepageGraph, SITE_URL } from "../lib/schema";

describe("homepageGraph (JSON-LD)", () => {
  const graph = homepageGraph();

  it("contains exactly 3 nodes: Organization + WebSite + WebApplication", () => {
    expect(graph).toHaveLength(3);
    const types = graph.map((n) => (n as { "@type": string })["@type"]);
    expect(types).toEqual(["Organization", "WebSite", "WebApplication"]);
  });

  it("Organization has SOZONEXT name + site URL", () => {
    const org = graph[0] as Record<string, unknown>;
    expect(org.name).toBe("SOZONEXT");
    expect(org.url).toBe(`${SITE_URL}/`);
    expect(org["@id"]).toBe(`${SITE_URL}/#org`);
  });

  it("WebSite publisher links to Organization @id", () => {
    const site = graph[1] as Record<string, { "@id": string }>;
    expect(site.publisher["@id"]).toBe(`${SITE_URL}/#org`);
    expect((site as unknown as Record<string, string>).inLanguage).toBe("ja-JP");
  });

  it("WebApplication publisher links to Organization @id + free offer", () => {
    const app = graph[2] as Record<string, unknown>;
    expect((app.publisher as { "@id": string })["@id"]).toBe(`${SITE_URL}/#org`);
    expect(app.applicationCategory).toBe("BusinessApplication");
    expect((app.offers as { price: string }).price).toBe("0");
  });

  it("WebApplication description contains niche keywords", () => {
    const app = graph[2] as Record<string, string>;
    // critical low-competition phrases AI search should pick up
    expect(app.description).toContain("5 維度評価");
    expect(app.description).toContain("スーパーホスト維持");
    expect(app.description).toContain("Airbnb 検索順位");
  });

  it("returns same content on repeated calls (referential safety)", () => {
    const a = homepageGraph();
    const b = homepageGraph();
    expect(a).toEqual(b);
  });
});
