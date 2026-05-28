# Phase 1 · Foundation & End-to-end Skeleton — Implementation Plan

> **执行模式:** Codex CLI 在同一仓库逐 task 实现。本文件每个 Task 自包含;Codex 一次只做一个 Task,完成后 commit;Claude Code(planner)用 `git diff` review,通过后才进入下一个 Task。
>
> **完成 Plan 1 后到达的状态:** 跑 `pnpm dev` 打开页面 → 粘贴 Airbnb URL → 点诊断 → 跳到结果页 → 看到 fixture 数据填充的 ScoreCard。**没有**真抓取/AI/邮件/PDF — 这些在 Plan 2-4。

**Goal:** 立起 Next.js + Mac scraper 骨架,通过 URL→fixture→DB→结果页的端到端链路。

**Architecture:** Next.js 15 App Router(部署目标 Vercel Hobby)+ 同仓库 `mac-scraper/` Express 服务。Web 用 Bearer 鉴权 POST 调 Mac。Mac 返回固定 fixture(符合 Diagnosis 契约)。结果写入 Neon Postgres(Drizzle),`/d/[id]` 服务端组件读 DB 渲染。

**Tech Stack:** Next.js 15 · React 19 · TypeScript 5 · pnpm · Vitest · @testing-library/react · Drizzle ORM · @neondatabase/serverless · next-intl · Express · supertest · pino · zod

**Out of scope(后续 plan):**
- Plan 2 — 真 PDP fetch + deferred-state 解析 + Reviews GraphQL + 5 维度评分
- Plan 3 — Claude Agent SDK + 单次 tool_use 3 产物
- Plan 4 — Resend F1/F7 + @react-pdf/renderer + 错误页 5A/5B/5C + v0.4 deltas 最终核对

---

## How to hand off each Task to Codex

在仓库根目录运行 Codex CLI(用户的本地 Codex 工具),提示词模板:

```
Read docs/superpowers/plans/2026-05-27-phase1-foundation-skeleton.md.
Implement ONLY Task <N>. Follow every step exactly.
Do not modify files belonging to other tasks.
After all steps pass, commit with the exact commit message at the end of Task <N>.
```

Codex commit 后,Claude Code 用 `git log -1 --stat` + `git show HEAD` + 跑 task 末尾的验证命令做 review。通过 → 下一个 Task;不通过 → 写 rework brief 重新交给 Codex。

**Codex 必读的设计参考(按需逐 task 读):**
- `design_handoff_review_app/design_system/colors_and_type.css` — 设计 token(Task 3 整体拷入 `app/globals.css`)
- `design_handoff_review_app/prototype/kit.css` — 组件样式参考
- `design_handoff_review_app/prototype/DiagnosticForm.jsx` — Task 15 视觉参考
- `design_handoff_review_app/prototype/ScoreCard.jsx` — Task 16 视觉参考
- `design_handoff_review_app/prototype/fixture.js` — Task 12 fixture 形状参考
- `docs/prd.md` §A1/A4 — 评分卡 + 字母 + 颜色业务规则
- `docs/system-design.md` §3-§5 — 模块树 + DB schema + API 契约
- `CLAUDE.md` §6 — v0.4 必须落实的 deltas(本 plan 中 v0.4 deltas 主要影响后续 plan,Plan 1 仅保证 ja 锁定 + ScoreCard 字母配色对齐)

---

## Repo state at Plan 1 start

- Branch: `feature/prototype`
- 工作树干净
- 已有:`docs/prd.md`、`docs/system-design.md`、`docs/adr/`、`CLAUDE.md`、`design_handoff_review_app/`、`docs/user-flow.md`、`.gitignore`、`.claude/`
- 缺:`package.json`(root)、`node_modules`、`mac-scraper/`、`lib/`、`app/`、`components/`、`.env.local`

---

## Module File Plan

| Path | Created in | 职责 |
|---|---|---|
| `package.json` | T1 | Next.js root 依赖 + scripts |
| `tsconfig.json` | T1 | TS 配置(`@/*` alias) |
| `next.config.mjs` | T1 | Next 配置 |
| `.env.example` | T1 | 文档化所有环境变量 |
| `.env.local`(gitignore) | T1 | 本地真值 |
| `vitest.config.ts` | T2 | Vitest + jsdom + alias |
| `tests/setup.ts` | T2 | jest-dom matchers |
| `app/layout.tsx` | T1 / T3 | Root layout:`html lang="ja"` + fonts |
| `app/globals.css` | T3 | 设计 token(从 design_system 拷入) |
| `app/page.tsx` | T15 | URL 输入页(wireframe 1C) |
| `app/d/[id]/page.tsx` | T17 | 结果页 RSC(wireframe 3A 二列骨架) |
| `app/api/diagnose/route.ts` | T14 | POST: URL→scraper→DB→redirect |
| `components/DiagnosticForm.tsx` | T15 | 表单 client 组件 |
| `components/ScoreCard.tsx` | T16 | 评分卡 server 组件 |
| `lib/util/url.ts` | T7 | Airbnb URL parser |
| `lib/util/grade.ts` | T8 | score→grade 映射 |
| `lib/types/diagnosis.ts` | T9 | Diagnosis 契约类型 |
| `lib/scraper/client.ts` | T13 | HTTP client to Mac scraper |
| `lib/db/schema.ts` | T5 | Drizzle 表定义 |
| `lib/db/client.ts` | T5 | Neon + Drizzle client |
| `lib/i18n/ja.ts` | T4 | 集中的 JA UI 文案 |
| `drizzle.config.ts` | T5 | Drizzle Kit 配置 |
| `mac-scraper/package.json` | T6 | Express 项目 deps |
| `mac-scraper/tsconfig.json` | T6 | TS 配置 |
| `mac-scraper/vitest.config.ts` | T6 | Vitest 配置 |
| `mac-scraper/.env`(gitignore) | T6 | scraper 端 env |
| `mac-scraper/src/server.ts` | T6 / T10 / T11 | Express bootstrap + routes |
| `mac-scraper/src/auth.ts` | T10 | Bearer middleware |
| `mac-scraper/src/types.ts` | T9 | Diagnosis 类型(mirror lib/types) |
| `mac-scraper/src/fixtures/sample.ts` | T12 | Plan 1 fixture |
| `mac-scraper/tests/server.test.ts` | T10 / T11 | supertest 集成测试 |
| `tests/url.test.ts` | T7 | URL 解析单测 |
| `tests/grade.test.ts` | T8 | grade 映射单测 |
| `tests/scraper-client.test.ts` | T13 | scraper client 单测 |
| `tests/api-diagnose.test.ts` | T14 | API route 集成测试 |
| `tests/ScoreCard.test.tsx` | T16 | ScoreCard 渲染测试 |

---

## Task 1 — Scaffold Next.js 15 root project

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.mjs`, `.env.example`, `app/layout.tsx`, `app/page.tsx`, `app/globals.css`
- Modify: `.gitignore`

- [ ] **Step 1 · Write `package.json`**

```jsonc
{
  "name": "sozo-review-web",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest run",
    "test:watch": "vitest",
    "db:generate": "drizzle-kit generate",
    "db:push": "drizzle-kit push"
  },
  "dependencies": {
    "next": "15.1.4",
    "react": "19.0.0",
    "react-dom": "19.0.0"
  },
  "devDependencies": {
    "@types/node": "^22.10.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "typescript": "5.7.2",
    "eslint": "^9.17.0",
    "eslint-config-next": "15.1.4"
  }
}
```

- [ ] **Step 2 · Write `tsconfig.json`**

```jsonc
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "es2022"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules", "mac-scraper"]
}
```

- [ ] **Step 3 · Write `next.config.mjs`**

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    typedRoutes: true,
  },
};

export default nextConfig;
```

- [ ] **Step 4 · Write `.env.example`**

```dotenv
# Neon Postgres connection string (pooled or direct — both work)
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DB?sslmode=require"

# Mac scraper endpoint (local dev) — Plan 1 默认 http://localhost:8787
SCRAPER_URL="http://localhost:8787"

# Bearer token shared with mac-scraper/.env
SCRAPER_SECRET="<32-byte random hex>"

# Plan 4 才用到,Plan 1 留占位
RESEND_API_KEY=""
ALERT_EMAIL_TO="alerts@example.com"
```

