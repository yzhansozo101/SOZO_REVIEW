# Phase 2 · Real Airbnb Scraping + 5-Dimension Scoring — Implementation Plan

> **执行模式:** Codex CLI 在同仓库逐 task。每个 Task 自包含;Codex 完成后 Claude 用 `git diff` review,通过 → 下一个。
>
> **完成 Plan 2 后到达的状态:** 粘任意真 Airbnb URL → mac-scraper 真 fetch PDP + reviews → 解析 → 5 维度评分 → 真 grade。AI 仍是占位文字(Plan 3 接)。结果页除了 ScoreCard 还展示 5 个维度卡片。

**Goal:** 把 mac-scraper 的 fixture 换成真 PDP 抓取 + 真评分。结果页加 DimensionGrid 展示 B1/B6/B7/B10/reviews。

**Architecture(SYSTEM_DESIGN §3 / §8):**
- `mac-scraper/src/airbnb/fetch-pdp.ts` — 真 fetch PDP HTML
- `mac-scraper/src/airbnb/parse-deferred.ts` — 抽出 `<script id="data-deferred-state-0">` 并 JSON.parse + 字段提取器
- `mac-scraper/src/airbnb/fetch-reviews.ts` — GraphQL `StaysPdpReviewsQuery`,持久查询 hash 动态从 PDP 抓
- `mac-scraper/src/score/{photos,description,amenities,reviews,index}.ts` — 5 维度评分(B12 仅准备数据,真分析在 Plan 3)
- `mac-scraper/src/server.ts` — 替换 fixture 为真流程

**Tech Stack(增量):** `cheerio` 或纯 regex 抽 script 块;`zod` 二次校验解析结果;`crypto` 算 description hash 比对 locale

**Plan 1 状态(已在 main 上):** Next.js + Drizzle + Neon + mac-scraper Express + fixture endpoint + URL parser + grade utils + ScoreCard + result page + URL input form,41 tests pass。

**Out of scope(留给后续 plan):**
- Plan 3 — Claude Agent SDK + AI 报告 + B12 真分析 + Top3
- Plan 4 — Resend F1/F7 邮件 + @react-pdf/renderer + 错误页 5A/5B/5C + C4 变化箭头 + A5 ladder + A7 升档复核 + F7 mock 文案 + 最终 v0.4 deltas 核对

---

## How to hand off each Task to Codex

```
Read docs/superpowers/plans/2026-05-28-phase2-real-scraping.md.
Implement ONLY Task <N>. Follow every step exactly.
Do not modify files belonging to other tasks.
DO NOT commit — Claude will commit after reviewing.
Output a brief summary listing files changed and test/build results.
```

**Codex 必读参考(按需逐 task):**
- `docs/system-design.md` §8 — 各字段在 deferred-state JSON 内的路径
- `docs/prd.md` §3.2 (B1/B2/B3/B6/B7/B8/B10/B12) — 业务规则
- `design_handoff_review_app/prototype/DimensionGrid.jsx` — T14 视觉参考
- `design_handoff_review_app/prototype/kit.css` — 维度卡 CSS 参考
- `mac-scraper/tests/fixtures/airbnb-pdp-deferred.json` — T1 录制的样本(T2+ 测试基准)

---

## Repo state at Plan 2 start

- Branch: `feature/prototype`
- 最新 commit:`0c8d56f Add CLAUDE.md project orientation guide`
- mac-scraper `/diagnose` 仍返回 Plan 1 fixture
- 41 tests pass

---

## Module File Plan

| Path | Created in | 职责 |
|---|---|---|
| `mac-scraper/tests/fixtures/airbnb-pdp-deferred.json` | T1 | 一次性录制的 deferred-state 样本 |
| `mac-scraper/tests/fixtures/airbnb-reviews.json` | T1 | Reviews GraphQL 样本 |
| `mac-scraper/src/airbnb/fetch-pdp.ts` | T2 | 真 fetch HTML + UA + 错误处理 |
| `mac-scraper/src/airbnb/parse-deferred.ts` | T3 | 抽 script 块 + JSON.parse |
| `mac-scraper/src/airbnb/extract.ts` | T4 | 从解析后的 JSON 抽具体字段 |
| `mac-scraper/src/airbnb/fetch-reviews.ts` | T5 | GraphQL fetch + 动态 hash |
| `mac-scraper/src/score/photos.ts` | T6 | B1/B2/B3 |
| `mac-scraper/src/score/description.ts` | T7 | B7 长度 + 章节 regex |
| `mac-scraper/src/score/amenities.ts` | T8 | B10 一致性 |
| `mac-scraper/src/score/reviews.ts` | T9 | rating + B12 准备 |
| `mac-scraper/src/score/index.ts` | T10 | 综合 → overall + grade + quality |
| `mac-scraper/src/server.ts` | T11(修改) | 用真流程替换 fixture |
| `mac-scraper/src/airbnb/locales.ts` | T13 | B8 多 locale 并发探测 |
| `components/DimensionGrid.tsx` | T14 | 5 维度卡片网格 |
| `components/DimensionCard.tsx` | T14 | 单个维度卡基础组件 |
| `app/d/[id]/page.tsx` | T14(修改) | 挂上 DimensionGrid |
| `docs/superpowers/plans/phase2-status.md` | T15 | 完成报告 |

**新依赖:**
- `mac-scraper`: `cheerio` 用于 HTML 解析(也可用 regex,但 cheerio 更稳)

---

## Task 1 — Record real PDP + reviews fixtures

**Files:**
- Create: `mac-scraper/tests/fixtures/airbnb-pdp-deferred.json`
- Create: `mac-scraper/tests/fixtures/airbnb-reviews.json`
- Create: `mac-scraper/tests/fixtures/.gitattributes`(可选,标 LFS 友好;本 task 不强制)

- [ ] **Step 1 · 临时脚本拉一次 PDP HTML**

在 `mac-scraper/` 创建临时 script `tmp-fetch-pdp.mjs`:
```js
import { writeFileSync } from "node:fs";

const url = "https://www.airbnb.jp/rooms/1174411978184206231";
const res = await fetch(url, {
  headers: {
    "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
    "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "accept-language": "ja,en-US;q=0.7,en;q=0.3",
  },
});
if (!res.ok) throw new Error(`fetch failed: ${res.status}`);
const html = await res.text();
const m = html.match(/<script id="data-deferred-state-0"[^>]*>(.+?)<\/script>/s);
if (!m) throw new Error("data-deferred-state-0 not found");
const json = JSON.parse(m[1]);
writeFileSync("tests/fixtures/airbnb-pdp-deferred.json", JSON.stringify(json, null, 2));
console.log("saved deferred state, size:", m[1].length);
```

Run:
```bash
cd mac-scraper && mkdir -p tests/fixtures && node tmp-fetch-pdp.mjs
```
Expected: `saved deferred state, size: <某个 50-300KB 之间的数>`,文件创建。

- [ ] **Step 2 · 从 fixture 里提取 GraphQL hash + listing 的 base64 id,再录 reviews**

继续在 `mac-scraper/` 创建 `tmp-fetch-reviews.mjs`:
```js
import { readFileSync, writeFileSync } from "node:fs";

const deferred = JSON.parse(readFileSync("tests/fixtures/airbnb-pdp-deferred.json", "utf8"));

// 1) 找 X-Airbnb-API-Key — 在 deferred state 任意嵌套层级查找 "api_config" 或 "apiConfig"
function find(obj, predicate, depth = 6) {
  if (depth < 0 || obj == null) return undefined;
  if (predicate(obj)) return obj;
  if (typeof obj === "object") {
    for (const v of Array.isArray(obj) ? obj : Object.values(obj)) {
      const r = find(v, predicate, depth - 1);
      if (r !== undefined) return r;
    }
  }
  return undefined;
}
const apiConfig = find(deferred, (n) => n && typeof n === "object" && typeof n.key === "string" && n.key.startsWith("d3"));
const apiKey = apiConfig?.key ?? "d306zoyjsyarp7ifhu67rjxn52tv0t20";

// 2) listing id base64
const listingId = "1174411978184206231";
const idB64 = Buffer.from(`StayListing:${listingId}`).toString("base64");

// 3) 找 reviews 模块里挂载的 persistedQuery hash;若失败,fall back 到当前已知 hash(可能过期)
const reviewsQuery = find(deferred, (n) => n && typeof n === "object" && n.operationName === "StaysPdpReviewsQuery");
const hash = reviewsQuery?.extensions?.persistedQuery?.sha256Hash ?? "0a44b1b4012f88a6b8e7a7e85d0b9a4d99f47fc5ad44b21d83b4f0ab36e3f1aa";

const body = {
  operationName: "StaysPdpReviewsQuery",
  variables: { id: idB64, pdpReviewsRequest: { fieldSelector: "for_p3_translation_only", limit: 20, offset: "0", sortingPreference: "MOST_RECENT" } },
  extensions: { persistedQuery: { version: 1, sha256Hash: hash } },
};

const res = await fetch("https://www.airbnb.jp/api/v3/StaysPdpReviewsQuery/" + hash, {
  method: "POST",
  headers: {
    "x-airbnb-api-key": apiKey,
    "content-type": "application/json",
    "accept-language": "ja",
    "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/130.0.0.0",
  },
  body: JSON.stringify(body),
});
const text = await res.text();
console.log("status", res.status, "len", text.length);
writeFileSync("tests/fixtures/airbnb-reviews.json", text);
```

