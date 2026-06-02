# SYSTEM DESIGN: Airbnb 房源健康诊断系统 v0.2

> 配套 PRD：[`prd.md`](prd.md) · 决策记录：[`adr/`](adr/)
> 版本：v0.2 · 日期：2026-05-27 · 状态：待评审
>
> **v0.2 变更**（基于 URL 实测 + 成本约束）：
> - **不再用 Playwright**。实测 Airbnb PDP 把所有需要的数据都嵌在 `data-deferred-state-0` 这个内联 JSON 里（92 张照片、12 组设施、6 维度评分、10 个评论标签全部 SSR），一次 curl + JSON 解析就够。Mac 服务变成纯 Node fetch，~50MB 依赖、~100MB 内存。
> - **AI 调用挪到 Mac**，用 **Claude Agent SDK** 接本地 Claude Code Enterprise 订阅，**$0 API 成本**。
> - **UI / PDF / AI 报告全部日语**（PRD v0.4 对齐）
> - **B7** 改为长度+章节正则评分（Airbnb 实测描述是单块 HTML，无 7 子字段）
> - **A5 Quality Status** 由评分推算 + UI 加"参考值"标注（Airbnb 不公开内部状态）
>
> **v0.1 → v0.2 影响汇总**：架构简化、月成本从 ~$2 降到 **$0**、Mac 内存占用降低、scrape 延迟从 15-20s 降到 2-5s（无浏览器启动）。

---

## 1. Context

实现 demo 阶段 Airbnb 房源健康诊断系统。用户贴 URL → 抓数据 → 输出 5 维度评分 + AI 报告 + SOZONEXT サポート CTA。

**核心约束**：
- demo 用，月成本 **$0**（强约束）
- 一人开发，1-2 周出可演示版本
- UI 全日语，目标用户：SOZONEXT 老板/运营

**技术决策（v0.2 锁定）**：
- 前端 + 短任务后端：**Next.js 15 (App Router) + TypeScript**，部署 **Vercel Hobby ($0)**
- 抓取：**Mac 本地 Node 服务**（无 Playwright），通过 **Cloudflare Tunnel** 暴露固定 HTTPS
- AI：**Claude Agent SDK** 在 Mac 上跑，用你的 Claude Code Enterprise OAuth ($0 API)
- DB：**Neon Postgres**（已开好），**Drizzle ORM** + **@neondatabase/serverless** 驱动
- PDF：**@react-pdf/renderer** + **NotoSansJP** 内嵌字体
- 图表：**Recharts**
- 国际化：**next-intl**（即便只有日语，规范化文案）

**总月成本**：$0（Vercel Hobby + Neon 免费 + Claude 走订阅）

---

## 2. 系统架构总览

```
┌────────────────────────────────────────────────────────────────┐
│                           ブラウザ (用户)                        │
└──────────────────────────────┬─────────────────────────────────┘
                               │ HTTPS
                               ▼
┌────────────────────────────────────────────────────────────────┐
│            Vercel Hobby (Next.js 15 App Router, 日本語 UI)      │
│                                                                │
│  ┌──────────────────┐    ┌────────────────────────────────┐    │
│  │  RSC ページ        │    │ Route Handlers (≤60s)         │    │
│  │  - /              │    │ - POST /api/diagnose          │    │
│  │  - /d/[id]        │    │ - GET  /api/diagnose/:id      │    │
│  │  - /d/[id]/pdf    │    │                                │    │
│  └──────────────────┘    └─────────┬───────────────┬───────┘    │
│                                    │               │            │
└────────────────────────────────────┼───────────────┼────────────┘
                                     │               │
            ┌────────────────────────┘               └────────┐
            │ HTTPS + Bearer secret                           │
            ▼                                                 ▼
┌──────────────────────────┐                          ┌──────────────┐
│ Mac (常駐)                │                          │ Neon Postgres │
│ Cloudflare Tunnel        │                          │ (Drizzle ORM) │
│ ┌──────────────────────┐ │                          │ - listings   │
│ │ Node Fetch Scraper   │ │                          │ - diagnoses  │
│ │  POST /diagnose      │ │                          └──────────────┘
│ │  - fetch airbnb HTML │ │
│ │  - parse deferred    │ │
│ │    state JSON        │ │
│ │  - fetch reviews via │ │
│ │    GraphQL endpoint  │ │
│ │  - compute 5 dims    │ │
│ │  - call Claude Agent │ │ ─── stdin/stdout ──► Claude Code CLI
│ │    SDK (local OAuth) │ │                      (Enterprise sub.)
│ │  - return full result│ │
│ └──────────────────────┘ │
└──────────────────────────┘
```

