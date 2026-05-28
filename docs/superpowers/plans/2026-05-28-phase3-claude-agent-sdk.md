# Phase 3 · Claude Agent SDK + AI Report + B12 + Top3 — Implementation Plan

> **执行模式:** Codex CLI 在同仓库逐 task。每个 Task 自包含;Codex 完成后 Claude 用 `git diff` review,通过 → 下一个。
>
> **完成 Plan 3 后到达的状态:** 真 Airbnb URL → fetch + parse + 5 维度评分 → **Claude Agent SDK 一次 tool_use 产出 3 份产物**(日语报告 markdown + B12 ネガキーワード + Top3 改善案) → 写 DB → 结果页右侧渲染 AI レポート + Top3 priorities 表格。

**Goal:** 把 mac-scraper 里 AI 占位字符串换成真 Claude 生成。SPEC §3.4 AI 综合诊断报告。

**Architecture(ADR-005):**
- mac-scraper 同进程内调 `@anthropic-ai/claude-agent-sdk` query()
- 走本机已登录的 Claude Code Enterprise OAuth(费用 $0)
- 一次调用,tool_use 强制结构化输出 3 份产物
- zod 二次校验,失败重试 1 次,仍失败 → `ai_status="fallback"`

**Tech Stack 增量:**
- `@anthropic-ai/claude-agent-sdk`(mac-scraper)
- `zod`(已有,扩 schema)
- `react-markdown` + `remark-gfm`(根 web,渲染 AI markdown)

**Plan 2 完成状态:**
- 32 commits,75 tests pass
- 真 Airbnb URL → real grade B/76 完整跑通
- AI 字段仍是占位字符串 `"Plan 3 で AI レポートを実装します。"`

**Out of scope(Plan 4):**
- Resend F1/F7 邮件、@react-pdf/renderer、错误页 5A/5B/5C、Quality Status ladder UI、A5 参考值脚注、A7 升档动态文案、C4 变化箭头、F7 mock 文案

---

## How to hand off each Task to Codex

```
Read docs/superpowers/plans/2026-05-28-phase3-claude-agent-sdk.md.
Implement ONLY Task <N>. Follow every step exactly.
Do not modify files belonging to other tasks.
DO NOT commit — Claude will commit.
Output a brief summary of files changed + test/build results.
```

**Codex 必读参考:**
- `docs/prd.md` §3.4 (E)、§B12 — AI 报告内容要求 + B12 输出格式
- [`docs/adr/0003-claude-agent-sdk.md`](../../adr/0003-claude-agent-sdk.md) + [`docs/adr/0005-single-tool-use.md`](../../adr/0005-single-tool-use.md) — 为什么走 Agent SDK,为什么单次 tool_use
- `docs/system-design.md` §7 — SDK 调用模式 + tool schema 草案
- `design_handoff_review_app/prototype/AIReport.jsx` — UI 视觉参考(Newsreader serif body + Top3 priorities table)

---

## Repo state at Plan 3 start

- Branch: `feature/prototype`
- 最新 commit:`c40a3dd Correct test counts in phase2-status (was 21, actually 26 after .tsx fix)`
- 真流程跑通:URL → real grade,但 `ai.status: "fallback"` + 占位 markdown
- 75 tests pass(root 26 + scraper 49)

---

## Module File Plan

| Path | Created in | 职责 |
|---|---|---|
| `mac-scraper/src/ai/claude-agent.ts` | T3/T4 | SDK wrapper:`generateReport(snapshot, dims, reviews) → AIResult` |
| `mac-scraper/src/ai/prompts/system.ja.md` | T2 | 日语 system prompt(纯文本) |
| `mac-scraper/src/ai/prompts/tools.ts` | T2 | tool schema + zod validator + TS 类型 |
| `mac-scraper/src/ai/prompts/build.ts` | T2 | `buildUserPrompt(snapshot, dimensions, reviews) → string` |
| `mac-scraper/tests/ai-claude-agent.test.ts` | T4 | mock SDK 的 TDD |
| `mac-scraper/src/server.ts` | T5(修改) | 调 generateReport 替换 fallback 占位 |
| `mac-scraper/tests/server.test.ts` | T5(修改) | mock claude-agent 模块 |
| `components/AIReport.tsx` | T6 | RSC,react-markdown 渲染 + Top3 表格 + neg-kw chips |
| `components/Top3Priorities.tsx` | T6 | 单独 Top3 卡片组件 |
| `components/NegativeKeywords.tsx` | T6 | 负面词芯片组(B12 视觉) |
| `app/d/[id]/page.tsx` | T7(修改) | 右栏挂 AIReport(sticky on ≥1024px) |
| `docs/superpowers/plans/phase3-status.md` | T9 | 完成报告 |

---

## Task 1 — Install Claude Agent SDK + react-markdown deps