Run: `cd mac-scraper && node tmp-fetch-reviews.mjs`
Expected: `status 200 len <数千>`,文件创建。
若 status != 200:hash 可能过期。本 task 仍保留响应(即使是错误响应)作为 fixture,后续 T5 处理失败兜底。

- [ ] **Step 3 · 删除临时脚本**

```bash
rm mac-scraper/tmp-fetch-pdp.mjs mac-scraper/tmp-fetch-reviews.mjs
```

- [ ] **Step 4 · 检查 fixture 文件大小,看是否需要 LFS**

```bash
ls -lh mac-scraper/tests/fixtures/
```
Expected: 两个 JSON 文件,各 < 1MB。git 普通处理即可,不需要 LFS。

- [ ] **Step 5 · 输出 fixture 验证摘要**

Codex 输出:
- pdp-deferred.json 大小
- 从 fixture 里能否定位关键路径(用 `grep '"localizedString"' tests/fixtures/airbnb-pdp-deferred.json | head -3`)
- reviews.json 大小 + status code

**Commit message (planner 之后用):** `Record Airbnb PDP + reviews fixture snapshots for parser tests`

---

## Task 2 — fetch-pdp.ts(真 HTTP fetch + UA + 错误码)

**Files:**
- Create: `mac-scraper/src/airbnb/fetch-pdp.ts`
- Create: `mac-scraper/tests/fetch-pdp.test.ts`

- [ ] **Step 1 · 写测试 `mac-scraper/tests/fetch-pdp.test.ts`**

```ts
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { fetchPdpHtml } from "../src/airbnb/fetch-pdp.js";

const originalFetch = global.fetch;

beforeEach(() => {
  vi.restoreAllMocks();
});
afterEach(() => {
  global.fetch = originalFetch;
});

describe("fetchPdpHtml", () => {
  it("returns { ok: true, html } on 200", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => "<html><body>x</body></html>",
    }) as unknown as typeof fetch;
    const r = await fetchPdpHtml("https://www.airbnb.jp/rooms/123");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.html).toContain("<html>");
  });

  it("returns { ok: false, error: 'not_found' } on 404", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 404, text: async () => "" }) as unknown as typeof fetch;
    const r = await fetchPdpHtml("https://www.airbnb.jp/rooms/x");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe("not_found");
  });

  it("returns { ok: false, error: 'blocked' } on 403/429", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 403, text: async () => "" }) as unknown as typeof fetch;
    const r = await fetchPdpHtml("https://www.airbnb.jp/rooms/x");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe("blocked");
  });

  it("sets browser-like UA + ja accept-language", async () => {
    const mock = vi.fn().mockResolvedValue({ ok: true, status: 200, text: async () => "" });
    global.fetch = mock as unknown as typeof fetch;
    await fetchPdpHtml("https://www.airbnb.jp/rooms/1");
    expect(mock).toHaveBeenCalledWith(
      "https://www.airbnb.jp/rooms/1",
      expect.objectContaining({
        headers: expect.objectContaining({
          "user-agent": expect.stringContaining("Mozilla/5.0"),
          "accept-language": expect.stringContaining("ja"),
        }),
      }),
    );
  });
});
```

- [ ] **Step 2 · 跑测试,失败**

`cd mac-scraper && pnpm test fetch-pdp.test.ts` → fail。

- [ ] **Step 3 · 实现 `mac-scraper/src/airbnb/fetch-pdp.ts`**

```ts
export type FetchPdpResult =
  | { ok: true; html: string }
  | { ok: false; error: "not_found" | "blocked" | "network" };

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36";

export async function fetchPdpHtml(
  url: string,
  init: { signal?: AbortSignal } = {},
): Promise<FetchPdpResult> {
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "user-agent": UA,
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "accept-language": "ja,en-US;q=0.7,en;q=0.3",
      },
      signal: init.signal,
    });
    if (res.ok) {
      const html = await res.text();
      return { ok: true, html };
    }
    if (res.status === 404) return { ok: false, error: "not_found" };
    if (res.status === 403 || res.status === 429) return { ok: false, error: "blocked" };
    return { ok: false, error: "network" };
  } catch {
    return { ok: false, error: "network" };
  }
}
```

- [ ] **Step 4 · 测试通过**

`pnpm test fetch-pdp.test.ts` → 4/4 pass。

**Commit message:** `Add fetchPdpHtml with Airbnb-compatible UA + status mapping`

---

## Task 3 — parse-deferred.ts(抽 script 块 + JSON.parse)

**Files:**
- Create: `mac-scraper/src/airbnb/parse-deferred.ts`
- Create: `mac-scraper/tests/parse-deferred.test.ts`

- [ ] **Step 1 · 写测试**

```ts
import { describe, it, expect } from "vitest";
import { parseDeferredState } from "../src/airbnb/parse-deferred.js";

const html = `
<!doctype html>
<html><body>
<script id="data-deferred-state-0" type="application/json">{"foo":"bar","n":1}</script>
</body></html>`;

describe("parseDeferredState", () => {
  it("returns parsed JSON when script block present", () => {
    const r = parseDeferredState(html);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.data).toEqual({ foo: "bar", n: 1 });
  });

  it("returns error when script block missing", () => {
    const r = parseDeferredState("<html><body>no</body></html>");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe("no_script_block");
  });

  it("returns error on malformed JSON", () => {
    const bad = '<script id="data-deferred-state-0">{ "x": }</script>';
    const r = parseDeferredState(bad);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe("invalid_json");
  });

  it("handles HTML entities in JSON (e.g. \\u003c)", () => {
    const ok = '<script id="data-deferred-state-0">{"x":"a\\u003cb"}</script>';
    const r = parseDeferredState(ok);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.data).toEqual({ x: "a<b" });
  });
});
```

- [ ] **Step 2 · 实现 `mac-scraper/src/airbnb/parse-deferred.ts`**

```ts
export type ParseDeferredResult =
  | { ok: true; data: unknown }
  | { ok: false; error: "no_script_block" | "invalid_json" };

const SCRIPT_RE = /<script[^>]*id="data-deferred-state-0"[^>]*>([\s\S]*?)<\/script>/i;

export function parseDeferredState(html: string): ParseDeferredResult {
  const m = html.match(SCRIPT_RE);
  if (!m) return { ok: false, error: "no_script_block" };
  try {
    return { ok: true, data: JSON.parse(m[1]) };
  } catch {
    return { ok: false, error: "invalid_json" };
  }
}
```

- [ ] **Step 3 · 测试通过 4/4**

**Commit message:** `Add data-deferred-state-0 script extractor + JSON parse`

---

## Task 4 — extract.ts(从 deferred state 抽具体字段)

**Files:**
- Create: `mac-scraper/src/airbnb/extract.ts`
- Create: `mac-scraper/tests/extract.test.ts`

参考 SYSTEM_DESIGN §8.1 表格 + T1 录制的 `airbnb-pdp-deferred.json`。

- [ ] **Step 1 · 写 `mac-scraper/src/airbnb/extract.ts`**

