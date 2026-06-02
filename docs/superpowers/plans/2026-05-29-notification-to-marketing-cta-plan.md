# Notification → SOZONEXT 营销 CTA 实施 Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 用 `<SupportCta />` 营销卡替换结果页"05 通知"区域，删除 F1/F7 邮件后端及配套代码。

**Architecture:** 1 个新增 server component（无 props、纯展示）；6 块删除（API endpoint / email lib / 2 个 component / 4 个 test 文件 / DB schema export / Resend 依赖）；4 处文档更新 + 1 个 ADR。**先写新代码、再删旧代码**——保证每步都有可跑的 build。

**Tech Stack:** Next.js 15 App Router · TypeScript · React 19 · Drizzle ORM · vitest + Testing Library · CSS variables（已有 tokens）。

**Spec:** [`docs/superpowers/specs/2026-05-29-notification-to-marketing-cta-design.md`](../specs/2026-05-29-notification-to-marketing-cta-design.md)

**Branch:** `feature/notification`（已基于最新 main）

---

## Task 1: 新增 `SupportCta` 组件 + 单元测试（TDD）

**Files:**
- Create: `tests/SupportCta.test.tsx`
- Create: `components/SupportCta.tsx`

- [ ] **Step 1.1: 写失败的单元测试**

新建 `tests/SupportCta.test.tsx`，内容：

```tsx
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import { SupportCta } from "@/components/SupportCta";

afterEach(() => cleanup());

describe("SupportCta", () => {
  it("renders headline and description", () => {
    render(<SupportCta />);
    expect(screen.getByText("もっと結果を出しませんか？")).toBeInTheDocument();
    expect(
      screen.getByText(/SOZONEXT は民泊運営代行の専門会社/),
    ).toBeInTheDocument();
  });

  it("renders all 3 service bullets with titles and captions", () => {
    render(<SupportCta />);
    expect(screen.getByText("リスティング最適化代行")).toBeInTheDocument();
    expect(
      screen.getByText("写真・タイトル・紹介文を SOZONEXT が制作"),
    ).toBeInTheDocument();
    expect(screen.getByText("24h 運営代行")).toBeInTheDocument();
    expect(
      screen.getByText("ゲスト対応・清掃・チェックイン代行"),
    ).toBeInTheDocument();
    expect(screen.getByText("収益改善コンサル")).toBeInTheDocument();
    expect(
      screen.getByText("価格戦略・RevPAR 改善・複数物件運用"),
    ).toBeInTheDocument();
  });

  it("email CTA uses prefilled mailto link to minpaku_info@sozonext.com", () => {
    render(<SupportCta />);
    const email = screen.getByRole("link", {
      name: /minpaku_info@sozonext\.com にメール相談する/,
    });
    expect(email.getAttribute("href")).toMatch(
      /^mailto:minpaku_info@sozonext\.com\?/,
    );
    expect(email.getAttribute("href")).toContain("subject=");
    expect(email.getAttribute("href")).toContain("body=");
  });

  it("phone link uses international tel: URI", () => {
    render(<SupportCta />);
    const tel = screen.getByRole("link", { name: /03-3842-1552/ });
    expect(tel).toHaveAttribute("href", "tel:+81338421552");
  });

  it("website link opens sozonext.com in a new tab safely", () => {
    render(<SupportCta />);
    const site = screen.getByRole("link", { name: /sozonext\.com/ });
    expect(site).toHaveAttribute("href", "https://sozonext.com");
    expect(site).toHaveAttribute("target", "_blank");
    expect(site).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("decorative icons are marked aria-hidden", () => {
    const { container } = render(<SupportCta />);
    const svgs = container.querySelectorAll("svg");
    expect(svgs.length).toBeGreaterThan(0);
    for (const svg of svgs) {
      expect(svg.getAttribute("aria-hidden")).toBe("true");
    }
  });

  it("email CTA reuses the navy primary CTA token (background: sozonext-navy)", () => {
    render(<SupportCta />);
    const email = screen.getByRole("link", {
      name: /minpaku_info@sozonext\.com にメール相談する/,
    });
    const style = email.getAttribute("style") ?? "";
    expect(style).toMatch(/background:\s*var\(--sozonext-navy\)/);
  });
});
```

- [ ] **Step 1.2: 跑测试，确认全部失败**

```bash
./node_modules/.bin/vitest run tests/SupportCta.test.tsx
```

Expected: 7 个 test 全部 FAIL，原因 `Cannot find module '@/components/SupportCta'`。

- [ ] **Step 1.3: 实现 `components/SupportCta.tsx`**

新建文件，内容：