**Files:**
- Modify: `mac-scraper/package.json`(+`@anthropic-ai/claude-agent-sdk`)
- Modify: `package.json`(+`react-markdown` + `remark-gfm`)

- [ ] **Step 1 · 装 mac-scraper 端 SDK**

```bash
cd mac-scraper && pnpm add @anthropic-ai/claude-agent-sdk
```

Expected: 装上,无 ERR。SDK 体积可能较大(可能拉 `@anthropic-ai/sdk` 作传递依赖,也可能不;接受 pnpm 选定的版本)。

- [ ] **Step 2 · 验证可 import**

写临时脚本 `mac-scraper/tmp-import-check.mjs`:
```js
import * as sdk from "@anthropic-ai/claude-agent-sdk";
console.log("exports:", Object.keys(sdk).sort().join(", "));
```
Run: `cd mac-scraper && node tmp-import-check.mjs`
Expected:打印一行包含 `query`(或其它入口名)的导出列表。把实际导出列表写入 task 输出,Plan 3 后续 task 用真实 API 名字而不是 plan 草案里的猜测。

删除 tmp 脚本:`rm mac-scraper/tmp-import-check.mjs`

- [ ] **Step 3 · 装根 web 端 markdown 渲染**

```bash
pnpm add react-markdown remark-gfm
```

- [ ] **Step 4 · pnpm build 两侧通过**

```bash
pnpm build
cd mac-scraper && pnpm build
```

**Commit message:** `Install Claude Agent SDK (scraper) + react-markdown (web)`

---

## Task 2 — Tool schema + zod validator + JA system prompt + build prompt

**Files:**
- Create: `mac-scraper/src/ai/prompts/tools.ts`
- Create: `mac-scraper/src/ai/prompts/system.ja.md`
- Create: `mac-scraper/src/ai/prompts/build.ts`
- Create: `mac-scraper/tests/ai-prompts.test.ts`

- [ ] **Step 1 · 写 `mac-scraper/src/ai/prompts/tools.ts`**

```ts
import { z } from "zod";

export const aiOutputSchema = z.object({
  report_md: z.string().min(50).describe("日本語マークダウン本文(総評・5次元・Top3・リスクを含む)"),
  negative_keywords: z
    .array(
      z.object({
        keyword: z.string().min(1).max(40),
        count: z.number().int().min(1),
        quote: z.string().min(1).max(400),
      }),
    )
    .max(5),
  top3: z
    .array(
      z.object({
        issue: z.string().min(3).max(200),
        action: z.string().min(3).max(300),
        impact: z.string().min(3).max(200),
      }),
    )
    .min(1)
    .max(3),
});

export type AIOutput = z.infer<typeof aiOutputSchema>;

/** JSON-Schema form for the SDK tool definition */
export const submitDiagnosisReportSchema = {
  type: "object",
  properties: {
    report_md: {
      type: "string",
      description: "日本語マークダウン本文。総評→5次元→Top3→リスクの順。",
    },
    negative_keywords: {
      type: "array",
      maxItems: 5,
      items: {
        type: "object",
        required: ["keyword", "count", "quote"],
        properties: {
          keyword: { type: "string", description: "日本語短語(2-6字)" },
          count: { type: "integer", description: "言及回数" },
          quote: { type: "string", description: "原文引用(言語そのまま)" },
        },
      },
    },
    top3: {
      type: "array",
      minItems: 1,
      maxItems: 3,
      items: {
        type: "object",
        required: ["issue", "action", "impact"],
        properties: {
          issue: { type: "string", description: "現状の問題(1文)" },
          action: { type: "string", description: "具体的なアクション" },
          impact: { type: "string", description: "期待効果" },
        },
      },
    },
  },
  required: ["report_md", "negative_keywords", "top3"],
} as const;

export const TOOL_NAME = "submit_diagnosis_report" as const;
```

- [ ] **Step 2 · 写 `mac-scraper/src/ai/prompts/system.ja.md`**

```markdown
あなたは Airbnb 物件運営の専門家です。
ホストが物件のパフォーマンスを改善できるよう、データに基づき日本語の診断レポートを作成します。

# 必ず守る方針

- 出力は **submit_diagnosis_report ツール経由のみ**。テキストレスポンスは使わない。
- 文体: 敬体「です・ます」調、ビジネス文書ライク。冗長にしすぎない。
- レポートは具体的かつ実行可能に。「ユーザー体験を向上させましょう」のような抽象論は禁止。
- 改善案は数値・固有名詞を含む(例:「Wi-Fi の速度(目安: 50Mbps)を説明文に明記してください」)。
- 否定キーワードは同義語をマージし、原文引用は原語のまま残す。

# レポート構成(report_md フィールド)

1. ## 総評(1-2 段落で全体像)
2. ## 5 次元分析(写真 / タイトル / 説明文 / 設備 / レビュー、各 2-4 行)
3. ## Top 3 改善優先度(top3 配列と同じ順序、簡潔に箇条書き)
4. ## リスク(あれば。なければ「現時点で顕著なリスクはありません」)
```