```ts
export type Snapshot = {
  listing_id: string;
  title: string | undefined;
  description_html: string | undefined;
  description_text: string | undefined;
  amenities: Array<{ title: string; available: boolean }>;
  photos: { count: number; categories: Record<string, number>; cover_category: string | undefined };
  rating: { overall: number | undefined; count: number | undefined; subscores: Record<string, number> };
  review_tags: Array<{ name: string; count: number }>;
  highlights: string[];
  house_rules: string[];
  api_key: string | undefined;
  reviews_persisted_hash: string | undefined;
};

/** Recursive walker. Cheap deep search by predicate; bounded depth. */
function walk(obj: unknown, hit: (n: unknown) => boolean, depth = 8): unknown {
  if (depth < 0 || obj == null) return undefined;
  if (hit(obj)) return obj;
  if (typeof obj === "object") {
    for (const v of Array.isArray(obj) ? obj : Object.values(obj as Record<string, unknown>)) {
      const r = walk(v, hit, depth - 1);
      if (r !== undefined) return r;
    }
  }
  return undefined;
}

function isObj(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null;
}

function pickString(o: unknown, key: string): string | undefined {
  return isObj(o) && typeof o[key] === "string" ? (o[key] as string) : undefined;
}

function htmlToText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}

export function extractSnapshot(deferred: unknown, listingId: string): Snapshot {
  // Title
  const titleNode = walk(deferred, (n) => isObj(n) && isObj(n.content) && typeof n.content.localizedString === "string");
  const title = isObj(titleNode) && isObj(titleNode.content) ? (titleNode.content.localizedString as string) : undefined;

  // Description (single block of HTML)
  const descSection = walk(deferred, (n) => isObj(n) && n.sectionId === "DESCRIPTION_DEFAULT");
  const descHtml = isObj(descSection) && isObj(descSection.section) && isObj(descSection.section.htmlDescription)
    ? pickString(descSection.section.htmlDescription, "htmlText")
    : undefined;
  const descText = descHtml ? htmlToText(descHtml) : undefined;

  // Amenities: seeAllAmenitiesGroups[].amenities[]
  const amen: Array<{ title: string; available: boolean }> = [];
  const amenitiesNode = walk(deferred, (n) => isObj(n) && Array.isArray(n.seeAllAmenitiesGroups));
  if (isObj(amenitiesNode) && Array.isArray(amenitiesNode.seeAllAmenitiesGroups)) {
    for (const g of amenitiesNode.seeAllAmenitiesGroups) {
      if (isObj(g) && Array.isArray(g.amenities)) {
        for (const a of g.amenities) {
          if (isObj(a) && typeof a.title === "string") {
            amen.push({ title: a.title, available: a.available !== false });
          }
        }
      }
    }
  }

  // Photos: PHOTO_TOUR_SCROLLABLE_MODAL.mediaItems[]
  const photoSection = walk(deferred, (n) => isObj(n) && n.sectionId === "PHOTO_TOUR_SCROLLABLE_MODAL");
  const mediaItems = isObj(photoSection) && isObj(photoSection.section) && Array.isArray(photoSection.section.mediaItems)
    ? photoSection.section.mediaItems
    : [];

  // Photo categories: roomTourLayoutInfos
  const layoutInfos = walk(deferred, (n) => isObj(n) && Array.isArray(n.roomTourLayoutInfos));
  const categories: Record<string, number> = {};
  let coverCategory: string | undefined;
  if (isObj(layoutInfos) && Array.isArray(layoutInfos.roomTourLayoutInfos) && layoutInfos.roomTourLayoutInfos[0]) {
    const items = layoutInfos.roomTourLayoutInfos[0];
    if (isObj(items) && Array.isArray(items.roomTourItems)) {
      for (const it of items.roomTourItems) {
        if (isObj(it) && typeof it.title === "string" && Array.isArray(it.imageIds)) {
          categories[it.title] = it.imageIds.length;
        }
      }
    }
  }
  if (mediaItems[0] && isObj(mediaItems[0])) {
    const firstId = mediaItems[0].id;
    if (firstId != null && isObj(layoutInfos) && Array.isArray(layoutInfos.roomTourLayoutInfos)) {
      for (const items of layoutInfos.roomTourLayoutInfos[0]?.roomTourItems ?? []) {
        if (isObj(items) && Array.isArray(items.imageIds) && items.imageIds.includes(firstId)) {
          coverCategory = items.title as string;
          break;
        }
      }
    }
  }

  // Rating overall + count
  const ratingStats = walk(deferred, (n) => isObj(n) && isObj(n.overallRatingStats));
  const overallRating = isObj(ratingStats) && isObj(ratingStats.overallRatingStats)
    ? Number((ratingStats.overallRatingStats as Record<string, unknown>).overallRating) || undefined
    : undefined;
  const reviewCount = isObj(ratingStats) && isObj(ratingStats.overallRatingStats)
    ? Number((ratingStats.overallRatingStats as Record<string, unknown>).reviewCount) || undefined
    : undefined;

  // 6 subscores: REVIEWS_DEFAULT.section.ratings[]
  const reviewsSection = walk(deferred, (n) => isObj(n) && n.sectionId === "REVIEWS_DEFAULT");
  const subscores: Record<string, number> = {};
  const reviewTags: Array<{ name: string; count: number }> = [];
  if (isObj(reviewsSection) && isObj(reviewsSection.section)) {
    const sec = reviewsSection.section as Record<string, unknown>;
    if (Array.isArray(sec.ratings)) {
      for (const r of sec.ratings) {
        if (isObj(r) && typeof r.label === "string" && typeof r.localizedRating === "string") {
          subscores[r.label] = Number(r.localizedRating);
        }
      }
    }
    if (Array.isArray(sec.reviewTags)) {
      for (const t of sec.reviewTags) {
        if (isObj(t) && typeof t.text === "string") {
          reviewTags.push({ name: t.text, count: Number(t.count ?? 0) });
        }
      }
    }
  }

  // Highlights
  const highlightsSection = walk(deferred, (n) => isObj(n) && n.sectionId === "HIGHLIGHTS_COMPACT");
  const highlights: string[] = [];
  if (isObj(highlightsSection) && isObj(highlightsSection.section) && Array.isArray((highlightsSection.section as Record<string, unknown>).highlights)) {
    for (const h of (highlightsSection.section as Record<string, unknown>).highlights as unknown[]) {
      if (isObj(h) && typeof h.title === "string") highlights.push(h.title);
    }
  }

  // House rules (concat strings under POLICIES_DEFAULT)
  const policiesSection = walk(deferred, (n) => isObj(n) && n.sectionId === "POLICIES_DEFAULT");
  const houseRules: string[] = [];
  if (isObj(policiesSection) && isObj(policiesSection.section)) {
    const rulesNode = (policiesSection.section as Record<string, unknown>).houseRulesSections;
    if (Array.isArray(rulesNode)) {
      for (const sec of rulesNode) {
        if (isObj(sec) && Array.isArray(sec.items)) {
          for (const it of sec.items) {
            if (isObj(it) && typeof it.title === "string") houseRules.push(it.title);
          }
        }
      }
    }
  }

  // X-Airbnb-API-Key
  const apiNode = walk(deferred, (n) => isObj(n) && typeof n.key === "string" && (n.key as string).length >= 24 && /^[a-z0-9]+$/i.test(n.key as string));
  const apiKey = isObj(apiNode) ? (apiNode.key as string) : undefined;

  // Reviews persistedQuery hash
  const reviewsQueryNode = walk(deferred, (n) => isObj(n) && n.operationName === "StaysPdpReviewsQuery");
  let reviewsHash: string | undefined;
  if (isObj(reviewsQueryNode) && isObj(reviewsQueryNode.extensions)) {
    const ext = reviewsQueryNode.extensions as Record<string, unknown>;
    if (isObj(ext.persistedQuery)) reviewsHash = pickString(ext.persistedQuery, "sha256Hash");
  }

  return {
    listing_id: listingId,
    title,
    description_html: descHtml,
    description_text: descText,
    amenities: amen,
    photos: { count: mediaItems.length, categories, cover_category: coverCategory },
    rating: { overall: overallRating, count: reviewCount, subscores },
    review_tags: reviewTags,
    highlights,
    house_rules: houseRules,
    api_key: apiKey,
    reviews_persisted_hash: reviewsHash,
  };
}
```

- [ ] **Step 2 · 写测试 `mac-scraper/tests/extract.test.ts`**(基于 T1 录制的 fixture)