**关键边界**：
- Vercel 侧任何函数 ≤ 60s（Hobby 上限）
- 重活全在 Mac：抓取 + 评分计算 + AI → 返回成品 JSON
- 状态全部存 Neon

---

## 3. 模块拆解

```
repo/
├── app/                            # Next.js App Router
│   ├── page.tsx                    # 「URL を入力」表单
│   ├── d/[id]/
│   │   ├── page.tsx                # 結果ページ
│   │   └── pdf/route.ts            # GET → PDF stream
│   └── api/
│       └── diagnose/
│           ├── route.ts            # POST → Mac → save → return
│           └── [id]/route.ts       # GET 単一診断
├── components/
│   ├── ScoreCard.tsx               # A1/A4/A7
│   ├── QualityStatusLadder.tsx     # A5（含"参考值"小字）
│   ├── DimensionCard.tsx           # 基础组件
│   ├── dimensions/
│   │   ├── PhotosCard.tsx          # B1/B2/B3
│   │   ├── TitleCard.tsx           # B6 占位
│   │   ├── DescriptionCard.tsx     # B7/B8
│   │   ├── AmenitiesCard.tsx       # B10
│   │   └── ReviewsCard.tsx         # B12
│   ├── TrendChart.tsx              # C1（mock + 当前）
│   ├── DiffArrow.tsx               # C4
│   ├── ReportPanel.tsx             # AI 报告 markdown
│   └── SupportCta.tsx               # 营销 CTA（替代原 F1/F7 UI）
├── lib/
│   ├── db/
│   │   ├── client.ts               # Neon + Drizzle
│   │   └── schema.ts
│   ├── scraper/
│   │   └── client.ts               # Vercel → Mac HTTP client
│   ├── pdf/
│   │   └── report.tsx              # react-pdf 布局（日语）
│   ├── i18n/
│   │   └── ja.ts                   # 所有 UI 文案集中管理
│   └── util/
│       ├── url.ts                  # Airbnb URL 解析（含 .jp 域名）
│       └── grade.ts                # 0-100 → A/B/C/D, quality_status 推算
├── public/
│   └── fonts/
│       └── NotoSansJP-Regular.ttf  # PDF 嵌入
└── mac-scraper/                    # 独立 Node 项目
    ├── package.json
    ├── src/
    │   ├── server.ts               # express server
    │   ├── airbnb/
    │   │   ├── fetch-pdp.ts        # curl HTML
    │   │   ├── parse-deferred.ts   # 解析 data-deferred-state-0
    │   │   ├── fetch-reviews.ts    # GraphQL StaysPdpReviewsQuery
    │   │   └── types.ts            # PDP / Review schema
    │   ├── score/
    │   │   ├── photos.ts           # B1/B2/B3
    │   │   ├── description.ts      # B7（长度+章节）/ B8（多 locale）
    │   │   ├── amenities.ts        # B10
    │   │   ├── reviews.ts          # 数据准备
    │   │   └── index.ts            # 综合 + grade + quality
    │   ├── ai/
    │   │   ├── claude-agent.ts     # @anthropic-ai/claude-agent-sdk
    │   │   └── prompts/
    │   │       ├── system.ja.md    # 日语系统 prompt
    │   │       └── tools.ts        # tool schema
    │   └── log.ts                  # pino
    └── .env
```

---

## 4. 数据模型 (Neon Postgres)