- [ ] **Step 5 · Append to `.gitignore`** (read 现有 .gitignore,把以下条目追加进去,不重复)

```gitignore
# Next.js
.next/
out/
next-env.d.ts

# Node
node_modules/

# Env
.env
.env.local
.env.*.local

# Mac scraper
mac-scraper/node_modules/
mac-scraper/dist/
mac-scraper/.env

# Editor / OS
.DS_Store
.vscode/
.idea/
```

- [ ] **Step 6 · Write `app/globals.css`**(此 task 仅占位,T3 替换)

```css
/* Plan 1 · T3 will replace this with the design tokens from
 * design_handoff_review_app/design_system/colors_and_type.css */
```

- [ ] **Step 7 · Write `app/layout.tsx`**

```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SOZO Review · 物件ヘルスチェック",
  description: "Airbnb 物件の健康診断システム",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 8 · Write `app/page.tsx`**(临时占位,T15 替换)

```tsx
export default function Home() {
  return (
    <main style={{ padding: 24 }}>
      <h1>SOZO Review</h1>
      <p>Foundation skeleton. Task 15 で URL 入力フォームに差し替えます。</p>
    </main>
  );
}
```

- [ ] **Step 9 · `pnpm install`**

Run: `pnpm install`
Expected: 完成无 ERR,生成 `pnpm-lock.yaml` 和 `node_modules/`。

- [ ] **Step 10 · 验证开发服务器能启动**

Run: `pnpm dev`(随后 `Ctrl+C` 停)
Expected: 控制台出现 `▲ Next.js 15.1.4` 与 `- Local: http://localhost:3000`,没有红色报错。

- [ ] **Step 11 · Commit**

```bash
git add package.json pnpm-lock.yaml tsconfig.json next.config.mjs .env.example .gitignore app/
git commit -m "Scaffold Next.js 15 root project with TS + pnpm"
```

---

## Task 2 — Vitest + Testing Library setup

**Files:**
- Modify: `package.json`(加 devDeps + script 已在 T1 加)
- Create: `vitest.config.ts`, `tests/setup.ts`

- [ ] **Step 1 · 安装测试依赖**

Run:
```bash
pnpm add -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```
Expected: `vitest@^2.1`、`@vitejs/plugin-react@^4.3`、`jsdom@^25` 等装上。

- [ ] **Step 2 · 写 `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    globals: false,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
```

- [ ] **Step 3 · 写 `tests/setup.ts`**

```ts
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 4 · 烟雾测试 — 写一个临时 dummy 测试**

Create `tests/_smoke.test.ts`:
```ts
import { describe, it, expect } from "vitest";