```tsx
/**
 * SupportCta — marketing card shown at the bottom of the result page.
 *
 * Replaces the prior "05 通知" (F1/F7 notification UI). Routes the user to
 * SOZONEXT's 民泊運営代行 service via email / phone / website.
 *
 * Pure server component. No props. Frozen copy.
 *
 * Design: docs/superpowers/specs/2026-05-29-notification-to-marketing-cta-design.md
 */

const EMAIL = "minpaku_info@sozonext.com";
const PHONE_DISPLAY = "03-3842-1552";
const PHONE_TEL = "tel:+81338421552";
const WEBSITE = "https://sozonext.com";
const WEBSITE_DISPLAY = "sozonext.com";

const MAILTO_SUBJECT = encodeURIComponent("リスティング改善のご相談");
const MAILTO_BODY = encodeURIComponent(
  "SOZONEXT Review で診断後、より良い結果のためご相談したく連絡いたしました。\n\n物件 URL:\n\nご質問・ご要望:\n",
);
const MAILTO_HREF = `mailto:${EMAIL}?subject=${MAILTO_SUBJECT}&body=${MAILTO_BODY}`;

const BULLETS: Array<{ title: string; caption: string }> = [
  {
    title: "リスティング最適化代行",
    caption: "写真・タイトル・紹介文を SOZONEXT が制作",
  },
  {
    title: "24h 運営代行",
    caption: "ゲスト対応・清掃・チェックイン代行",
  },
  {
    title: "収益改善コンサル",
    caption: "価格戦略・RevPAR 改善・複数物件運用",
  },
];

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M20 6 9 17l-5-5"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 12 12 4l9 8M5 10v10h4v-6h6v6h4V10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 12h14M13 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 4h4l2 5-3 2a11 11 0 0 0 5 5l2-3 5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path
        d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function SupportCta() {
  return (
    <section
      style={{
        background: "var(--card)",
        border: "1px solid var(--ink-100)",
        borderRadius: "var(--r-lg)",
        padding: "var(--s-6)",
        boxShadow: "var(--shadow-card)",
        display: "grid",
        gap: "var(--s-4)",
      }}
    >
      <header style={{ display: "flex", alignItems: "flex-start", gap: "var(--s-3)" }}>
        <span
          aria-hidden="true"
          style={{
            flex: "0 0 28px",
            width: 28,
            height: 28,
            borderRadius: "var(--r-pill)",
            background: "var(--sozonext-navy)",
            color: "var(--card)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <HomeIcon />
        </span>
        <div style={{ minWidth: 0, flex: 1 }}>
          <h3
            style={{
              margin: 0,
              fontSize: 20,
              fontWeight: 600,
              color: "var(--ink-900)",
              letterSpacing: "-0.005em",
              lineHeight: 1.3,
            }}
          >
            もっと結果を出しませんか？
          </h3>
          <p
            style={{
              margin: "6px 0 0",
              fontSize: 14.5,
              color: "var(--ink-600)",
              lineHeight: 1.6,
            }}
          >
            SOZONEXT は民泊運営代行の専門会社。リスティング改善から運営代行・収益コンサルまで一括サポートします。
          </p>
        </div>
      </header>

      <hr
        style={{
          margin: 0,
          border: 0,
          borderTop: "1px solid var(--ink-100)",
        }}
      />

      <ul
        style={{
          margin: 0,
          padding: 0,
          listStyle: "none",
          display: "grid",
          gap: "var(--s-3)",
        }}
      >
        {BULLETS.map((b) => (
          <li
            key={b.title}
            style={{
              display: "grid",
              gridTemplateColumns: "auto 1fr",
              gap: 10,
              alignItems: "start",
            }}
          >
            <span
              aria-hidden="true"
              style={{
                width: 22,
                height: 22,
                borderRadius: 999,
                background: "var(--grade-a)",
                color: "var(--card)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                marginTop: 2,
              }}
            >
              <CheckIcon />
            </span>
            <div>
              <div
                style={{
                  fontSize: 14.5,
                  fontWeight: 600,
                  color: "var(--ink-800)",
                  lineHeight: 1.4,
                }}
              >
                {b.title}
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: "var(--ink-500)",
                  marginTop: 2,
                  lineHeight: 1.55,
                }}
              >
                {b.caption}
              </div>
            </div>
          </li>
        ))}
      </ul>

      <hr
        style={{
          margin: 0,
          border: 0,
          borderTop: "1px solid var(--ink-100)",
        }}
      />

      <div
        className="support-cta-contact"
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "var(--s-3)",
        }}
      >
        <a
          href={MAILTO_HREF}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "12px 18px",
            background: "var(--sozonext-navy)",
            border: "1px solid var(--sozonext-navy)",
            borderRadius: "var(--r-md)",
            color: "var(--text-on-navy)",
            textDecoration: "none",
            fontSize: 14.5,
            fontWeight: "var(--w-semibold)",
            letterSpacing: 0.1,
            boxShadow:
              "0 1px 0 rgba(255,255,255,0.1) inset, 0 6px 16px -8px rgba(2, 66, 128, 0.5)",
            transition:
              "background var(--t-fast) var(--ease-out), transform var(--t-fast) var(--ease-out)",
          }}
        >
          {EMAIL} にメール相談する
          <ArrowIcon />
        </a>

        <div
          style={{
            display: "grid",
            gap: 6,
            fontSize: 13.5,
            color: "var(--ink-700)",
          }}
        >
          <a
            href={PHONE_TEL}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              color: "var(--ink-700)",
              textDecoration: "none",
            }}
          >
            <span style={{ color: "var(--sozonext-navy)" }}>
              <PhoneIcon />
            </span>
            {PHONE_DISPLAY}
          </a>
          <a
            href={WEBSITE}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              color: "var(--ink-700)",
              textDecoration: "none",
            }}
          >
            <span style={{ color: "var(--sozonext-navy)" }}>
              <GlobeIcon />
            </span>
            {WEBSITE_DISPLAY}
            <ArrowIcon />
          </a>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 1.4: 跑测试，确认全部通过**

```bash
./node_modules/.bin/vitest run tests/SupportCta.test.tsx
```

Expected: 7/7 PASS。

- [ ] **Step 1.5: Commit**

```bash
git add tests/SupportCta.test.tsx components/SupportCta.tsx
git commit -m "$(cat <<'EOF'
feat(SupportCta): add marketing CTA component for result page

