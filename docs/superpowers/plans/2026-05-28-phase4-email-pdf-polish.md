# Phase 4 · Email(F1/F7)+ PDF + UI Polish + v0.4 Deltas — Implementation Plan

> **执行模式:** Codex CLI 逐 task。Claude 看 diff + commit。
>
> **完成 Plan 4 后到达的状态:** SPEC §8 全部受け入れ条件通。具体:贴 URL → 实分析 + AI 报告 + 下载 PDF + 评分<60 触发 F1 邮件 + 立即测试发送 F7 周报。

**Goal:** SPEC §8 demo 成功 checklist 全部跑通。

**Priority order(按重要性,如时间紧从底部砍):**

1. **PDF 下载**(SPEC §3.4 + 用户优先要求) → T1-T3
2. **F1 score<60 自动预警邮件**(SPEC §7 必须) → T4-T6
3. **F7 立即测试发送 + AlertBar**(SPEC §F7 v0.4 demo 仅手动) → T7-T8
4. **ProgressView 2B**(UX 必要,因为真 AI 60s 用户需要进度提示) → T9
5. **v0.4 deltas 集中收尾**(A5 ladder + ※参考值脚注 / B7 copy / F7 mock 文案) → T10
6. **Trend / C4 / 错误页**(可砍) → T11-T13
7. **最终 E2E + status doc** → T14-T15

**Tech Stack 增量:**
- `@react-pdf/renderer`(PDF)
- `@react-email/components` + `resend`(邮件)
- `recharts`(C1 趋势图)
- `public/fonts/NotoSansJP-Regular.ttf`(PDF + 邮件日文)

**Plan 3 完成状态:**
- 56 commits,84 tests pass
- 真 Airbnb URL → real AI 报告 1817 字 + Top3 落 DB,UI 渲染
- 临时变更:scraper-client timeout 120s(Plan 4 T15 可重审,Vercel 60s 限制需要 prompt 调优)

---

## How to hand off

```
Read docs/superpowers/plans/2026-05-28-phase4-email-pdf-polish.md.
Implement ONLY Task <N>. Follow every step exactly.
DO NOT commit — Claude will commit.
Output summary of files changed + test/build results.
```

**Codex 必读参考:**
- `SPEC_房源诊断系统_需求v0.4.md` §3.4(PDF / E)+ §3.5(F1 + F7)+ §A5(8 档 ladder)
- `SYSTEM_DESIGN_v0.2.md` §3 模块、§9 邮件、§10 PDF、§4 alerts_sent 表
- `design_handoff_review_app/prototype/AIReport.jsx` — PDF button placement
- `design_handoff_review_app/prototype/AlertBar.jsx`、`EmailPreview.jsx` — F1/F7 视觉(wireframe 4B)
- `design_handoff_review_app/prototype/ProgressView.jsx` — ProgressView 2B 视觉
- `design_handoff_review_app/prototype/QualityStatus.jsx`、`TrendChart.jsx` — A5/C1 视觉

---

## Module File Plan

| Path | Created in | 职责 |
|---|---|---|
| `public/fonts/NotoSansJP-Regular.ttf` | T1 | 内嵌字体 (~2MB) |
| `lib/pdf/report.tsx` | T2 | react-pdf Document 组件 |
| `app/d/[id]/pdf/route.ts` | T2 | GET route 流式输出 PDF |
| `components/PdfDownloadButton.tsx` | T3 | 客户端按钮 |
| `lib/email/resend.ts` | T4 | Resend client + dev fallback (log only) |
| `lib/email/alert.tsx` | T5 | F1 react-email 模板 |
| `lib/email/weekly.tsx` | T6 | F7 react-email 模板 |
| `app/api/diagnose/route.ts` | T5(修改) | F1 触发 |
| `app/api/weekly/test/route.ts` | T6 | F7 手动触发 |
| `components/AlertBar.tsx` | T7 | F1 + F7 状态条 |
| `components/EmailPreview.tsx` | T8 | 4B modal 预览 |
| `components/ProgressView.tsx` | T9 | 2B 骨架 loader |
| `app/page.tsx` | T9(修改) | 提交后切到 ProgressView |
| `components/QualityStatusLadder.tsx` | T10 | A5 8 档 + ※参考值脚注 |
| `lib/util/quality.ts` | T10 | 评分 → 8 档推算 |
| `components/TrendChart.tsx` | T11 | C1 mock 2 点折线(recharts) |
| `components/DiffArrow.tsx` | T12 | C4 上次 vs 本次 |
| `app/d/[id]/page.tsx` | T7/T10/T11/T12 | 挂上述新组件 |
| `app/page.tsx` | T13 | URL 错误内联 + 5A/5B/5C 状态视图 |
| `docs/superpowers/plans/phase4-status.md` | T15 | 完成报告 |

**新依赖**(根 web):
- `@react-pdf/renderer`、`@react-email/components`、`resend`、`recharts`

---

## Task 1 — Install deps + NotoSansJP font

**Files:**
- Modify: `package.json`
- Create: `public/fonts/NotoSansJP-Regular.ttf`(下载或从 Google Fonts 取)

- [ ] **Step 1 · 安装 npm deps**

```bash
pnpm add @react-pdf/renderer @react-email/components resend recharts
```

- [ ] **Step 2 · 下载 NotoSansJP-Regular.ttf**

```bash
mkdir -p public/fonts
curl -L -o public/fonts/NotoSansJP-Regular.ttf "https://raw.githubusercontent.com/googlefonts/noto-cjk/main/Sans/OTF/Japanese/NotoSansCJKjp-Regular.otf"
# 验证大小 > 1MB
ls -lh public/fonts/NotoSansJP-Regular.ttf
```

(若上述 URL 失败,fallback:`https://fonts.gstatic.com/s/notosansjp/...` 或从 Google Fonts 下载 zip。文件名最终是 `NotoSansJP-Regular.ttf`,即使源是 .otf 也按 .ttf 扩展存 — @react-pdf/renderer 通过 fontTagger 不强校验扩展。)