describe("vitest smoke", () => {
  it("runs", () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 5 · `pnpm test` 通过**

Run: `pnpm test`
Expected:
```
 ✓ tests/_smoke.test.ts (1)
 Test Files  1 passed (1)
      Tests  1 passed (1)
```

- [ ] **Step 6 · 删除 dummy 测试**

```bash
rm tests/_smoke.test.ts
```

- [ ] **Step 7 · Commit**

```bash
git add package.json pnpm-lock.yaml vitest.config.ts tests/setup.ts
git commit -m "Wire up Vitest + Testing Library + jsdom"
```

---

## Task 3 — Drop design tokens + register Google Fonts

**Files:**
- Modify: `app/globals.css`(用 design_system tokens 替换)
- Modify: `app/layout.tsx`(用 next/font 注册字体)
- Create: `app/fonts.ts`

- [ ] **Step 1 · 把 design tokens 拷入 `app/globals.css`**

把 `design_handoff_review_app/design_system/colors_and_type.css` 的**全文**拷贝替换 `app/globals.css`,但去掉文件开头的 `@import url('https://fonts.googleapis.com/...')` 一行(字体改用 next/font 加载,避免 CLS)。

- [ ] **Step 2 · 写 `app/fonts.ts`**

```ts
import { Geist, Geist_Mono, Newsreader, Noto_Sans_JP, Noto_Serif_JP } from "next/font/google";

export const geist = Geist({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-geist",
  display: "swap",
});

export const geistMono = Geist_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-geist-mono",
  display: "swap",
});

export const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
  variable: "--font-newsreader",
  display: "swap",
});

export const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-noto-sans-jp",
  display: "swap",
});

export const notoSerifJP = Noto_Serif_JP({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-noto-serif-jp",
  display: "swap",
});
```

- [ ] **Step 3 · 更新 `app/layout.tsx` 把 font variables 挂到 `<html>`**

```tsx
import type { Metadata } from "next";
import "./globals.css";
import { geist, geistMono, newsreader, notoSansJP, notoSerifJP } from "./fonts";

export const metadata: Metadata = {
  title: "SOZO Review · 物件ヘルスチェック",
  description: "Airbnb 物件の健康診断システム",
};

const fontVars = [geist, geistMono, newsreader, notoSansJP, notoSerifJP]
  .map((f) => f.variable)
  .join(" ");

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={fontVars}>
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 4 · 在 `app/globals.css` 顶部覆写 `--font-sans` 等以引用 next/font CSS 变量**

在 globals.css 的 `:root { ... }` 区块**最末尾**(`--gutter: 24px;` 之后,`}` 之前)追加:

```css
  /* next/font 提供的 variable references */
  --font-sans:    var(--font-geist), var(--font-noto-sans-jp), system-ui, sans-serif;
  --font-serif:   var(--font-newsreader), var(--font-noto-serif-jp), Georgia, serif;
  --font-mono:    var(--font-geist-mono), ui-monospace, monospace;
```

- [ ] **Step 5 · 验证字体加载**

Run: `pnpm dev`,浏览器打开 `http://localhost:3000`,DevTools → Network → 应能看到 `geist-...woff2` / `noto-sans-jp-...woff2` 由 `/_next/static/media/` 提供。
页面文字应为 Geist(英文/数字)+ Noto Sans JP(日文)。

- [ ] **Step 6 · Commit**

```bash
git add app/globals.css app/fonts.ts app/layout.tsx
git commit -m "Adopt design tokens and register fonts via next/font"
```

---

## Task 4 — next-intl with `ja` locale

**Files:**
- Create: `lib/i18n/ja.ts`、`i18n.ts`(next-intl 入口)
- Modify: `app/layout.tsx`、`next.config.mjs`

(说明:即使只有 `ja`,过 next-intl 让所有 UI 文案集中可改,符合 CLAUDE.md §1 全日语原则)

- [ ] **Step 1 · 装依赖**

Run: `pnpm add next-intl@^3.26`

- [ ] **Step 2 · 写 `lib/i18n/ja.ts`**(Plan 1 用到的最小集合,后续 plan 扩充)

```ts
export const ja = {
  app: {
    title: "SOZO Review · 物件ヘルスチェック",
    description: "Airbnb 物件の健康診断システム",
  },
  form: {
    eyebrow: "物件ヘルスチェック",
    headline: "Airbnb 物件 URL を入力してください",
    placeholder: "https://www.airbnb.jp/rooms/...",
    submit: "診断する",
    submitting: "診断中…",
    errors: {
      invalid_url: "無効な Airbnb URL です。確認してください。",
      not_airbnb: "Airbnb の物件 URL を入力してください。",
      no_listing_id: "URL に物件 ID が含まれていません。",
      scrape_failed: "物件データを取得できませんでした。",
      timeout: "処理がタイムアウトしました。再度お試しください。",
    },
  },
  result: {
    scoreCard: {
      titleSuffix: "級",
      neutralStatus: "データなし",
      upgradeAtMax: "最高等級です",
      upgradeHintTpl: "あと {points} 点で {grade} 級にアップ",
    },
  },
} as const;

export type JaMessages = typeof ja;
```

- [ ] **Step 3 · 写 `i18n.ts`(next-intl 配置)**

```ts
import { getRequestConfig } from "next-intl/server";
import { ja } from "@/lib/i18n/ja";

export default getRequestConfig(async () => ({
  locale: "ja",
  messages: ja as unknown as Record<string, unknown>,
}));
```

- [ ] **Step 4 · 更新 `next.config.mjs` 接入 next-intl**

```js
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    typedRoutes: true,
  },
};

export default withNextIntl(nextConfig);
```

- [ ] **Step 5 · `pnpm dev` 仍可启动**

Run: `pnpm dev` → `Ctrl+C`。Expected: 无报错。

- [ ] **Step 6 · Commit**

```bash
git add package.json pnpm-lock.yaml lib/i18n/ja.ts i18n.ts next.config.mjs
git commit -m "Add next-intl with ja-locale message catalog"
```

---

## Task 5 — Drizzle + Neon schema, push migrations

**Files:**
- Create: `lib/db/schema.ts`、`lib/db/client.ts`、`drizzle.config.ts`
- Modify: `.env.local`(Codex 应该已经被告知 DATABASE_URL,见下)

**注意 Codex:** Claude planner 已提供 DATABASE_URL = `postgresql://neondb_owner:<YOUR_DB_PASSWORD>@ep-lively-frog-apc3467q.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require`。若 `.env.local` 不存在,创建它,且 **`.env.local` 不要 commit**(已在 .gitignore)。

- [ ] **Step 1 · 装依赖**

Run:
```bash
pnpm add drizzle-orm @neondatabase/serverless
pnpm add -D drizzle-kit dotenv
```

- [ ] **Step 2 · 写 `lib/db/schema.ts`**(基于 SYSTEM_DESIGN §4)

```ts
import { pgTable, text, uuid, integer, char, jsonb, timestamp, index } from "drizzle-orm/pg-core";

export const listings = pgTable("listings", {
  id: text("id").primaryKey(),
  url: text("url").notNull(),
  title: text("title"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const diagnoses = pgTable(
  "diagnoses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    listingId: text("listing_id").notNull().references(() => listings.id),
    overallScore: integer("overall_score").notNull(),
    grade: char("grade", { length: 1 }).notNull(),
    qualityStatus: text("quality_status").notNull(),
    dimensions: jsonb("dimensions").notNull(),
    snapshot: jsonb("snapshot").notNull(),
    aiReportMd: text("ai_report_md"),
    aiNegativeKw: jsonb("ai_negative_kw"),
    aiTop3: jsonb("ai_top3"),
    aiStatus: text("ai_status").notNull(),
    scrapeStatus: text("scrape_status").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    listingIdIdx: index("idx_diagnoses_listing").on(table.listingId, table.createdAt),
  })
);

export const alertsSent = pgTable("alerts_sent", {
  diagnosisId: uuid("diagnosis_id").primaryKey().references(() => diagnoses.id),
  emailTo: text("email_to").notNull(),
  sentAt: timestamp("sent_at", { withTimezone: true }).notNull().defaultNow(),
  resendId: text("resend_id"),
});

export type Listing = typeof listings.$inferSelect;
export type DiagnosisRow = typeof diagnoses.$inferSelect;
export type NewDiagnosis = typeof diagnoses.$inferInsert;
```

- [ ] **Step 3 · 写 `lib/db/client.ts`**

```ts
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error("DATABASE_URL is not set");
}

export const sql = neon(url);
export const db = drizzle(sql, { schema });
export { schema };
```

- [ ] **Step 4 · 写 `drizzle.config.ts`**

```ts
import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
});
```

- [ ] **Step 5 · 写 `.env.local`(不 commit)**

```dotenv
DATABASE_URL="postgresql://neondb_owner:<YOUR_DB_PASSWORD>@ep-lively-frog-apc3467q.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require"
SCRAPER_URL="http://localhost:8787"
SCRAPER_SECRET="dev-secret-change-me"
```

- [ ] **Step 6 · 推送 migration 到 Neon**

Run: `pnpm db:push`
Expected: 输出 `[✓] Pulling schema from database...` 和 `[✓] Changes applied`,Neon 上能看到 listings / diagnoses / alerts_sent 三张表。
若 Codex 担心污染 demo DB,可改用 `pnpm db:generate` 仅生成 SQL 不推送 — Claude 会在 review 时决定。

- [ ] **Step 7 · Commit**

```bash
git add package.json pnpm-lock.yaml lib/db/ drizzle.config.ts
# 若 db:generate 生成了 drizzle/ 目录
git add drizzle/ 2>/dev/null || true
git commit -m "Add Drizzle schema (listings / diagnoses / alerts_sent) + Neon client"
```

---

## Task 6 — Mac scraper Node project bootstrap

**Files:**
- Create: `mac-scraper/package.json`、`mac-scraper/tsconfig.json`、`mac-scraper/vitest.config.ts`、`mac-scraper/.env`(gitignored)、`mac-scraper/src/server.ts`、`mac-scraper/src/log.ts`

- [ ] **Step 1 · 创建目录并 init**

```bash
mkdir -p mac-scraper/src mac-scraper/tests
cd mac-scraper
```

- [ ] **Step 2 · 写 `mac-scraper/package.json`**

```jsonc
{
  "name": "sozo-review-scraper",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "start": "node --import tsx src/server.ts",
    "build": "tsc",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "express": "^4.21.2",
    "pino": "^9.5.0",
    "pino-pretty": "^11.3.0",
    "zod": "^3.23.8",
    "dotenv": "^16.4.7"
  },
  "devDependencies": {
    "@types/express": "^5.0.0",
    "@types/node": "^22.10.0",
    "@types/supertest": "^6.0.2",
    "supertest": "^7.0.0",
    "tsx": "^4.19.2",
    "typescript": "^5.7.2",
    "vitest": "^2.1.8"
  }
}
```

- [ ] **Step 3 · 写 `mac-scraper/tsconfig.json`**

```jsonc
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "types": ["node"],
    "baseUrl": ".",
    "paths": { "@scraper/*": ["src/*"] }
  },
  "include": ["src/**/*.ts", "tests/**/*.ts"]
}
```

- [ ] **Step 4 · 写 `mac-scraper/vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    globals: false,
  },
  resolve: {
    alias: { "@scraper": path.resolve(__dirname, "src") },
  },
});
```

- [ ] **Step 5 · 写 `mac-scraper/.env`**

```dotenv
PORT=8787
SCRAPER_SECRET="dev-secret-change-me"
```

(注意:`SCRAPER_SECRET` 必须与 Next.js 侧 `.env.local` 一致,否则 Bearer 鉴权会 401)

- [ ] **Step 6 · 写 `mac-scraper/src/log.ts`**

```ts
import pino from "pino";

export const log = pino({
  level: process.env.LOG_LEVEL ?? "info",
  transport: process.env.NODE_ENV === "production"
    ? undefined
    : { target: "pino-pretty", options: { colorize: true, translateTime: "HH:MM:ss" } },
});
```

- [ ] **Step 7 · 写最小 `mac-scraper/src/server.ts`**(Task 10/11 会扩展)

```ts
import "dotenv/config";
import express from "express";
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

// 直接运行(非测试)时启动 server
const isMain = import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  const app = createApp();
  app.listen(PORT, () => log.info({ port: PORT }, "mac-scraper listening"));
}
```

- [ ] **Step 8 · 安装依赖**

```bash
cd mac-scraper
pnpm install
```

- [ ] **Step 9 · 烟雾测试**

```bash
cd mac-scraper
pnpm dev
```

另开终端:
```bash
curl http://localhost:8787/healthz
```
Expected: `{"ok":true}`
然后 Ctrl+C 停止 dev。

- [ ] **Step 10 · Commit**

```bash
git add mac-scraper/package.json mac-scraper/pnpm-lock.yaml mac-scraper/tsconfig.json mac-scraper/vitest.config.ts mac-scraper/src/
git commit -m "Bootstrap mac-scraper Express + pino + vitest"
```

---

## Task 7 — Airbnb URL parser(TDD)

**Files:**
- Create: `lib/util/url.ts`
- Create: `tests/url.test.ts`

- [ ] **Step 1 · 先写失败测试 `tests/url.test.ts`**

```ts
import { describe, it, expect } from "vitest";
import { parseAirbnbUrl } from "@/lib/util/url";

describe("parseAirbnbUrl", () => {
  it("extracts listing id from airbnb.jp URL", () => {
    expect(parseAirbnbUrl("https://www.airbnb.jp/rooms/12345678"))
      .toEqual({ ok: true, listingId: "12345678" });
  });

  it("extracts listing id from airbnb.com URL with query string", () => {
    expect(parseAirbnbUrl("https://www.airbnb.com/rooms/87654321?source=foo"))
      .toEqual({ ok: true, listingId: "87654321" });
  });

  it("extracts listing id when subdomain is bare airbnb.jp(no www)", () => {
    expect(parseAirbnbUrl("https://airbnb.jp/rooms/9999"))
      .toEqual({ ok: true, listingId: "9999" });
  });

  it("rejects non-Airbnb URL", () => {
    expect(parseAirbnbUrl("https://booking.com/rooms/123"))
      .toEqual({ ok: false, error: "not_airbnb" });
  });

  it("rejects URL without listing id", () => {
    expect(parseAirbnbUrl("https://www.airbnb.jp/"))
      .toEqual({ ok: false, error: "no_listing_id" });
  });

  it("rejects garbage string as invalid_url", () => {
    expect(parseAirbnbUrl("not a url"))
      .toEqual({ ok: false, error: "invalid_url" });
  });

  it("accepts /h/<slug>/<id> style URLs", () => {
    // Airbnb 偶发短链 redirect 形式,本 task 不要求支持 — 验证当前实现按 no_listing_id 处理
    expect(parseAirbnbUrl("https://www.airbnb.jp/h/some-slug")).toEqual({
      ok: false,
      error: "no_listing_id",
    });
  });
});
```

- [ ] **Step 2 · 跑测试,确认失败**

Run: `pnpm test tests/url.test.ts`
Expected: 全部 fail,提示 `parseAirbnbUrl is not a function` 或模块不存在。

- [ ] **Step 3 · 写最小实现 `lib/util/url.ts`**

```ts
export type ParseResult =
  | { ok: true; listingId: string }
  | { ok: false; error: "not_airbnb" | "no_listing_id" | "invalid_url" };

const AIRBNB_HOST = /(^|\.)airbnb\.[a-z.]+$/i;
const ROOMS_PATH = /^\/rooms\/(\d+)/;

export function parseAirbnbUrl(input: string): ParseResult {
  let url: URL;
  try {
    url = new URL(input);
  } catch {
    return { ok: false, error: "invalid_url" };
  }
  if (!AIRBNB_HOST.test(url.hostname)) {
    return { ok: false, error: "not_airbnb" };
  }
  const m = url.pathname.match(ROOMS_PATH);
  if (!m) return { ok: false, error: "no_listing_id" };
  return { ok: true, listingId: m[1] };
}
```

- [ ] **Step 4 · 跑测试通过**

Run: `pnpm test tests/url.test.ts`
Expected:
```
 ✓ tests/url.test.ts (7)
 Test Files  1 passed (1)
      Tests  7 passed (7)
```

- [ ] **Step 5 · Commit**

```bash
git add lib/util/url.ts tests/url.test.ts
git commit -m "Add Airbnb URL parser with TDD coverage"
```

---

## Task 8 — Score-to-grade mapping(TDD)

**Files:**
- Create: `lib/util/grade.ts`
- Create: `tests/grade.test.ts`

业务规则(SPEC §A1):90-100→A,75-89→B,60-74→C,0-59→D。

- [ ] **Step 1 · 先写失败测试 `tests/grade.test.ts`**

```ts
import { describe, it, expect } from "vitest";
import {
  scoreToGrade,
  gradeColors,
  pointsToNextGrade,
} from "@/lib/util/grade";

describe("scoreToGrade", () => {
  it("maps 90-100 to A", () => {
    expect(scoreToGrade(100)).toBe("A");
    expect(scoreToGrade(90)).toBe("A");
  });
  it("maps 75-89 to B", () => {
    expect(scoreToGrade(89)).toBe("B");
    expect(scoreToGrade(75)).toBe("B");
  });
  it("maps 60-74 to C", () => {
    expect(scoreToGrade(74)).toBe("C");
    expect(scoreToGrade(60)).toBe("C");
  });
  it("maps 0-59 to D", () => {
    expect(scoreToGrade(59)).toBe("D");
    expect(scoreToGrade(0)).toBe("D");
  });
});

describe("gradeColors", () => {
  it("returns CSS variable refs for each grade", () => {
    expect(gradeColors("A")).toEqual({
      fill: "var(--grade-a-fill)",
      ink: "var(--grade-a-ink)",
      base: "var(--grade-a)",
    });
    expect(gradeColors("D").base).toBe("var(--grade-d)");
  });
});

describe("pointsToNextGrade", () => {
  it("computes delta to next threshold", () => {
    expect(pointsToNextGrade(78)).toEqual({ atMax: false, points: 12, target: "A" });
    expect(pointsToNextGrade(72)).toEqual({ atMax: false, points: 3, target: "B" });
    expect(pointsToNextGrade(55)).toEqual({ atMax: false, points: 5, target: "C" });
  });
  it("returns atMax when already A", () => {
    expect(pointsToNextGrade(95)).toEqual({ atMax: true, points: 0, target: "A" });
  });
});
```

- [ ] **Step 2 · 跑测试,确认失败**

Run: `pnpm test tests/grade.test.ts` → fail。

- [ ] **Step 3 · 写实现 `lib/util/grade.ts`**

```ts
export type Grade = "A" | "B" | "C" | "D";

export function scoreToGrade(score: number): Grade {
  if (score >= 90) return "A";
  if (score >= 75) return "B";
  if (score >= 60) return "C";
  return "D";
}

export type GradeColors = { fill: string; ink: string; base: string };

export function gradeColors(grade: Grade): GradeColors {
  const map: Record<Grade, GradeColors> = {
    A: { fill: "var(--grade-a-fill)", ink: "var(--grade-a-ink)", base: "var(--grade-a)" },
    B: { fill: "var(--grade-b-fill)", ink: "var(--grade-b-ink)", base: "var(--grade-b)" },
    C: { fill: "var(--grade-c-fill)", ink: "var(--grade-c-ink)", base: "var(--grade-c)" },
    D: { fill: "var(--grade-d-fill)", ink: "var(--grade-d-ink)", base: "var(--grade-d)" },
  };
  return map[grade];
}

export type NextGrade =
  | { atMax: true; points: 0; target: "A" }
  | { atMax: false; points: number; target: Exclude<Grade, "D"> };

export function pointsToNextGrade(score: number): NextGrade {
  if (score >= 90) return { atMax: true, points: 0, target: "A" };
  if (score >= 75) return { atMax: false, points: 90 - score, target: "A" };
  if (score >= 60) return { atMax: false, points: 75 - score, target: "B" };
  return { atMax: false, points: 60 - score, target: "C" };
}
```

- [ ] **Step 4 · 跑测试通过**

Run: `pnpm test tests/grade.test.ts` → all green。

- [ ] **Step 5 · Commit**

```bash
git add lib/util/grade.ts tests/grade.test.ts
git commit -m "Add score-to-grade + color + next-grade utilities (TDD)"
```

---

## Task 9 — Diagnosis 契约类型(共享于 Next.js 与 mac-scraper)

**Files:**
- Create: `lib/types/diagnosis.ts`
- Create: `mac-scraper/src/types.ts`(mirror)

(说明:两端不打 monorepo,通过手抄保持一致;后续 plan 如果改契约,两边都改并跑两侧测试。)

- [ ] **Step 1 · 写 `lib/types/diagnosis.ts`**

```ts
export type Grade = "A" | "B" | "C" | "D";

export type QualityStatus =
  | "Good"
  | "Educate"
  | "Warn"
  | "Probation"
  | "Additional Warn"
  | "Pending Removal"
  | "Suspended"
  | "Removed";

export type DimensionScore = {
  score: number;
  note?: string;
  [key: string]: unknown;
};

export type Dimensions = {
  photos: DimensionScore;
  title: DimensionScore;
  description: DimensionScore;
  amenities: DimensionScore;
  reviews: DimensionScore;
};

export type AiResult = {
  report_md: string;
  negative_keywords: Array<{ keyword: string; count: number; quote: string }>;
  top3: Array<{ issue: string; action: string; impact: string }>;
  status: "ok" | "fallback";
};

export type Diagnosis = {
  listing_id: string;
  title: string;
  snapshot: Record<string, unknown>;
  dimensions: Dimensions;
  overall_score: number;
  grade: Grade;
  quality_status: QualityStatus;
  ai: AiResult;
  scrape_status: "ok" | "cache" | "partial";
};
```

- [ ] **Step 2 · 写 `mac-scraper/src/types.ts`**(完全同内容,本地路径)

把上面文件的全文复制到 `mac-scraper/src/types.ts`,**不**改任何内容。两端 import path 不同,但类型定义必须 byte-identical。

- [ ] **Step 3 · 类型检查**

Run(根目录): `pnpm exec tsc --noEmit`
Run(mac-scraper): `cd mac-scraper && pnpm exec tsc --noEmit && cd ..`
Expected: 两边都 0 error。

- [ ] **Step 4 · Commit**

```bash
git add lib/types/diagnosis.ts mac-scraper/src/types.ts
git commit -m "Define shared Diagnosis contract types (web + scraper mirror)"
```

---

## Task 10 — Mac scraper Bearer auth middleware(TDD)

**Files:**
- Create: `mac-scraper/src/auth.ts`
- Modify: `mac-scraper/src/server.ts`
- Create: `mac-scraper/tests/server.test.ts`

- [ ] **Step 1 · 写失败测试 `mac-scraper/tests/server.test.ts`**

```ts
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
    // Task 11 handler validates body with zod → 400 invalid_request
    expect(res.status).toBe(400);
  });

  it("/healthz is open(no auth)", async () => {
    const app = createApp();
    const res = await request(app).get("/healthz");
    expect(res.status).toBe(200);
  });
});
```

- [ ] **Step 2 · 跑测试,失败**

Run: `cd mac-scraper && pnpm test` → 401/200/400 期望未达到。

- [ ] **Step 3 · 实现 `mac-scraper/src/auth.ts`**

```ts
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
```

- [ ] **Step 4 · 更新 `mac-scraper/src/server.ts` 挂上 auth + 占位 /diagnose**(Task 11 完善)

```ts
import "dotenv/config";
import express from "express";
import { z } from "zod";
import { log } from "./log.js";
import { bearerAuth } from "./auth.js";

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
    // Task 11 替换为 fixture 返回
    res.status(501).json({ error: "not_implemented" });
  });

  return app;
}

const PORT = Number(process.env.PORT ?? 8787);
const isMain = import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  const app = createApp();
  app.listen(PORT, () => log.info({ port: PORT }, "mac-scraper listening"));
}
```

- [ ] **Step 5 · 跑测试通过**

Run: `cd mac-scraper && pnpm test` → 4 个 auth 测试 pass。

- [ ] **Step 6 · Commit**

```bash
git add mac-scraper/src/ mac-scraper/tests/server.test.ts
git commit -m "Add Bearer auth middleware + skeleton /diagnose route"
```

---

## Task 11 — Mac scraper POST /diagnose returns fixture(TDD)

**Files:**
- Modify: `mac-scraper/src/server.ts`
- Create: `mac-scraper/src/fixtures/sample.ts`
- Modify: `mac-scraper/tests/server.test.ts`(加 fixture 响应断言)

- [ ] **Step 1 · 写 `mac-scraper/src/fixtures/sample.ts`**

参考 `design_handoff_review_app/prototype/fixture.js` 的形状,但**严格符合** `mac-scraper/src/types.ts` 中的 `Diagnosis`。fixture 用真实 Airbnb URL 风格的 listing id,字段都填:

```ts
import type { Diagnosis } from "../types.js";

export const sampleDiagnosis: Diagnosis = {
  listing_id: "1174411978184206231",
  title: "【贅沢な和モダン貸切1軒家】京都駅徒歩10分・最大8名",
  snapshot: {
    note: "Plan 1 fixture — real PDP parsing arrives in Plan 2",
    photoCount: 92,
    rating: 4.87,
    reviewsCount: 106,
  },
  dimensions: {
    photos: { score: 95, total: 92, cover_ok: true, coverage: "5/5" },
    title: { score: 70, placeholder: true, note: "B6 開発中" },
    description: { score: 88, length: 1240, sections_hit: ["寝室", "リビング", "キッチン", "バスルーム", "アクセス"] },
    amenities: { score: 75, match_ratio: "18/24", missing: ["Wi-Fi 速度の記述"] },
    reviews: { score: 99, rating: 4.87, count: 106 },
  },
  overall_score: 86,
  grade: "B",
  quality_status: "Good",
  ai: {
    report_md: "## 総評\n\nPlan 1 fixture です。実際の AI レポートは Plan 3 で生成されます。",
    negative_keywords: [],
    top3: [
      { issue: "Plan 1 fixture", action: "Plan 3 で実装", impact: "AI レポートが本物になる" },
    ],
    status: "fallback",
  },
  scrape_status: "ok",
};
```

- [ ] **Step 2 · 追加 server 测试**

在 `mac-scraper/tests/server.test.ts` 末尾追加:

```ts
describe("POST /diagnose (fixture)", () => {
  it("returns the sample fixture for any valid URL", async () => {
    const app = createApp();
    const res = await request(app)
      .post("/diagnose")
      .set("Authorization", "Bearer test-secret")
      .send({ url: "https://www.airbnb.jp/rooms/1174411978184206231" });
    expect(res.status).toBe(200);
    expect(res.body.listing_id).toBe("1174411978184206231");
    expect(res.body.grade).toBe("B");
    expect(res.body.dimensions.photos.score).toBe(95);
    expect(res.body.ai.status).toBe("fallback");
  });
});
```

- [ ] **Step 3 · 跑测试,确认失败**

Run: `cd mac-scraper && pnpm test` → 新增的 fixture 测试 fail(当前还是 501)。

- [ ] **Step 4 · 替换 /diagnose 处理器为 fixture 响应**

修改 `mac-scraper/src/server.ts` 中 `/diagnose` 处理函数:

```ts
import { sampleDiagnosis } from "./fixtures/sample.js";
// ...
  app.post("/diagnose", bearerAuth(), (req, res) => {
    const parsed = diagnoseSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "invalid_request" });
      return;
    }
    // Plan 1: 不论 URL 内容,都返回 fixture(listing_id 用 fixture 的)
    log.info({ url: parsed.data.url }, "fixture diagnose");
    res.json(sampleDiagnosis);
  });
```

- [ ] **Step 5 · 跑测试通过**

Run: `cd mac-scraper && pnpm test` → 全部 green。

- [ ] **Step 6 · 手动 curl 验证**

```bash
cd mac-scraper && pnpm dev &
sleep 2
curl -s -X POST http://localhost:8787/diagnose \
  -H "Authorization: Bearer dev-secret-change-me" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://www.airbnb.jp/rooms/1174411978184206231"}' | head -c 200
# Expected: starts with {"listing_id":"1174411978184206231","title":"【贅沢な和モダン
kill %1 2>/dev/null || true
```

- [ ] **Step 7 · Commit**

```bash
git add mac-scraper/src/ mac-scraper/tests/
git commit -m "Return Plan 1 fixture from POST /diagnose"
```

---

## Task 12 — (合并到 T11 — 此处占位)

Plan 草稿中 T12 原是单独「写 fixture」步骤,实际 fixture 文件已在 T11 步骤 1 创建。本 Task **跳过**,Codex 收到此 Task 时直接 commit 空文档变更:

(planner 注:Codex 看到 T12 时,先确认 T11 提交里已有 `mac-scraper/src/fixtures/sample.ts`,有则跳过本 task;若不知何故缺失,补回。)

- [ ] **Step 1 · 验证 fixture 文件存在**

```bash
test -f mac-scraper/src/fixtures/sample.ts && echo "OK" || echo "MISSING"
```
Expected: `OK`(若 MISSING,回到 T11 Step 1 重新创建)

- [ ] **Step 2 · 跳过 commit(不引入空提交)**

---

## Task 13 — Scraper HTTP client(TDD)

**Files:**
- Create: `lib/scraper/client.ts`
- Create: `tests/scraper-client.test.ts`

- [ ] **Step 1 · 写失败测试 `tests/scraper-client.test.ts`**

```ts
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { fetchDiagnosis } from "@/lib/scraper/client";

describe("fetchDiagnosis", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    process.env.SCRAPER_URL = "http://localhost:8787";
    process.env.SCRAPER_SECRET = "test-secret";
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("posts URL with Bearer auth", async () => {
    const mock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        listing_id: "abc",
        title: "T",
        snapshot: {},
        dimensions: {
          photos: { score: 90 },
          title: { score: 70 },
          description: { score: 80 },
          amenities: { score: 70 },
          reviews: { score: 95 },
        },
        overall_score: 86,
        grade: "B",
        quality_status: "Good",
        ai: { report_md: "", negative_keywords: [], top3: [], status: "fallback" },
        scrape_status: "ok",
      }),
    });
    global.fetch = mock as unknown as typeof fetch;

    const r = await fetchDiagnosis("https://www.airbnb.jp/rooms/abc");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.data.listing_id).toBe("abc");

    expect(mock).toHaveBeenCalledWith(
      "http://localhost:8787/diagnose",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "Authorization": "Bearer test-secret",
          "Content-Type": "application/json",
        }),
      }),
    );
  });

  it("returns {ok:false, error:'scrape_failed'} on non-2xx", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 502,
      json: async () => ({ error: "boom" }),
    }) as unknown as typeof fetch;
    const r = await fetchDiagnosis("https://www.airbnb.jp/rooms/x");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe("scrape_failed");
  });

  it("returns timeout error when fetch rejects with AbortError", async () => {
    global.fetch = vi.fn().mockImplementation(() => {
      const err = new Error("aborted");
      err.name = "AbortError";
      return Promise.reject(err);
    }) as unknown as typeof fetch;
    const r = await fetchDiagnosis("https://www.airbnb.jp/rooms/x", { timeoutMs: 5 });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe("timeout");
  });
});
```

- [ ] **Step 2 · 跑测试,失败**

Run: `pnpm test tests/scraper-client.test.ts` → fail。

- [ ] **Step 3 · 实现 `lib/scraper/client.ts`**

```ts
import type { Diagnosis } from "@/lib/types/diagnosis";

export type FetchResult =
  | { ok: true; data: Diagnosis }
  | { ok: false; error: "scrape_failed" | "timeout" | "config_missing" };

export type FetchOptions = {
  timeoutMs?: number;
};

export async function fetchDiagnosis(url: string, opts: FetchOptions = {}): Promise<FetchResult> {
  const base = process.env.SCRAPER_URL;
  const secret = process.env.SCRAPER_SECRET;
  if (!base || !secret) return { ok: false, error: "config_missing" };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), opts.timeoutMs ?? 45_000);

  try {
    const res = await fetch(`${base}/diagnose`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${secret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url }),
      signal: controller.signal,
    });
    if (!res.ok) return { ok: false, error: "scrape_failed" };
    const data = (await res.json()) as Diagnosis;
    return { ok: true, data };
  } catch (e) {
    if (e instanceof Error && e.name === "AbortError") {
      return { ok: false, error: "timeout" };
    }
    return { ok: false, error: "scrape_failed" };
  } finally {
    clearTimeout(timer);
  }
}
```

- [ ] **Step 4 · 测试通过**

Run: `pnpm test tests/scraper-client.test.ts` → all green。

- [ ] **Step 5 · Commit**

```bash
git add lib/scraper/client.ts tests/scraper-client.test.ts
git commit -m "Add Mac scraper HTTP client with timeout + auth"
```

---

## Task 14 — POST /api/diagnose route(TDD)

**Files:**
- Create: `app/api/diagnose/route.ts`
- Create: `tests/api-diagnose.test.ts`

行为:接 URL → 校验 → upsert listing → 调 scraper → 写 diagnosis 行 → 返回 `{ diagnosis_id, redirect }`。Plan 1 不做"1 小时内缓存"和"F1 邮件",留在 Plan 4。

- [ ] **Step 1 · 写失败测试 `tests/api-diagnose.test.ts`**

(集成测试用 mock 替换 scraper client 和 db client;route 直接 import + 调用)

```ts
import { describe, it, expect, beforeEach, vi } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/scraper/client", () => ({
  fetchDiagnosis: vi.fn(),
}));
vi.mock("@/lib/db/client", () => {
  const inserted = { id: "00000000-0000-0000-0000-000000000001" };
  const onConflictDoUpdate = vi.fn().mockResolvedValue(undefined);
  const valuesOnInsertListings = vi.fn().mockReturnValue({ onConflictDoUpdate });
  const valuesOnInsertDiagnoses = vi.fn().mockReturnValue({
    returning: vi.fn().mockResolvedValue([inserted]),
  });
  const insert = vi.fn().mockImplementation((table) => {
    if ((table as { _: { name: string } })._.name === "listings") {
      return { values: valuesOnInsertListings };
    }
    return { values: valuesOnInsertDiagnoses };
  });
  return { db: { insert }, schema: {} };
});

import { fetchDiagnosis } from "@/lib/scraper/client";
import { POST } from "@/app/api/diagnose/route";
import type { Diagnosis } from "@/lib/types/diagnosis";

const sample: Diagnosis = {
  listing_id: "9999",
  title: "Test",
  snapshot: {},
  dimensions: {
    photos: { score: 95 },
    title: { score: 70 },
    description: { score: 88 },
    amenities: { score: 75 },
    reviews: { score: 99 },
  },
  overall_score: 86,
  grade: "B",
  quality_status: "Good",
  ai: { report_md: "", negative_keywords: [], top3: [], status: "fallback" },
  scrape_status: "ok",
};

function mkReq(body: unknown) {
  return new NextRequest("http://localhost/api/diagnose", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

beforeEach(() => {
  vi.mocked(fetchDiagnosis).mockReset();
});

describe("POST /api/diagnose", () => {
  it("400 on missing url", async () => {
    const res = await POST(mkReq({}));
    expect(res.status).toBe(400);
  });

  it("400 on non-airbnb url", async () => {
    const res = await POST(mkReq({ url: "https://booking.com/foo" }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("invalid_url");
  });

  it("502 when scraper fails", async () => {
    vi.mocked(fetchDiagnosis).mockResolvedValue({ ok: false, error: "scrape_failed" });
    const res = await POST(mkReq({ url: "https://www.airbnb.jp/rooms/9999" }));
    expect(res.status).toBe(502);
  });

  it("200 with diagnosis_id and redirect on success", async () => {
    vi.mocked(fetchDiagnosis).mockResolvedValue({ ok: true, data: sample });
    const res = await POST(mkReq({ url: "https://www.airbnb.jp/rooms/9999" }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.diagnosis_id).toBe("00000000-0000-0000-0000-000000000001");
    expect(body.redirect).toBe("/d/00000000-0000-0000-0000-000000000001");
  });
});
```

- [ ] **Step 2 · 跑测试,失败**

Run: `pnpm test tests/api-diagnose.test.ts` → route 文件不存在。

- [ ] **Step 3 · 实现 `app/api/diagnose/route.ts`**

```ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { parseAirbnbUrl } from "@/lib/util/url";
import { fetchDiagnosis } from "@/lib/scraper/client";
import { db, schema } from "@/lib/db/client";

const reqSchema = z.object({ url: z.string().min(1) });

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }
  const parsed = reqSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const urlResult = parseAirbnbUrl(parsed.data.url);
  if (!urlResult.ok) {
    return NextResponse.json({ error: "invalid_url" }, { status: 400 });
  }

  const scraped = await fetchDiagnosis(parsed.data.url);
  if (!scraped.ok) {
    const status = scraped.error === "timeout" ? 504 : 502;
    return NextResponse.json({ error: scraped.error }, { status });
  }

  const d = scraped.data;

  await db
    .insert(schema.listings)
    .values({ id: d.listing_id, url: parsed.data.url, title: d.title })
    .onConflictDoUpdate({
      target: schema.listings.id,
      set: { url: parsed.data.url, title: d.title, updatedAt: new Date() },
    });

  const inserted = await db
    .insert(schema.diagnoses)
    .values({
      listingId: d.listing_id,
      overallScore: d.overall_score,
      grade: d.grade,
      qualityStatus: d.quality_status,
      dimensions: d.dimensions,
      snapshot: d.snapshot,
      aiReportMd: d.ai.report_md,
      aiNegativeKw: d.ai.negative_keywords,
      aiTop3: d.ai.top3,
      aiStatus: d.ai.status,
      scrapeStatus: d.scrape_status,
    })
    .returning({ id: schema.diagnoses.id });

  const id = inserted[0].id;
  return NextResponse.json({ diagnosis_id: id, redirect: `/d/${id}` });
}
```

- [ ] **Step 4 · 测试通过**

Run: `pnpm test tests/api-diagnose.test.ts` → all green。

- [ ] **Step 5 · Commit**

```bash
git add app/api/diagnose/route.ts tests/api-diagnose.test.ts
git commit -m "Add POST /api/diagnose route with URL validation + DB write"
```

---

## Task 15 — DiagnosticForm + 首页(wireframe 1C)

**Files:**
- Create: `components/DiagnosticForm.tsx`(`'use client'`)
- Replace: `app/page.tsx`(改为引用 DiagnosticForm)

视觉参考:`design_handoff_review_app/prototype/DiagnosticForm.jsx` 和 `design_handoff_review_app/prototype/kit.css` 中的 `.kit-field` / 主按钮样式。Plan 1 不实装 "最近诊断 history rows",留到后续 plan。

- [ ] **Step 1 · 实现 `components/DiagnosticForm.tsx`**

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ja } from "@/lib/i18n/ja";

type ErrorKey = keyof typeof ja.form.errors;

export function DiagnosticForm() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<ErrorKey | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const key: ErrorKey = body.error in ja.form.errors ? body.error : "scrape_failed";
        setError(key);
        return;
      }
      const body = (await res.json()) as { redirect: string };
      router.push(body.redirect as never);
    } catch {
      setError("scrape_failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} style={{ maxWidth: 760, margin: "0 auto", padding: "var(--s-7) var(--s-5)" }}>
      <p className="t-eyebrow" style={{ marginBottom: "var(--s-2)" }}>{ja.form.eyebrow}</p>
      <h1 className="t-h1" style={{ marginBottom: "var(--s-5)" }}>{ja.form.headline}</h1>

      <div style={{ display: "flex", gap: "var(--s-3)", alignItems: "stretch" }}>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder={ja.form.placeholder}
          required
          aria-invalid={!!error}
          style={{
            flex: 1,
            padding: "var(--s-3) var(--s-4)",
            border: `1px solid ${error ? "var(--grade-d)" : "var(--ink-200)"}`,
            borderRadius: "var(--r-md)",
            fontFamily: "var(--font-mono)",
            fontSize: "var(--t-sm)",
            background: "var(--card)",
          }}
        />
        <button
          type="submit"
          disabled={submitting || !url}
          style={{
            padding: "var(--s-3) var(--s-5)",
            background: "var(--sozonext-navy)",
            color: "#fff",
            border: "none",
            borderRadius: "var(--r-md)",
            fontWeight: "var(--w-semibold)",
            cursor: submitting ? "wait" : "pointer",
          }}
        >
          {submitting ? ja.form.submitting : ja.form.submit}
        </button>
      </div>

      {error && (
        <p className="t-small" style={{ color: "var(--grade-d)", marginTop: "var(--s-3)" }}>
          {ja.form.errors[error]}
        </p>
      )}
    </form>
  );
}
```

- [ ] **Step 2 · 替换 `app/page.tsx`**

```tsx
import { DiagnosticForm } from "@/components/DiagnosticForm";