7 unit tests cover: headline + description, 3 bullets, mailto href
shape, tel: international format, website target=_blank + rel,
aria-hidden on all decorative SVGs, navy primary CTA token reuse.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: 结果页接入（替换 AlertBar）

**Files:**
- Modify: `app/d/[id]/page.tsx`

- [ ] **Step 2.1: 修改 `app/d/[id]/page.tsx` 的 imports**

把这一行：
```tsx
import { AlertBar } from "@/components/AlertBar";
```
替换为：
```tsx
import { SupportCta } from "@/components/SupportCta";
```

- [ ] **Step 2.2: 移除 alerts_sent DB 查询**

定位文件中这一段（约第 111–116 行）：
```tsx
  const alertRows = await db
    .select()
    .from(schema.alertsSent)
    .where(eq(schema.alertsSent.diagnosisId, id))
    .limit(1);
  const alert = alertRows[0];
```
整段删除。`alert` 变量在后续不再被使用。

- [ ] **Step 2.3: 替换 section 05 渲染**

定位 section "05 通知"（约第 305–313 行）：
```tsx
            <section style={{ display: "grid", gap: "var(--s-3)" }}>
              <SectionLabel n="05" title="通知" />
              <AlertBar
                score={d.overallScore}
                alertSent={!!alert}
                alertEmailTo={alert?.emailTo ?? process.env.ALERT_EMAIL_TO ?? "(未設定)"}
                diagnosisId={id}
              />
            </section>
```
替换为：
```tsx
            <section style={{ display: "grid", gap: "var(--s-3)" }}>
              <SectionLabel n="05" title="サポート" />
              <SupportCta />
            </section>
```

- [ ] **Step 2.4: 跑整体测试**

```bash
./node_modules/.bin/vitest run
```

Expected: 全部通过（包括上一步新建的 SupportCta tests + 老的 AlertBar tests 暂时还在但会用现存 AlertBar.tsx 渲染 —— 在 Task 6 删除前都会绿）。

- [ ] **Step 2.5: Commit**

```bash
git add app/d/\[id\]/page.tsx
git commit -m "$(cat <<'EOF'
feat(result-page): replace AlertBar with SupportCta marketing card

Section "05 通知" becomes "05 サポート". Removes the alerts_sent DB
query — alert state is no longer surfaced in UI.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: 删除 `/api/diagnose` 路由里的 F1 alert 分支

**Files:**
- Modify: `app/api/diagnose/route.ts`
- Modify: `tests/api-diagnose.test.ts`

- [ ] **Step 3.1: 先改测试 —— 删除 F1 相关 setup 和 2 条 F1 test case**

`tests/api-diagnose.test.ts` 顶部 `mocks` 对象去掉 `alertValues`、`alertOnConflictDoNothing`、`sendEmail`：

```ts
const mocks = vi.hoisted(() => ({
  listingValues: vi.fn(),
  listingOnConflictDoUpdate: vi.fn().mockResolvedValue(undefined),
  diagnosisValues: vi.fn(),
  diagnosisReturning: vi.fn().mockResolvedValue([{ id: "00000000-0000-0000-0000-000000000001" }]),
}));
```

`vi.mock("@/lib/db/client", ...)` 块里去掉 alerts 分支和 mockReturnValue 调用：

```ts
vi.mock("@/lib/db/client", () => {
  mocks.listingValues.mockReturnValue({ onConflictDoUpdate: mocks.listingOnConflictDoUpdate });
  mocks.diagnosisValues.mockReturnValue({ returning: mocks.diagnosisReturning });

  const insert = vi.fn().mockImplementation((table) => {
    const nameSymbol = Object.getOwnPropertySymbols(table).find(
      (symbol) => symbol.description === "drizzle:Name"
    );
    const tableName = (table as { _: { name?: string } })._?.name ?? table[nameSymbol!];
    if (tableName === "listings") {
      return { values: mocks.listingValues };
    }
    return { values: mocks.diagnosisValues };
  });
  return { db: { insert }, schema: {} };
});
```

删除整段 `vi.mock("@/lib/email/resend", ...)`。

删除 `import { sendEmail } from "@/lib/email/resend";`。

`beforeEach` 内删除：
```ts
  mocks.alertValues.mockClear();
  mocks.alertOnConflictDoNothing.mockClear();
  vi.mocked(sendEmail).mockReset();
  vi.mocked(sendEmail).mockResolvedValue({ ok: true, id: "resend_123", dev: false });
```

删除最后两条 test case（约第 112–157 行）：
- `it("sends an F1 alert and records it when overall_score is below 60", ...)`
- `it("still returns the diagnosis response when F1 alert sending throws", ...)`

完成后 `tests/api-diagnose.test.ts` 应保留 4 条 test：
1. `400 on missing url`
2. `400 on non-airbnb url`
3. `502 when scraper fails`
4. `200 with diagnosis_id and redirect on success`

- [ ] **Step 3.2: 改 `app/api/diagnose/route.ts` —— 删 F1 块 + 相关 imports**

删除以下 imports（顶部）：
```ts
import { render } from "@react-email/components";
import { alertsSent, listings, diagnoses } from "@/lib/db/schema";   // ← 改成仅 listings, diagnoses
import { F1AlertEmail } from "@/lib/email/alert";
import { sendEmail } from "@/lib/email/resend";
```

把 `import` 改成只保留必要的：
```ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db/client";
import { listings, diagnoses } from "@/lib/db/schema";
import { fetchDiagnosis } from "@/lib/scraper/client";
import { parseAirbnbUrl } from "@/lib/util/url";
```

删除文件中第 67–99 行的 F1 发送块（包括 try/catch、render、sendEmail、insert alertsSent）：

```ts
  const id = inserted[0].id;
  if (d.overall_score < 60) {
    try {
      // ... 整段都删
    } catch (e) {
      console.error("F1 alert send failed:", e);
    }
  }

  return NextResponse.json({ diagnosis_id: id, redirect: `/d/${id}` });