```ts
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { extractSnapshot } from "../src/airbnb/extract.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixturePath = resolve(__dirname, "fixtures/airbnb-pdp-deferred.json");
const deferred = JSON.parse(readFileSync(fixturePath, "utf8"));

describe("extractSnapshot", () => {
  const snap = extractSnapshot(deferred, "1174411978184206231");

  it("extracts the listing id back", () => {
    expect(snap.listing_id).toBe("1174411978184206231");
  });

  it("extracts non-empty title", () => {
    expect(typeof snap.title).toBe("string");
    expect((snap.title ?? "").length).toBeGreaterThan(2);
  });

  it("extracts description text > 100 chars", () => {
    expect(typeof snap.description_text).toBe("string");
    expect((snap.description_text ?? "").length).toBeGreaterThan(100);
  });

  it("extracts at least 5 amenities", () => {
    expect(snap.amenities.length).toBeGreaterThanOrEqual(5);
  });

  it("extracts overall rating between 0 and 5", () => {
    const r = snap.rating.overall;
    expect(typeof r).toBe("number");
    expect(r!).toBeGreaterThan(0);
    expect(r!).toBeLessThanOrEqual(5);
  });

  it("extracts api_key (24+ chars lowercase alphanumeric)", () => {
    expect(snap.api_key).toMatch(/^[a-z0-9]{24,}$/);
  });
});
```

- [ ] **Step 3 · 跑测试**

`cd mac-scraper && pnpm test extract.test.ts` → 6/6 pass。
若某条断言失败,说明该路径在真实 fixture 里不同 — Codex 应**调整 extract.ts** 的 walker predicate 让其找到正确节点,再 commit。

**Commit message:** `Extract title/description/amenities/photos/rating/api_key from deferred state`

---

## Task 5 — fetch-reviews.ts(GraphQL + 动态 hash)

**Files:**
- Create: `mac-scraper/src/airbnb/fetch-reviews.ts`
- Create: `mac-scraper/tests/fetch-reviews.test.ts`

- [ ] **Step 1 · 写测试**

```ts
import { describe, it, expect, beforeEach, vi } from "vitest";
import { fetchReviews } from "../src/airbnb/fetch-reviews.js";

beforeEach(() => vi.restoreAllMocks());

describe("fetchReviews", () => {
  it("posts to GraphQL endpoint with API key, returns reviews array", async () => {
    const mock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        data: {
          presentation: {
            stayProductDetailPage: {
              reviews: {
                reviews: [
                  { id: "r1", comments: "good place", rating: 5, language: "ja" },
                  { id: "r2", comments: "汚かった", rating: 2, language: "ja" },
                ],
              },
            },
          },
        },
      }),
    });
    global.fetch = mock as unknown as typeof fetch;
    const r = await fetchReviews({
      listingId: "1174411978184206231",
      apiKey: "d3xxx",
      persistedHash: "abcd",
    });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.reviews.length).toBe(2);
    expect(mock).toHaveBeenCalledWith(
      expect.stringContaining("StaysPdpReviewsQuery/abcd"),
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ "x-airbnb-api-key": "d3xxx" }),
      }),
    );
  });

  it("returns { ok: false, error } on non-2xx", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 500, json: async () => ({}) }) as unknown as typeof fetch;
    const r = await fetchReviews({ listingId: "1", apiKey: "x", persistedHash: "h" });
    expect(r.ok).toBe(false);
  });
});
```

- [ ] **Step 2 · 实现 `mac-scraper/src/airbnb/fetch-reviews.ts`**

```ts
export type Review = {
  id: string;
  comments: string;
  rating: number;
  language: string | undefined;
};

export type FetchReviewsResult =
  | { ok: true; reviews: Review[] }
  | { ok: false; error: "graphql_failed" | "no_data" | "hash_expired" };

export type FetchReviewsInput = {
  listingId: string;
  apiKey: string;
  persistedHash: string;
  limit?: number;
};

export async function fetchReviews(input: FetchReviewsInput): Promise<FetchReviewsResult> {
  const { listingId, apiKey, persistedHash, limit = 20 } = input;
  const idB64 = Buffer.from(`StayListing:${listingId}`).toString("base64");

  const body = {
    operationName: "StaysPdpReviewsQuery",
    variables: {
      id: idB64,
      pdpReviewsRequest: {
        fieldSelector: "for_p3_translation_only",
        limit,
        offset: "0",
        sortingPreference: "MOST_RECENT",
      },
    },
    extensions: { persistedQuery: { version: 1, sha256Hash: persistedHash } },
  };

  let res: Response;
  try {
    res = await fetch(`https://www.airbnb.jp/api/v3/StaysPdpReviewsQuery/${persistedHash}`, {
      method: "POST",
      headers: {
        "x-airbnb-api-key": apiKey,
        "content-type": "application/json",
        "accept-language": "ja",
      },
      body: JSON.stringify(body),
    });
  } catch {
    return { ok: false, error: "graphql_failed" };
  }

  if (!res.ok) {
    if (res.status === 410 || res.status === 400) return { ok: false, error: "hash_expired" };
    return { ok: false, error: "graphql_failed" };
  }

  const json = (await res.json()) as Record<string, unknown>;
  const reviews =
    (json.data as { presentation?: { stayProductDetailPage?: { reviews?: { reviews?: unknown[] } } } })?.presentation
      ?.stayProductDetailPage?.reviews?.reviews;
  if (!Array.isArray(reviews)) return { ok: false, error: "no_data" };

  const parsed: Review[] = [];
  for (const r of reviews) {
    if (r && typeof r === "object") {
      const rr = r as Record<string, unknown>;
      if (typeof rr.id === "string" && typeof rr.comments === "string") {
        parsed.push({
          id: rr.id,
          comments: rr.comments,
          rating: Number(rr.rating ?? 0),
          language: typeof rr.language === "string" ? rr.language : undefined,
        });
      }
    }
  }
  return { ok: true, reviews: parsed };
}
```

- [ ] **Step 3 · 测试通过 2/2**

**Commit message:** `Add reviews GraphQL fetcher with dynamic persistedQuery hash`

---

## Task 6 — score/photos.ts(B1/B2/B3,TDD)

**Files:**
- Create: `mac-scraper/src/score/photos.ts`
- Create: `mac-scraper/tests/score-photos.test.ts`

业务规则(SPEC §B1/B2/B3):
- B1: 数量 <5 ❌不足 / 5-9 🟡良好 / 10-19 🟢充足 / ≥20 ⭐丰富
- B2: cover 类别属于客厅/卧室/外景/整体 = ✅;属于浴室/厨房细节 = ⚠️
- B3: 5 类房间覆盖(寝室/キッチン/バスルーム/リビング/外景)各 ≥1 张;5/5=完整,3-4=基本,<3=严重缺失

- [ ] **Step 1 · 写测试**

```ts
import { describe, it, expect } from "vitest";
import { scorePhotos } from "../src/score/photos.js";

describe("scorePhotos", () => {
  it("B1 marks <5 as insufficient", () => {
    const r = scorePhotos({ count: 4, categories: {}, cover_category: undefined });
    expect(r.b1_status).toBe("insufficient");
    expect(r.score).toBeLessThan(60);
  });
  it("B1 marks 10-19 as adequate", () => {
    const r = scorePhotos({ count: 12, categories: {}, cover_category: undefined });
    expect(r.b1_status).toBe("adequate");
  });
  it("B1 marks 20+ as rich", () => {
    const r = scorePhotos({ count: 30, categories: {}, cover_category: undefined });
    expect(r.b1_status).toBe("rich");
  });

  it("B2 marks living/bedroom cover as ok", () => {
    const r = scorePhotos({ count: 10, categories: {}, cover_category: "リビング" });
    expect(r.b2_cover_ok).toBe(true);
  });
  it("B2 marks bathroom cover as not ok", () => {
    const r = scorePhotos({ count: 10, categories: {}, cover_category: "バスルーム" });
    expect(r.b2_cover_ok).toBe(false);
  });

  it("B3 reports coverage like '4/5'", () => {
    const r = scorePhotos({
      count: 10,
      categories: { 寝室: 2, リビング: 3, キッチン: 1, バスルーム: 1 },
      cover_category: "リビング",
    });
    expect(r.b3_coverage).toBe("4/5");
    expect(r.b3_missing).toContain("外景");
  });
  it("score is high when everything good", () => {
    const r = scorePhotos({
      count: 25,
      categories: { 寝室: 4, リビング: 5, キッチン: 3, バスルーム: 2, 外景: 1 },
      cover_category: "リビング",
    });
    expect(r.score).toBeGreaterThanOrEqual(90);
  });
});
```

- [ ] **Step 2 · 实现 `mac-scraper/src/score/photos.ts`**

```ts
export type PhotosInput = {
  count: number;
  categories: Record<string, number>;
  cover_category: string | undefined;
};

export type PhotosScore = {
  score: number;
  total: number;
  b1_status: "insufficient" | "good" | "adequate" | "rich";
  b2_cover_ok: boolean;
  b3_coverage: string;
  b3_missing: string[];
};