export default function Home() {
  return (
    <main>
      <DiagnosticForm />
    </main>
  );
}
```

- [ ] **Step 3 · 手动验证(无单测,UI 走 dev server)**

```bash
# 终端 A
cd mac-scraper && pnpm dev
# 终端 B(回到 repo 根)
pnpm dev
```
浏览器 `http://localhost:3000`:
- 输入空 → 提交按钮 disabled
- 输入 `https://booking.com/xxx` → 浏览器原生 url type 通过(因为是 url 形式),后端返 400 → 页面显示「Airbnb の物件 URL を入力してください」
- 输入 `https://www.airbnb.jp/rooms/1174411978184206231` → ~1s 后跳到 `/d/<uuid>`(此时结果页还是 T17 的临时占位)

- [ ] **Step 4 · Commit**

```bash
git add components/DiagnosticForm.tsx app/page.tsx
git commit -m "Add URL input form (wireframe 1C) + wire to /api/diagnose"
```

---

## Task 16 — ScoreCard 组件 A1/A4(TDD)

**Files:**
- Create: `components/ScoreCard.tsx`
- Create: `tests/ScoreCard.test.tsx`

视觉参考:`design_handoff_review_app/prototype/ScoreCard.jsx`。Plan 1 实现 A1(大字母)+ A4(颜色映射)+ A7(升档提示),C4/Quality Status ladder 留到后续 plan。