```sql
CREATE TABLE listings (
  id          TEXT PRIMARY KEY,      -- airbnb listing_id
  url         TEXT NOT NULL,
  title       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE diagnoses (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id      TEXT NOT NULL REFERENCES listings(id),
  overall_score   INTEGER NOT NULL,
  grade           CHAR(1) NOT NULL,
  quality_status  TEXT NOT NULL,        -- 推算值
  dimensions      JSONB NOT NULL,       -- 5 维度详情
  snapshot        JSONB NOT NULL,       -- Mac 返回原始 listing 数据
  ai_report_md    TEXT,                 -- 日语 markdown
  ai_negative_kw  JSONB,                -- [{keyword,count,quote}]
  ai_top3         JSONB,                -- [{issue,action,impact}]
  ai_status       TEXT NOT NULL,        -- "ok" | "fallback"
  scrape_status   TEXT NOT NULL,        -- "ok" | "cache" | "partial"
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_diagnoses_listing ON diagnoses(listing_id, created_at DESC);
```

**和 v0.1 差别**：拆出 `ai_top3` 字段（之前藏在 ai_report_md 内），方便结果页 Top3Priorities 组件直接读用，不用二次解析 markdown。

> **历史注记**：早期版本还有 `alerts_sent` 表，用于跟踪 F1 预警邮件去重。F1/F7 邮件已废止（[ADR-006](adr/0006-remove-notification-emails.md)），该表在 Drizzle schema 中不再导出。Neon 中物理表保留作为废弃 schema，无新写入。

---

## 5. API 契约

### 5.1 Vercel `POST /api/diagnose`
```jsonc
// req
{ "url": "https://www.airbnb.jp/rooms/1174411978184206231?..." }

// res 200
{ "diagnosis_id": "uuid", "redirect": "/d/<uuid>" }

// 错误
// 400 { "error": "invalid_url" }
// 502 { "error": "scrape_failed" }
// 504 { "error": "timeout" }
```
内部：调 Mac scraper（≤45s timeout）→ 拿到完整 diagnosis JSON → 写 DB → 返回。（F1 アラートメールは廃止 — [ADR-006](adr/0006-remove-notification-emails.md)）

### 5.2 Mac `POST /diagnose`
```jsonc
// req headers: Authorization: Bearer <SCRAPER_SECRET>
// req body
{ "url": "...", "compare_to_listing_id": "..." }

// res（一次返完整结果，包括 AI 报告）
{
  "listing_id": "1174411978184206231",
  "title": "【贅沢な和モダン貸切1軒家】...",
  "snapshot": { /* 全部 SSR 提取的字段 */ },
  "dimensions": {
    "photos":      { "score": 95, "total": 92, "cover_ok": true, "coverage": "5/5", ... },
    "title":       { "score": 70, "placeholder": true },
    "description": { "score": 88, "length": 1240, "sections_hit": ["寝室","リビング",...] },
    "amenities":   { "score": 75, "match_ratio": "18/24", "missing": [...] },
    "reviews":     { "score": 99, "rating": 4.99, "count": 106, "category_ratings": {...} }
  },
  "overall_score": 86,
  "grade": "B",
  "quality_status": "Good",
  "ai": {
    "report_md": "## 総評\n...",
    "negative_keywords": [{"keyword":"...","count":3,"quote":"..."}],
    "top3": [{"issue":"...","action":"...","impact":"..."}],
    "status": "ok"
  }
}
```

### 5.3 Airbnb 内部端点（Mac scraper 调用，**非自有契约**）
- **PDP HTML**: `GET https://www.airbnb.jp/rooms/{id}` → 解析 `<script id="data-deferred-state-0">`
- **Reviews GraphQL**: `POST https://www.airbnb.jp/api/v3/StaysPdpReviewsQuery` with `X-Airbnb-API-Key: d306zoyjsyarp7ifhu67rjxn52tv0t20`（API key 从 PDP HTML 抽取，不硬编码以防过期）

---

## 6. 诊断主流程

```
POST /api/diagnose { url }              ← Vercel ≤60s 预算
  │
  ├─ 1. URL 校验（airbnb.com/airbnb.jp/airbnb.{country}/rooms/{id}）
  │    ✗ 400 "無効な Airbnb URL です"
  │
  ├─ 2. UPSERT listings
  │
  ├─ 3. 查 1 小时内是否已诊断该 listing → 命中直接 302 到旧结果
  │
  ├─ 4. POST Mac /diagnose（45s timeout）─────┐
  │                                          │  Mac 内部流程：
  │                                          │  a. fetch PDP HTML（~1s）
  │                                          │  b. 解析 deferred-state（同步，<100ms）
  │                                          │  c. fetch reviews GraphQL（~1s，前 20 条）
  │                                          │  d. 计算 5 维度评分（<50ms）
  │                                          │  e. 调 Claude Agent SDK 一次（~10-15s）
  │                                          │  f. 返回完整 JSON
  │                                          ◄─┘  Mac 总耗时 ~15-20s
  │
  ├─ 5. INSERT diagnoses（含完整 snapshot + AI 产物）
  │
  ├─ 6. 返回 { diagnosis_id, redirect }
  └─ （历史的 F1 邮件流已废止，UI 改用 SupportCta 营销 CTA）
```