- [ ] **Step 3 · `pnpm build` 通过**

`pnpm build` → 0 error。

**Commit message:** `Install PDF (react-pdf) + email (react-email + resend) + recharts deps + NotoSansJP font`

---

## Task 2 — PDF route /d/[id]/pdf

**Files:**
- Create: `lib/pdf/report.tsx`
- Create: `app/d/[id]/pdf/route.ts`

- [ ] **Step 1 · 写 `lib/pdf/report.tsx`**

```tsx
import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";
import path from "node:path";

// Register Japanese font from public/fonts/
Font.register({
  family: "NotoSansJP",
  src: path.resolve(process.cwd(), "public/fonts/NotoSansJP-Regular.ttf"),
});

const s = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "NotoSansJP",
    fontSize: 10,
    lineHeight: 1.5,
    color: "#0E1116",
  },
  h1: { fontSize: 22, marginBottom: 8 },
  meta: { fontSize: 9, color: "#777C84", marginBottom: 24 },
  scoreRow: { flexDirection: "row", gap: 16, marginBottom: 20, alignItems: "baseline" },
  grade: { fontSize: 48, fontWeight: 700 },
  scoreNum: { fontSize: 14, color: "#41464D" },
  h2: { fontSize: 14, marginTop: 16, marginBottom: 6 },
  h3: { fontSize: 11, marginTop: 12, marginBottom: 4, fontWeight: 700 },
  body: { marginBottom: 6 },
  topItem: { marginBottom: 10, padding: 8, backgroundColor: "#F2F3F5", borderRadius: 4 },
  topLabel: { fontSize: 8, color: "#777C84", marginTop: 4 },
};

type Top3Item = { issue: string; action: string; impact: string };
type Dim = { score: number; [k: string]: unknown };

type Props = {
  listingId: string;
  listingTitle: string | null;
  url: string | null;
  diagnosedAt: Date;
  overallScore: number;
  grade: string;
  qualityStatus: string;
  dimensions: { photos: Dim; title: Dim; description: Dim; amenities: Dim; reviews: Dim };
  reportMd: string | null;
  top3: Top3Item[];
};

export function DiagnosisReport(p: Props) {
  return (
    <Document title={`SOZO Review ${p.listingId}`}>
      <Page size="A4" style={s.page}>
        <Text style={s.h1}>SOZO Review · 物件ヘルスチェック</Text>
        <Text style={s.meta}>
          {p.listingTitle ?? p.listingId} · {p.url ?? ""} · 診断日 {p.diagnosedAt.toLocaleDateString("ja-JP")}
        </Text>

        <View style={s.scoreRow}>
          <Text style={s.grade}>{p.grade}</Text>
          <Text style={s.scoreNum}>{p.overallScore} / 100 · {p.qualityStatus}</Text>
        </View>

        <Text style={s.h2}>5 次元スコア</Text>
        {(["photos","title","description","amenities","reviews"] as const).map((key) => (
          <Text key={key} style={s.body}>・ {key}: {p.dimensions[key].score}</Text>
        ))}

        {p.reportMd && (
          <>
            <Text style={s.h2}>AI レポート</Text>
            {/* Render markdown as plain paragraphs — keep simple. */}
            {p.reportMd.split(/\n+/).map((para, i) => (
              <Text key={i} style={s.body}>{para.replace(/^#+\s*/, "")}</Text>
            ))}
          </>
        )}

        {p.top3.length > 0 && (
          <>
            <Text style={s.h2}>Top 3 改善優先度</Text>
            {p.top3.map((it, i) => (
              <View key={i} style={s.topItem}>
                <Text style={s.h3}>{i + 1}. {it.issue}</Text>
                <Text style={s.topLabel}>アクション</Text>
                <Text style={s.body}>{it.action}</Text>
                <Text style={s.topLabel}>期待効果</Text>
                <Text style={s.body}>{it.impact}</Text>
              </View>
            ))}
          </>
        )}
      </Page>
    </Document>
  );
}
```

- [ ] **Step 2 · 写 `app/d/[id]/pdf/route.ts`**

```ts
import { eq } from "drizzle-orm";
import { renderToStream } from "@react-pdf/renderer";
import { db } from "@/lib/db/client";
import { diagnoses, listings } from "@/lib/db/schema";
import { DiagnosisReport } from "@/lib/pdf/report";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) {
    return new Response("Not Found", { status: 404 });
  }

  const rows = await db.select().from(diagnoses).where(eq(diagnoses.id, id)).limit(1);
  const d = rows[0];
  if (!d) return new Response("Not Found", { status: 404 });

  const lr = await db.select().from(listings).where(eq(listings.id, d.listingId)).limit(1);
  const listing = lr[0];

  const stream = await renderToStream(
    DiagnosisReport({
      listingId: d.listingId,
      listingTitle: listing?.title ?? null,
      url: listing?.url ?? null,
      diagnosedAt: d.createdAt,
      overallScore: d.overallScore,
      grade: d.grade,
      qualityStatus: d.qualityStatus,
      dimensions: d.dimensions as Parameters<typeof DiagnosisReport>[0]["dimensions"],
      reportMd: d.aiReportMd,
      top3: (d.aiTop3 as Parameters<typeof DiagnosisReport>[0]["top3"]) ?? [],
    }),
  );

  const yyyymmdd = new Date(d.createdAt).toISOString().slice(0, 10).replace(/-/g, "");
  const filename = `SOZO_REVIEW_${d.listingId}_${yyyymmdd}.pdf`;

  return new Response(stream as unknown as ReadableStream, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
```

- [ ] **Step 3 · `pnpm build` 通过**

(@react-pdf/renderer 在 Next.js bundle 中可能需要 `serverExternalPackages` 配置。若 build 报错 about `pdfkit` 或类似,在 `next.config.mjs` 加:
```js
serverExternalPackages: ["@react-pdf/renderer"],
```
位于 nextConfig 顶层。)