- [ ] **Step 1 · 写失败测试 `tests/ScoreCard.test.tsx`**

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ScoreCard } from "@/components/ScoreCard";

describe("ScoreCard", () => {
  it("renders letter grade and score", () => {
    render(<ScoreCard score={86} />);
    expect(screen.getByTestId("score-letter")).toHaveTextContent("B");
    expect(screen.getByTestId("score-number")).toHaveTextContent("86");
  });

  it("applies grade-a colors when score >= 90", () => {
    render(<ScoreCard score={92} />);
    const card = screen.getByTestId("score-card");
    expect(card.style.background).toContain("--grade-a-fill");
  });

  it("shows upgrade hint when not at max", () => {
    render(<ScoreCard score={78} />);
    expect(screen.getByTestId("score-upgrade")).toHaveTextContent("あと 12 点で A 級にアップ");
  });

  it("shows at-max copy when already A", () => {
    render(<ScoreCard score={95} />);
    expect(screen.getByTestId("score-upgrade")).toHaveTextContent("最高等級です");
  });

  it("renders ? for null score", () => {
    render(<ScoreCard score={null} />);
    expect(screen.getByTestId("score-letter")).toHaveTextContent("?");
  });
});
```

- [ ] **Step 2 · 跑测试,失败**

Run: `pnpm test tests/ScoreCard.test.tsx` → fail。

- [ ] **Step 3 · 实现 `components/ScoreCard.tsx`**

```tsx
import { scoreToGrade, gradeColors, pointsToNextGrade, type Grade } from "@/lib/util/grade";
import { ja } from "@/lib/i18n/ja";