```

替换为：
```ts
  const id = inserted[0].id;

  return NextResponse.json({ diagnosis_id: id, redirect: `/d/${id}` });
```

- [ ] **Step 3.3: 跑测试，确认通过**

```bash
./node_modules/.bin/vitest run tests/api-diagnose.test.ts
```

Expected: 4/4 PASS。

- [ ] **Step 3.4: Commit**

```bash
git add app/api/diagnose/route.ts tests/api-diagnose.test.ts
git commit -m "$(cat <<'EOF'
refactor(api/diagnose): remove F1 alert email branch

/api/diagnose now performs only the diagnose flow: scrape → upsert
listing → insert diagnosis → return id. The F1 email send and the
alerts_sent insert are gone; tests/api-diagnose.test.ts drops the two
F1-specific tests and the sendEmail mock.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: 删除 `/api/weekly/test` endpoint

**Files:**
- Delete: `app/api/weekly/test/route.ts`
- Delete: `app/api/weekly/test/` 目录
- Delete: `app/api/weekly/` 目录

- [ ] **Step 4.1: 删除整个目录**

```bash
rm -rf app/api/weekly
```

- [ ] **Step 4.2: 确认无其他引用**

```bash
grep -rn "api/weekly" app/ components/ lib/ tests/ 2>/dev/null
```

Expected: 无输出（除非 docs 里有 —— 那不影响代码 build）。

- [ ] **Step 4.3: Commit**