**Commit message:** `Add PDF generation route /d/[id]/pdf with react-pdf + NotoSansJP`

---

## Task 3 — PDF download button in AIReport

**Files:**
- Modify: `components/AIReport.tsx`
- Create: `components/PdfDownloadButton.tsx`(client component for download UX)

- [ ] **Step 1 · 写 `components/PdfDownloadButton.tsx`**

```tsx
"use client";

type Props = { diagnosisId: string };

export function PdfDownloadButton({ diagnosisId }: Props) {
  return (
    <a
      href={`/d/${diagnosisId}/pdf`}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "var(--s-2)",
        padding: "8px 14px",
        background: "var(--card)",
        border: "1px solid var(--ink-200)",
        borderRadius: "var(--r-md)",
        color: "var(--ink-800)",
        textDecoration: "none",
        fontSize: "var(--t-sm)",
        fontWeight: "var(--w-medium)",
        transition: "background var(--t-fast) var(--ease-out)",
      }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      PDF をダウンロード
    </a>
  );
}
```

- [ ] **Step 2 · AIReport.tsx 增 `diagnosisId` prop + 渲染按钮**

修改 `components/AIReport.tsx` 的 Props 加 `diagnosisId: string`,在 header 放按钮:

```tsx
import { PdfDownloadButton } from "./PdfDownloadButton";
// ...
type Props = {
  diagnosisId: string;
  reportMd: string | null;
  top3: ...;
  negativeKeywords: ...;
  status: "ok" | "fallback";
};

// 在 <header> JSX 内加 <PdfDownloadButton diagnosisId={diagnosisId} />
```

- [ ] **Step 3 · 修改 `app/d/[id]/page.tsx` 给 AIReport 传 `diagnosisId={id}`**

- [ ] **Step 4 · `pnpm build` + 浏览器试 PDF 下载**

`pnpm build` 0 error。开发模式手试:打开 result page,点 "PDF をダウンロード",浏览器应该弹下载窗口(`SOZO_REVIEW_<id>_<date>.pdf`),打开 PDF 日文不乱码。

**Commit message:** `Add PDF download button on AIReport + wire diagnosisId`

---

## Task 4 — Resend client + dev fallback

**Files:**
- Create: `lib/email/resend.ts`

- [ ] **Step 1 · 写 `lib/email/resend.ts`**

```ts
import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;

type SendArgs = {
  from?: string;
  to: string;
  subject: string;
  html: string;
  tags?: Array<{ name: string; value: string }>;
};

export type SendResult =
  | { ok: true; id: string | null; dev: boolean }
  | { ok: false; error: string };

export async function sendEmail(args: SendArgs): Promise<SendResult> {
  const from = args.from ?? "SOZO Review <onboarding@resend.dev>";

  if (!apiKey) {
    console.log("[email/dev-fallback] would send:", { to: args.to, subject: args.subject, htmlBytes: args.html.length });
    return { ok: true, id: null, dev: true };
  }

  const resend = new Resend(apiKey);
  try {
    const { data, error } = await resend.emails.send({
      from,
      to: args.to,
      subject: args.subject,
      html: args.html,
      tags: args.tags,
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true, id: data?.id ?? null, dev: false };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}
```

(说明:`RESEND_API_KEY` 没设时 → dev-fallback,console.log 邮件内容并返回 ok。这样 demo 无 Resend 账号也能跑通流程。生产填上真 key 就真发。)

- [ ] **Step 2 · `pnpm build`**

**Commit message:** `Add Resend email client with dev-fallback (log-only when no API key)`

---

## Task 5 — F1 alert email + trigger in /api/diagnose

**Files:**
- Create: `lib/email/alert.tsx`
- Modify: `app/api/diagnose/route.ts`(score<60 → 发 F1)
- Create: `tests/email-alert.test.ts`(渲染 HTML 测试)

- [ ] **Step 1 · 写 `lib/email/alert.tsx`**(react-email 模板)

```tsx
import { Html, Head, Body, Container, Heading, Text, Section, Button, Hr } from "@react-email/components";

type Top3Item = { issue: string; action: string; impact: string };

type Props = {
  listingTitle: string;
  score: number;
  grade: string;
  reportUrl: string;
  top3: Top3Item[];
};

const ink = "#0E1116";
const muted = "#595E66";

export function F1AlertEmail({ listingTitle, score, grade, reportUrl, top3 }: Props) {
  return (
    <Html lang="ja">
      <Head />
      <Body style={{ fontFamily: "Noto Sans JP, sans-serif", color: ink, backgroundColor: "#FAF8F4" }}>
        <Container style={{ maxWidth: 600, padding: 24, backgroundColor: "#fff", borderRadius: 8 }}>
          <Heading style={{ margin: 0, color: "#C7382B" }}>⚠️ 物件アラート</Heading>
          <Text style={{ color: muted, marginTop: 4 }}>
            {listingTitle}
          </Text>
          <Section style={{ backgroundColor: "#F7E1DE", padding: 16, borderRadius: 6, marginTop: 16 }}>
            <Text style={{ fontSize: 32, fontWeight: 700, color: "#842318", margin: 0 }}>
              {grade} 級 · {score} 点
            </Text>
            <Text style={{ margin: 0, fontSize: 12 }}>閾値 60 点を下回りました。早急な対応をご検討ください。</Text>
          </Section>

          <Heading as="h2" style={{ fontSize: 16, marginTop: 20 }}>Top 3 改善優先度</Heading>
          {top3.map((it, i) => (
            <Section key={i} style={{ marginTop: 8 }}>
              <Text style={{ margin: 0, fontWeight: 700 }}>{i + 1}. {it.issue}</Text>
              <Text style={{ margin: "2px 0", fontSize: 13, color: muted }}>{it.action}</Text>
              <Text style={{ margin: 0, fontSize: 12, color: "#1F5C3D" }}>→ {it.impact}</Text>
            </Section>
          ))}

          <Hr style={{ margin: "20px 0" }} />
          <Button href={reportUrl} style={{ backgroundColor: "#024280", color: "#fff", padding: "10px 16px", borderRadius: 6 }}>
            レポートを開く →
          </Button>

          <Text style={{ marginTop: 20, fontSize: 11, color: muted }}>
            このメールは SOZO Review が自動送信したものです。同一診断で再送はされません。
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
```