**总时间预算**：Mac 15-20s + Vercel overhead 5s = ~25s（Hobby 60s 内宽裕）

---

## 7. AI 集成（Claude Agent SDK on Mac）

**为什么用 Agent SDK 而非 API key**：
- 走本机已登录的 Claude Code Enterprise OAuth → API 账单 $0
- 同进程内调用，无网络往返
- Agent SDK 支持 tool_use 结构化输出

**调用模式**：
```ts
// mac-scraper/src/ai/claude-agent.ts
import { query } from "@anthropic-ai/claude-agent-sdk";

const result = await query({
  prompt: buildPrompt(snapshot, dimensions),
  systemPrompt: JA_SYSTEM_PROMPT,         // 日语系统提示
  tools: [submitDiagnosisReport],          // 强制结构化输出
  maxTurns: 1,
});
// 解析 tool_use 入参 = AI 产物
```

**Prompt 结构**（系统提示日语）：
```
あなたは Airbnb 物件運営の専門家です。
以下のデータに基づき、日本語で診断レポートを生成してください。
出力は必ず submit_diagnosis_report ツールで返してください。

入力:
- 物件情報: {snapshot 摘要}
- 5次元評価: {dimensions JSON}
- レビュー抽選: {最多 50 条评论文本}

要求:
- 文体: です・ます調
- Top 3 改善案は具体的かつ実行可能に
- 否定キーワードは同義語をマージ
```

**Tool schema**：
```ts
const submitDiagnosisReport = {
  name: "submit_diagnosis_report",
  description: "診断レポートを提出する",
  input_schema: {
    type: "object",
    properties: {
      report_md: { type: "string", description: "日本語マークダウン全文" },
      negative_keywords: {
        type: "array",
        items: {
          type: "object",
          properties: {
            keyword: { type: "string", description: "日本語短語" },
            count: { type: "integer" },
            quote: { type: "string", description: "原文引用（言語そのまま）" },
          },
          required: ["keyword","count","quote"],
        },
      },
      top3: {
        type: "array",
        items: {
          type: "object",
          properties: {
            issue: { type: "string" },
            action: { type: "string" },
            impact: { type: "string" },
          },
        },
      },
    },
    required: ["report_md","negative_keywords","top3"],
  },
};
```

**重试**：失败 1 次重试；仍失败 → `ai_status="fallback"`，报告字段为日语兜底文案"AI 分析は現在利用できません"。

**速率/公平使用**：Claude Code 订阅有日限（按 plan 不同）；demo 量级（每日数十次）远低于阈值。

---

## 8. Airbnb 数据抽取（实测验证过）

### 8.1 PDP HTML → 结构化数据
所有字段都在 `<script id="data-deferred-state-0" type="application/json">` 里：

| 字段 | JSON 路径 |
|---|---|
| title | `niobeClientData[0][1].data.node.pdpPresentation.title.content.localizedString` |
| description (HTML) | `...sections.sections[].sectionId === "DESCRIPTION_DEFAULT"`.section.htmlDescription.htmlText |
| amenities (12 组) | `pdpPresentation.amenities.seeAllAmenitiesGroups[].amenities[]` |
| photos (92 张) | `sections[].sectionId === "PHOTO_TOUR_SCROLLABLE_MODAL"`.section.mediaItems[] |
| photo categories | `roomTourLayoutInfos[0].roomTourItems[]` (title=房间名, imageIds[]) |
| rating + count | `node.listingRatingStats.overallRatingStats` |
| 6 维度子评分 | `REVIEWS_DEFAULT`.section.ratings[] (CLEANLINESS/ACCURACY/...) |
| 10 评论 tag + count | `REVIEWS_DEFAULT`.section.reviewTags[] |
| highlights | `HIGHLIGHTS_COMPACT`.section.highlights[] |
| house rules | `POLICIES_DEFAULT`.section.houseRulesSections[] |
| 坐标 + address | JSON-LD 块 + presentation 内 |

