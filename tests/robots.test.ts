import { describe, it, expect } from "vitest";
import robots from "../app/robots";

describe("robots.txt generator", () => {
  const result = robots();
  const rules = Array.isArray(result.rules) ? result.rules : [result.rules!];

  it("first rule is wildcard '*' with allow / disallow /d/ + /api/", () => {
    expect(rules[0].userAgent).toBe("*");
    expect(rules[0].allow).toBe("/");
    expect(rules[0].disallow).toEqual(["/d/", "/api/"]);
  });

  it("explicitly allows the 9 critical AI crawlers we care about", () => {
    const uas = rules.map((r) => r.userAgent);
    // Critical for the AI-search demo path
    expect(uas).toContain("GPTBot");
    expect(uas).toContain("ChatGPT-User");
    expect(uas).toContain("ClaudeBot");
    expect(uas).toContain("Claude-Web");
    expect(uas).toContain("PerplexityBot");
    expect(uas).toContain("Perplexity-User");
    expect(uas).toContain("Google-Extended");
    expect(uas).toContain("Bingbot");
    expect(uas).toContain("Applebot-Extended");
  });

  it("every AI/search rule disallows /d/ (user privacy)", () => {
    for (const rule of rules) {
      const disallow = Array.isArray(rule.disallow) ? rule.disallow : [rule.disallow!];
      expect(disallow).toContain("/d/");
    }
  });

  it("every AI/search rule disallows /api/ (internal)", () => {
    for (const rule of rules) {
      const disallow = Array.isArray(rule.disallow) ? rule.disallow : [rule.disallow!];
      expect(disallow).toContain("/api/");
    }
  });

  it("declares sitemap URL pointing to production", () => {
    expect(result.sitemap).toBe("https://sozonext-review.vercel.app/sitemap.xml");
  });

  it("declares host", () => {
    expect(result.host).toBe("https://sozonext-review.vercel.app");
  });
});