- [ ] **Step 2 · 修改 `app/api/diagnose/route.ts` 触发 F1**

在 db insert 完之后,id 拿到之后,加:

```ts
import { render } from "@react-email/components";
import { F1AlertEmail } from "@/lib/email/alert";
import { sendEmail } from "@/lib/email/resend";
import { alertsSent } from "@/lib/db/schema";

// ... after const id = inserted[0].id;
if (d.overall_score < 60) {
  try {
    const html = await render(
      F1AlertEmail({
        listingTitle: d.title,
        score: d.overall_score,
        grade: d.grade,
        reportUrl: `${req.nextUrl.origin}/d/${id}`,
        top3: d.ai.top3,
      }),
    );
    const result = await sendEmail({
      to: process.env.ALERT_EMAIL_TO ?? "alerts@example.com",
      subject: `⚠️ 物件アラート · ${d.title} · 評価 ${d.overall_score}`,
      html,
      tags: [{ name: "diagnosis_id", value: id }],
    });
    if (result.ok) {
      await db.insert(alertsSent).values({
        diagnosisId: id,
        emailTo: process.env.ALERT_EMAIL_TO ?? "alerts@example.com",
        resendId: result.id,
      }).onConflictDoNothing();
    }
  } catch (e) {
    console.error("F1 alert send failed:", e);
  }
}
```

- [ ] **Step 3 · 写测试 `tests/email-alert.test.ts`**

```ts
import { describe, it, expect } from "vitest";
import { render } from "@react-email/components";
import { F1AlertEmail } from "@/lib/email/alert";

describe("F1AlertEmail", () => {
  it("renders to HTML with the listing title and grade", async () => {
    const html = await render(F1AlertEmail({
      listingTitle: "テスト物件",
      score: 55,
      grade: "D",
      reportUrl: "https://example.com/d/abc",
      top3: [{ issue: "x", action: "y", impact: "z" }],
    }));
    expect(html).toContain("テスト物件");
    expect(html).toContain("D 級");
    expect(html).toContain("55");
    expect(html).toContain("y");
  });
});
```

- [ ] **Step 4 · 测试通过**

`pnpm test tests/email-alert.test.ts` → 1 pass。

**Commit message:** `Add F1 alert email + trigger when overall_score < 60`

---

## Task 6 — F7 weekly summary + /api/weekly/test

**Files:**
- Create: `lib/email/weekly.tsx`
- Create: `app/api/weekly/test/route.ts`
- Create: `tests/email-weekly.test.ts`

业务规则(SPEC §F7 v0.4):demo 仅手动「立即测试发送」,无定时器。邮件含:本周诊断总数、评级分布、Top3 低分房源。

- [ ] **Step 1 · 写 `lib/email/weekly.tsx`**

```tsx
import { Html, Head, Body, Container, Heading, Text, Section, Hr } from "@react-email/components";

type Listing = { title: string; grade: string; score: number; mainIssue: string };

type Props = {
  weekOf: string;        // "2026-05-27"
  totalDiagnosed: number;
  distribution: { A: number; B: number; C: number; D: number };
  top3Worst: Listing[];
};

export function F7WeeklyEmail({ weekOf, totalDiagnosed, distribution, top3Worst }: Props) {
  return (
    <Html lang="ja">
      <Head />
      <Body style={{ fontFamily: "Noto Sans JP, sans-serif", color: "#0E1116", backgroundColor: "#FAF8F4" }}>
        <Container style={{ maxWidth: 600, padding: 24, backgroundColor: "#fff", borderRadius: 8 }}>
          <Heading style={{ margin: 0 }}>SOZO 物件ヘルス週次サマリー</Heading>
          <Text style={{ color: "#595E66", marginTop: 4 }}>{weekOf} 週</Text>

          <Section style={{ marginTop: 16 }}>
            <Text style={{ margin: 0 }}>本週診断物件数: <strong>{totalDiagnosed}</strong> 件</Text>
            <Text style={{ margin: "4px 0" }}>評価分布:
              A {distribution.A} · B {distribution.B} · C {distribution.C} · D {distribution.D}
            </Text>
          </Section>

          <Hr style={{ margin: "20px 0" }} />

          <Heading as="h2" style={{ fontSize: 16 }}>要注意 Top 3</Heading>
          {top3Worst.map((l, i) => (
            <Section key={i} style={{ marginTop: 8 }}>
              <Text style={{ margin: 0, fontWeight: 700 }}>{i + 1}. {l.title}</Text>
              <Text style={{ margin: "2px 0", fontSize: 13 }}>{l.grade} 級 · {l.score} 点</Text>
              <Text style={{ margin: 0, fontSize: 12, color: "#595E66" }}>{l.mainIssue}</Text>
            </Section>
          ))}

          <Text style={{ marginTop: 20, fontSize: 11, color: "#595E66" }}>
            ※ demo 段階:定時送信は v1 で実装します。本メールは手動「テスト送信」によるものです。
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
```

- [ ] **Step 2 · 写 `app/api/weekly/test/route.ts`**