### 8.2 评论文本 → GraphQL
```
POST https://www.airbnb.jp/api/v3/StaysPdpReviewsQuery
Headers:
  X-Airbnb-API-Key: <从 PDP HTML 抽取>
  Content-Type: application/json
Body:
  { "operationName": "StaysPdpReviewsQuery",
    "variables": { "id": "<base64 encoded listing id>", "first": 20, ... },
    "extensions": { "persistedQuery": {...} } }
```
返回最近 20 条评论（含 text/rating/language）→ 喂 Claude 做 B12。

### 8.3 多 locale 检测（B8）
追加 query `?locale=en` / `?locale=zh` / `?locale=ko` 各 fetch 一次，检查 `pdpPresentation.descriptions.longDescriptionHtml` 是否存在且与日语版本内容差异显著（hash 比对）→ 判定该语种是否有专属描述。

---

## 9. サポート CTA（旧 邮件集成）

F1 アラート / F7 週次サマリーは廃止された（[ADR-006](adr/0006-remove-notification-emails.md)）。
代わりに結果ページ末尾の「05 サポート」セクションに `components/SupportCta.tsx`
（純 server component、ハードコード日本語文案）を表示し、SOZONEXT 民泊運営代行への
mailto / tel / 外部リンクで CTA を構成する。詳細は
[`docs/superpowers/specs/2026-05-29-notification-to-marketing-cta-design.md`](superpowers/specs/2026-05-29-notification-to-marketing-cta-design.md) 参照。

---

## 10. PDF 生成（日语）

- `/d/[id]/pdf/route.ts` 用 `@react-pdf/renderer`
- 字体：`public/fonts/NotoSansJP-Regular.ttf`（subset 后 ~2MB）通过 `Font.register({ family:"NotoSansJP", src: ... })` 注册
- 所有 Text 组件 `style={{ fontFamily: "NotoSansJP" }}`
- 文件名：`SOZO_REVIEW_{listing_id}_{YYYYMMDD}.pdf`

**为什么不用 Playwright print**：原 v0.1 已论证 → Vercel 上免装 chromium，react-pdf 纯 JS 更轻。

---

## 11. 缓存策略

1. **诊断级**：Vercel 第 3 步查 1 小时内是否已诊断
2. **Mac 内部**：内存 LRU，同 URL 5 分钟复用上次 fetch 结果
3. **Claude prompt cache**：Agent SDK 自动 ephemeral cache 复用系统提示

---

## 12. 错误处理

| 场景 | 行为 |
|---|---|
| URL 非 Airbnb (含 .jp / .com.cn 等)房源 | 400「無効な Airbnb URL です」 |
| Mac 不可达（关机/tunnel 断） | 重试 1 次 → 502「物件データを取得できませんでした」 |
| Airbnb HTML 解析失败 | scrape_status="partial"，未拿到字段全显示「データなし」 |
| Reviews GraphQL 失败 | B12 显示「レビューデータを取得できません」，其他维度照常 |
| Claude Agent SDK 失败 | ai_status="fallback"，UI「AI 分析は現在利用できません」 |
| Vercel 55s 仍未完成 | abort 504，DB 仍写入失败标记的 diagnoses 行 |

---

## 13. 配置 & 安全

**Vercel 环境变量**：
```
DATABASE_URL=postgres://...neon.tech/...
SCRAPER_URL=https://scraper-sozo.trycloudflare.com
SCRAPER_SECRET=<32 字节随机>
```

**Mac `mac-scraper/.env`**：
```
PORT=8787
SCRAPER_SECRET=<同上>
# Claude Agent SDK：使用本机 Claude Code 已登录态，不需要单独 API key
```

**鉴权**：Bearer secret。所有非授权请求 401。

---

## 14. Trade-offs（v0.2 更新）