```bash
git add app/api/
git commit -m "$(cat <<'EOF'
chore: remove /api/weekly/test endpoint

The F7 weekly summary feature is being replaced by the SupportCta
marketing card. No remaining callers.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: 删除 email 模板和它们的测试

**Files:**
- Delete: `lib/email/alert.tsx`
- Delete: `lib/email/weekly.tsx`
- Delete: `lib/email/resend.ts`
- Delete: `lib/email/` 目录
- Delete: `tests/email-alert.test.ts`
- Delete: `tests/email-weekly.test.ts`

- [ ] **Step 5.1: 删除 email lib 和 tests**

```bash
rm -rf lib/email
rm -f tests/email-alert.test.ts tests/email-weekly.test.ts
```

- [ ] **Step 5.2: 确认无其他引用 `@/lib/email/*`**

```bash
grep -rn "@/lib/email\|lib/email/" app/ components/ lib/ tests/ 2>/dev/null
```

Expected: 无输出。如果有，是上面 Task 3 没清理完全；返回 Task 3 修复。

- [ ] **Step 5.3: 跑测试，确认整体绿色**

```bash
./node_modules/.bin/vitest run
```

Expected: 全部 PASS（少了 4 条 email-* + 2 条 F1 api-diagnose tests）。

- [ ] **Step 5.4: Commit**

```bash
git add lib/ tests/
git commit -m "$(cat <<'EOF'
chore: delete lib/email/ templates and their tests

F1AlertEmail, F7WeeklyEmail, Resend wrapper, and their unit tests are
no longer used after removing /api/diagnose F1 branch (Task 3) and
/api/weekly/test endpoint (Task 4).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: 删除 `AlertBar` + `EmailPreview` 组件 + 测试

**Files:**
- Delete: `components/AlertBar.tsx`
- Delete: `components/EmailPreview.tsx`
- Delete: `tests/AlertBar.test.tsx`
- Delete: `tests/EmailPreview.test.tsx`

- [ ] **Step 6.1: 删除文件**

```bash
rm -f components/AlertBar.tsx components/EmailPreview.tsx
rm -f tests/AlertBar.test.tsx tests/EmailPreview.test.tsx
```

- [ ] **Step 6.2: 确认无其他引用**

```bash
grep -rn "AlertBar\|EmailPreview" app/ components/ lib/ tests/ 2>/dev/null
```

Expected: 无输出。

- [ ] **Step 6.3: 跑测试**

```bash
./node_modules/.bin/vitest run
```

Expected: 全部 PASS。

- [ ] **Step 6.4: Commit**

```bash
git add components/ tests/
git commit -m "$(cat <<'EOF'
chore: delete AlertBar + EmailPreview components and their tests

UI now uses SupportCta. The email preview modal was tied to F1/F7
content which is gone.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 7: Schema export 清理（保留 DB 表）

**Files:**
- Modify: `lib/db/schema.ts`

- [ ] **Step 7.1: 删除 `alertsSent` export，留下注释**

把 `lib/db/schema.ts` 中的：
```ts
export const alertsSent = pgTable("alerts_sent", {
  diagnosisId: uuid("diagnosis_id").primaryKey().references(() => diagnoses.id),
  emailTo: text("email_to").notNull(),
  sentAt: timestamp("sent_at", { withTimezone: true }).notNull().defaultNow(),
  resendId: text("resend_id"),
});
```

替换为：
```ts
// alertsSent table dropped from schema export 2026-05-29 (notification
// system removed in favor of SupportCta marketing card). The
// `alerts_sent` table still exists in Neon as dead schema; revisit if
// space pressure ever matters.
```

- [ ] **Step 7.2: 确认没人 import `alertsSent`**

```bash
grep -rn "alertsSent\|alerts_sent" app/ components/ lib/ tests/ 2>/dev/null
```

Expected: 只剩 `lib/db/schema.ts` 里那段注释，其他位置无引用。

- [ ] **Step 7.3: 跑测试 + 跑 next build 确认 TS 通过**

```bash
./node_modules/.bin/vitest run && ./node_modules/.bin/next build
```

Expected: 测试全绿 + build 成功。

- [ ] **Step 7.4: Commit**

```bash
git add lib/db/schema.ts
git commit -m "$(cat <<'EOF'
chore(schema): remove alertsSent export (table kept in Neon as dead)

Comment retained at the original location so anyone resurrecting the
notification feature can find the legacy table name.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 8: Package + 环境变量清理

**Files:**
- Modify: `package.json`
- Modify: `.env.example`
- Delete from `pnpm-lock.yaml` automatically via `pnpm install`

- [ ] **Step 8.1: 验证 `@react-email/components` 和 `resend` 没有其他使用者**

```bash
grep -rn "@react-email/components\|from \"resend\"" app/ components/ lib/ tests/ 2>/dev/null
```

Expected: 无输出（前面任务已删完）。如果还有，回到对应 Task。

- [ ] **Step 8.2: 修改 `package.json` 移除 2 个依赖**

把 `dependencies` 块里这两行删除：
```json
    "@react-email/components": "^1.0.12",
    "resend": "^6.12.4",
```

最终 `dependencies` 长这样：
```json
  "dependencies": {
    "@neondatabase/serverless": "^1.1.0",
    "@react-pdf/renderer": "^4.5.1",
    "drizzle-orm": "^0.45.2",
    "next": "15.5.18",
    "next-intl": "^3.26.5",
    "react": "19.0.0",
    "react-dom": "19.0.0",
    "react-markdown": "^10.1.0",
    "recharts": "^3.8.1",
    "remark-gfm": "^4.0.1",
    "zod": "^4.4.3"
  },
```

- [ ] **Step 8.3: 跑 `pnpm install` 更新 lockfile**

```bash
CI=true pnpm install 2>&1 | tail -10
```

Expected: 成功，`pnpm-lock.yaml` 变小（少了 resend 和 react-email/components 的依赖树）。

- [ ] **Step 8.4: 修改 `.env.example` —— 删除 `RESEND_API_KEY` + `ALERT_EMAIL_TO`**

打开 `.env.example`，最终长这样：

```
# Neon Postgres connection string (pooled or direct — both work)
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DB?sslmode=require"

# Mac scraper endpoint (local dev) — Plan 1 默认 http://localhost:8787
SCRAPER_URL="http://localhost:8787"

# Bearer token shared with mac-scraper/.env
SCRAPER_SECRET="<32-byte random hex>"
```

(删除最后 3 行 `# Plan 4 才用到...` + `RESEND_API_KEY=""` + `ALERT_EMAIL_TO="alerts@example.com"`)

- [ ] **Step 8.5: 验证整体 build + test**

```bash
./node_modules/.bin/vitest run && ./node_modules/.bin/next build
```

Expected: 测试 PASS（数量比之前少 4 + 2 + 2 = 大约 8 条），build SUCCESS。

- [ ] **Step 8.6: Commit**

```bash
git add package.json pnpm-lock.yaml .env.example
git commit -m "$(cat <<'EOF'
chore(deps): drop resend + @react-email/components + email env vars

These were the last residue of the F1/F7 notification feature.
RESEND_API_KEY and ALERT_EMAIL_TO are no longer read anywhere.
Operations note: remove the same two vars from Vercel project env
post-merge.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 9: 文档更新

**Files:**
- Modify: `CLAUDE.md`
- Modify: `docs/prd.md`
- Modify: `docs/system-design.md`
- Create: `docs/adr/0006-remove-notification-emails.md`
- Verify: `docs/system-design-geo.md`（应不需要改）

- [ ] **Step 9.1: 修改 `CLAUDE.md`**

打开 `CLAUDE.md`，做以下修改：

**§4 技术栈表** —— 删除 Resend 这一行：
```
| メール | **Resend**(無料 3000/月) |
```
（一行去掉，前后行连续）

**§6 v0.4 デルタ** —— 第 5 条 F7 改成：
原文：
```
5. **F7 週次サマリー**:**定時器は実装しない**(...)。UI は「🧪 立即测试发送」ボタンで手動テスト可。配信設定の表示は **プロダクト的な体裁**(...)
```
替换为：
```
5. **F7 週次サマリー**:**廃止**。結果ページ末尾の「05 サポート」セクションには SOZONEXT 民泊運営代行への CTA（`SupportCta` コンポーネント）を表示。詳細は [`docs/superpowers/specs/2026-05-29-notification-to-marketing-cta-design.md`](docs/superpowers/specs/2026-05-29-notification-to-marketing-cta-design.md) 参照。
```

**§10 受け入れ:demo 成功の定義** —— 把第 4 条和第 5 条改成：
原文：
```
4. 評価 < 60 → テストメール受信箱に F1 警告メール着信
5. 「🧪 立即测试发送」→ 受信箱に F7 週次サマリー着信
```
替换为：
```
4. 結果ページ末尾に「05 サポート」(SOZONEXT 民泊代行 CTA)が表示され、メール/電話/サイトリンクがクリック可能
```
（第 5 条整条删除）

**§11 守る** —— 删除这一行：
```
- メール送信先は `ALERT_EMAIL_TO` のテストアドレス、運営の本物アドレスには絶対送らない
```

**§11 やらない** —— 删除这一行：
```
- F7 真の定時送信(v1 で扱う)
```

**§12 演示前 checklist** —— 从 env vars 列表里去掉 `RESEND_API_KEY` 和 `ALERT_EMAIL_TO`：
原文：
```
- [ ] Vercel 環境変数 (`DATABASE_URL` / `RESEND_API_KEY` / `ALERT_EMAIL_TO` / `SCRAPER_URL` / `SCRAPER_SECRET`) 設定済み
```
替换为：
```
- [ ] Vercel 環境変数 (`DATABASE_URL` / `SCRAPER_URL` / `SCRAPER_SECRET`) 設定済み
```

- [ ] **Step 9.2: 修改 `docs/prd.md`**

打开 `docs/prd.md`：

**搜索 `F1 ·` 和 `F7 ·`** —— 删除两个对应的 feature 段落（约第 371–414 行：F1 评分低于阈值自动邮件 + F7 每周摘要邮件）。两段一起删，删之间的空行也清理掉。

**搜索"核心绝不能砍"** —— 修改这一行（约第 484 行）：
原文：
```
1. **核心绝不能砍**：A1 + A4（评分卡） · 至少 1 个维度卡片有真实分析 · AI 报告 · F1 预警邮件
```
替换为：
```
1. **核心绝不能砍**：A1 + A4（评分卡） · 至少 1 个维度卡片有真实分析 · AI 报告 · SupportCta 营销 CTA
```

**搜索"F7 周报：demo"** —— 删除该 bullet（约第 14 行和第 489 行各有一处提到 F7 周报）。

**搜索整个文件中 `F1` 和 `F7`** —— 把其余零散提及全部清掉或改写。可以用：
```bash
grep -n "F1\|F7\|alerts_sent\|アラート\|週次サマリー\|アラートメール" docs/prd.md
```

每一行人工判断：
- 如果是 feature 定义/列表里的 F1/F7 → 删
- 如果是行号引用/cross-reference → 改成 SupportCta 引用

**新增 feature 段落** —— 在原 F7 段落的位置插入一个新 feature：

```markdown
#### F8 · SOZONEXT サポート CTA

诊断结果页底部 (section 05) 替代原 F1/F7 通知 UI 的营销 CTA 卡。

- 组件：`components/SupportCta.tsx`（纯 server component，无 props，硬编码日文文案）
- 内容：标题 `もっと結果を出しませんか？` · 描述 · 3 条业务 bullets（リスティング最適化代行 / 24h 運営代行 / 収益改善コンサル）· 邮件 navy primary CTA → `mailto:minpaku_info@sozonext.com`（subject + body 预填）· 电话 `tel:+81338421552`（显示 `03-3842-1552`）· 官网 `https://sozonext.com`
- 触发：总是显示，不依赖 score
- Design spec：[`docs/superpowers/specs/2026-05-29-notification-to-marketing-cta-design.md`](superpowers/specs/2026-05-29-notification-to-marketing-cta-design.md)
```

- [ ] **Step 9.3: 修改 `docs/system-design.md`**

打开 `docs/system-design.md`：

**§邮件 / 技术栈表** —— 把 `Resend (免费 3000/月，demo 数十封)` 那行从 §1 表里删；把"**总月成本**：$0 …Resend 免费…"这一行的 `+ Resend 免费` 去掉。

**§3 文件结构图** —— 找到 `weekly/test/route.ts`、`AlertBanner.tsx`、`WeeklyDigestPanel.tsx`、`alert.tsx`、`weekly.tsx`、`alerts_sent` 这些行（约第 102, 116-117, 126-127, 192 行），全部删除。在原 `AlertBanner.tsx` 位置加一行：
```
│   └── SupportCta.tsx               # 营销 CTA（替代原 F1/F7 UI）
```

**§4 数据库 schema** —— 整段 `alerts_sent` CREATE TABLE 删掉（约第 192 行附近）。在前后段落里若有提到该表的描述，删除/改写。

**§6 主流程** —— 找到这块（约第 281–282 行）：
```
  ├─ 6. if overall_score < 60 AND not alerts_sent:
  │       Resend F1 → INSERT alerts_sent
```
整段（包括步骤 6 标题）删除。把后续步骤重新编号或留着空隙（按你的判断）。在 `5. 写 diagnosis` 后面加一句：
```
  ├─ 6. 返回 { diagnosis_id, redirect }
  └─ （历史的 F1 邮件流已废止，UI 改用 SupportCta 营销 CTA）
```

**§API 对照表** —— 找到 §413 附近的"F1 アラート / F7 週次サマリー"表格，整段删除。

**整体重新 grep** —— 跑：
```bash
grep -n "F1\|F7\|アラート\|週次\|alerts_sent\|Resend\|weekly" docs/system-design.md
```
逐行判断要不要清。

- [ ] **Step 9.4: 验证 `docs/system-design-geo.md` 不受影响**

```bash
grep -n "F1\|F7\|アラート\|alerts_sent\|Resend\|weekly" docs/system-design-geo.md
```

Expected: 无输出（GEO 文档不涉及邮件）。如有，按行判断删除。

- [ ] **Step 9.5: 新建 `docs/adr/0006-remove-notification-emails.md`**

内容：
```markdown
# ADR-0006: Remove F1/F7 notification emails in favor of SupportCta

**Date:** 2026-05-29
**Status:** Accepted
**Supersedes:** N/A
**Superseded by:** N/A

## Context

The result page section "05 通知" displayed F1 alert email status
(triggered when overall score < 60, sent via Resend) and three
buttons: F1 alert preview, F7 weekly summary preview, F7 manual test
send. The actual F1 email did fire end-to-end against a real inbox
(part of CLAUDE.md §10 demo acceptance criteria #4). F7 was a manual
test-only endpoint, intentionally not scheduled.

For the v0.4 demo audience (boss + internal users), this UI surface
was confusing rather than valuable. It mixed product behavior ("we
emailed you") with developer affordances (preview / test send)
without serving either persona well. Meanwhile the diagnostic result
page is the highest-intent surface in the product — a user who just
saw their listing scored a "D" is the exact ICP for SOZONEXT's
existing 民泊運営代行 service line — and had no conversion path.

## Decision

Replace the entire notification UI section with a marketing CTA
card (`components/SupportCta.tsx`) that drives leads to SOZONEXT's
operations service via email / phone / website.

Delete the F1/F7 backend in full:
- `/api/diagnose` no longer sends F1 alerts
- `/api/weekly/test` route is removed
- `lib/email/{alert,weekly,resend}.tsx` deleted
- `components/{AlertBar,EmailPreview}.tsx` deleted
- `tests/{AlertBar,EmailPreview,email-alert,email-weekly}.test.*` deleted
- F1 assertions in `tests/api-diagnose.test.ts` removed
- `resend` + `@react-email/components` dependencies removed from
  `package.json`
- `RESEND_API_KEY` + `ALERT_EMAIL_TO` removed from `.env.example`
- `alertsSent` table dropped from `lib/db/schema.ts` export (the
  underlying Neon table is kept as dead schema; not worth a real
  drop migration)

## Consequences

**Good:**
- One clear next action for the demo user (contact SOZONEXT)
- Smaller bundle, fewer deps, fewer env vars to provision in Vercel
- Demo acceptance criteria simplify (no inbox-checking required)
- Result page bottom matures from dev tooling into a sales surface

**Trade-offs:**
- Real "we noticed your listing is in trouble" notification capability
  is gone. If we ever want it back, we'd resurrect the Resend wrapper
  and a new template — non-trivial but bounded.
- The `alerts_sent` Neon table is now orphaned. Acceptable —
  dropping it requires coordinating a migration, and it costs
  approximately nothing to keep.

**Operations follow-up (manual, post-merge):**
- Remove `RESEND_API_KEY` and `ALERT_EMAIL_TO` from Vercel project
  env vars
- Optionally revoke the Resend API key
```

- [ ] **Step 9.6: 最后再跑一次 grep 确认 docs 干净**

```bash
grep -rn "F1\|F7\|アラート\|週次サマリー\|alerts_sent\|Resend\|RESEND_API_KEY\|ALERT_EMAIL_TO" docs/ CLAUDE.md 2>/dev/null | grep -v "specs/2026-05-29\|plans/2026-05-29\|adr/0006"
```

Expected: 无关键文档输出（除了 spec / plan / ADR 本身在描述这些被删的东西，那是合理的）。如果其他 docs 还残留，再清一轮。

- [ ] **Step 9.7: Commit**

```bash
git add CLAUDE.md docs/
git commit -m "$(cat <<'EOF'
docs: align CLAUDE.md / prd / system-design with SupportCta replacement

- CLAUDE.md §4/§6/§10/§11/§12 updated: drop Resend row, F7 delta,
  demo acceptance #4+#5, ALERT_EMAIL_TO guidance, F7 v1 backlog,
  env checklist
- docs/prd.md: F1 + F7 feature sections deleted; F8 SupportCta added
- docs/system-design.md: email lib, /api/weekly, alerts_sent schema,
  F1 step in main flow, F1/F7 comparison table — all removed
- docs/adr/0006-remove-notification-emails.md: new ADR capturing
  context + decision + consequences + ops follow-up

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 10: 最终验证 + PR

**Files:** （无新增）

- [ ] **Step 10.1: 跑全量测试**

```bash
./node_modules/.bin/vitest run
```

Expected: 全部 PASS。期望测试数量 ≈ 之前 67 - 4（email + AlertBar + EmailPreview 各 1 个测试文件被删，每个原文件多条）≈ 50+。

- [ ] **Step 10.2: 跑生产 build**

```bash
./node_modules/.bin/next build 2>&1 | tail -25
```

Expected: `✓ Compiled successfully` 无 TS / ESLint 错误。

- [ ] **Step 10.3: 起 dev server + curl 验证 GEO 不破**

```bash
# Mac Claude preview MCP start
# 或者直接：
./node_modules/.bin/next dev --port 3030 &
sleep 6
curl -s http://localhost:3030/ | grep -c "application/ld+json"   # 应为 1
curl -s http://localhost:3030/ | grep -c "SOZONEXT"              # 应 > 5
curl -s http://localhost:3030/robots.txt | grep -c "Disallow: /d/"  # 应为 1
curl -s http://localhost:3030/sitemap.xml | grep -c "/d/"        # 应为 0
kill %1 2>/dev/null
```

Expected: 4 个数字依次为 `1`, `≥5`, `1`, `0`（JSON-LD 仍然渲染、SOZONEXT keyword 仍密集、robots disallow /d/ 仍在、sitemap 仍不包含 /d/）。

如果在 Claude 环境，可以用 preview-MCP 启动 `next-dev` 然后用 preview_eval 跑同样的 fetch 检查。

- [ ] **Step 10.4: Push 分支**

```bash
git push origin feature/notification 2>&1 | tail -5
```

- [ ] **Step 10.5: 开 PR**

```bash
gh pr create --base main --head feature/notification \
  --title "feat: replace F1/F7 notification UI with SOZONEXT marketing CTA" \
  --body "$(cat <<'EOF'
## Summary

- Replace result page section "05 通知" with `<SupportCta />` — a marketing card driving leads to SOZONEXT 民泊運営代行 via email / phone / website (`minpaku_info@sozonext.com` / `03-3842-1552` / `sozonext.com`).
- Delete F1/F7 notification backend in full: `/api/diagnose` F1 branch, `/api/weekly/test` endpoint, `lib/email/{alert,weekly,resend}`, `components/{AlertBar,EmailPreview}`, and their tests.
- Drop `resend` + `@react-email/components` dependencies, drop `RESEND_API_KEY` + `ALERT_EMAIL_TO` env vars.
- `alertsSent` table removed from `lib/db/schema.ts` export; underlying Neon table left as dead schema (no migration committed).
- Docs aligned: `CLAUDE.md`, `docs/prd.md`, `docs/system-design.md`, new `docs/adr/0006-remove-notification-emails.md`.

Design spec: [`docs/superpowers/specs/2026-05-29-notification-to-marketing-cta-design.md`](docs/superpowers/specs/2026-05-29-notification-to-marketing-cta-design.md)
Plan: [`docs/superpowers/plans/2026-05-29-notification-to-marketing-cta-plan.md`](docs/superpowers/plans/2026-05-29-notification-to-marketing-cta-plan.md)

## Test plan
- [x] `pnpm test` — all vitest tests pass (new SupportCta suite + diminished api-diagnose suite)
- [x] `pnpm build` — clean production build
- [x] Manual GEO check: JSON-LD still emitted, robots.txt disallows `/d/`, sitemap.xml excludes `/d/`
- [ ] Manual visual check: result page section 05 renders the new SupportCta card; email / phone / site links functional
- [ ] Post-merge ops: remove `RESEND_API_KEY` + `ALERT_EMAIL_TO` from Vercel project env vars

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

完成后 PR URL 会打印到 stdout，记录下来。

---

## Self-Review 结果（写完 plan 后自检）

**Spec 覆盖检查**：

| Spec 要求 | 对应 Task |
|---|---|
| 新增 `SupportCta` 组件（无 props、所有 copy 硬编码） | Task 1 |
| Mailto 预填 subject + body | Task 1 (Step 1.3) |
| Phone `tel:+81338421552` | Task 1 (Step 1.3) |
| Website `target=_blank` + `rel=noopener noreferrer` | Task 1 (Step 1.3) |
| Icon SVG `aria-hidden="true"` | Task 1 (Step 1.3) |
| 复用 navy primary CTA token | Task 1 (Step 1.3) |
| `<AlertBar>` → `<SupportCta />` 接入 | Task 2 |
| 移除 alerts_sent 查询 | Task 2 (Step 2.2) |
| Section label "通知" → "サポート" | Task 2 (Step 2.3) |
| `/api/diagnose` 删 F1 块 | Task 3 |
| `/api/weekly/test` 删 endpoint | Task 4 |
| `lib/email/*` 全删 | Task 5 |
| `AlertBar` + `EmailPreview` 删 | Task 6 |
| `alerts_sent` schema export 删 | Task 7 |
| `resend` + `@react-email/components` deps 删 | Task 8 |
| `.env.example` 清理 | Task 8 |
| CLAUDE.md 更新 | Task 9 (Step 9.1) |
| `docs/prd.md` 更新 | Task 9 (Step 9.2) |
| `docs/system-design.md` 更新 | Task 9 (Step 9.3) |
| `docs/system-design-geo.md` 验证 | Task 9 (Step 9.4) |
| ADR-006 新增 | Task 9 (Step 9.5) |
| 最终验证 (test + build + GEO check) | Task 10 |

**Placeholder 扫描**：plan 内无 `TBD` / `TODO` / "implement later"，所有 code block 完整。

**类型一致性**：`SupportCta` 在 plan 内仅一种签名（无 props）；测试中用的所有 selector 与组件内的文本/href/style 一致。

**Secret 安全**：plan 不含任何真实 token / API key / 密码（per `.claude/rules/never-inline-secrets.md`）。`RESEND_API_KEY` / `ALERT_EMAIL_TO` 都是被删除的变量名，不需要 placeholder。

---

## 执行建议

按 Task 顺序逐个落地。Task 1 用 TDD（红 → 绿 → commit），Task 3 也是先改测试再改代码。其他 Task 是删除型，遵循"删 → grep 确认无引用 → 跑测试 → commit"循环。

每个 Task 都有独立 commit，保证万一某步出问题可以单独 revert。