- [ ] **Step 3 · 写 `mac-scraper/src/ai/prompts/build.ts`**

```ts
import type { Snapshot } from "../../airbnb/extract.js";
import type { Review } from "../../airbnb/fetch-reviews.js";

export type Dimensions = {
  photos: { score: number; total?: number; b1_status?: string; b3_coverage?: string };
  title: { score: number; placeholder?: boolean };
  description: { score: number; length?: number; sections_hit?: string[]; locales?: string[] };
  amenities: { score: number; match_ratio?: string; missing?: string[] };
  reviews: { score: number; rating?: number; count?: number; sparse?: boolean };
};

export function buildUserPrompt(snapshot: Snapshot, dims: Dimensions, reviews: Review[]): string {
  const sampleReviews = reviews.slice(0, 30).map((r) => `- (${r.rating}/5) ${r.comments.slice(0, 200)}`).join("\n");

  return `# 物件情報

- リスティングID: ${snapshot.listing_id}
- タイトル: ${snapshot.title ?? "(取得失敗)"}
- 写真数: ${snapshot.photos.count}枚 / cover: ${snapshot.photos.cover_category ?? "?"}
- 評価: ${snapshot.rating.overall ?? "?"} (${snapshot.rating.count ?? "?"}件)
- 説明文長さ: ${snapshot.description_text?.length ?? 0}文字
- 設備数: ${snapshot.amenities.filter((a) => a.available).length}件

# 5 次元スコア(0-100)

- 写真: ${dims.photos.score} (B1=${dims.photos.b1_status ?? "?"}, B3 coverage=${dims.photos.b3_coverage ?? "?"})
- タイトル: ${dims.title.score}${dims.title.placeholder ? " ※プレースホルダー" : ""}
- 説明文: ${dims.description.score} (${dims.description.length ?? 0}文字, 章節 ${dims.description.sections_hit?.length ?? 0}/6, locales=${dims.description.locales?.join(",") ?? "ja"})
- 設備: ${dims.amenities.score} (${dims.amenities.match_ratio ?? "?"} 一致, 不足: ${(dims.amenities.missing ?? []).slice(0, 5).join("、")})
- レビュー: ${dims.reviews.score} (★${dims.reviews.rating ?? "?"}, ${dims.reviews.count ?? "?"}件${dims.reviews.sparse ? "、データ少" : ""})

# レビュー抜粋(直近${Math.min(reviews.length, 30)}件)

${sampleReviews || "(レビューを取得できませんでした)"}

上記に基づき、submit_diagnosis_report ツールで診断レポートを返してください。`;
}
```

- [ ] **Step 4 · 写测试 `mac-scraper/tests/ai-prompts.test.ts`**

```ts
import { describe, it, expect } from "vitest";
import { aiOutputSchema, submitDiagnosisReportSchema, TOOL_NAME } from "../src/ai/prompts/tools.js";
import { buildUserPrompt } from "../src/ai/prompts/build.js";

describe("aiOutputSchema", () => {
  it("accepts valid output", () => {
    const ok = aiOutputSchema.safeParse({
      report_md: "## 総評\n" + "a".repeat(100),
      negative_keywords: [{ keyword: "汚れ", count: 3, quote: "汚かった" }],
      top3: [{ issue: "x", action: "y", impact: "z" }],
    });
    expect(ok.success).toBe(true);
  });

  it("rejects empty top3", () => {
    const r = aiOutputSchema.safeParse({
      report_md: "a".repeat(80),
      negative_keywords: [],
      top3: [],
    });
    expect(r.success).toBe(false);
  });

  it("rejects > 5 negative keywords", () => {
    const r = aiOutputSchema.safeParse({
      report_md: "a".repeat(80),
      negative_keywords: Array(6).fill({ keyword: "x", count: 1, quote: "x" }),
      top3: [{ issue: "x", action: "y", impact: "z" }],
    });
    expect(r.success).toBe(false);
  });
});

describe("submitDiagnosisReportSchema", () => {
  it("has the expected top-level shape", () => {
    expect(submitDiagnosisReportSchema.type).toBe("object");
    expect(submitDiagnosisReportSchema.required).toEqual(["report_md", "negative_keywords", "top3"]);
    expect(TOOL_NAME).toBe("submit_diagnosis_report");
  });
});

describe("buildUserPrompt", () => {
  it("includes title, rating, dim scores", () => {
    const p = buildUserPrompt(
      {
        listing_id: "999",
        title: "テスト物件",
        description_html: undefined,
        description_text: "寝室。リビング。",
        amenities: [{ title: "Wi-Fi", available: true }],
        photos: { count: 12, categories: {}, cover_category: "リビング" },
        rating: { overall: 4.8, count: 50, subscores: {} },
        review_tags: [],
        highlights: [],
        house_rules: [],
        api_key: "x",
        reviews_persisted_hash: "x",
      },
      {
        photos: { score: 95, total: 12, b1_status: "adequate", b3_coverage: "5/5" },
        title: { score: 70, placeholder: true },
        description: { score: 75, length: 8, sections_hit: [], locales: ["ja"] },
        amenities: { score: 100, match_ratio: "1/1" },
        reviews: { score: 96, rating: 4.8, count: 50, sparse: false },
      },
      [{ id: "r1", comments: "good", rating: 5, language: "en" }],
    );
    expect(p).toContain("テスト物件");
    expect(p).toContain("4.8");
    expect(p).toContain("submit_diagnosis_report");
  });
});
```