type Props = { score: number | null };

export function ScoreCard({ score }: Props) {
  if (score === null) {
    return (
      <div
        data-testid="score-card"
        style={{
          background: "var(--grade-x-fill)",
          color: "var(--grade-x-ink)",
          borderRadius: "var(--r-xl)",
          padding: "var(--s-6)",
          boxShadow: "var(--shadow-card)",
        }}
      >
        <div data-testid="score-letter" className="t-display">?</div>
        <p className="t-small">{ja.result.scoreCard.neutralStatus}</p>
      </div>
    );
  }

  const grade: Grade = scoreToGrade(score);
  const colors = gradeColors(grade);
  const next = pointsToNextGrade(score);
  const upgradeText = next.atMax
    ? ja.result.scoreCard.upgradeAtMax
    : ja.result.scoreCard.upgradeHintTpl
        .replace("{points}", String(next.points))
        .replace("{grade}", next.target);

  return (
    <div
      data-testid="score-card"
      style={{
        background: colors.fill,
        color: colors.ink,
        borderRadius: "var(--r-xl)",
        padding: "var(--s-6)",
        boxShadow: "var(--shadow-card)",
        display: "grid",
        gap: "var(--s-3)",
      }}
    >
      <div
        data-testid="score-letter"
        className="t-display"
        style={{ color: colors.base }}
      >
        {grade}
      </div>
      <div className="t-tabular" data-testid="score-number" style={{ fontSize: "var(--t-xl)" }}>
        {score}
      </div>
      <div className="t-small" data-testid="score-upgrade">
        {upgradeText}
      </div>
    </div>
  );
}
```

- [ ] **Step 4 · 测试通过**

Run: `pnpm test tests/ScoreCard.test.tsx` → all green。

- [ ] **Step 5 · Commit**

```bash
git add components/ScoreCard.tsx tests/ScoreCard.test.tsx
git commit -m "Add ScoreCard component (A1/A4/A7) with TDD coverage"
```

---

## Task 17 — 结果页 `app/d/[id]/page.tsx`(读 DB,挂 ScoreCard)

**Files:**
- Create: `app/d/[id]/page.tsx`
- Create: `app/d/[id]/not-found.tsx`

- [ ] **Step 1 · 实现 `app/d/[id]/page.tsx`**

```tsx
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db/client";
import { ScoreCard } from "@/components/ScoreCard";