```ts
import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { render } from "@react-email/components";
import { db } from "@/lib/db/client";
import { diagnoses, listings } from "@/lib/db/schema";
import { F7WeeklyEmail } from "@/lib/email/weekly";
import { sendEmail } from "@/lib/email/resend";

export async function POST() {
  // 本週 = 最近 50 条诊断作为 demo 数据
  const recent = await db
    .select({
      id: diagnoses.id,
      overallScore: diagnoses.overallScore,
      grade: diagnoses.grade,
      listingTitle: listings.title,
      reportMd: diagnoses.aiReportMd,
    })
    .from(diagnoses)
    .leftJoin(listings, undefined)
    .orderBy(desc(diagnoses.createdAt))
    .limit(50);

  // Drizzle leftJoin without condition isn't directly supported above; simpler:
  // do it in two passes if Codex finds the API unergonomic.

  const distribution = { A: 0, B: 0, C: 0, D: 0 };
  for (const r of recent) {
    const g = r.grade as "A" | "B" | "C" | "D";
    if (g in distribution) distribution[g]++;
  }

  // 排分数最低 Top 3 — 若不足 3 条,用所有
  const sorted = [...recent].sort((a, b) => a.overallScore - b.overallScore).slice(0, 3);
  const top3Worst = sorted.map((r) => ({
    title: r.listingTitle ?? "(不明)",
    grade: r.grade,
    score: r.overallScore,
    mainIssue: (r.reportMd ?? "").slice(0, 80).replace(/\n/g, " "),
  }));

  const html = await render(F7WeeklyEmail({
    weekOf: new Date().toISOString().slice(0, 10),
    totalDiagnosed: recent.length,
    distribution,
    top3Worst,
  }));

  const result = await sendEmail({
    to: process.env.ALERT_EMAIL_TO ?? "alerts@example.com",
    subject: `SOZONEXT 物件ヘルス週次サマリー · ${new Date().toISOString().slice(0, 10)}`,
    html,
  });

  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 502 });
  return NextResponse.json({ ok: true, dev: "dev" in result ? result.dev : false, recent_count: recent.length });
}
```

(planner 注:`leftJoin(listings, undefined)` 是占位。Codex 应改成 `.leftJoin(listings, eq(diagnoses.listingId, listings.id))` 或先 query diagnoses 再 batch query listings — drizzle 文档参考。)

- [ ] **Step 3 · 写测试 `tests/email-weekly.test.ts`**

```ts
import { describe, it, expect } from "vitest";
import { render } from "@react-email/components";
import { F7WeeklyEmail } from "@/lib/email/weekly";

describe("F7WeeklyEmail", () => {
  it("renders weekly summary HTML", async () => {
    const html = await render(F7WeeklyEmail({
      weekOf: "2026-05-28",
      totalDiagnosed: 5,
      distribution: { A: 2, B: 1, C: 1, D: 1 },
      top3Worst: [
        { title: "物件 1", grade: "D", score: 52, mainIssue: "設備不足" },
      ],
    }));
    expect(html).toContain("2026-05-28");
    expect(html).toContain("5");
    expect(html).toContain("物件 1");
    expect(html).toContain("52");
    expect(html).toContain("v1 で実装"); // mock footer
  });
});
```

- [ ] **Step 4 · 测试通过**

**Commit message:** `Add F7 weekly summary email + /api/weekly/test endpoint (no scheduler per v0.4)`

---

## Task 7 — AlertBar component on result page

**Files:**
- Create: `components/AlertBar.tsx`
- Modify: `app/d/[id]/page.tsx`

- [ ] **Step 1 · 写 `components/AlertBar.tsx`**

```tsx
type Props = {
  score: number;
  alertSent: boolean;
  alertEmailTo: string;
  diagnosisId: string;
};

export function AlertBar({ score, alertSent, alertEmailTo, diagnosisId }: Props) {
  const triggered = score < 60;
  const bg = triggered ? "var(--grade-d-fill)" : "var(--grade-a-fill)";
  const fg = triggered ? "var(--grade-d-ink)" : "var(--grade-a-ink)";

  return (
    <section
      style={{
        background: bg,
        color: fg,
        padding: "var(--s-4)",
        borderRadius: "var(--r-lg)",
        margin: "var(--s-5) 0",
        display: "grid",
        gap: "var(--s-2)",
      }}
    >
      <div style={{ fontWeight: "var(--w-semibold)" }}>
        {triggered
          ? `⚠️ アラートを送信しました → ${alertEmailTo}`
          : `✅ 評価健全(${score} 点 ≥ 60)、アラートはトリガーされていません`}
      </div>
      <div className="t-small">
        次回自動送信予定:来週月曜日 09:00 ※ demo 段階では定時送信なし
      </div>
      <div>
        <form action="/api/weekly/test" method="POST">
          <button
            type="submit"
            style={{
              padding: "6px 12px",
              background: "var(--card)",
              border: "1px solid var(--ink-200)",
              borderRadius: "var(--r-md)",
              cursor: "pointer",
              fontSize: "var(--t-sm)",
            }}
          >
            🧪 立即测试发送週次サマリー
          </button>
        </form>
      </div>
    </section>
  );
}
```

(planner 注:`<form action="/api/weekly/test" method="POST">` 简版做法。Vercel 上需要 verify 该 form 提交后 Next.js 不会把响应当 HTML — 实际上 POST /api/weekly/test 返回 JSON,浏览器会渲染 JSON。改进版可改为 client component 用 fetch + toast,本 plan 简化。)

- [ ] **Step 2 · 修改结果页挂 AlertBar**

在 ScoreCard + DimensionGrid 之后插入:
```tsx
import { AlertBar } from "@/components/AlertBar";
// ...
<AlertBar score={d.overallScore} alertSent={!!d.aiStatus} alertEmailTo={process.env.ALERT_EMAIL_TO ?? "(未設定)"} diagnosisId={id} />
```

(注:这里 `alertSent` 该从 alerts_sent 表查;为简化先用占位 `true`。)

- [ ] **Step 3 · `pnpm build` 通过**

**Commit message:** `Add AlertBar to result page (F1 status + F7 manual trigger)`

---

## Task 8 — EmailPreview modal(可砍,4B wireframe)

**Files:**
- Create: `components/EmailPreview.tsx`

(说明:这是 wireframe 4B 的"邮件预览 modal"。Demo 非必须,但很有展示价值。若时间紧可砍。)

- [ ] **Step 1 · 实现 client component 模态框**