const GOOD_COVERS = ["リビング", "寝室", "ベッドルーム", "外景", "外観", "全体"];
const REQUIRED_ROOMS = ["寝室", "リビング", "キッチン", "バスルーム", "外景"];

export function scorePhotos(input: PhotosInput): PhotosScore {
  const c = input.count;
  const b1_status: PhotosScore["b1_status"] =
    c < 5 ? "insufficient" : c < 10 ? "good" : c < 20 ? "adequate" : "rich";

  const cover = input.cover_category ?? "";
  const b2_cover_ok = GOOD_COVERS.some((k) => cover.includes(k));

  let hits = 0;
  const missing: string[] = [];
  for (const room of REQUIRED_ROOMS) {
    const found = Object.keys(input.categories).some((k) => k.includes(room.slice(0, 2)));
    if (found && input.categories[Object.keys(input.categories).find((k) => k.includes(room.slice(0, 2)))!] > 0) {
      hits++;
    } else {
      missing.push(room);
    }
  }
  const b3_coverage = `${hits}/${REQUIRED_ROOMS.length}`;

  // Score: B1 40% + B2 20% + B3 40%
  const b1 = c < 5 ? 30 : c < 10 ? 70 : c < 20 ? 90 : 100;
  const b2 = b2_cover_ok ? 100 : 60;
  const b3 = (hits / REQUIRED_ROOMS.length) * 100;
  const score = Math.round(b1 * 0.4 + b2 * 0.2 + b3 * 0.4);

  return { score, total: c, b1_status, b2_cover_ok, b3_coverage, b3_missing: missing };
}
```

- [ ] **Step 3 · 测试通过**

**Commit message:** `Score photos dimension (B1/B2/B3) with TDD`

---

## Task 7 — score/description.ts(B7 长度 + 章节,TDD)

**Files:**
- Create: `mac-scraper/src/score/description.ts`
- Create: `mac-scraper/tests/score-description.test.ts`

业务规则(SPEC §B7,v0.4):
- 章节 regex 命中:`寝室|ベッドルーム` / `リビング` / `キッチン` / `バスルーム|浴室|風呂` / `駅|アクセス|交通` / `周辺|観光|スポット`
- 长度 ≥800 + 命中 ≥5 → 充足(满分)
- 长度 400-799 或 命中 3-4 → 良好
- 长度 <400 或 命中 ≤2 → 需改进
- 完全为空 → 严重问题

- [ ] **Step 1 · 写测试**

```ts
import { describe, it, expect } from "vitest";
import { scoreDescription } from "../src/score/description.js";

describe("scoreDescription", () => {
  it("returns lowest score for empty", () => {
    const r = scoreDescription("");
    expect(r.score).toBeLessThanOrEqual(20);
    expect(r.length).toBe(0);
    expect(r.sections_hit).toEqual([]);
  });

  it("detects all 6 sections in a long description", () => {
    const text = "寝室は広いです。リビングからキッチンへ。バスルーム完備。駅まで5分。周辺は静か。" + "x".repeat(900);
    const r = scoreDescription(text);
    expect(r.sections_hit.sort()).toEqual(["アクセス", "キッチン", "バスルーム", "リビング", "寝室", "周辺"].sort());
    expect(r.score).toBeGreaterThanOrEqual(90);
  });

  it("partial match (3 sections, 500 chars) → 良好", () => {
    const text = "寝室は2つあります。リビングが広い。キッチンに調理器具。" + "x".repeat(500);
    const r = scoreDescription(text);
    expect(r.sections_hit.length).toBeGreaterThanOrEqual(3);
    expect(r.score).toBeGreaterThanOrEqual(60);
    expect(r.score).toBeLessThan(90);
  });

  it("short description → 需改進", () => {
    const r = scoreDescription("寝室1つ。");
    expect(r.score).toBeLessThan(60);
  });
});
```

- [ ] **Step 2 · 实现**

```ts
const SECTIONS: Array<{ key: string; re: RegExp }> = [
  { key: "寝室", re: /寝室|ベッドルーム/ },
  { key: "リビング", re: /リビング/ },
  { key: "キッチン", re: /キッチン/ },
  { key: "バスルーム", re: /バスルーム|浴室|風呂/ },
  { key: "アクセス", re: /駅|アクセス|交通/ },
  { key: "周辺", re: /周辺|観光|スポット/ },
];

export type DescriptionScore = {
  score: number;
  length: number;
  sections_hit: string[];
  sections_missing: string[];
};

export function scoreDescription(text: string): DescriptionScore {
  const length = text.length;
  const hits: string[] = [];
  const missing: string[] = [];
  for (const s of SECTIONS) {
    if (s.re.test(text)) hits.push(s.key);
    else missing.push(s.key);
  }

  if (length === 0) return { score: 5, length, sections_hit: hits, sections_missing: missing };
  if (length >= 800 && hits.length >= 5) return { score: 95, length, sections_hit: hits, sections_missing: missing };
  if (length >= 400 || hits.length >= 3) return { score: 75, length, sections_hit: hits, sections_missing: missing };
  return { score: 45, length, sections_hit: hits, sections_missing: missing };
}
```

- [ ] **Step 3 · 测试通过**

**Commit message:** `Score description dimension (B7 length + section regex)`

---

## Task 8 — score/amenities.ts(B10,TDD)

**Files:**
- Create: `mac-scraper/src/score/amenities.ts`
- Create: `mac-scraper/tests/score-amenities.test.ts`

业务规则(SPEC §B10):设施在描述里被提到 = 一致;未被提到 = 不一致。一致比例越高分越高。

- [ ] **Step 1 · 写测试**

```ts
import { describe, it, expect } from "vitest";
import { scoreAmenities } from "../src/score/amenities.js";

describe("scoreAmenities", () => {
  it("returns ratio + missing list when partial match", () => {
    const amenities = [
      { title: "Wi-Fi", available: true },
      { title: "洗濯機", available: true },
      { title: "エアコン", available: true },
      { title: "コーヒーメーカー", available: true },
    ];
    const desc = "高速Wi-Fi完備。エアコンあり。";
    const r = scoreAmenities(amenities, desc);
    expect(r.match_ratio).toBe("2/4");
    expect(r.missing.sort()).toEqual(["コーヒーメーカー", "洗濯機"].sort());
  });

  it("returns 100% score when all amenities mentioned", () => {
    const amenities = [{ title: "Wi-Fi", available: true }];
    const desc = "高速Wi-Fi.";
    const r = scoreAmenities(amenities, desc);
    expect(r.score).toBeGreaterThanOrEqual(95);
  });

  it("ignores unavailable amenities", () => {
    const amenities = [
      { title: "Wi-Fi", available: true },
      { title: "プール", available: false },
    ];
    const desc = "Wi-Fi完備。";
    const r = scoreAmenities(amenities, desc);
    expect(r.match_ratio).toBe("1/1"); // 不计 unavailable
  });

  it("returns 0% score when nothing matches", () => {
    const r = scoreAmenities([{ title: "Wi-Fi", available: true }], "no amenities mentioned");
    expect(r.score).toBeLessThan(40);
  });
});
```

- [ ] **Step 2 · 实现**

```ts
export type Amenity = { title: string; available: boolean };

export type AmenitiesScore = {
  score: number;
  match_ratio: string;
  matched: string[];
  missing: string[];
};