- [ ] **Step 5 · 测试通过**

`cd mac-scraper && pnpm test ai-prompts.test.ts` → all pass(4 tests)。

**Commit message:** `Add AI prompt schema + zod validation + JA system prompt + prompt builder`

---

## Task 3 — claude-agent.ts wrapper(skeleton, no SDK call yet)

**Files:**
- Create: `mac-scraper/src/ai/claude-agent.ts`

(说明:这一步只搭骨架,让 SDK 调用以可被 mock 的方式存在。T4 给它写 TDD 覆盖。)

- [ ] **Step 1 · 写骨架 `mac-scraper/src/ai/claude-agent.ts`**

注意:Task 1 Step 2 已经输出了 SDK 实际导出名。本 task **必须**使用真实导出(不要用 plan 草稿里的 `query`,如果实际不是这名字)。如导出是 `query`,用 query;如是 `runAgent`,用 runAgent。

下面以 `query` 为例。Codex 应替换为真实名。

```ts
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
// !!! 替换为 Task 1 输出中真实的 SDK 入口名
import { query } from "@anthropic-ai/claude-agent-sdk";
import { aiOutputSchema, submitDiagnosisReportSchema, TOOL_NAME, type AIOutput } from "./prompts/tools.js";
import { buildUserPrompt, type Dimensions } from "./prompts/build.js";
import type { Snapshot } from "../airbnb/extract.js";
import type { Review } from "../airbnb/fetch-reviews.js";
import { log } from "../log.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SYSTEM_PROMPT = readFileSync(resolve(__dirname, "prompts/system.ja.md"), "utf8");

export type GenerateResult =
  | { status: "ok"; data: AIOutput }
  | { status: "fallback"; reason: string };

export type SdkInjector = {
  callSdk: (params: { systemPrompt: string; userPrompt: string }) => Promise<unknown>;
};

/**
 * Inner core. Accept an injector so we can mock the SDK in tests.
 */
export async function generateReportWith(
  snapshot: Snapshot,
  dimensions: Dimensions,
  reviews: Review[],
  injector: SdkInjector,
): Promise<GenerateResult> {
  const userPrompt = buildUserPrompt(snapshot, dimensions, reviews);
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const raw = await injector.callSdk({ systemPrompt: SYSTEM_PROMPT, userPrompt });
      const parsed = aiOutputSchema.safeParse(raw);
      if (parsed.success) {
        return { status: "ok", data: parsed.data };
      }
      log.warn({ issues: parsed.error.issues, attempt }, "AI output failed zod validation");
    } catch (e) {
      log.warn({ err: String(e), attempt }, "Claude Agent SDK call threw");
    }
  }
  return { status: "fallback", reason: "Claude Agent SDK 出力検証に失敗しました" };
}

/**
 * Real SDK injector. Iterates the Claude Agent stream until a tool_use
 * for submit_diagnosis_report is captured; returns its `input`.
 */
export const realSdkInjector: SdkInjector = {
  async callSdk({ systemPrompt, userPrompt }) {
    const result = await query({
      prompt: userPrompt,
      // NB: 以下选项名称请按 Task 1 Step 2 输出的真实 SDK 类型调整
      systemPrompt,
      tools: [
        {
          name: TOOL_NAME,
          description: "診断レポートを提出する",
          input_schema: submitDiagnosisReportSchema,
        },
      ],
      maxTurns: 1,
    } as Parameters<typeof query>[0]);

    for await (const msg of result as AsyncIterable<unknown>) {
      const m = msg as { type?: string; name?: string; input?: unknown };
      if (m.type === "tool_use" && m.name === TOOL_NAME) {
        return m.input;
      }
    }
    throw new Error("no_tool_use_in_stream");
  },
};

/** Default factory: real SDK. */
export async function generateReport(
  snapshot: Snapshot,
  dimensions: Dimensions,
  reviews: Review[],
): Promise<GenerateResult> {
  return generateReportWith(snapshot, dimensions, reviews, realSdkInjector);
}
```

- [ ] **Step 2 · `pnpm build` 通过**