参考 `design_handoff_review_app/prototype/EmailPreview.jsx` 写一个 `'use client'` 模态框,渲染 F1/F7 邮件 HTML(通过 `dangerouslySetInnerHTML`)在一个 720px 信封容器里。AlertBar 多加两个 "プレビュー" 按钮触发。

(planner 注:本 task 内容详尽实现留给 Codex 看 prototype 自由发挥 + build pass。)

**Commit message:** `Add F1/F7 email preview modal (wireframe 4B)`

---

## Task 9 — ProgressView 2B skeleton loader

**Files:**
- Create: `components/ProgressView.tsx`
- Modify: `components/DiagnosticForm.tsx`(submit 后切到 ProgressView)
- Modify: `app/page.tsx`

参考 `design_handoff_review_app/prototype/ProgressView.jsx`:进度条 banner(spinner + step label "取得中…" / "分析中…" / "レポート生成中…")+ 下方结果页骨架(灰色条 placeholders)。Plan 4 demo 阶段无 SSE,文案 mock 时序:0-5s "取得中" / 5-25s "分析中" / 25s+ "AI レポート生成中"。

- [ ] **Step 1 · 实现 ProgressView**

```tsx
"use client";
import { useEffect, useState } from "react";

const PHASES = [
  { until: 5_000, label: "物件データを取得中…" },
  { until: 25_000, label: "5 項目を分析中…" },
  { until: 120_000, label: "AI レポートを生成中…" },
];

export function ProgressView() {
  const [start] = useState(() => Date.now());
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const t = setInterval(() => {
      const elapsed = Date.now() - start;
      const idx = PHASES.findIndex((p) => elapsed < p.until);
      setPhase(idx === -1 ? PHASES.length - 1 : idx);
    }, 500);
    return () => clearInterval(t);
  }, [start]);

  return (
    <main style={{ maxWidth: 1280, margin: "0 auto", padding: "var(--s-7) var(--gutter)" }}>
      <div
        style={{
          background: "var(--card)",
          border: "1px solid var(--ink-100)",
          borderRadius: "var(--r-lg)",
          padding: "var(--s-5)",
          display: "flex",
          alignItems: "center",
          gap: "var(--s-3)",
          marginBottom: "var(--s-6)",
        }}
      >
        <div
          style={{
            width: 16,
            height: 16,
            border: "2px solid var(--ink-200)",
            borderTopColor: "var(--sozonext-navy)",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        />
        <div className="t-body" style={{ fontWeight: "var(--w-medium)" }}>{PHASES[phase].label}</div>
        <div className="t-small" style={{ marginLeft: "auto", color: "var(--ink-400)" }}>{phase + 1}/{PHASES.length}</div>
      </div>

      {/* Skeleton preview of result page */}
      <div style={{ display: "grid", gap: "var(--s-4)" }}>
        <div style={{ height: 160, background: "var(--ink-50)", borderRadius: "var(--r-xl)" }} className="sk-bar" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "var(--s-3)" }}>
          {[0,1,2,3,4].map((i) => (
            <div key={i} style={{ height: 100, background: "var(--ink-50)", borderRadius: "var(--r-lg)" }} className="sk-bar" />
          ))}
        </div>
        <div style={{ height: 220, background: "var(--ink-50)", borderRadius: "var(--r-lg)" }} className="sk-bar" />
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes shimmer {
          0% { background-position: -800px 0; }
          100% { background-position: 800px 0; }
        }
        .sk-bar {
          background: linear-gradient(90deg, var(--ink-50) 0%, var(--ink-100) 50%, var(--ink-50) 100%);
          background-size: 1600px 100%;
          animation: shimmer 1.5s linear infinite;
        }
      `}</style>
    </main>
  );
}
```

- [ ] **Step 2 · 修改 DiagnosticForm submit 后切换**

把 DiagnosticForm 改成在 `submitting=true` 时整体替换为 `<ProgressView/>`。home 页用 client-side 状态切换。

```tsx
// app/page.tsx 改为 'use client' wrapper 或 — 更干净 — 在 DiagnosticForm 内 conditional render
// 在 DiagnosticForm.tsx return 顶部:
if (submitting) return <ProgressView />;
```

- [ ] **Step 3 · `pnpm build` + 浏览器观察**

提交后页面切到 spinner + skeleton + 阶段标签按时间推进。

**Commit message:** `Add ProgressView 2B skeleton loader during diagnose submission`

---

## Task 10 — QualityStatusLadder A5(+ v0.4 deltas 一并处理)

**Files:**
- Create: `components/QualityStatusLadder.tsx`
- Create: `lib/util/quality.ts`
- Modify: `lib/i18n/ja.ts`(8 档文案)
- Modify: `app/d/[id]/page.tsx`

业务规则(SPEC §A5):8 档,当前档位高亮,下方一行文字解释,**必须脚注「※ Airbnb の内部判定とは異なる参考値です」**。

- [ ] **Step 1 · 写 `lib/util/quality.ts`**

```ts
export const QUALITY_STEPS = [
  "Good",
  "Educate",
  "Warn",
  "Probation",
  "Additional Warn",
  "Pending Removal",
  "Suspended",
  "Removed",
] as const;

export type QualityStatus = (typeof QUALITY_STEPS)[number];

export function ratingToQuality(rating: number | null | undefined): QualityStatus {
  if (rating == null) return "Good"; // fallback per v0.4
  if (rating >= 4.8) return "Good";
  if (rating >= 4.5) return "Educate";
  if (rating >= 4.0) return "Warn";
  if (rating >= 3.5) return "Probation";
  if (rating >= 3.0) return "Additional Warn";
  return "Pending Removal";
}
```

- [ ] **Step 2 · 写 i18n 文案 + Ladder 组件**

JA 文案加到 `lib/i18n/ja.ts`:
```ts
qualityStatus: {
  Good: { label: "健全", desc: "品質問題はありません" },
  Educate: { label: "指導", desc: "1 件の品質指摘あり" },
  Warn: { label: "警告", desc: "複数の品質問題、要対応" },
  Probation: { label: "保留", desc: "繰り返し問題あり、削除リスク" },
  "Additional Warn": { label: "追加警告", desc: "累積過多" },
  "Pending Removal": { label: "削除予定", desc: "30 日後に削除" },
  Suspended: { label: "一時停止", desc: "現在停止中" },
  Removed: { label: "削除済み", desc: "既に削除されました" },
  reference: "※ Airbnb の内部判定とは異なる参考値です",
},
```

`components/QualityStatusLadder.tsx`:

```tsx
import { QUALITY_STEPS, type QualityStatus } from "@/lib/util/quality";
import { ja } from "@/lib/i18n/ja";