type Params = { params: Promise<{ id: string }> };

export default async function ResultPage({ params }: Params) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const rows = await db
    .select()
    .from(schema.diagnoses)
    .where(eq(schema.diagnoses.id, id))
    .limit(1);

  const d = rows[0];
  if (!d) notFound();

  const listingRows = await db
    .select()
    .from(schema.listings)
    .where(eq(schema.listings.id, d.listingId))
    .limit(1);
  const listing = listingRows[0];

  return (
    <main style={{ maxWidth: "var(--content-max)", margin: "0 auto", padding: "var(--s-6) var(--gutter)" }}>
      <div className="t-small" style={{ color: "var(--ink-500)", marginBottom: "var(--s-2)" }}>
        {listing?.url}
      </div>
      <h1 className="t-h1" style={{ marginBottom: "var(--s-5)" }}>{listing?.title ?? d.listingId}</h1>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: "var(--s-6)" }}>
        <div>
          <ScoreCard score={d.overallScore} />
          <p className="t-small" style={{ marginTop: "var(--s-4)" }}>
            Plan 1 skeleton: dimensions / trend / AI report は後続フェーズで実装します。
          </p>
        </div>
        <aside>
          <h2 className="t-h2">AI レポート</h2>
          <p className="t-editorial">
            {d.aiReportMd || "Plan 3 で AI レポートを実装します。"}
          </p>
        </aside>
      </div>
    </main>
  );
}
```

- [ ] **Step 2 · 写 `app/d/[id]/not-found.tsx`**

```tsx
export default function NotFound() {
  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "var(--s-7) var(--s-5)" }}>
      <h1 className="t-h1">診断が見つかりません</h1>
      <p className="t-body">URL をご確認の上、最初からやり直してください。</p>
      <a href="/" className="t-small">トップに戻る</a>
    </main>
  );
}
```

- [ ] **Step 3 · 手动 E2E 验证**

```bash
# 终端 A
cd mac-scraper && pnpm dev
# 终端 B
pnpm dev
```
浏览器:
1. 打开 `http://localhost:3000` → 看到 1C 表单
2. 粘贴 `https://www.airbnb.jp/rooms/1174411978184206231` → 「診断する」
3. 1-2s 后跳到 `/d/<uuid>`
4. 页面应显示:
   - 顶部:fixture title「【贅沢な和モダン貸切1軒家】京都駅徒歩10分・最大8名」
   - 左侧:大写字母「B」+ 数字「86」+ 「あと 4 点で A 級にアップ」(86 → 90 差 4 分;若与 expected 不符,检查 pointsToNextGrade)
   - 右侧:AI レポート 占位文字

