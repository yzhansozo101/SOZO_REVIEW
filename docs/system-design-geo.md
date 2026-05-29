# SYSTEM DESIGN: GEO 增强 — SOZONEXT Review

> **配套 PRD**: [`prd-geo.md`](prd-geo.md) · **主系统设计**: [`system-design.md`](system-design.md) · **决策记录**: [`adr/`](adr/)
>
> 版本：v0.1 · 日期：2026-05-29 · 状态：待评审
>
> **范围**：本文档对应 [`prd-geo.md`](prd-geo.md) P0 + 部分 P1 的工程实现。所有改动局限于 Next.js 前端（`app/` / `public/` / `components/`），**不影响 Mac scraper、DB、AI、邮件、PDF 任何现有模块**。

---

## 1. Requirements 摘录

| ID | 来源 | 工程影响 |
|---|---|---|
| R1 | 允许 9 个核心 AI 爬虫 | `app/robots.ts` 显式 allow |
| R2 | 禁止爬虫访问 `/d/[id]` | `app/robots.ts` disallow + `app/d/[id]/page.tsx` 加 `noindex` meta |
| R3 | 机器可读产品介绍 | `public/llms.txt` |
| R4 | 首页 ≥ 200 字有意义内容 | `app/page.tsx` + 4 个 marketing 组件 |
| R5 | JA/ZH/EN 三语品牌识别 | 多语 brand snippets 段 + JSON-LD `inLanguage` |
| R6 | Bing 验证 | ✅ 已完成（[PR #5](https://github.com/yzhansozo101/SOZO_REVIEW/pull/5)） |
| R7 | 提交 sitemap 到 Bing | `app/sitemap.ts` + 手动在 Bing Webmaster 提交 |
| R8 | 老板演示话术文档 | `docs/geo-demo-script.md`（人写，非代码） |
| R9 (P1) | 结构化元数据 | Organization + WebSite + WebApplication 三件套 JSON-LD |
| R12 (P1) | OG + Twitter Card | `app/layout.tsx` metadata + `app/opengraph-image.tsx` 生成图 |

**Out of scope（本期不做）**：R10 hreflang、R11 Google Search Console、R13-R17 (P2)。

---

## 2. 非功能约束

| 约束 | 来源 | 影响 |
|---|---|---|
| **月成本 $0** | [ADR-001](adr/0001-vercel-mac-split.md) | 不引入新付费服务（Vercel Hobby + 静态资源继续 $0） |
| **不引入新运行时依赖** | [ADR-002](adr/0002-no-playwright.md) 精神延续 | 全部用 Next.js 内置 API + 标准库 |
| **不破坏现有 Phase 1-4 功能** | demo ready 状态 | 诊断主流程 / 邮件 / PDF / Mac scraper 0 改动 |
| **form UX 不退化** | PRD §11 | DiagnosticForm 客户端组件保持原状不动 |
| **Vercel 60s 函数上限** | [ADR-001](adr/0001-vercel-mac-split.md) | 本期全静态，N/A |

---

## 3. 高层架构

```
┌───────────────────────── sozonext-review.vercel.app ─────────────────────────┐
│                                                                              │
│  ┌─────────── 爬虫入口（机器） ──────────┐  ┌──────── 人类入口 ────────┐    │
│  │                                          │  │                          │    │
│  │  GET /robots.txt   ← app/robots.ts       │  │   GET /                  │    │
│  │  GET /sitemap.xml  ← app/sitemap.ts      │  │   ↓                      │    │
│  │  GET /llms.txt     ← public/llms.txt     │  │   app/page.tsx           │    │
│  │  GET /og.png       ← app/opengraph-image │  │   ┌───────────────────┐  │    │
│  │                                          │  │   │  Hero (server)    │  │    │
│  │  (所有响应都来自 Vercel Edge / Static)   │  │   │  ─ JA h1 + lead   │  │    │
│  │                                          │  │   ├───────────────────┤  │    │
│  └──────────────────────────────────────────┘  │   │  DiagnosticForm   │  │    │
│                                                │   │  (client, 原样)    │  │    │
│  GET / 也会被爬虫拿到：                       │   ├───────────────────┤  │    │
│  → 渲染 SSR HTML，head 里塞：                  │   │  HowItWorks       │  │    │
│    ・<title>/<description>/keywords            │   │  (server)         │  │    │
│    ・OG / Twitter / canonical / robots         │   ├───────────────────┤  │    │
│    ・<meta msvalidate.01="...">（已有）         │   │  AboutSozonext    │  │    │
│    ・<script type="application/ld+json">       │   │  (server)         │  │    │
│      Organization + WebSite + WebApplication   │   ├───────────────────┤  │    │
│  → body 里 SSR 出 Hero / How / About / Snippets│   │  Multilingual     │  │    │
│                                                │   │  Brand Snippets   │  │    │
│                                                │   │  (server, small)  │  │    │
│                                                │   └───────────────────┘  │    │
│                                                └──────────────────────────┘    │
│                                                                                │
│  app/layout.tsx：metadataBase + 公共 OG/canonical/robots + verification (已有) │
└────────────────────────────────────────────────────────────────────────────────┘

DB / Mac scraper / Resend / @react-pdf — 不动 ❌
```

### 模块清单

```
新增/修改文件（共 13 个）

app/
├── robots.ts                        # 新增 — Next.js 原生 robots 约定
├── sitemap.ts                       # 新增 — Next.js 原生 sitemap 约定
├── opengraph-image.tsx              # 新增 — OG 图片生成器（ImageResponse）
├── layout.tsx                       # 改 — 扩展 metadata + 注入 JSON-LD（layout 级）
├── page.tsx                         # 改 — 在 form 上下嵌入 marketing 组件
└── d/[id]/page.tsx                  # 改 — 加 metadata.robots = noindex（双保险）

components/marketing/
├── Hero.tsx                         # 新增 — 顶部 h1 + lead（JA 含品牌词 + 长尾 kw）
├── HowItWorks.tsx                   # 新增 — 3 步说明
├── AboutSozonext.tsx                # 新增 — 公司+产品介绍（JA，密集品牌词）
├── MultilingualBrandSnippets.tsx    # 新增 — 站底 ZH/EN brand 短句
└── StructuredData.tsx               # 新增 — JSON-LD 注入组件

public/
└── llms.txt                         # 新增 — 标准 llms.txt 格式

docs/
└── geo-demo-script.md               # 新增 — 老板演示话术 + 备份演示路径
```

---

## 4. 组件设计

### 4.1 `app/robots.ts`

```ts
import type { MetadataRoute } from 'next';

const BASE = 'https://sozonext-review.vercel.app';

// 显式列出主流 AI 爬虫 + 搜索引擎爬虫
// 即使 '*' 已涵盖，显式 entry 让意图清晰，且某些爬虫只读自己 UA 的规则
const AI_AND_SEARCH_UAS = [
  // OpenAI
  'GPTBot', 'ChatGPT-User', 'OAI-SearchBot',
  // Anthropic
  'ClaudeBot', 'Claude-Web', 'anthropic-ai',
  // Perplexity
  'PerplexityBot', 'Perplexity-User',
  // Google
  'Google-Extended', 'Googlebot',
  // Apple
  'Applebot-Extended', 'Applebot',
  // Bing
  'Bingbot',
];

export default function robots(): MetadataRoute.Robots {
  const sharedRule = { allow: '/', disallow: ['/d/', '/api/'] };
  return {
    rules: [
      { userAgent: '*', ...sharedRule },
      ...AI_AND_SEARCH_UAS.map((ua) => ({ userAgent: ua, ...sharedRule })),
    ],
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  };
}
```

**输出**：`/robots.txt`（build-time 静态）。

### 4.2 `app/sitemap.ts`

```ts
import type { MetadataRoute } from 'next';

const BASE = 'https://sozonext-review.vercel.app';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${BASE}/`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1.0,
    },
  ];
}
```

**输出**：`/sitemap.xml`。当未来加 `/about`、FAQ、文章时，往这个数组扩展即可。

### 4.3 `public/llms.txt`

[llms.txt 标准格式](https://llmstxt.org)。静态文件，Vercel 自动从 `public/` 服务到 `/llms.txt`。**密集嵌入行业 niche 术语**（自然行文，非堆砌）。

```md
# SOZONEXT Review