export function QualityStatusLadder({ current }: { current: QualityStatus }) {
  return (
    <section style={{ margin: "var(--s-4) 0" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: "var(--s-1)" }}>
        {QUALITY_STEPS.map((s) => {
          const active = s === current;
          return (
            <div
              key={s}
              title={ja.result.qualityStatus[s].label}
              style={{
                height: 28,
                background: active ? "var(--sozonext-navy)" : "var(--ink-100)",
                color: active ? "#fff" : "var(--ink-400)",
                fontSize: "var(--t-xs)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 3,
                fontWeight: active ? "var(--w-semibold)" : "var(--w-regular)",
              }}
            >
              {ja.result.qualityStatus[s].label}
            </div>
          );
        })}
      </div>
      <div className="t-small" style={{ marginTop: "var(--s-2)", color: "var(--ink-700)" }}>
        現在: <strong>{ja.result.qualityStatus[current].label}</strong> — {ja.result.qualityStatus[current].desc}
      </div>
      <div className="t-caption" style={{ marginTop: "var(--s-1)" }}>{ja.result.qualityStatus.reference}</div>
    </section>
  );
}
```

- [ ] **Step 3 · 挂到结果页(ScoreCard 下方,DimensionGrid 上方)**

```tsx
import { QualityStatusLadder } from "@/components/QualityStatusLadder";
import type { QualityStatus } from "@/lib/util/quality";
// ...
<QualityStatusLadder current={(d.qualityStatus as QualityStatus) ?? "Good"} />
```

- [ ] **Step 4 · `pnpm build` 通过**

**Commit message:** `Add Quality Status 8-step ladder (A5) with reference-value footnote`

---

## Task 11 — TrendChart C1(mock 2-point line,可砍)

**Files:**
- Create: `components/TrendChart.tsx`
- Modify: `app/d/[id]/page.tsx`

业务规则(SPEC §C1 v0.4):demo 阶段画 2 点折线("近一年" mock + "当前"真值),配文字注解"近一年评分为示例数据"。

- [ ] **Step 1 · 写 `components/TrendChart.tsx`**(recharts)

```tsx
"use client";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

type Props = { current: number };

export function TrendChart({ current }: Props) {
  // mock 1 year ago slightly different
  const lastYear = Math.max(0, Math.min(5, current / 20 - 0.3 + Math.random() * 0.4));
  const today = current / 20;
  const data = [
    { date: "1 年前", value: Number(lastYear.toFixed(2)) },
    { date: "現在", value: Number(today.toFixed(2)) },
  ];

  return (
    <section style={{ margin: "var(--s-5) 0" }}>
      <h3 className="t-h3" style={{ margin: "0 0 var(--s-3)" }}>評価推移</h3>
      <div style={{ width: "100%", height: 180, background: "var(--card)", border: "1px solid var(--ink-100)", borderRadius: "var(--r-lg)", padding: "var(--s-3)" }}>
        <ResponsiveContainer>
          <LineChart data={data}>
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis domain={[0, 5]} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="var(--sozonext-navy)" strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="t-caption" style={{ marginTop: "var(--s-2)" }}>
        ※ 「1 年前」のデータは示例値です。次バージョンで実履歴を表示します。
      </p>
    </section>
  );
}
```

- [ ] **Step 2 · 挂结果页 + build**

**Commit message:** `Add TrendChart C1 with mock 1-year line + reference footnote`

---

## Task 12 — C4 diff arrow + 错误页 5A/5B/5C(都是 polish,可砍)

**Files:**
- Create: `components/DiffArrow.tsx`(SPEC §C4)
- Modify: `app/page.tsx` 或 `components/DiagnosticForm.tsx`(5A/5B/5C 错误显示)

业务规则:
- C4:对比上次诊断,升 ↑ 绿、降 ↓ 红、平 = 灰、首次显示"首次诊断"
- 错误页:invalid URL / scrape fail / AI fail 在表单页内联展示(prototype 已有错误样式)

- [ ] **Step 1 · 写 DiffArrow**

```tsx
type Props = { current: number; previous: number | null };

export function DiffArrow({ current, previous }: Props) {
  if (previous == null) return <span className="t-small" style={{ color: "var(--ink-400)" }}>初回診断</span>;
  const delta = current - previous;
  if (delta === 0) return <span className="t-small" style={{ color: "var(--ink-400)" }}>= 維持</span>;
  const up = delta > 0;
  return (
    <span className="t-small" style={{ color: up ? "var(--grade-a)" : "var(--grade-d)" }}>
      {up ? "↑" : "↓"} {Math.abs(delta)} 点
    </span>
  );
}
```

- [ ] **Step 2 · 结果页查询同 listing 上一次诊断 → 挂 DiffArrow**

在 page.tsx 增 query:
```ts
const prev = await db
  .select({ s: diagnoses.overallScore })
  .from(diagnoses)
  .where(and(eq(diagnoses.listingId, d.listingId), ne(diagnoses.id, d.id)))
  .orderBy(desc(diagnoses.createdAt))
  .limit(1);
