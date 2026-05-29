# Homepage FAQ GEO Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Japanese-first homepage FAQ section with matching `FAQPage` JSON-LD and cross-language SOZONEXT brand aliases for AI/search discovery.

**Architecture:** Store FAQ copy in one shared `lib/marketing/faq.ts` module, render it from a new server component, and convert the same data into JSON-LD in `lib/schema.ts`. Keep English/Chinese support in the existing multilingual brand snippet and `alternateName` schema fields.

**Tech Stack:** Next.js App Router, React server components, TypeScript, Schema.org JSON-LD, Vitest, Testing Library.

---

### Task 1: Shared FAQ Content

**Files:**
- Create: `lib/marketing/faq.ts`
- Test: `tests/faq-content.test.ts`

- [ ] **Step 1: Write the failing FAQ content test**

Create `tests/faq-content.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { FAQ_ITEMS } from "@/lib/marketing/faq";

describe("FAQ_ITEMS", () => {
  it("contains six Japanese-first FAQ items", () => {
    expect(FAQ_ITEMS).toHaveLength(6);
    expect(FAQ_ITEMS.map((item) => item.question)).toEqual([
      "SOZONEXT Review とは何ですか？",
      "どのような項目を診断しますか？",
      "Airbnb の公式評価と同じですか？",
      "Airbnb アカウントへのログインは必要ですか？",
      "検索順位やスーパーホスト維持に役立ちますか？",
      "料金はかかりますか？",
    ]);
  });

  it("states the Airbnb score is not official", () => {
    const official = FAQ_ITEMS.find((item) => item.question.includes("公式評価"));
    expect(official?.answer).toContain("Airbnb の内部判定や公式評価ではありません");
  });

  it("does not guarantee search ranking or badge outcomes", () => {
    const ranking = FAQ_ITEMS.find((item) => item.question.includes("検索順位"));
    expect(ranking?.answer).toContain("保証するものではありません");
    expect(ranking?.answer).not.toContain("必ず");
  });
});
```

- [ ] **Step 2: Run the FAQ content test to verify it fails**

Run: `pnpm test tests/faq-content.test.ts`

Expected: FAIL because `@/lib/marketing/faq` does not exist.

- [ ] **Step 3: Create shared FAQ content**

Create `lib/marketing/faq.ts`:

```ts
export type FaqItem = {
  readonly question: string;
  readonly answer: string;
};

export const FAQ_ITEMS = [
  {
    question: "SOZONEXT Review とは何ですか？",
    answer:
      "SOZONEXT Review は、SOZONEXT が提供する Airbnb 物件の健康診断ツールです。公開されている Airbnb 物件 URL をもとに、リスティングの状態を確認し、改善レポートを日本語で提示します。",
  },
  {
    question: "どのような項目を診断しますか？",
    answer:
      "写真、タイトル、紹介文、設備、レビューの 5 維度を診断します。結果は総合スコア、各項目の評価、AI 改善レポート、PDF レポートとして確認できます。",
  },
  {
    question: "Airbnb の公式評価と同じですか？",
    answer:
      "いいえ。SOZONEXT Review の Quality Status やスコアは、Airbnb の内部判定や公式評価ではありません。公開情報をもとにした、運営改善のための参考値です。",
  },
  {
    question: "Airbnb アカウントへのログインは必要ですか？",
    answer:
      "ログインは不要です。デモでは公開されている Airbnb 物件 URL を入力するだけで診断できます。ホストアカウントの権限やパスワードは必要ありません。",
  },
  {
    question: "検索順位やスーパーホスト維持に役立ちますか？",
    answer:
      "写真、タイトル、紹介文、設備、レビュー品質の改善ポイントを見つけることで、Airbnb 検索順位の改善やスーパーホスト維持に向けた運営改善の参考になります。ただし、検索順位やバッジ獲得を保証するものではありません。",
  },
  {
    question: "料金はかかりますか？",
    answer:
      "現在のデモは無料で利用できます。SOZONEXT Review は、Vercel、Neon、Resend などの無料枠を活用し、月額コスト 0 円の構成を前提にしています。",
  },
] as const satisfies readonly FaqItem[];
```