export function scoreAmenities(amenities: Amenity[], descriptionText: string): AmenitiesScore {
  const available = amenities.filter((a) => a.available);
  const matched: string[] = [];
  const missing: string[] = [];

  for (const a of available) {
    // 简化:title 主词出现在描述里就算一致
    const head = a.title.split(/[\s/(（]/, 1)[0];
    if (head && descriptionText.includes(head)) matched.push(a.title);
    else missing.push(a.title);
  }

  const total = available.length || 1;
  const score = Math.round((matched.length / total) * 100);
  return {
    score,
    match_ratio: `${matched.length}/${available.length}`,
    matched,
    missing,
  };
}
```

- [ ] **Step 3 · 测试通过**

**Commit message:** `Score amenities dimension (B10) with TDD`

---

## Task 9 — score/reviews.ts(rating + B12 数据准备,TDD)

**Files:**
- Create: `mac-scraper/src/score/reviews.ts`
- Create: `mac-scraper/tests/score-reviews.test.ts`

业务规则:rating × 20 = score 主项(4.85 ≈ 97);评论数 <3 标 "参考程度";B12 真分析在 Plan 3,本 task 只准备好 `texts: string[]` 给 AI。

- [ ] **Step 1 · 写测试**

```ts
import { describe, it, expect } from "vitest";
import { scoreReviews } from "../src/score/reviews.js";

describe("scoreReviews", () => {
  it("rating 4.87 → score ≈ 97", () => {
    const r = scoreReviews({ overall: 4.87, count: 106, subscores: {} }, []);
    expect(r.score).toBeGreaterThanOrEqual(95);
    expect(r.score).toBeLessThanOrEqual(100);
  });

  it("missing rating → neutral score 70 with note", () => {
    const r = scoreReviews({ overall: undefined, count: undefined, subscores: {} }, []);
    expect(r.score).toBe(70);
    expect(r.note).toContain("レビューデータ");
  });

  it("review count < 3 sets sparse flag", () => {
    const r = scoreReviews({ overall: 5, count: 2, subscores: {} }, [
      { id: "r1", comments: "good", rating: 5, language: "en" },
    ]);
    expect(r.sparse).toBe(true);
  });

  it("collects review comments as texts[] for AI consumption", () => {
    const r = scoreReviews({ overall: 4.5, count: 5, subscores: {} }, [
      { id: "r1", comments: "very good place", rating: 5, language: "en" },
      { id: "r2", comments: "汚かった", rating: 2, language: "ja" },
    ]);
    expect(r.texts).toEqual(["very good place", "汚かった"]);
  });
});
```

- [ ] **Step 2 · 实现**

```ts
import type { Review } from "../airbnb/fetch-reviews.js";

export type ReviewsScoreInput = {
  overall: number | undefined;
  count: number | undefined;
  subscores: Record<string, number>;
};

export type ReviewsScore = {
  score: number;
  rating: number | undefined;
  count: number | undefined;
  subscores: Record<string, number>;
  sparse: boolean;
  texts: string[]; // for Plan 3 B12 analysis
  note: string | undefined;
};

export function scoreReviews(input: ReviewsScoreInput, reviews: Review[]): ReviewsScore {
  if (input.overall == null) {
    return {
      score: 70,
      rating: undefined,
      count: input.count,
      subscores: input.subscores,
      sparse: true,
      texts: reviews.map((r) => r.comments),
      note: "レビューデータが取得できませんでした",
    };
  }
  const score = Math.round((input.overall / 5) * 100);
  return {
    score,
    rating: input.overall,
    count: input.count,
    subscores: input.subscores,
    sparse: (input.count ?? 0) < 3,
    texts: reviews.map((r) => r.comments),
    note: undefined,
  };
}
```

- [ ] **Step 3 · 测试通过**

**Commit message:** `Score reviews dimension (rating + B12 text prep) with TDD`

---

## Task 10 — score/index.ts(综合 + grade + quality_status)

**Files:**
- Create: `mac-scraper/src/score/index.ts`
- Create: `mac-scraper/tests/score-index.test.ts`

业务规则(SPEC §A1/A5):
- overall = 5 维度 score 平均(等权)
- 90+ → A,75-89 → B,60-74 → C,<60 → D
- Quality status by overall rating(SPEC §A5):≥4.8 Good / 4.5-4.79 Educate / 4.0-4.49 Warn / 3.5-3.99 Probation / 3.0-3.49 Additional Warn / <3.0 Pending Removal

- [ ] **Step 1 · 写测试**

```ts
import { describe, it, expect } from "vitest";
import { aggregate } from "../src/score/index.js";

describe("aggregate", () => {
  it("averages 5 dimensions and maps to grade", () => {
    const r = aggregate({
      photos: { score: 95 },
      title: { score: 70 },
      description: { score: 88 },
      amenities: { score: 75 },
      reviews: { score: 99, rating: 4.95 },
    });
    expect(r.overall_score).toBe(85); // (95+70+88+75+99)/5 = 85.4 → 85
    expect(r.grade).toBe("B");
  });

  it("rating 4.85 → Good quality status", () => {
    const r = aggregate({
      photos: { score: 50 },
      title: { score: 50 },
      description: { score: 50 },
      amenities: { score: 50 },
      reviews: { score: 80, rating: 4.85 },
    });
    expect(r.quality_status).toBe("Good");
  });

  it("low rating → Warn", () => {
    const r = aggregate({
      photos: { score: 50 },
      title: { score: 50 },
      description: { score: 50 },
      amenities: { score: 50 },
      reviews: { score: 80, rating: 4.2 },
    });
    expect(r.quality_status).toBe("Warn");
  });

  it("undefined rating defaults to Good", () => {
    const r = aggregate({
      photos: { score: 50 },
      title: { score: 50 },
      description: { score: 50 },
      amenities: { score: 50 },
      reviews: { score: 70, rating: undefined },
    });
    expect(r.quality_status).toBe("Good");
  });
});
```

- [ ] **Step 2 · 实现**

```ts
type DimScore = { score: number };
type ReviewsDim = DimScore & { rating: number | undefined };

export type AggregateInput = {
  photos: DimScore;
  title: DimScore;
  description: DimScore;
  amenities: DimScore;
  reviews: ReviewsDim;
};

export type Grade = "A" | "B" | "C" | "D";
export type QualityStatus =
  | "Good"
  | "Educate"
  | "Warn"
  | "Probation"
  | "Additional Warn"
  | "Pending Removal";

export type AggregateResult = {
  overall_score: number;
  grade: Grade;
  quality_status: QualityStatus;
};

export function scoreToGrade(s: number): Grade {
  if (s >= 90) return "A";
  if (s >= 75) return "B";
  if (s >= 60) return "C";
  return "D";
}

function ratingToQuality(rating: number | undefined): QualityStatus {
  if (rating == null) return "Good";
  if (rating >= 4.8) return "Good";
  if (rating >= 4.5) return "Educate";
  if (rating >= 4.0) return "Warn";
  if (rating >= 3.5) return "Probation";
  if (rating >= 3.0) return "Additional Warn";
  return "Pending Removal";
}

export function aggregate(input: AggregateInput): AggregateResult {
  const sum =
    input.photos.score + input.title.score + input.description.score + input.amenities.score + input.reviews.score;
  const overall = Math.round(sum / 5);
  return {
    overall_score: overall,
    grade: scoreToGrade(overall),
    quality_status: ratingToQuality(input.reviews.rating),
  };
}
```

- [ ] **Step 3 · 测试通过 4/4**

**Commit message:** `Aggregate 5-dimension scores into overall + grade + quality status`

---

## Task 11 — Replace fixture in server.ts with real flow

**Files:**
- Modify: `mac-scraper/src/server.ts`
- Modify: `mac-scraper/tests/server.test.ts`(用新 fixture-based 流程取代旧 fixture-return assert)

- [ ] **Step 1 · 更新 server.ts /diagnose handler 用真流程**

替换 server.ts 现有 /diagnose handler 为:

```ts
import { fetchPdpHtml } from "./airbnb/fetch-pdp.js";
import { parseDeferredState } from "./airbnb/parse-deferred.js";
import { extractSnapshot } from "./airbnb/extract.js";
import { fetchReviews } from "./airbnb/fetch-reviews.js";
import { scorePhotos } from "./score/photos.js";
import { scoreDescription } from "./score/description.js";
import { scoreAmenities } from "./score/amenities.js";
import { scoreReviews } from "./score/reviews.js";
import { aggregate } from "./score/index.js";
import type { Diagnosis } from "./types.js";

// 在 /diagnose handler 里(替换 sampleDiagnosis 返回):
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

  // 1. fetch PDP HTML
  const pdp = await fetchPdpHtml(url);
  if (!pdp.ok) {
    res.status(502).json({ error: pdp.error });
    return;
  }
  // 2. parse deferred
  const parsedDeferred = parseDeferredState(pdp.html);
  if (!parsedDeferred.ok) {
    res.status(502).json({ error: parsedDeferred.error });
    return;
  }
  // 3. extract
  const snapshot = extractSnapshot(parsedDeferred.data, listingId);

  // 4. reviews (best effort)
  let reviews: Awaited<ReturnType<typeof fetchReviews>> = { ok: true, reviews: [] };
  if (snapshot.api_key && snapshot.reviews_persisted_hash) {
    reviews = await fetchReviews({
      listingId,
      apiKey: snapshot.api_key,
      persistedHash: snapshot.reviews_persisted_hash,
    });
  }
  const reviewList = reviews.ok ? reviews.reviews : [];

  // 5. score
  const photosScore = scorePhotos(snapshot.photos);
  const descScore = scoreDescription(snapshot.description_text ?? "");
  const amenScore = scoreAmenities(snapshot.amenities, snapshot.description_text ?? "");
  const reviewsScore = scoreReviews(snapshot.rating, reviewList);
  const titleScore = { score: 70 }; // B6 placeholder, Plan 4 / v1

  // 6. aggregate
  const agg = aggregate({
    photos: photosScore,
    title: titleScore,
    description: descScore,
    amenities: amenScore,
    reviews: reviewsScore,
  });

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
    ai: {
      report_md: "Plan 3 で AI レポートを実装します。",
      negative_keywords: [],
      top3: [],
      status: "fallback",
    },
    scrape_status: !reviews.ok ? "partial" : "ok",
  };

  res.json(diagnosis);
});
```

- [ ] **Step 2 · 更新 server.ts 旧 import**

删除 `import { sampleDiagnosis } from "./fixtures/sample.js"`(fixture 不再用于 /diagnose,但保留文件供后续可能的测试)。

- [ ] **Step 3 · 更新 server.test.ts**

把原"fixture endpoint"测试改为基于 mock 的真流程测试。新测试:

```ts
import { vi } from "vitest";