> Airbnb 物件の健康診断ツール — SOZONEXT が運営。URL を貼るだけで 25 秒で **5 維度評価**と AI 改善レポートを生成。**スーパーホスト維持**や **Airbnb 検索順位**の改善に。

民泊運営支援を専門とする SOZONEXT が、Airbnb ホストのために開発した内部発の診断ツール。**写真・タイトル・紹介文・設備・レビュー**の 5 維度でスコアリングし、**スーパーホスト維持**・**Airbnb 検索順位**改善・**ゲスト評価向上**に必要な具体的アクションを日本語で提示。**OTA リスティング最適化**や**民泊運営代行**を行うチーム、**民泊サブリース**運営者に最適。

## 特徴
- **Airbnb タイトル 最適化** の自動診断
- **Airbnb 紹介文 添削**（描述完整性スコア）
- **Airbnb 写真 改善**（カバー写真 + カテゴリ網羅評価）
- 設備網羅性とレビュー解析（高頻度ネガティブキーワード抽出）
- **Quality Status 参考値**（公開情報からの推定）

料金無料、25 秒で結果、PDF ダウンロード可能。

## Primary
- [Home](https://sozonext-review.vercel.app/): 診断フォーム + プロダクト紹介

## About SOZONEXT
SOZONEXT は民泊運営支援を専門とする日本の会社。SOZONEXT Review は内部のオペレーション運営から生まれた診断ツール。

---

## English

SOZONEXT Review is an Airbnb listing diagnostic tool by SOZONEXT, a hospitality operations company based in Japan. Paste an Airbnb listing URL and get a 5-dimension health check (photos, title, description, amenities, reviews) plus an AI-generated improvement report in 25 seconds. Designed for hosts aiming to maintain Superhost status, improve Airbnb search ranking, and raise guest review scores. Useful for OTA listing optimization, vacation rental sublease operators, and property management agencies. Free to use. Output is in Japanese.

Keywords: Airbnb diagnostic, listing audit, Airbnb optimization tool, vacation rental analytics, Superhost maintenance, Airbnb search ranking, guest review improvement, 民泊, host tool, OTA optimization.

## 中文

SOZONEXT Review 是 SOZONEXT 推出的 Airbnb 房源健康诊断工具。SOZONEXT 是日本一家民泊运营服务公司。粘贴 Airbnb 房源 URL，25 秒内得到 5 维度健康评分（照片、标题、描述、设施、评论）和 AI 改进报告。面向想维持 Superhost 资格、提升 Airbnb 搜索排名、改善房客评分的房东。也适合 OTA 房源优化、民宿托管、转租运营团队使用。免费使用，报告语言为日语。

关键词：Airbnb 诊断、房源评分、民宿优化工具、Airbnb 工具、民泊运营、Superhost、搜索排名、房客评价。
```

### 4.4 `app/layout.tsx`（扩展，不重写）

在已有 metadata 基础上追加。**Bing verification 已存在，保留。**

```ts
export const metadata: Metadata = {
  metadataBase: new URL('https://sozonext-review.vercel.app'),
  title: {
    default: 'SOZONEXT Review · Airbnb 物件 ヘルスチェック',
    template: '%s | SOZONEXT Review',
  },
  description:
    'Airbnb 物件の URL から 25 秒で 5 維度評価と AI 改善レポート。スーパーホスト維持や Airbnb 検索順位向上を目指す民泊運営者向けの診断ツール。SOZONEXT が運営。',
  keywords: [
    // 品牌（必中）
    'SOZONEXT', 'SOZO Review', 'SOZONEXT Review',
    // 产品独有功能名（极低竞争）
    '5維度評価', '5維度スコアリング', 'Quality Status',
    // host 真痛点（低竞争）
    'Airbnb 検索順位', 'スーパーホスト維持', 'ゲスト評価向上',
    // 你 5 维度对应的具体优化场景（低竞争）
    'Airbnb タイトル 最適化', 'Airbnb 紹介文 添削', 'Airbnb 写真 改善',
    // B2B / 行业术语
    '民泊サブリース', '民泊 運営代行', 'OTA リスティング最適化',
    // 现有保留
    'Airbnb', '民泊', 'ヘルスチェック', '健康診断', 'リスティング',
  ],
  authors: [{ name: 'SOZONEXT' }],
  creator: 'SOZONEXT',
  publisher: 'SOZONEXT',
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    alternateLocale: ['en_US', 'zh_CN'],
    siteName: 'SOZONEXT Review',
    title: 'SOZONEXT Review · Airbnb 物件 ヘルスチェック',
    description: 'Airbnb 物件の URL から 25 秒で 5 維度評価 + AI 改善レポート。スーパーホスト維持・検索順位向上に。',
    url: 'https://sozonext-review.vercel.app/',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'SOZONEXT Review' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SOZONEXT Review · Airbnb 物件 ヘルスチェック',
    description: 'Airbnb 物件の URL から 25 秒で 5 維度評価 + AI 改善レポート。スーパーホスト維持・検索順位向上に。',
    images: ['/og.png'],
  },
  alternates: { canonical: 'https://sozonext-review.vercel.app/' },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  verification: {
    other: { 'msvalidate.01': '050C453F1AC4CDC35FDCCF5B2B0063A6' }, // 已存在，保留
  },
  category: 'business',
};
```

注意：JSON-LD **不放 layout 的 metadata**，而是作为 React 组件渲染（见 §4.6），原因是 Next.js Metadata API 没有 `script` 字段，需要手动在 React 树里塞 `<script type="application/ld+json">`。

### 4.5 `app/opengraph-image.tsx`（OG 图生成）

Next.js 内置 `ImageResponse`，build-time 生成 1200×630 PNG。**不依赖任何设计工具**。

```tsx
import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'SOZONEXT Review';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div style={{
        width: '100%', height: '100%',
        display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center',
        background: '#FAF8F4', color: '#024280',
        fontFamily: 'sans-serif', padding: '80px',
      }}>
        <div style={{ fontSize: 32, opacity: 0.6, marginBottom: 24 }}>SOZONEXT</div>
        <div style={{ fontSize: 72, fontWeight: 600, textAlign: 'center', lineHeight: 1.1 }}>
          Airbnb 物件 ヘルスチェック
        </div>
        <div style={{ fontSize: 28, marginTop: 32, opacity: 0.7 }}>
          25 秒で 5 維度健康診断 + AI 改善レポート
        </div>
      </div>
    ),
    { ...size },
  );
}
```

**输出**：`/og.png`（自动）。

### 4.6 `components/marketing/StructuredData.tsx`（JSON-LD 注入）

服务端组件。`<script>` 标签放在 layout 或 page 的 React 树里都行，本设计**放在首页 `app/page.tsx`**（page-specific 信息更密集），公共部分（Organization）从 layout 注入。

```tsx
// 这个组件接受 graph nodes，自己拼 @graph 并序列化
export function StructuredData({ graph }: { graph: object[] }) {
  const payload = {
    '@context': 'https://schema.org',
    '@graph': graph,
  };
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }}
    />
  );
}
```

**Schema 设计**（一个 `@graph` 三个 node）：

```jsonc
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://sozonext-review.vercel.app/#org",
      "name": "SOZONEXT",
      "url": "https://sozonext-review.vercel.app/",
      "description": "民泊運営支援を専門とする会社。Airbnb ホスト向けの診断ツール SOZONEXT Review を運営。"
    },
    {
      "@type": "WebSite",
      "@id": "https://sozonext-review.vercel.app/#site",
      "url": "https://sozonext-review.vercel.app/",
      "name": "SOZONEXT Review",
      "publisher": { "@id": "https://sozonext-review.vercel.app/#org" },
      "inLanguage": "ja-JP"
    },
    {
      "@type": "WebApplication",
      "@id": "https://sozonext-review.vercel.app/#app",
      "name": "SOZONEXT Review",
      "url": "https://sozonext-review.vercel.app/",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web",
      "publisher": { "@id": "https://sozonext-review.vercel.app/#org" },
      "description": "Airbnb 物件の URL から 25 秒で 5 維度評価と AI 改善レポート。スーパーホスト維持や Airbnb 検索順位向上を目指す民泊運営者向け。",
      "inLanguage": "ja-JP",
      "offers": { "@type": "Offer", "price": "0", "priceCurrency": "JPY" }
    }
  ]
}
```

**为什么这三个 type**：
- **Organization** → 把 `SOZONEXT` 作为实体注册（品牌词搜索的核心 anchor）
- **WebSite** → 告诉爬虫这是一个站点（而不是单个文章），有 `publisher` link
- **WebApplication** → 这才是产品本身：分类 "BusinessApplication"，免费（Offer price=0），日语

不加 `FAQPage` / `Product` / `SoftwareApplication`，因为：
- `FAQPage` 需要真实 Q&A 内容，本期没有
- `Product` 适用于物理商品，本应用是服务
- `SoftwareApplication` 跟 WebApplication 高度重叠，且 WebApp 对在线工具更准确

### 4.7 Marketing 组件（`components/marketing/*`）

5 个组件都是**纯展示服务端组件**，0 状态、0 客户端 JS。文字硬编码（i18n 用 `lib/i18n/ja.ts` 已有）。

#### `Hero.tsx`

最终 JA copy（确认稿）：

```
Eyebrow:  SOZONEXT REVIEW

h1:       Airbnb 物件の 健康診断を 25 秒で。

Lead:     URL を貼るだけで、写真・タイトル・紹介文・設備・レビューの
          5 維度評価と AI 改善レポート。スーパーホスト維持や Airbnb
          検索順位向上を目指す民泊運営者のための、SOZONEXT 製ツール。
```

**含 keyword 密度（自然，非堆砌）**：
- 品牌：`SOZONEXT` ×2（eyebrow + lead）
- Niche 长尾：`5 維度評価` / `スーパーホスト維持` / `Airbnb 検索順位` / `民泊運営者` / `健康診断` 共 5 个
- 现有维度名（写真/タイトル/紹介文/設備/レビュー）作为可读列表自然嵌入

**视觉规范**：
- eyebrow: `class="t-eyebrow"`（已有 token），间距 18px
- h1: 已有的 `clamp(32px, 6vw, 48px)` 大小，`line-height: 1.1`，`max-width: 680px`
- lead: 18px / `line-height: 1.5` / `color: var(--ink-700)` / `max-width: 680px`

**字数**：h1 17 chars、lead ~85 chars，移动端读起来 2-3 行，桌面 1-2 行。

#### `HowItWorks.tsx`
3 步说明。每步 1 行文字 + 1 个 emoji。
- ① URL を貼り付け
- ② 25 秒で 5 維度診断 + AI レポート生成
- ③ PDF ダウンロード可能

#### `AboutSozonext.tsx`
1-2 段，~100 字。公司 + 产品介绍。**最密集品牌词出现段。**

#### `MultilingualBrandSnippets.tsx`
站底小字 2 行：
- **EN**: "SOZONEXT Review — Airbnb listing diagnostic tool by SOZONEXT, a hospitality operations company."
- **ZH**: "SOZONEXT Review — SOZONEXT 推出的 Airbnb 房源健康诊断工具。"

字号小（14px）、灰色，**不抢人类视觉但 AI 能爬到**。

#### `StructuredData.tsx`
见 §4.6。

### 4.8 `app/page.tsx` 重构

当前：
```tsx
// 当前（推测，未读现文件，按推测）
export default function Home() {
  return (
    <main>
      <DiagnosticForm />
    </main>
  );
}
```

新版：
```tsx
import { Hero } from '@/components/marketing/Hero';
import { HowItWorks } from '@/components/marketing/HowItWorks';
import { AboutSozonext } from '@/components/marketing/AboutSozonext';
import { MultilingualBrandSnippets } from '@/components/marketing/MultilingualBrandSnippets';
import { StructuredData } from '@/components/marketing/StructuredData';
import { homepageGraph } from '@/lib/schema';

export default function Home() {
  return (
    <>
      <StructuredData graph={homepageGraph} />
      <main>
        <Hero />
        <DiagnosticForm />
        <HowItWorks />
        <AboutSozonext />
        <MultilingualBrandSnippets />
      </main>
    </>
  );
}
```

JSON-LD graph 抽到 `lib/schema.ts`，方便测试 + 重用。

### 4.9 `app/d/[id]/page.tsx`（双保险 noindex）

robots.txt 已经 disallow `/d/`，但补一个 page-level `noindex` 防止漏：

```tsx
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};
```

### 4.10 `docs/geo-demo-script.md`（人写文档）

老板用。内容大纲：
1. **3 个准备好的关键词**（待 PRD §8 OQ 老板确认）：
   - 品牌词：`SOZONEXT review`
   - JA 长尾：`民泊 健康診断 ツール`
   - ZH 兜底：`airbnb 房源诊断 工具`
2. **Demo 演示路径**：
   - 打开 Perplexity → 搜关键词 1 → 截图本站命中
   - 打开 ChatGPT (browse) → 同样
3. **备份 demo（如果 AI 还没索引）**：
   - 桌面 terminal 现场跑 `curl -A "GPTBot" https://sozonext-review.vercel.app/` → 给老板看完整 HTML 中的产品描述
   - 打开 [Schema Markup Validator](https://validator.schema.org/#url=https%3A%2F%2Fsozonext-review.vercel.app%2F) → 给老板看 3 个 schema 节点都被识别
   - 打开 Bing Webmaster Tools → 给老板看"已收录 + 已验证"

---

## 5. 数据流（爬虫视角）

```
1. AI 爬虫(GPTBot)请求 /
   ↓
2. Vercel Edge 静态返回 SSR HTML（age=0，每次都 fresh）
   ↓
3. 爬虫读 <head>:
   ・<title>/<description>/keywords    → 内容主题摘要
   ・<meta name="robots" content="...">  → 索引许可
   ・<meta msvalidate.01="...">          → 站长身份
   ・<meta property="og:*">              → 社交分享显示
   ・<link rel="canonical">              → 规范 URL
   ・<script type="application/ld+json"> → 结构化产品/品牌信息
   ↓
4. 爬虫读 <body>:
   ・hero h1 + lead                      → 主题 + 品牌词
   ・form                                 → 用户能干嘛
   ・How / About / Snippets              → 详细说明 + 多语 brand
   ↓
5. 爬虫再访问 /llms.txt（如果它支持）
   → 拿到一份精炼的"机器读"版产品说明
   ↓
6. 爬虫再访问 /sitemap.xml
   → 拿到本站完整 URL 列表（目前只 /）
   ↓
7. 爬虫尝试 /d/abc-123
   → /robots.txt disallowed + page noindex → 跳过
```

---

## 6. Trade-off 分析

| 决策 | 选择 | 替代 | 取舍 |
|---|---|---|---|
| robots & sitemap 实现 | `app/robots.ts` + `app/sitemap.ts`（Next.js 原生 metadata route） | 静态 `public/robots.txt` + `public/sitemap.xml` | 原生：build-time 生成，类型安全，未来加 dynamic 内容（文章）方便。静态：更朴素，但加新 URL 要手工。**选原生**。 |
| llms.txt 实现 | 静态 `public/llms.txt` | 动态 `app/llms.txt/route.ts` | 静态：极简，缓存自动。动态：可程序化生成但 overkill。本期内容稳定→**选静态**。当文章数 > 5 时考虑改动态。 |
| OG 图 | `app/opengraph-image.tsx` 用 `ImageResponse` 生成 | 设计师做 PNG 放 `public/og.png` | 生成：不依赖设计工具，构建期生成，brand 一致；图可程序化更新。手画：可能更美但需要设计师。**选生成**。 |
| JSON-LD 注入位置 | React 组件 `<script>` 标签，放在首页 | 通过 `next-seo` 库 / Next.js metadata 字段 | Next.js Metadata API 没有 JSON-LD 字段。`next-seo` 是额外依赖（违反 §2 约束）。**自己写 ~10 行**。 |
| Schema 类型组合 | Org + WebSite + WebApplication 三件套 | + Product / + FAQPage / + SoftwareApplication | 三件套覆盖品牌+站点+应用本身；其他 type 当前没内容支撑（FAQPage 需 Q&A，Product 适物理商品）。**简洁优先**。 |
| 首页结构 | 在现有 form 上下嵌入 marketing 段（X 方案） | 拆 `/`（marketing）+ `/diagnose`（form）（Y 方案） | X：单 URL crawl 信号集中，UX 改动小。Y：UX 更纯净但 SEO juice 分散。PRD §6.1 已选 X。 |
| 多语策略 | JA 主体 + 站底 ZH/EN 小字 brand snippets | 完整 `next-intl` 三语 + hreflang | 完整三语翻倍 UI 工作量，违反 PRD §3 non-goals。**选 snippet** 已足够让 AI fingerprint 跨语品牌词。 |
| 演示话术放哪 | `docs/geo-demo-script.md`（与其他 docs 并列） | `docs/superpowers/plans/` | demo script 是给老板看的产品文档，不是工程 plan。**docs/** 根目录更合适。 |
| `/d/[id]` 防索引 | robots.txt + page-level `noindex` 双保险 | 仅 robots.txt | 双保险防漏（万一某 crawler 没看 robots.txt 还有 meta 兜底）。代价 ~3 行代码。**选双保险**。 |

---

## 7. Scale & Reliability

**本期所有产物都是 build-time 静态**：
- `/robots.txt`、`/sitemap.xml`、`/og.png`、`/llms.txt`、`/`（prerendered HTML） 全部 0 运行时开销
- Vercel Edge 默认 cache forever 直到 deploy
- **没有运行时 failure mode**（不像诊断主流程依赖 Mac + DB + AI）

**未来 scale point**：
- 当 sitemap 超过 ~50 URL（文章 + FAQ）：考虑分页 sitemap
- 当 llms.txt 内容随产品变化频繁：改动态 `app/llms.txt/route.ts`，从 CMS 或 DB 拼

---

## 8. 实现顺序 / PR 拆分

**推荐 1 个 PR，13 个文件**。原因：所有改动小、关联紧（同时上才让爬虫看到一致快照）、可以一次 demo 验证。

```
PR #N: GEO 增强 — robots / sitemap / llms.txt / metadata / homepage 内容

  新增:
    app/robots.ts
    app/sitemap.ts
    app/opengraph-image.tsx
    components/marketing/Hero.tsx
    components/marketing/HowItWorks.tsx
    components/marketing/AboutSozonext.tsx
    components/marketing/MultilingualBrandSnippets.tsx
    components/marketing/StructuredData.tsx
    lib/schema.ts
    public/llms.txt
    docs/geo-demo-script.md

  修改:
    app/layout.tsx          (metadata 扩展, JSON-LD 不在这里)
    app/page.tsx            (在 form 上下嵌入 marketing 组件 + JSON-LD)
    app/d/[id]/page.tsx     (加 noindex metadata)
```

如果担心 PR 太大，**可选拆 2**：
- PR A：纯技术管道（robots + sitemap + llms.txt + metadata + JSON-LD），保留首页只 form
- PR B：首页内容（5 个 marketing 组件 + page.tsx 重构）

**推荐合并到一个 PR** 因为：
- 加 metadata 不加内容时，AI 爬到首页只看到 "URL を入力してください" + 一堆 meta，**显得空洞**，比现状好不了多少
- 一次 PR review 一次 demo，更高效

---

## 9. Test / 验证策略

### 9.1 单元 / 集成测试

| 测试 | 怎么测 |
|---|---|
| robots.txt 内容正确 | `vitest`: 调 robots() 函数，断言含 `/d/` disallow + 9 个 AI UA |
| sitemap.xml 内容正确 | 调 sitemap()，断言含 `/` |
| JSON-LD 合法 | 调 graph builder，对返回值跑 Zod schema 校验（自定义） |
| `/d/[id]` metadata 含 noindex | 渲染测试 |

### 9.2 端到端验证（手动 + 命令行）

```bash
# 1. 爬虫 UA 模拟
for UA in GPTBot ChatGPT-User PerplexityBot ClaudeBot Bingbot Google-Extended; do
  echo "=== $UA ==="
  curl -sI -A "$UA" https://sozonext-review.vercel.app/ | head -3
done
# 期待: 6/6 拿到 200

# 2. robots/sitemap/llms 都能访问
curl -s https://sozonext-review.vercel.app/robots.txt | head -20
curl -s https://sozonext-review.vercel.app/sitemap.xml
curl -s https://sozonext-review.vercel.app/llms.txt | head -10

# 3. JSON-LD 在首页 HTML 中
curl -s https://sozonext-review.vercel.app/ | grep -A 30 'application/ld+json'

# 4. /d/* 拿到 noindex
curl -s https://sozonext-review.vercel.app/d/test-id | grep -i 'noindex'
```

### 9.3 外部验证工具

- [Google Rich Results Test](https://search.google.com/test/rich-results) — paste URL，看 schema 解析
- [Schema Markup Validator](https://validator.schema.org/) — 同上更严格
- [Bing Webmaster Tools](https://www.bing.com/webmasters/) — 检查 indexed pages、sitemap status
- [llms.txt validator](https://llmstxt.org/) — 检查 llms.txt 格式

---

## 10. 风险 & Mitigation

| 风险 | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Vercel Edge cache 不立即失效，新 deploy 后 robots/sitemap 还是旧的 | Mid | Low | 等 1-2 分钟自动失效；急用 Vercel Dashboard 手动 invalidate |
| AI 爬虫无视 robots.txt 还是爬 `/d/[id]` | Low | High（隐私） | page-level `noindex` 双保险（§4.9） |
| 首页加了内容后 Lighthouse 性能分数下降 | Low | Low | 全是 server-rendered 静态文字 + 1 张 OG png，无运行时开销 |
| JSON-LD 语法错误导致全部 schema 不被解析 | Mid | Mid | Vitest 单测 + 上线后用 Schema Validator 手验 |
| 首页内容加得太多挤压 form 视觉 | Mid | Mid | hero 控 ≤ 3 行；form 立即可见，无需滚动 |
| 老板演示日 AI 还没索引（Bing 一般 1-3 天） | High | High（demo 失败感） | demo script 含"备份演示"路径（curl + schema validator 截图） |

---

## 11. 未来 revisit（v1+）

| 触发条件 | 改动 |
|---|---|
| 加文章 / FAQ | sitemap 改动态从 DB / fs 生成；考虑加 FAQPage schema |
| 真的多语言 UI | 引入 `next-intl` locale routing + hreflang 头 + 多 sitemap |
| 买自定义域名 | metadataBase 改新域名；Bing/Google 重新验证；canonical 301 旧域 |
| 大量外部链接 / 真实流量 | 加 GA / Plausible（违反 $0 → 决策点）|
| Anthropic 提供 push API | 改主动通知，不再纯被动 |

---

## 12. 与既有 ADR 一致性 check

| ADR | 关系 |
|---|---|
| [ADR-001 Vercel+Mac](adr/0001-vercel-mac-split.md) | ✅ 全部新文件都在 Vercel 端（前端 prerender），Mac scraper 0 改动 |
| [ADR-002 fetch + JSON 解析](adr/0002-no-playwright.md) | ✅ 不引入新运行时依赖 |
| [ADR-003 Claude Agent SDK](adr/0003-claude-agent-sdk.md) | ✅ AI 调用路径不动 |
| [ADR-004 同步主流程](adr/0004-synchronous-flow.md) | ✅ 主流程不动 |
| [ADR-005 单次 tool_use](adr/0005-single-tool-use.md) | ✅ AI 集成不动 |

**不需要新 ADR**。所有决策都在既有 ADR 框架内。

---

## 13. Implementation effort 估算

| 文件/任务 | 工作量 |
|---|---|
| `app/robots.ts` | 10 min |
| `app/sitemap.ts` | 5 min |
| `app/opengraph-image.tsx` | 20 min（含调字号配色）|
| `app/layout.tsx` 扩展 | 15 min |
| `app/page.tsx` 重构 | 10 min |
| `app/d/[id]/page.tsx` noindex | 5 min |
| `components/marketing/*` 5 个组件 | 60 min（含 JA copywriting）|
| `lib/schema.ts` | 15 min |
| `public/llms.txt` | 20 min（含三语 copy）|
| `docs/geo-demo-script.md` | 30 min |
| 单测 | 30 min |
| 端到端验证 + 提交 Bing sitemap | 20 min |
| **合计** | **~4 小时** |

**符合 PRD §9 Day 0 范围**。

---

## 14. 实施前 confirm（已 resolved）

| Q | 决定 | 备注 |
|---|---|---|
| PR 拆 1 个还是 2 个？ | **1 个 PR**（13 文件） | 一次 review、一次 demo 验证 |
| OG 图配色 | **Sozonext Navy `#024280` + Paper `#FAF8F4`**（`colors_and_type.css` brand token） | brand 一致 |
| Hero JA copy | **本文档 §4.7 已 freeze 文案**（"Airbnb 物件の 健康診断を 25 秒で。" + niche-dense lead） | 实装时直接照抄 |
| Multilingual Snippet 字号 | **默认 14px / `var(--ink-500)`** | 不抢人类视觉，AI 能爬到 |
| Demo script 关键词 | **`docs/geo-demo-script.md` 先用 stub 占位**：3 个 placeholder + 备份演示路径完整 | 等老板回答 [PRD §8 OQ](prd-geo.md#8-open-questions) 后填具体 keyword |
| Niche keyword 强化 | **§4.3 llms.txt + §4.4 layout description/keywords + §4.6 JSON-LD 都已采用 niche 加强版** | 极低竞争词（5維度評価 / Quality Status / スーパーホスト維持 / Airbnb 検索順位 等）密集嵌入 |

**全部 resolved。design freeze。可以进入 implementation。**