`cd mac-scraper && pnpm build` → 若 SDK 真实 API 与上面草稿不一致(如导出名、options shape),Codex 应**调整代码让 build 通过**。允许做的调整:
- 替换 `query` 为真实导出名
- 调整 options 字段(`systemPrompt`、`tools`、`maxTurns` 等)
- 调整 tool_use 消息的实际 type/name 字段位置

**目标:`pnpm build` pass。** 此 task 不跑测试。

**Commit message:** `Add claude-agent wrapper skeleton with injectable SDK adapter`

---

## Task 4 — TDD claude-agent.ts(mock SDK)

**Files:**
- Create: `mac-scraper/tests/ai-claude-agent.test.ts`

- [ ] **Step 1 · 写测试**

```ts
import { describe, it, expect, vi } from "vitest";
import { generateReportWith, type SdkInjector } from "../src/ai/claude-agent.js";
import type { Snapshot } from "../src/airbnb/extract.js";
import type { Dimensions } from "../src/ai/prompts/build.js";

const snap: Snapshot = {
  listing_id: "1",
  title: "x",
  description_html: undefined,
  description_text: "寝室。リビング。キッチン。",
  amenities: [],
  photos: { count: 10, categories: {}, cover_category: "リビング" },
  rating: { overall: 4.5, count: 10, subscores: {} },
  review_tags: [],
  highlights: [],
  house_rules: [],
  api_key: undefined,
  reviews_persisted_hash: undefined,
};
const dims: Dimensions = {
  photos: { score: 90 },
  title: { score: 70 },
  description: { score: 80 },
  amenities: { score: 70 },
  reviews: { score: 90, rating: 4.5, count: 10 },
};

const validOutput = {
  report_md: "## 総評\n" + "x".repeat(80),
  negative_keywords: [{ keyword: "汚れ", count: 2, quote: "汚かった" }],
  top3: [
    { issue: "写真不足", action: "リビング写真を追加", impact: "クリック率向上" },
    { issue: "設備記述漏れ", action: "Wi-Fi を明記", impact: "問い合わせ削減" },
    { issue: "アクセス情報不足", action: "駅から徒歩X分を追加", impact: "予約率向上" },
  ],
};

describe("generateReportWith", () => {
  it("returns ok with parsed data when SDK returns valid output", async () => {
    const injector: SdkInjector = { callSdk: vi.fn().mockResolvedValue(validOutput) };
    const r = await generateReportWith(snap, dims, [], injector);
    expect(r.status).toBe("ok");
    if (r.status === "ok") expect(r.data.top3.length).toBe(3);
  });

  it("retries once on first failure, succeeds on second", async () => {
    const callSdk = vi
      .fn()
      .mockRejectedValueOnce(new Error("transient"))
      .mockResolvedValueOnce(validOutput);
    const r = await generateReportWith(snap, dims, [], { callSdk });
    expect(r.status).toBe("ok");
    expect(callSdk).toHaveBeenCalledTimes(2);
  });

  it("falls back when both attempts throw", async () => {
    const callSdk = vi.fn().mockRejectedValue(new Error("nope"));
    const r = await generateReportWith(snap, dims, [], { callSdk });
    expect(r.status).toBe("fallback");
    expect(callSdk).toHaveBeenCalledTimes(2);
  });

  it("falls back when SDK returns schema-invalid object", async () => {
    const callSdk = vi.fn().mockResolvedValue({ report_md: "too short", negative_keywords: [], top3: [] });
    const r = await generateReportWith(snap, dims, [], { callSdk });
    expect(r.status).toBe("fallback");
    expect(callSdk).toHaveBeenCalledTimes(2);
  });
});
```

- [ ] **Step 2 · 测试通过 4/4**

`cd mac-scraper && pnpm test ai-claude-agent.test.ts` → 4 pass。

**Commit message:** `TDD claude-agent generator with retry + zod-fallback`

---

## Task 5 — Wire AI into server.ts, replace ai placeholder

**Files:**
- Modify: `mac-scraper/src/server.ts`(调用 generateReport)
- Modify: `mac-scraper/tests/server.test.ts`(mock claude-agent 模块)

- [ ] **Step 1 · 修改 server.ts**

在 `/diagnose` handler 里,把现有 ai 占位:
```ts
ai: {
  report_md: "Plan 3 で AI レポートを実装します。",
  negative_keywords: [],
  top3: [],
  status: "fallback",
},
```

替换为:
```ts
import { generateReport } from "./ai/claude-agent.js";

// ... after aggregate(...) but before constructing the response Diagnosis:
const ai = await generateReport(snapshot, {
  photos: photosScore,
  title: titleScore,
  description: descScore,
  amenities: amenScore,
  reviews: reviewsScore,
}, reviewList);

const aiBlock = ai.status === "ok"
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

// then in the response:
ai: aiBlock,
```

- [ ] **Step 2 · 修改 server.test.ts**