- [ ] **Step 4: Run the FAQ content test to verify it passes**

Run: `pnpm test tests/faq-content.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit shared FAQ content**

Run:

```bash
git add lib/marketing/faq.ts tests/faq-content.test.ts
git commit -m "feat: add shared homepage FAQ content"
```

### Task 2: Visible Homepage FAQ

**Files:**
- Create: `components/marketing/Faq.tsx`
- Modify: `app/page.tsx`
- Modify: `components/marketing/MultilingualBrandSnippets.tsx`
- Test: `tests/Faq.test.tsx`
- Test: `tests/MultilingualBrandSnippets.test.tsx`

- [ ] **Step 1: Write failing component tests**

Create `tests/Faq.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Faq } from "@/components/marketing/Faq";

describe("Faq", () => {
  it("renders the Japanese FAQ section and key safety copy", () => {
    render(<Faq />);

    expect(screen.getByRole("heading", { name: "よくある質問" })).toBeInTheDocument();
    expect(screen.getByText("SOZONEXT Review とは何ですか？")).toBeInTheDocument();
    expect(screen.getByText(/Airbnb の内部判定や公式評価ではありません/)).toBeInTheDocument();
    expect(screen.getByText(/保証するものではありません/)).toBeInTheDocument();
  });
});
```

Create `tests/MultilingualBrandSnippets.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MultilingualBrandSnippets } from "@/components/marketing/MultilingualBrandSnippets";