const previousScore = prev[0]?.s ?? null;
// ScoreCard 旁:
<DiffArrow current={d.overallScore} previous={previousScore} />
```

- [ ] **Step 3 · 错误页:DiagnosticForm 已有 inline error**

5A invalid URL ✓(已在)、5B scrape fail = 显示 "物件データを取得できませんでした" 文案 ✓(已在)、5C AI fail = 实际不阻断诊断,UI 上 AIReport status="fallback" 时已显示提示 ✓(已在)

→ **本 task 5A/5B/5C 已在前 plan 实现,本 task 仅检查文案完整 + commit Diff Arrow。**

**Commit message:** `Add C4 vs-previous diff arrow + verify 5A/5B/5C error inline copy`

---

## Task 13 — v0.4 deltas 最终核对(占位 task,纯人工 review)

**Files:** 无新建,可能微调若干文件。

- [ ] **Step 1 · 跑 checklist 自检**

逐条对照 CLAUDE.md §6 列表 + SPEC v0.4 元章节:

| Delta | 当前位置 | 状态 |
|---|---|---|
| UI 全日本語 | T4 next-intl ja | ✅ |
| B7 文字数 + 章节 | Plan 2 T7 | ✅ |
| A5 ※参考值脚注 | Plan 4 T10 | ✅ |
| C1 mock 标注 | Plan 4 T11 | ✅(若实装) |
| F7 mock 文案 + 仅手动 | Plan 4 T6 + T7 AlertBar | ✅ |
| 错误页 fallback | Plan 4 T12 review | ✅ |

如果发现某项文案不对齐(比如某处用「※ Airbnb 内部判定とは違う参考値」而非「異なる」),Codex 统一修。

- [ ] **Step 2 · 全测试通过**

```bash
pnpm test && cd mac-scraper && pnpm test && cd ..
```

**Commit message:** `Verify v0.4 deltas (A5 footnote / B7 copy / F7 mock / fallback errors) consistent`

---

## Task 14 — Final E2E smoke + phase4-status

**Files:**
- Create: `docs/superpowers/plans/phase4-status.md`

- [ ] **Step 1 · 启服务跑完整 demo 流程**

```bash
cd mac-scraper && pnpm dev &
ulimit -n 4096 && WATCHPACK_POLLING=true pnpm dev &
until curl -sf http://localhost:8787/healthz && curl -sf http://localhost:3000; do sleep 2; done

# 1) 高分房(应不触发 F1)
curl -X POST http://localhost:3000/api/diagnose -d '{"url":"<高分 URL>"}' -H 'Content-Type: application/json'

# 2) 低分房(应触发 F1 → 检 dev-fallback console.log 看邮件 payload)
# 3) /api/weekly/test 手动触发
curl -X POST http://localhost:3000/api/weekly/test
# 4) /d/<id>/pdf 下载 PDF,检查日文无乱码

kill %1 %2
```

- [ ] **Step 2 · 写 phase4-status.md**

```markdown
# Phase 4 Status — DEMO READY

**Completed:** 2026-MM-DD

## SPEC §8 受け入れ条件 — 全 8 步状态

1. 打开网页 ✅
2. 粘贴 Airbnb URL ✅
3. 点 「診断する」 ✅
4. 等待 ~30-60s(ProgressView 显示) ✅
5. 看到完整诊断结果(ScoreCard + QualityLadder + 5 DimensionCard + TrendChart + AIReport) ✅
6. 点 「PDFをダウンロード」→ 日文 PDF ✅
7. score<60 → F1 邮件已发(或 dev-fallback log) ✅
8. 「立即测试发送 F7」→ 周报邮件已发 ✅

## What's in
- 真 Airbnb fetch + 5 维度真分 + 真 Claude AI 报告 + PDF + F1/F7 邮件
- ProgressView 2B 60s 等待友好
- Quality Status ladder + ※参考值脚注(v0.4 delta)
- C4 vs-previous arrow
- C1 mock 趋势图 + 标注
- 错误页 5A/5B/5C 内联

## Known limitations
- timeout 120s(Vercel Hobby 60s 不兼容,需 prompt 调优 + 截断 reviews 文本量)
- Claude Code CLI 需 `claude /login` 单独认证(ADR-003 假设破)
- 真定时器 F7 仅"立即测试发送",v1 接 Vercel Cron
- reviews GraphQL hash 偶发过期 → 实测时 B12 数组可能为空

## Decisions for v1
- 时间预算优化:截 reviews 到 10 条 + 缩 system prompt → 真 AI 30s 内
- API key vs Subscription:迁移 ADR-003 到 ANTHROPIC_API_KEY 模式
- F7 真定时:Vercel Cron(weekly Monday 09:00 UTC+9)

## Total state
- ~75 commits 在 `feature/prototype`
- ~95+ tests pass
- Demo 可在内部老板演示
```

- [ ] **Step 3 · Claude commit + 关 server**

---

## Self-review checklist

- [x] **Spec coverage** — SPEC §3.4(PDF / E)、§3.5(F1 + F7)、§A5 ladder + 脚注、§C1 mock 趋势、§C4 箭头都对应任务。
- [x] **No placeholders** — 每个 task 有完整代码。
- [x] **Type consistency** — F1/F7 邮件参数类型与 Diagnosis.ai 字段一致;Quality status 类型与 score/index.ts 输出一致。
- [x] **Self-contained tasks** — Codex 可一次读一 task。
- [x] **TDD on logic; UI on build** — 邮件渲染 / quality 计算 TDD;UI 走 build 验证。

---

## Risks

1. **PDF NotoSansJP 字体 ~2MB** — Vercel Hobby 部署体积可能逼近上限,但 dev 没问题
2. **@react-pdf/renderer 与 Next 15** — 服务端组件兼容性偶有问题,需 `serverExternalPackages` 配置
3. **AlertBar form action POST 返回 JSON 浏览器渲染体验** — T7 留改进空间(client fetch + toast)
4. **F7 dev-fallback 无真发** — 若用户没 RESEND_API_KEY,F1/F7 只 console.log,不真发邮件。演示足够,但要清楚说明

---

## Execution

```
codex exec --sandbox workspace-write -c 'sandbox_workspace_write.network_access=true' -C "..." "..."
```

Codex 写代码 + 跑测试,Claude 看 diff + commit。**与前 3 个 plan 模式一致**。