在文件顶部加:
```ts
vi.mock("../src/ai/claude-agent.js", () => ({
  generateReport: vi.fn().mockResolvedValue({
    status: "ok",
    data: {
      report_md: "## 総評\nテスト用レポート。" + "x".repeat(60),
      negative_keywords: [],
      top3: [
        { issue: "test issue", action: "test action", impact: "test impact" },
      ],
    },
  }),
}));
```

现有 3 个 real-flow 测试应继续通过(返回的 diagnosis.ai.status 现在是 "ok",不是 "fallback")。如有断言需要,Codex 调整。

- [ ] **Step 3 · 全部测试通过**

`cd mac-scraper && pnpm test`
Expected: 11+ 文件,~53 tests pass(原 49 + ai-prompts 4 + ai-claude-agent 4 - 1 老占位 maybe)。

**Commit message:** `Wire Claude Agent SDK output into /diagnose response`

---

## Task 6 — AIReport + Top3Priorities + NegativeKeywords UI 组件

**Files:**
- Create: `components/AIReport.tsx`
- Create: `components/Top3Priorities.tsx`
- Create: `components/NegativeKeywords.tsx`

视觉参考:`design_handoff_review_app/prototype/AIReport.jsx`(Newsreader serif body + Top 3 priorities table + 下载 PDF 按钮 — 本 Plan 不实装 PDF,Plan 4 接)。

- [ ] **Step 1 · 写 `components/Top3Priorities.tsx`**

```tsx
type Item = { issue: string; action: string; impact: string };

export function Top3Priorities({ items }: { items: Item[] }) {
  if (!items?.length) return null;
  return (
    <section style={{ margin: "var(--s-5) 0" }}>
      <h3 className="t-h3" style={{ marginBottom: "var(--s-3)" }}>Top 3 改善優先度</h3>
      <ol style={{ display: "grid", gap: "var(--s-3)", padding: 0, listStyle: "none", counterReset: "top3" }}>
        {items.map((it, i) => (
          <li
            key={i}
            style={{
              counterIncrement: "top3",
              background: "var(--card)",
              border: "1px solid var(--ink-100)",
              borderRadius: "var(--r-lg)",
              padding: "var(--s-4) var(--s-5)",
              display: "grid",
              gap: "var(--s-2)",
              position: "relative",
            }}
          >
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                top: "var(--s-4)",
                right: "var(--s-5)",
                fontFamily: "var(--font-serif)",
                fontStyle: "italic",
                fontSize: "var(--t-lg)",
                color: "var(--ink-300)",
              }}
            >
              0{i + 1}
            </div>
            <div className="t-small" style={{ color: "var(--ink-500)" }}>問題</div>
            <div className="t-body" style={{ margin: 0, fontWeight: "var(--w-medium)" }}>{it.issue}</div>
            <div className="t-small" style={{ color: "var(--ink-500)", marginTop: "var(--s-2)" }}>アクション</div>
            <div className="t-body" style={{ margin: 0 }}>{it.action}</div>
            <div className="t-small" style={{ color: "var(--ink-500)", marginTop: "var(--s-2)" }}>期待効果</div>
            <div className="t-body" style={{ margin: 0, color: "var(--grade-a-ink)" }}>{it.impact}</div>
          </li>
        ))}
      </ol>
    </section>
  );
}
```

- [ ] **Step 2 · 写 `components/NegativeKeywords.tsx`**

```tsx
type Item = { keyword: string; count: number; quote: string };

export function NegativeKeywords({ items }: { items: Item[] }) {
  if (!items?.length) {
    return (
      <section style={{ margin: "var(--s-5) 0" }}>
        <h3 className="t-h3" style={{ marginBottom: "var(--s-2)" }}>否定キーワード</h3>
        <p className="t-small" style={{ color: "var(--ink-500)" }}>
          ✅ 高頻度の否定キーワードは検出されませんでした
        </p>
      </section>
    );
  }
  return (
    <section style={{ margin: "var(--s-5) 0" }}>
      <h3 className="t-h3" style={{ marginBottom: "var(--s-3)" }}>否定キーワード Top {items.length}</h3>
      <ul style={{ display: "grid", gap: "var(--s-3)", padding: 0, listStyle: "none" }}>
        {items.map((it, i) => (
          <li
            key={i}
            style={{
              display: "grid",
              gridTemplateColumns: "auto 1fr",
              gap: "var(--s-3)",
              alignItems: "baseline",
            }}
          >
            <span
              style={{
                background: "var(--grade-d-fill)",
                color: "var(--grade-d-ink)",
                padding: "2px 10px",
                borderRadius: "var(--r-pill)",
                fontSize: "var(--t-sm)",
                fontWeight: "var(--w-semibold)",
                whiteSpace: "nowrap",
              }}
            >
              {it.keyword} ×{it.count}
            </span>
            <span className="t-small" style={{ color: "var(--ink-500)", fontStyle: "italic" }}>
              “{it.quote.slice(0, 140)}{it.quote.length > 140 ? "…" : ""}”
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
```