| 决策 | 优势 | 风险 |
|---|---|---|
| 不用 Playwright，纯 fetch | 简单、快、Mac 资源占用小 | Airbnb 改 HTML 结构会断；要监控解析失败率 |
| Claude Agent SDK on Mac | $0 API、本地调用快 | Mac 必须开机；TOS 灰区（demo OK，规模化不行）|
| Vercel Hobby + CF Tunnel | $0 部署 | tunnel/Mac 任一断都不能用，演示前必检 |
| 描述章节正则评分 (B7) | 务实、能落地 | 不同 host 描述风格差异大，正则覆盖不全 → 多收 host 样本调正则 |
| Quality Status 评分推算 | 有总比没有 | 不是 Airbnb 真实判定，必须 UI 加"参考值"小字 |
| AI 一次结构化输出 | 一次往返产 3 份产物 | prompt 偏长、改 schema 要 SDK + DB 双向调 |
| Drizzle ORM | 体积小、Neon 友好 | 团队若不熟悉，Prisma 更主流 |
| C1 mock 历史点 | 立即可演示 | v1 必须接真实历史 |

---

## 15. 实施路线（v0.2，缩短到 7 天）

| 天 | 里程碑 |
|---|---|
| D1 | 仓库脚手架 + Neon migration + Drizzle 装好 + `lib/i18n/ja.ts` |
| D2 | Mac scraper：fetch PDP + 解析 deferred state → 完整 JSON |
| D3 | Mac scraper：reviews GraphQL + 5 维度评分 lib |
| D3 | Cloudflare Tunnel 配置，从 Vercel preview 调通 |
| D4 | Claude Agent SDK 集成，跑通 1 次端到端日语报告 |
| D5 | 结果页 UI（评分卡 + 5 维度 + 趋势图 mock + 报告面板 + SupportCta，全日语） |
| D6 | PDF 日语布局 + NotoSansJP 嵌入 |
| D7 | 端到端走查（多个真实 URL：高分 / 低分 / 评论少 / 描述短）+ 修边界 |

**减少天数原因**：v0.1 里 D2 整天调 Playwright + chromium 部署，现在用 fetch + JSON 解析半天能跑通。

---

## 16. 验证 & Demo 演练

1. Mac 开机：`cd mac-scraper && pnpm dev`（监听 8787）
2. `cloudflared tunnel run sozo-scraper`（固定 URL）
3. 打开 https://sozo-review.vercel.app 或本地 `pnpm dev`
4. 粘贴真实 Airbnb URL（准备 3 个：高分日本房 / 评论多 / 评论少）
5. ~25 秒看到完整结果页（日语）
6. 点击「PDF をダウンロード」→ 检查日语字体不乱码
7. 结果页底部「05 サポート」区块显示 SOZONEXT サポート CTA，mailto / tel / 外部リンクが機能
8. Neon console 检查 diagnoses 表新行

**演示前 checklist**：
- [ ] Mac 不进入睡眠（`caffeinate -d` 或省电选项调整）
- [ ] CF Tunnel 进程在跑（`pm2 status`）
- [ ] Vercel env 变量正确
- [ ] Claude Code 已登录、订阅有效

---

## 17. 已决 / 待办

### 已决
- **Claude Agent SDK token 过期**：不会过期，无需特殊处理（演示前不需要刷新登录态）
- **Airbnb 反爬升级**：当前 SSR 数据裸露，先按此实现；真的被反了再加 UA/Referer/cookie 等手段，不在 demo 范围内预防

### 待办（实现期处理）

1. **B8 多 locale 并发 fetch**
   - 为检测描述支持语种数，需对同一 listing 用 `?locale=ja/en/zh/ko` 各 fetch 一次
   - **必须并发**（`Promise.all`），保证整体耗时 ≤ 2s
   - 判定逻辑：比对各 locale 返回的 `htmlDescription.htmlText` 与日语版本 hash，不同 → host 主动填了；相同 → host 未填，Airbnb 自动 fallback
   - 失败容忍：单个 locale 超时/失败 → 标"未確認"，不阻断其他

2. **Reviews GraphQL persistedQuery hash 动态化**
   - Airbnb 会变更 `StaysPdpReviewsQuery` 的 `persistedQuery.sha256Hash`
   - 不要硬编码 hash → 在 PDP HTML 加载阶段，从内嵌 script 块或 network manifest 里动态抽取最新 hash
   - 失败兜底：hash 抽取失败时，本次诊断 B12 标"レビューデータ取得失敗"，其他维度继续