(planner 注:实际差值是 90-86=4,测试里我用 78→12 是另一个数据点。运行时差值 = 4,期望文案「あと 4 点で A 級にアップ」)

- [ ] **Step 4 · Commit**

```bash
git add app/d/
git commit -m "Add /d/[id] result page rendering ScoreCard from DB"
```

---

## Task 18 — End-to-end smoke check + Phase 1 完成确认

**Files:** 无新增。本 task 仅做完整链路烟雾测试 + 记录已知缺口。

- [ ] **Step 1 · 启动两侧服务并跑完 happy path**

```bash
# 终端 A
cd mac-scraper && pnpm dev
# 终端 B
pnpm dev
```
浏览器:`http://localhost:3000` → 粘 Airbnb URL → 「診断する」→ 看到结果页。

- [ ] **Step 2 · 跑所有测试**

```bash
pnpm test
cd mac-scraper && pnpm test && cd ..
```
Expected: 两边全 green,合计 URL parser(7)+ grade(8)+ scraper-client(3)+ api-diagnose(4)+ ScoreCard(5)+ mac-scraper auth/fixture(5)= **32 个测试通过**。

- [ ] **Step 3 · 检查 Neon 上有真的行**

```bash
pnpm exec drizzle-kit studio
# 或者用 psql 直连:
# psql "$DATABASE_URL" -c "select id, listing_id, overall_score, grade from diagnoses order by created_at desc limit 3;"
```
Expected: 看得到刚才诊断的行(listing_id = `1174411978184206231`,grade = B)。

- [ ] **Step 4 · 写 `docs/superpowers/plans/phase1-status.md`**(记录 Phase 1 完成 + 已知缺口)

```markdown
# Phase 1 Status

**Completed:** 2026-05-27

## What works
- pnpm dev (Next.js + mac-scraper) 同时跑
- 粘 URL → POST /api/diagnose → mac-scraper 返回 fixture → 写入 Neon → 跳 /d/[id] → 渲染 ScoreCard
- 32 个单元/集成测试通过
- 设计 token 接入,日语 UI

## Known gaps(Plan 2-4 处理)
- Mac scraper 还是 fixture,没真抓 Airbnb
- AI 报告占位文字,无 Claude Agent SDK
- 没 5 维度卡片网格、Quality Status 8 档、TrendChart、AI 报告全文
- 没邮件(F1 / F7)、PDF 下载
- 没错误页 5A/5B/5C
- v0.4 deltas 中:A5 参考值脚注 / B7 文字数+章节 / F7 mock 文案 — 留到 Plan 4 最终核对

## Next plan
docs/superpowers/plans/2026-05-XX-phase2-real-scraping.md(待写)
```

- [ ] **Step 5 · Commit**

```bash
git add docs/superpowers/plans/phase1-status.md
git commit -m "Mark Phase 1 (foundation skeleton) complete"
```

---

## Self-review checklist(planner 在 hand-off 之前自检)

- [x] **Spec coverage** — Plan 1 只覆盖 SPEC §A1/A4/A7 中 ScoreCard + DB schema(SYSTEM_DESIGN §4)+ API 契约(§5.1/5.2 简化版),其他 §3 维度卡片、§3.4 AI 报告、§3.5 邮件均显式标记 out-of-scope 留到后续 plan。
- [x] **No placeholders** — 每个 task 都有可粘贴运行的完整代码,没有 "TBD" / "add error handling" / "similar to Task N" 类占位。
- [x] **Type consistency** — `Diagnosis`/`Grade`/`Dimensions` 在 lib/types/diagnosis.ts 和 mac-scraper/src/types.ts 都用同一份(T9 强制 byte-identical)。`gradeColors` 返回 `{ fill, ink, base }`(T8) 与 ScoreCard 使用一致(T16)。
- [x] **Self-contained tasks** — 每个 task 的 Files / Steps / Run commands / Commit message 都在同一 task 内,Codex 不需要交叉读其它 task。
- [x] **TDD on logic; manual on UI** — URL parser / grade / auth / fixture endpoint / scraper client / API route / ScoreCard 都有 TDD;DiagnosticForm 走 dev server 目视验证。

---

## Execution choice(下一步)

Plan 1 已写完。两种执行路径:

1. **Codex 任务级交接(本项目锁定方式)** — 用户在仓库根目录把每个 Task 喂给 Codex CLI,Codex commit 后 Claude planner 用 `git diff` review,通过 → 下一个。
2. **Claude 内联执行(备选)** — Claude 直接在本会话用 Edit/Write/Bash 跑完所有 task。代码完全由 Claude 写,Codex 不参与。

按之前对话,**默认走路径 1(Codex 任务级)**。当 Codex 完成 Task 1 commit 后,在本会话告诉 Claude:"Task 1 done",Claude 会 `git show HEAD` + 跑测试做 review。