- [ ] **Step 3 · 写 `components/AIReport.tsx`(server component)**

```tsx
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Top3Priorities } from "./Top3Priorities";
import { NegativeKeywords } from "./NegativeKeywords";

type Props = {
  reportMd: string | null;
  top3: Array<{ issue: string; action: string; impact: string }>;
  negativeKeywords: Array<{ keyword: string; count: number; quote: string }>;
  status: "ok" | "fallback";
};

export function AIReport({ reportMd, top3, negativeKeywords, status }: Props) {
  return (
    <aside
      style={{
        background: "var(--card)",
        border: "1px solid var(--ink-100)",
        borderRadius: "var(--r-lg)",
        padding: "var(--s-6) var(--s-5)",
        position: "sticky",
        top: "var(--s-5)",
      }}
    >
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "var(--s-4)" }}>
        <h2 className="t-h2" style={{ margin: 0 }}>AI レポート</h2>
        {status === "fallback" && (
          <span className="t-small" style={{ color: "var(--grade-c-ink)" }}>※ AI 出力フォールバック</span>
        )}
      </header>

      <article className="t-editorial">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {reportMd ?? "AI 分析は現在利用できません。"}
        </ReactMarkdown>
      </article>

      <Top3Priorities items={top3} />
      <NegativeKeywords items={negativeKeywords} />
    </aside>
  );
}
```

- [ ] **Step 4 · `pnpm build` 通过**

可能需要为 `react-markdown` + `remark-gfm` 解决 ESM 类型 — 若 TS 报错,加 `// @ts-expect-error` 临时跳过或更新 tsconfig 的 `moduleResolution` 不必动(应能直接通过)。

**Commit message:** `Add AIReport + Top3 + NegativeKeywords UI components`

---

## Task 7 — Mount AIReport on /d/[id] result page

**Files:**
- Modify: `app/d/[id]/page.tsx`

- [ ] **Step 1 · 更新结果页 layout 为二栏(wireframe 3A)**

参考 design_handoff_review_app/README.md 的 Screen 3 描述,大屏 ≥1024px 二栏:左 ScoreCard + DimensionGrid,右 AIReport。窄屏单栏。

```tsx
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db/client";
import { ScoreCard } from "@/components/ScoreCard";
import { DimensionGrid } from "@/components/DimensionGrid";
import { AIReport } from "@/components/AIReport";

type Params = { params: Promise<{ id: string }> };

export default async function ResultPage({ params }: Params) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const rows = await db.select().from(schema.diagnoses).where(eq(schema.diagnoses.id, id)).limit(1);
  const d = rows[0];
  if (!d) notFound();

  const listingRows = await db.select().from(schema.listings).where(eq(schema.listings.id, d.listingId)).limit(1);
  const listing = listingRows[0];

  return (
    <main style={{ maxWidth: "var(--content-max)", margin: "0 auto", padding: "var(--s-6) var(--gutter)" }}>
      <div className="t-small" style={{ color: "var(--ink-500)", marginBottom: "var(--s-2)" }}>{listing?.url}</div>
      <h1 className="t-h1" style={{ marginBottom: "var(--s-6)" }}>{listing?.title ?? d.listingId}</h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr)",
          gap: "var(--s-6)",
        }}
        className="result-grid"
      >
        <div>
          <ScoreCard score={d.overallScore} />
          <DimensionGrid dimensions={d.dimensions as Parameters<typeof DimensionGrid>[0]["dimensions"]} />
        </div>
        <AIReport
          reportMd={d.aiReportMd}
          top3={(d.aiTop3 as Parameters<typeof AIReport>[0]["top3"]) ?? []}
          negativeKeywords={(d.aiNegativeKw as Parameters<typeof AIReport>[0]["negativeKeywords"]) ?? []}
          status={(d.aiStatus as "ok" | "fallback") ?? "fallback"}
        />
      </div>

      <style>{`
        @media (min-width: 1024px) {
          .result-grid {
            grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) !important;
          }
        }
      `}</style>
    </main>
  );
}
```

(planner 注:嵌入 `<style>` 是简化做法。`grid-template-columns` 的内联 var 也行,但媒体查询需要 CSS。若 lint 抱怨 `dangerouslySetInnerHTML`,可改写为 globals.css 加一个 `.result-grid` 类。)

- [ ] **Step 2 · pnpm build 通过**

`pnpm build` → 0 error。

**Commit message:** `Mount AIReport in right column on result page (3A two-column on ≥1024px)`

---

## Task 8 — End-to-end smoke run with real Claude Agent SDK

**Files:** 无新建。本 task 是 hands-on E2E,跑真 AI 调用。

(⚠️ 这一步真调 Claude 订阅。先打开 Claude Code 应用确认登录态有效。预估单次 ~10-20s,$0 但消耗订阅 quota。)