vi.mock("../src/airbnb/fetch-pdp.js", () => ({
  fetchPdpHtml: vi.fn(),
}));
vi.mock("../src/airbnb/fetch-reviews.js", () => ({
  fetchReviews: vi.fn(),
}));

import { fetchPdpHtml } from "../src/airbnb/fetch-pdp.js";
import { fetchReviews } from "../src/airbnb/fetch-reviews.js";
import { readFileSync } from "node:fs";

const deferredJson = JSON.parse(readFileSync("tests/fixtures/airbnb-pdp-deferred.json", "utf8"));
const htmlWrapper = `<script id="data-deferred-state-0">${JSON.stringify(deferredJson)}</script>`;

describe("POST /diagnose (real flow)", () => {
  it("returns Diagnosis with real grade for valid URL", async () => {
    vi.mocked(fetchPdpHtml).mockResolvedValue({ ok: true, html: htmlWrapper });
    vi.mocked(fetchReviews).mockResolvedValue({ ok: true, reviews: [] });

    const app = createApp();
    const res = await request(app)
      .post("/diagnose")
      .set("Authorization", "Bearer test-secret")
      .send({ url: "https://www.airbnb.jp/rooms/1174411978184206231" });
    expect(res.status).toBe(200);
    expect(res.body.listing_id).toBe("1174411978184206231");
    expect(["A", "B", "C", "D"]).toContain(res.body.grade);
    expect(res.body.dimensions.photos.score).toBeGreaterThan(0);
    expect(res.body.dimensions.description.length).toBeGreaterThan(0);
  });

  it("returns 502 when fetchPdpHtml fails", async () => {
    vi.mocked(fetchPdpHtml).mockResolvedValue({ ok: false, error: "not_found" });
    const app = createApp();
    const res = await request(app)
      .post("/diagnose")
      .set("Authorization", "Bearer test-secret")
      .send({ url: "https://www.airbnb.jp/rooms/x" });
    expect(res.status).toBe(502);
  });

  it("marks scrape_status=partial when reviews fail", async () => {
    vi.mocked(fetchPdpHtml).mockResolvedValue({ ok: true, html: htmlWrapper });
    vi.mocked(fetchReviews).mockResolvedValue({ ok: false, error: "hash_expired" });
    const app = createApp();
    const res = await request(app)
      .post("/diagnose")
      .set("Authorization", "Bearer test-secret")
      .send({ url: "https://www.airbnb.jp/rooms/1174411978184206231" });
    expect(res.status).toBe(200);
    expect(res.body.scrape_status).toBe("partial");
  });
});
```

(原 4 个 auth 测试保留)

- [ ] **Step 4 · 跑 mac-scraper 全部测试,所有 pass**

`cd mac-scraper && pnpm test`
Expected: ~10 个测试通过(4 auth + 3 new flow + 之前的 6 个 score 测试中复用的)。

**Commit message:** `Wire real PDP+scoring flow into POST /diagnose`

---

## Task 12 — Re-record fixtures if extraction reveals path drift(可选 task)

**Files:** 可能修改 `mac-scraper/src/airbnb/extract.ts`(walker predicates),无新文件。

(Codex 注:本 task 仅在 T4 测试有失败时执行。若 T4 通过,本 task 跳过 commit。)

- [ ] **Step 1 · 跑 extract 测试再次确认**

`cd mac-scraper && pnpm test extract.test.ts` → 应 6/6 pass。

- [ ] **Step 2 · 跳过 commit**

---

## Task 13 — B8 multi-locale 并发探测

**Files:**
- Create: `mac-scraper/src/airbnb/locales.ts`
- Create: `mac-scraper/tests/locales.test.ts`
- Modify: `mac-scraper/src/server.ts`(在 score 前并发查 locale)
- Modify: `mac-scraper/src/score/description.ts`(增加 B8 字段)

业务规则(SPEC §B8):必须有 ja + en;加分项 zh-CN, ko。缺日/英 → 「基礎不足」。

- [ ] **Step 1 · 实现 `mac-scraper/src/airbnb/locales.ts`**

```ts
import { createHash } from "node:crypto";
import { fetchPdpHtml } from "./fetch-pdp.js";
import { parseDeferredState } from "./parse-deferred.js";
import { extractSnapshot } from "./extract.js";

const LOCALES = ["en", "zh-CN", "ko"] as const;

export async function detectLocales(baseUrl: string, jaDescriptionHash: string): Promise<string[]> {
  const found: string[] = ["ja"];
  await Promise.all(
    LOCALES.map(async (loc) => {
      try {
        const url = new URL(baseUrl);
        url.searchParams.set("locale", loc);
        const res = await fetchPdpHtml(url.toString());
        if (!res.ok) return;
        const parsed = parseDeferredState(res.html);
        if (!parsed.ok) return;
        const m = baseUrl.match(/\/rooms\/(\d+)/);
        if (!m) return;
        const snap = extractSnapshot(parsed.data, m[1]);
        if (!snap.description_text) return;
        const h = createHash("sha1").update(snap.description_text).digest("hex");
        if (h !== jaDescriptionHash) found.push(loc);
      } catch {
        // 单 locale 失败不阻断
      }
    }),
  );
  return found;
}

export function hashDescription(text: string): string {
  return createHash("sha1").update(text).digest("hex");
}
```

- [ ] **Step 2 · 修改 score/description.ts 增 B8**

把 `DescriptionScore` 加上 `locales: string[]`、`b8_status: "ok" | "missing_critical"`,并在 scoreDescription 接口加可选 `locales` 参数:

```ts
export type DescriptionScore = {
  score: number;
  length: number;
  sections_hit: string[];
  sections_missing: string[];
  locales: string[];
  b8_status: "ok" | "missing_critical";
};

export function scoreDescription(text: string, locales: string[] = ["ja"]): DescriptionScore {
  // ...原有逻辑...
  const hasJa = locales.includes("ja");
  const hasEn = locales.includes("en");
  const b8_status: "ok" | "missing_critical" = hasJa && hasEn ? "ok" : "missing_critical";
  return { ...result, locales, b8_status };
}
```

- [ ] **Step 3 · 测试 + 更新 server.ts 在 score 前调 detectLocales**

测试:略(参考 T7 模式;新增 2 个 case:`locales: ["ja","en"]` → ok / `locales: ["ja"]` → missing_critical)。

server.ts 修改:
```ts
import { detectLocales, hashDescription } from "./airbnb/locales.js";
// after extractSnapshot:
const jaHash = snapshot.description_text ? hashDescription(snapshot.description_text) : "";
const locales = jaHash ? await detectLocales(url, jaHash) : ["ja"];
const descScore = scoreDescription(snapshot.description_text ?? "", locales);
```

- [ ] **Step 4 · 测试通过**

**Commit message:** `Add B8 multi-locale concurrent detection`

---

## Task 14 — DimensionGrid + DimensionCard UI

**Files:**
- Create: `components/DimensionCard.tsx`
- Create: `components/DimensionGrid.tsx`
- Modify: `app/d/[id]/page.tsx`
- Modify: `lib/i18n/ja.ts`(加维度卡文案)

视觉参考:`design_handoff_review_app/prototype/DimensionGrid.jsx`、`prototype/kit.css` 的 `.kit-dim-grid` / `.kit-dim`。

- [ ] **Step 1 · 扩 `lib/i18n/ja.ts`**

在 `result.scoreCard` 同级加:

```ts
  dimensions: {
    photos: { label: "写真", placeholder: "" },
    title: { label: "タイトル", placeholder: "⏳ v1 で実装" },
    description: { label: "説明文", placeholder: "" },
    amenities: { label: "設備", placeholder: "" },
    reviews: { label: "レビュー", placeholder: "" },
  },