describe("MultilingualBrandSnippets", () => {
  it("renders English and Chinese brand aliases", () => {
    render(<MultilingualBrandSnippets />);

    expect(screen.getByText(/also known as SOZO Review/)).toBeInTheDocument();
    expect(screen.getByText(/也可称为 SOZO Review/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run component tests to verify they fail**

Run: `pnpm test tests/Faq.test.tsx tests/MultilingualBrandSnippets.test.tsx`

Expected: FAIL because `Faq` does not exist and the multilingual snippets do not contain the new aliases.

- [ ] **Step 3: Add visible FAQ component**

Create `components/marketing/Faq.tsx`:

```tsx
import { FAQ_ITEMS } from "@/lib/marketing/faq";

export function Faq() {
  return (
    <section
      aria-labelledby="faq-heading"
      style={{
        width: "min(760px, calc(100vw - 32px))",
        margin: "0 auto",
        padding: "var(--s-6) 0 var(--s-6)",
        borderTop: "1px solid var(--ink-200)",
      }}
    >
      <h2
        id="faq-heading"
        className="t-h2"
        style={{
          margin: "0 0 var(--s-4)",
          fontSize: 24,
          letterSpacing: "0.02em",
        }}
      >
        よくある質問
      </h2>
      <dl style={{ display: "grid", gap: "var(--s-4)", margin: 0 }}>
        {FAQ_ITEMS.map((item) => (
          <div key={item.question} style={{ paddingTop: "var(--s-3)", borderTop: "1px solid var(--ink-200)" }}>
            <dt style={{ fontSize: 16, fontWeight: 600, color: "var(--ink-900)", marginBottom: 8 }}>
              {item.question}
            </dt>
            <dd style={{ margin: 0, fontSize: 15, lineHeight: 1.7, color: "var(--ink-700)" }}>
              {item.answer}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
```

- [ ] **Step 4: Wire FAQ into homepage**

Modify `app/page.tsx`:

```tsx
import { Faq } from "@/components/marketing/Faq";
```

Render `<Faq />` between `<AboutSozonext />` and `<MultilingualBrandSnippets />`.

- [ ] **Step 5: Strengthen multilingual brand snippets**

Modify the English sentence to include:

```tsx
SOZONEXT Review, also known as SOZO Review
```

Modify the Chinese sentence to include:

```tsx
SOZONEXT Review，也可称为 SOZO Review
```

- [ ] **Step 6: Run component tests to verify they pass**

Run: `pnpm test tests/Faq.test.tsx tests/MultilingualBrandSnippets.test.tsx`

Expected: PASS.

- [ ] **Step 7: Commit visible FAQ**

Run:

```bash
git add app/page.tsx components/marketing/Faq.tsx components/marketing/MultilingualBrandSnippets.tsx tests/Faq.test.tsx tests/MultilingualBrandSnippets.test.tsx
git commit -m "feat: add homepage FAQ section"
```

### Task 3: FAQPage JSON-LD

**Files:**
- Modify: `lib/schema.ts`
- Test: `tests/schema.test.ts`

- [ ] **Step 1: Update schema tests first**

Modify `tests/schema.test.ts` to expect four nodes:

```ts
expect(graph).toHaveLength(4);
expect(types).toEqual(["Organization", "WebSite", "WebApplication", "FAQPage"]);
```

Add assertions:

```ts
it("WebApplication has cross-language alternate names", () => {
  const app = graph[2] as { alternateName: readonly string[] };
  expect(app.alternateName).toEqual(
    expect.arrayContaining([
      "SOZO Review",
      "SOZONEXT Review",
      "SOZONEXT レビュー",
      "SOZONEXT Airbnb listing health check",
      "SOZONEXT Airbnb 房源健康诊断",
    ])
  );
});

it("FAQPage mirrors the visible FAQ content", () => {
  const faq = graph[3] as {
    "@type": string;
    "@id": string;
    mainEntity: readonly {
      "@type": string;
      name: string;
      acceptedAnswer: { "@type": string; text: string };
    }[];
  };

  expect(faq["@type"]).toBe("FAQPage");
  expect(faq["@id"]).toBe(`${SITE_URL}/#faq`);
  expect(faq.mainEntity).toHaveLength(6);
  expect(faq.mainEntity[0].name).toBe("SOZONEXT Review とは何ですか？");
  expect(faq.mainEntity[2].acceptedAnswer.text).toContain("Airbnb の内部判定や公式評価ではありません");
  expect(faq.mainEntity[4].acceptedAnswer.text).toContain("保証するものではありません");
});
```

- [ ] **Step 2: Run schema test to verify it fails**

Run: `pnpm test tests/schema.test.ts`

Expected: FAIL because the graph still has three nodes and no `FAQPage`.

- [ ] **Step 3: Implement schema changes**

Modify `lib/schema.ts`:

- Import `FAQ_ITEMS` from `@/lib/marketing/faq`.
- Add `alternateName` arrays to `organization` and `webApplication`.
- Add:

```ts
const faqPage = {
  "@type": "FAQPage",
  "@id": `${SITE_URL}/#faq`,
  mainEntity: FAQ_ITEMS.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
} as const;
```

- Return `[organization, website, webApplication, faqPage]`.

- [ ] **Step 4: Run schema test to verify it passes**

Run: `pnpm test tests/schema.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit JSON-LD FAQPage**

Run:

```bash
git add lib/schema.ts tests/schema.test.ts
git commit -m "feat: add FAQPage structured data"
```

### Task 4: Final Verification and PR

**Files:**
- All changed files.

- [ ] **Step 1: Run full test suite**

Run: `pnpm test`

Expected: all tests pass.

- [ ] **Step 2: Run production build without DATABASE_URL**

Run: `env -u DATABASE_URL PNPM_CONFIG_IGNORE_SCRIPTS=true pnpm build`

Expected: build completes successfully.

- [ ] **Step 3: Inspect final diff**

Run: `git diff origin/main...HEAD --stat`

Expected: spec/plan docs, FAQ content/component tests, homepage wiring, multilingual snippet changes, and schema changes.

- [ ] **Step 4: Push branch**

Run: `git push -u origin fix/geo`

Expected: branch pushed to GitHub.

- [ ] **Step 5: Create PR**

Run:

```bash
gh pr create --base main --head fix/geo --title "feat: add homepage FAQ GEO signals" --body "## Summary
- Add a Japanese-first homepage FAQ section.
- Add matching FAQPage JSON-LD sourced from the same FAQ content.
- Add cross-language SOZONEXT Review brand aliases for AI/search discovery.

## Test Plan
- pnpm test
- env -u DATABASE_URL PNPM_CONFIG_IGNORE_SCRIPTS=true pnpm build"
```

Expected: PR URL printed.