- [ ] **Step 1 · 全部测试通过**

```bash
pnpm test && cd mac-scraper && pnpm test && cd ..
```

- [ ] **Step 2 · 启服务**

```bash
cd mac-scraper && pnpm dev &
SC=$!
ulimit -n 4096 && WATCHPACK_POLLING=true pnpm dev &
NX=$!
until curl -sf http://localhost:8787/healthz && curl -sf http://localhost:3000; do sleep 2; done
```

- [ ] **Step 3 · 真 AI 跑一次**

```bash
RESP=$(curl -sS -X POST http://localhost:3000/api/diagnose \
  -H 'Content-Type: application/json' \
  -d '{"url":"https://www.airbnb.jp/rooms/1174411978184206231"}')
echo "$RESP"
DID=$(echo "$RESP" | python3 -c 'import json,sys; print(json.load(sys.stdin)["diagnosis_id"])')
# DB 查 ai 字段是否非空
PGPASSWORD="" psql "$DATABASE_URL" -c "select ai_status, length(ai_report_md), jsonb_array_length(ai_top3) from diagnoses where id='$DID';" 2>/dev/null || true
```

期望:
- `ai_status = ok`
- `length(ai_report_md) > 200`
- `jsonb_array_length(ai_top3) = 3`(or 1-3)
- 浏览器打开 /d/<uuid>,右侧 AIReport 渲染出日语 markdown + Top3 cards

- [ ] **Step 4 · 杀服务**

```bash
kill $SC $NX 2>/dev/null
```

(若杀失败,记下 PID,Claude planner 会用其它手段清理。)

- [ ] **Step 5 · 输出 summary 给 Claude review**

包含:
- ai_status
- report_md 头 200 字
- top3 数组长度 + 第 1 条
- negative_keywords 长度

---

## Task 9 — phase3-status.md

**Files:**
- Create: `docs/superpowers/plans/phase3-status.md`

- [ ] **Step 1 · 写状态文档**

```markdown
# Phase 3 Status

**Completed:** 2026-MM-DD

## What works
- 真 Airbnb URL → real fetch + parse + 5 dim score → **Claude Agent SDK 一次 tool_use 出 report_md + Top3 + neg_kw**
- 走本机 Claude Code Enterprise OAuth,$0 API
- zod 校验 + 1 次重试 + fallback
- 结果页右栏 sticky AIReport(<1024px 单栏)

## Smoke run
- listing 1174411978184206231:diagnosis_id = <uuid>,ai_status = ok,report ~XXX 字,Top3 = N 条

## Known gaps(Plan 4)
- 没邮件(F1 score<60 / F7 週次サマリー)
- 没 PDF 下载(react-pdf + NotoSansJP)
- 没错误页 5A/5B/5C
- 没 Quality Status ladder UI(A5)
- A7 升档动态文案 / C4 变化箭头 未实装
- v0.4 deltas:A5 参考值脚注 / F7 mock 文案 / B7 文字数+章节确认

## Next plan
docs/superpowers/plans/2026-MM-DD-phase4-email-pdf-polish.md(待写)
```

- [ ] **Step 2 · 不 commit,Claude planner 收尾**

---

## Self-review checklist

- [x] **Spec coverage** — Plan 3 覆盖 SPEC §3.4 E(AI 报告 5 段)、B12(高频负面词)、F1 邮件 Top3 数据来源。F1/F7 邮件本身留给 Plan 4。
- [x] **No placeholders** — 每个 task 有完整代码 + tests。
- [x] **Type consistency** — `AIOutput`(zod)→ Diagnosis.ai 字段;`Dimensions`(prompt build)同 score 输出兼容。
- [x] **Self-contained tasks** — 含 ADR-005、SPEC E、SDK 调用模式等关键引用。
- [x] **TDD on logic; UI on build** — claude-agent / prompt schema TDD;UI 组件靠 build pass。

---

## Risks(planner 提示)

1. **SDK API 名 / shape 与 plan 草稿不一致** — T1 Step 2 输出真实导出列表,T3/T5 必须按真实 API 调整。如导出是 `runAgent` 而非 `query`,Codex 不可硬照 plan 写。
2. **Claude Code 必须登录有效** — 本 Mac 当前已登录(用户在 Codex Plus 等多个产品上下文中)。T8 之前**手动确认** Claude Code app 状态。
3. **TOS 灰区(ADR-003)** — 仅本机 demo,不上规模化部署。Plan 4 / v1 切回 API key。
4. **AI 输出不符合 schema** — 通过 zod + 重试 1 次 + fallback 兜底,UI 显示「※ AI 出力フォールバック」。

---

## Execution

同 Plan 1/2 模式:`codex exec --sandbox workspace-write -c 'sandbox_workspace_write.network_access=true' -C "..." "..."`。Codex 写代码 + 跑测试,Claude 看 diff + commit。