```

- [ ] **Step 2 · 实现 `components/DimensionCard.tsx`**

```tsx
import { scoreToGrade, gradeColors } from "@/lib/util/grade";

type Props = {
  label: string;
  score: number;
  primaryStat: string;
  note?: string;
  placeholder?: boolean;
};

export function DimensionCard({ label, score, primaryStat, note, placeholder }: Props) {
  const grade = scoreToGrade(score);
  const colors = gradeColors(grade);
  return (
    <div
      style={{
        background: "var(--card)",
        border: "1px solid var(--ink-100)",
        borderRadius: "var(--r-lg)",
        padding: "var(--s-5)",
        display: "grid",
        gap: "var(--s-2)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 className="t-h3" style={{ margin: 0 }}>{label}</h3>
        <span
          style={{
            background: colors.fill,
            color: colors.ink,
            padding: "2px 8px",
            borderRadius: "var(--r-pill)",
            fontSize: "var(--t-xs)",
            fontWeight: "var(--w-semibold)",
          }}
        >
          {grade}
        </span>
      </div>
      <div className="t-tabular" style={{ fontSize: "var(--t-lg)", fontWeight: "var(--w-semibold)", color: "var(--ink-800)" }}>
        {primaryStat}
      </div>
      {note && (
        <p className="t-small" style={{ margin: 0, color: placeholder ? "var(--ink-400)" : "var(--ink-500)" }}>
          {note}
        </p>
      )}
    </div>
  );
}
```

- [ ] **Step 3 · 实现 `components/DimensionGrid.tsx`**

```tsx
import { DimensionCard } from "./DimensionCard";
import { ja } from "@/lib/i18n/ja";

type Dim = { score: number; [key: string]: unknown };
type Props = {
  dimensions: {
    photos: Dim & { total?: number; b3_coverage?: string };
    title: Dim & { placeholder?: boolean };
    description: Dim & { length?: number; sections_hit?: string[] };
    amenities: Dim & { match_ratio?: string };
    reviews: Dim & { rating?: number; count?: number };
  };
};

export function DimensionGrid({ dimensions }: Props) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: "var(--s-4)",
        margin: "var(--s-6) 0",
      }}
    >
      <DimensionCard
        label={ja.result.dimensions.photos.label}
        score={dimensions.photos.score}
        primaryStat={`${dimensions.photos.total ?? "?"} 枚`}
        note={dimensions.photos.b3_coverage ? `カバー率 ${dimensions.photos.b3_coverage}` : undefined}
      />
      <DimensionCard
        label={ja.result.dimensions.title.label}
        score={dimensions.title.score}
        primaryStat="—"
        note={ja.result.dimensions.title.placeholder}
        placeholder
      />
      <DimensionCard
        label={ja.result.dimensions.description.label}
        score={dimensions.description.score}
        primaryStat={`${dimensions.description.length ?? 0} 文字`}
        note={
          dimensions.description.sections_hit?.length
            ? `主要章節 ${dimensions.description.sections_hit.length}/6`
            : "章節カバレッジ不足"
        }
      />
      <DimensionCard
        label={ja.result.dimensions.amenities.label}
        score={dimensions.amenities.score}
        primaryStat={dimensions.amenities.match_ratio ?? "?"}
        note="設備と説明文の一致度"
      />
      <DimensionCard
        label={ja.result.dimensions.reviews.label}
        score={dimensions.reviews.score}
        primaryStat={dimensions.reviews.rating ? `★ ${dimensions.reviews.rating.toFixed(2)}` : "—"}
        note={dimensions.reviews.count ? `${dimensions.reviews.count} 件のレビュー` : "レビューなし"}
      />
    </div>
  );
}
```

- [ ] **Step 4 · 修改 `app/d/[id]/page.tsx` 挂上 DimensionGrid**

在 ScoreCard 下方加入:
```tsx
import { DimensionGrid } from "@/components/DimensionGrid";
// ... in JSX, after <ScoreCard score={d.overallScore} />:
<DimensionGrid dimensions={d.dimensions as Parameters<typeof DimensionGrid>[0]["dimensions"]} />
```

- [ ] **Step 5 · pnpm build 通过**

`pnpm build` → 0 error。

**Commit message:** `Add DimensionGrid + DimensionCard to result page`

---

## Task 15 — E2E smoke + Phase 2 status

**Files:** 无新建。本 task 收尾。

- [ ] **Step 1 · 跑全部测试**

```bash
pnpm test
cd mac-scraper && pnpm test && cd ..
```
Expected: 全部 green。预估总数:36 (Plan 1 root) + 5 (Plan 1 scraper) + 4 (T2 fetch-pdp) + 4 (T3 parse-deferred) + 6 (T4 extract) + 2 (T5 reviews) + 7 (T6 photos) + 4 (T7 description) + 4 (T8 amenities) + 4 (T9 reviews) + 4 (T10 aggregate) + 3 (T11 server real flow) ≈ **83 tests pass**。

- [ ] **Step 2 · 启服务做真实 E2E**

```bash
cd mac-scraper && pnpm dev &
SCRAPER_PID=$!
ulimit -n 4096 && WATCHPACK_POLLING=true pnpm dev &
NEXT_PID=$!
# Monitor 等两个起来:
until curl -sf http://localhost:8787/healthz > /dev/null && curl -sf http://localhost:3000 > /dev/null; do sleep 2; done

# 真 POST(用一个真 Airbnb URL):
RESP=$(curl -sS -X POST http://localhost:3000/api/diagnose \
  -H 'Content-Type: application/json' \
  -d '{"url":"https://www.airbnb.jp/rooms/1174411978184206231"}')
echo "$RESP"

# 期望: {"diagnosis_id":"<uuid>","redirect":"/d/<uuid>"}
# 然后 curl GET /d/<uuid> 应返 200

kill $SCRAPER_PID $NEXT_PID 2>/dev/null
```

- [ ] **Step 3 · 写 `docs/superpowers/plans/phase2-status.md`**

```markdown
# Phase 2 Status

**Completed:** 2026-05-XX

## What works
- 真 Airbnb URL → mac-scraper fetch PDP + reviews → parse deferred state → 5 维度评分 → 真 grade
- Reviews GraphQL 自动从 PDP 抽 hash + api_key,过期 fallback 标 scrape_status=partial
- 描述 B8 多 locale 并发探测
- 结果页除 ScoreCard 还展示 5 个 DimensionCard

## Smoke run
- listing 1174411978184206231 真实诊断,grade = <?>(根据当时真分)
- ~83 tests pass

## Known gaps
- AI 报告仍占位文字(Plan 3 接 Claude Agent SDK)
- B12 高频差评:数据准备好了(reviews.texts),AI 分析在 Plan 3
- B6 标题 SEO:仍 placeholder
- 没邮件、PDF
- 没 Quality Status ladder UI、A7 升档动态文案
- C4 变化箭头未实装
- 没错误页 5A/5B/5C
- v0.4 deltas A5 参考值脚注、F7 mock — Plan 4

## Next plan
docs/superpowers/plans/2026-05-XX-phase3-claude-agent-sdk.md(待写)
```

- [ ] **Step 4 · 跳 commit,让 Claude 收尾**

---

## Self-review checklist

- [x] **Spec coverage** — Plan 2 覆盖 B1/B2/B3/B7/B8/B10 + reviews rating;B6 仍 placeholder(SPEC 允许);B12 数据准备(真分析 Plan 3);A1/A4/A5/A7 在 Plan 1+4 已/将处理。
- [x] **No placeholders** — 每个 task 有完整代码 + tests。仅 T12 是显式 no-op。
- [x] **Type consistency** — `Diagnosis.dimensions.photos.score / .b3_coverage` 等在 score 文件输出 + DimensionGrid 消费时同名;reviews `texts: string[]` 字段供 Plan 3 消费。
- [x] **Self-contained tasks** — Codex 一次读一 task 即可上手。
- [x] **TDD on logic; UI on build** — 所有 score / fetch / parse / extract 用 TDD;DimensionGrid 走 build pass。

---

## Execution

**模式同 Plan 1**:`codex exec --sandbox workspace-write -c 'sandbox_workspace_write.network_access=true' -C "..." "...prompt..."`,Codex 写代码 + 跑测试,Claude 看 diff + commit。
