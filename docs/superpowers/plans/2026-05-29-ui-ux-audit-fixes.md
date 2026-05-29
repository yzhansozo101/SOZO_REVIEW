# UI/UX Audit Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. **This plan is intended for Codex CLI execution** — Codex's session-start hook auto-injects superpowers via `.codex/hooks/session-start-superpowers.sh`, so the skill is already available.

**Goal:** Apply 9 concrete fixes from the 2026-05-29 UI/UX audit so the demo passes accessibility, design-token, and v0.4 spec compliance.

**Architecture:** Pure UI fixes — no scraping / DB / AI changes. Adds 3 missing design tokens to `app/globals.css`, then sweeps 7 components for spec drift (inline hex/rgba → tokens), accessibility gaps (touch targets, reduced-motion), and missing interactive feedback (hover states).

**Tech Stack:** Next.js 15 + TypeScript + inline CSS-in-JSX (no Tailwind). Tests: Vitest + @testing-library/react + jsdom (config: `vitest.config.ts`, setup: `tests/setup.ts`).

**Branch:** `feature/ui-ux` (current). Do not switch branches.

**Spec source of truth (do not edit):** `design_handoff_review_app/design_system/colors_and_type.css`, `CLAUDE.md` §6 / §7, `AGENTS.md`.

**Non-goals:**
- No font / color / layout redesign (only spec-conformance fixes)
- No new components
- No changes to `mac-scraper/` or any `lib/scraper/`, `lib/db/`, `lib/email/`, `lib/pdf/`
- No commits to `main`; no PR creation (user does that)

---

## Task 1: Add missing design tokens to `app/globals.css`

**Why:** Tasks 2, 4, 5 below depend on three tokens that don't exist yet (`--shadow-focus-error`, `--overlay-bg`, `--text-on-navy`). Adding them first is a prereq.

**Files:**
- Modify: `app/globals.css` (insert after `--shadow-focus` definition, around line 129)

**Note on the design hand-off file:** `design_handoff_review_app/design_system/colors_and_type.css` is marked 編集禁止 in `CLAUDE.md` §3. **Do not edit it.** Add tokens only to `app/globals.css`.

- [ ] **Step 1: Write the failing test**

Create new file `tests/globals-tokens.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("app/globals.css design tokens", () => {
  const css = readFileSync(resolve(__dirname, "../app/globals.css"), "utf8");

  it("defines --shadow-focus-error for form error states", () => {
    expect(css).toMatch(/--shadow-focus-error:\s*0 0 0 3px/);
  });

  it("defines --overlay-bg for modal scrims", () => {
    expect(css).toMatch(/--overlay-bg:\s*rgba\(14,\s*17,\s*22,\s*0\.42\)/);
  });

  it("defines --text-on-navy for content on sozonext-navy fills", () => {
    expect(css).toMatch(/--text-on-navy:\s*var\(--card\)/);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/globals-tokens.test.ts`
Expected: 3 failing assertions ("token not found in globals.css").

- [ ] **Step 3: Add the tokens**

In `app/globals.css`, locate the shadow block (around line 127-129):

```css
  --shadow-card: 0 1px 2px rgba(14, 17, 22, 0.04), 0 8px 24px -8px rgba(14, 17, 22, 0.08);
  --shadow-pop:  0 4px 12px rgba(14, 17, 22, 0.06), 0 24px 48px -12px rgba(14, 17, 22, 0.16);
  --shadow-focus: 0 0 0 3px rgba(30, 42, 120, 0.18);
```

Append directly after `--shadow-focus`:

```css
  --shadow-focus-error: 0 0 0 3px rgba(199, 56, 43, 0.18);
  --overlay-bg: rgba(14, 17, 22, 0.42);
  --text-on-navy: var(--card);
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/globals-tokens.test.ts`
Expected: 3 passing assertions.

- [ ] **Step 5: Commit**

```bash
git add app/globals.css tests/globals-tokens.test.ts
git commit -m "feat(tokens): add --shadow-focus-error, --overlay-bg, --text-on-navy"
```

---

## Task 2: ProgressView — respect `prefers-reduced-motion`

**Why:** Audit finding H1. The progress spinner + shimmer animate continuously for ~25 s during diagnosis. Users with vestibular sensitivity (or any `prefers-reduced-motion: reduce` setting) currently get no relief. This is the highest-impact accessibility fix before demo.

**Files:**
- Modify: `components/ProgressView.tsx` (extend the `<style jsx global>` block around lines 104-113)

- [ ] **Step 1: Write the failing test**

Create `tests/ProgressView.test.tsx`:

```tsx
import { afterEach, describe, it, expect } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { ProgressView } from "@/components/ProgressView";

afterEach(() => cleanup());

describe("ProgressView", () => {
  it("disables spinner/shimmer animations when prefers-reduced-motion is reduce", () => {
    const { container } = render(<ProgressView />);
    const styleTags = Array.from(container.querySelectorAll("style"));
    const combined = styleTags.map((s) => s.textContent ?? "").join("\n");
    expect(combined).toMatch(/@media\s*\(prefers-reduced-motion:\s*reduce\)/);
    expect(combined).toMatch(/progress-spin[^{]*\{[^}]*animation:\s*none/);
    expect(combined).toMatch(/progress-shimmer[^{]*\{[^}]*animation:\s*none/);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/ProgressView.test.tsx`
Expected: All 3 matchers fail ("no @media (prefers-reduced-motion: reduce)" or animations still run).

- [ ] **Step 3: Add the reduced-motion override**

In `components/ProgressView.tsx`, find the existing `<style jsx global>` block (around lines 104-113):

```tsx
      <style jsx global>{`
        @keyframes progress-spin {
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes progress-shimmer {
          from { background-position: -200% 0; }
          to { background-position: 200% 0; }
        }
      `}</style>
```

Add the reduced-motion media query immediately before the closing `` ` ``:

```tsx
      <style jsx global>{`
        @keyframes progress-spin {
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes progress-shimmer {
          from { background-position: -200% 0; }
          to { background-position: 200% 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .progress-spin { animation: none !important; }
          .progress-shimmer { animation: none !important; }
        }
      `}</style>
```

Then add the matching `className`s to the spinner element (the `<div>` that currently sets `animation: "progress-spin 1s linear infinite"` around line 58) and to each shimmer skeleton bar (the `<div>` with `animation: "progress-shimmer 1.5s linear infinite"` around line 14 / wherever each `style` object spreads `shimmerStyle`). The classes work alongside the inline `animation` style — CSS specificity from `!important` ensures the override wins.

For each animated element, change e.g. from:

```tsx
<div style={{ ...someStyles, animation: "progress-spin 1s linear infinite" }} />
```

To:

```tsx
<div className="progress-spin" style={{ ...someStyles, animation: "progress-spin 1s linear infinite" }} />
```

And similarly add `className="progress-shimmer"` to shimmer bars.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/ProgressView.test.tsx`
Expected: All 3 matchers pass.

- [ ] **Step 5: Commit**

```bash
git add components/ProgressView.tsx tests/ProgressView.test.tsx
git commit -m "fix(a11y): ProgressView respects prefers-reduced-motion"
```

---

## Task 3: DiagnosticForm — replace hardcoded error-ring rgba with token

**Why:** Audit finding H3. `boxShadow: error ? "0 0 0 3px rgba(199, 56, 43, 0.14)" : undefined` bypasses tokens; the magic value silently drifts from `--grade-d`. Now that Task 1 added `--shadow-focus-error`, use it.

**Files:**
- Modify: `components/DiagnosticForm.tsx:97`

**Note:** `DiagnosticForm` has no error-state props; the error is internal state triggered by failed `fetch`. Rather than mock `fetch` for what is essentially a one-line CSS swap, this task uses a source-file regression test (same pattern as Task 7) — cheap, reliable, and catches reverts.

- [ ] **Step 1: Write the failing test**

Create `tests/DiagnosticForm-token.test.ts` (`.ts`, not `.tsx`):

```ts
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("DiagnosticForm error-ring token", () => {
  const src = readFileSync(
    resolve(__dirname, "../components/DiagnosticForm.tsx"),
    "utf8",
  );

  it("does not hardcode the grade-d rgba for the error ring", () => {
    expect(src).not.toMatch(/rgba\(199,\s*56,\s*43,\s*0\.14\)/);
  });

  it("uses --shadow-focus-error token on the error boxShadow", () => {
    expect(src).toMatch(
      /boxShadow:\s*error\s*\?\s*["'`]var\(--shadow-focus-error\)["'`]/,
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/DiagnosticForm-token.test.ts`
Expected: 2 failing assertions — source still contains the hardcoded rgba.

- [ ] **Step 3: Swap the hardcoded value**

In `components/DiagnosticForm.tsx` around line 97, change:

```tsx
boxShadow: error ? "0 0 0 3px rgba(199, 56, 43, 0.14)" : undefined,
```

To:

```tsx
boxShadow: error ? "var(--shadow-focus-error)" : undefined,
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/DiagnosticForm-token.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add components/DiagnosticForm.tsx tests/DiagnosticForm-token.test.ts
git commit -m "fix(tokens): DiagnosticForm error ring uses --shadow-focus-error"
```

---

## Task 4: AlertBar — touch targets ≥ 44 px, hover states, mock-data visual marker

**Why:** Audit findings H4 + M8 + M11. AlertBar's two buttons currently render ~32 px tall (`padding: "6px 12px"` + 14 px line height), violating WCAG 2.5.5 (44×44 minimum). They also lack hover feedback. The mock "次回自動送信予定: 来週月曜 09:00" text reads as real data — needs a visual marker.

**Files:**
- Modify: `components/AlertBar.tsx` (lines 24-33 for `buttonStyle`; lines 50-54 for mock text block)

- [ ] **Step 1: Write the failing test**

Create `tests/AlertBar.test.tsx`:

```tsx
import { afterEach, describe, it, expect } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { AlertBar } from "@/components/AlertBar";

afterEach(() => cleanup());

const baseProps = {
  score: 50,
  alertSent: false,
  alertEmailTo: "test@example.com",
  diagnosisId: "test-id-001",
};

describe("AlertBar", () => {
  it("buttons have padding meeting 44px touch-target minimum", () => {
    render(<AlertBar {...baseProps} />);
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThanOrEqual(2);
    for (const btn of buttons) {
      const style = btn.getAttribute("style") ?? "";
      expect(style).toMatch(/padding:\s*10px 16px/);
    }
  });

  it("buttons declare a hover transition", () => {
    render(<AlertBar {...baseProps} />);
    const btn = screen.getAllByRole("button")[0];
    const style = btn.getAttribute("style") ?? "";
    expect(style).toMatch(/transition:[^;]*background/);
  });

  it("renders mock-data marker for the demo schedule line", () => {
    render(<AlertBar {...baseProps} />);
    const marker = screen.getByTestId("alert-bar-mock-schedule");
    expect(marker).toHaveAttribute("data-mock", "true");
    expect(marker.textContent).toMatch(/デモ表示/);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/AlertBar.test.tsx`
Expected: 3 failing assertions.

- [ ] **Step 3: Update `buttonStyle` and the mock-marker line**

In `components/AlertBar.tsx`, change `buttonStyle` (lines 24-33) from:

```tsx
  const buttonStyle = {
    padding: "6px 12px",
    background: "var(--card)",
    border: "1px solid var(--ink-200)",
    borderRadius: "var(--r-md)",
    cursor: "pointer",
    fontSize: "var(--t-sm)",
    color: "var(--ink-800)",
    fontFamily: "var(--font-sans)",
  } as const;
```

To:

```tsx
  const buttonStyle = {
    padding: "10px 16px",
    background: "var(--card)",
    border: "1px solid var(--ink-200)",
    borderRadius: "var(--r-md)",
    cursor: "pointer",
    fontSize: "var(--t-sm)",
    color: "var(--ink-800)",
    fontFamily: "var(--font-sans)",
    transition: "background var(--t-fast) var(--ease-out)",
  } as const;
```

Then add an `onMouseEnter`/`onMouseLeave` pair to each button, OR — simpler and cleaner — replace the inline-style button with a CSS class. Use the cleaner path: add a `<style jsx>` block at the bottom of the component's JSX (just before `</>` of the fragment) and a `className="alert-bar-button"` on each `<button>`:

```tsx
<style jsx>{`
  .alert-bar-button:hover {
    background: var(--ink-50);
  }
  .alert-bar-button:focus-visible {
    outline: none;
    box-shadow: var(--shadow-focus);
  }
`}</style>
```

For the mock-data marker, change lines 50-54 from:

```tsx
        <div className="t-small" style={{ color: "inherit" }}>
          デモ段階では定時送信なし。週次サマリーは手動テスト送信のみです。
        </div>
        <div className="t-small" style={{ color: "inherit" }}>
          次回自動送信予定: 来週月曜 09:00(デモ表示)
        </div>
```

To:

```tsx
        <div className="t-small" style={{ color: "inherit" }}>
          デモ段階では定時送信なし。週次サマリーは手動テスト送信のみです。
        </div>
        <div
          className="t-small"
          data-testid="alert-bar-mock-schedule"
          data-mock="true"
          style={{
            color: "inherit",
            background: "var(--ink-50)",
            border: "1px dashed var(--ink-200)",
            borderRadius: "var(--r-sm)",
            padding: "6px 10px",
            display: "inline-flex",
            alignItems: "center",
            gap: "var(--s-2)",
            fontStyle: "italic",
          }}
        >
          <span aria-hidden="true">ⓘ</span>
          次回自動送信予定: 来週月曜 09:00(デモ表示)
        </div>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/AlertBar.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add components/AlertBar.tsx tests/AlertBar.test.tsx
git commit -m "fix(a11y): AlertBar touch targets, hover, mock-data marker"
```

---

## Task 5: EmailPreview — overlay token + close-button touch target

**Why:** Audit findings M5 + M6. Overlay uses hardcoded `rgba(14, 17, 22, 0.42)` instead of the new `--overlay-bg` token (Task 1). Close button at `padding: 7px 12px` is ~28 px tall, below the 44 px touch-target minimum.

**Files:**
- Modify: `components/EmailPreview.tsx` (around lines 80 for overlay; lines 134 for `.email-preview-close` padding)

**Note on the EmailPreview prop API** (verified against `components/EmailPreview.tsx`): the component is rendered when present (no `open` prop) and dismissed via `onClose`. Required props: `kind`, `score`, `alertEmailTo`, `diagnosisId`, `onClose`.

- [ ] **Step 1: Write the failing test**

Create `tests/EmailPreview.test.tsx`:

```tsx
import { afterEach, describe, it, expect } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { EmailPreview } from "@/components/EmailPreview";

afterEach(() => cleanup());

const baseProps = {
  kind: "f1" as const,
  score: 50,
  alertEmailTo: "test@example.com",
  diagnosisId: "test-id-001",
  onClose: () => {},
};

describe("EmailPreview", () => {
  it("overlay background uses --overlay-bg token", () => {
    const { container } = render(<EmailPreview {...baseProps} />);
    const css = Array.from(container.querySelectorAll("style"))
      .map((s) => s.textContent ?? "")
      .join("\n");
    expect(css).toMatch(/background:\s*var\(--overlay-bg\)/);
    expect(css).not.toMatch(/rgba\(14,\s*17,\s*22,\s*0\.42\)/);
  });

  it("close button padding meets 44px touch-target minimum", () => {
    const { container } = render(<EmailPreview {...baseProps} />);
    const css = Array.from(container.querySelectorAll("style"))
      .map((s) => s.textContent ?? "")
      .join("\n");
    expect(css).toMatch(/\.email-preview-close[^{]*\{[^}]*padding:\s*12px 18px/);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/EmailPreview.test.tsx`
Expected: 2 failing assertions.

- [ ] **Step 3: Swap overlay + close button CSS**

In `components/EmailPreview.tsx` around line 80, change:

```tsx
          background: rgba(14, 17, 22, 0.42);
```

To:

```tsx
          background: var(--overlay-bg);
```

Around line 134, change `.email-preview-close` padding from:

```css
          padding: 7px 12px;
```

To:

```css
          padding: 12px 18px;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/EmailPreview.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add components/EmailPreview.tsx tests/EmailPreview.test.tsx
git commit -m "fix(a11y): EmailPreview overlay token + close-button touch target"
```

---

## Task 6: PdfDownloadButton — add hover state

**Why:** Audit finding M7. The element declares `transition: "background var(--t-fast) var(--ease-out)"` but never defines a hover style, so the transition is dead code.

**Files:**
- Modify: `components/PdfDownloadButton.tsx`

- [ ] **Step 1: Write the failing test**

Create `tests/PdfDownloadButton.test.tsx`:

```tsx
import { afterEach, describe, it, expect } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { PdfDownloadButton } from "@/components/PdfDownloadButton";

afterEach(() => cleanup());

describe("PdfDownloadButton", () => {
  it("declares a :hover background change", () => {
    const { container } = render(<PdfDownloadButton diagnosisId="abc123" />);
    const css = Array.from(container.querySelectorAll("style"))
      .map((s) => s.textContent ?? "")
      .join("\n");
    expect(css).toMatch(/\.pdf-download-btn:hover[^{]*\{[^}]*background:\s*var\(--ink-50\)/);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/PdfDownloadButton.test.tsx`
Expected: assertion fails (no `<style>` tag exists in component yet).

- [ ] **Step 3: Add a class + style block**

In `components/PdfDownloadButton.tsx`, change the JSX from:

```tsx
    <a
      href={`/d/${diagnosisId}/pdf`}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "inline-flex",
        ...
      }}
    >
```

To:

```tsx
    <>
    <a
      className="pdf-download-btn"
      href={`/d/${diagnosisId}/pdf`}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "inline-flex",
        ...
      }}
    >
      ...
    </a>
    <style jsx>{`
      .pdf-download-btn:hover {
        background: var(--ink-50);
      }
      .pdf-download-btn:focus-visible {
        outline: none;
        box-shadow: var(--shadow-focus);
      }
    `}</style>
    </>
```

(Wrap the existing `<a>` and new `<style>` in a fragment.)

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/PdfDownloadButton.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add components/PdfDownloadButton.tsx tests/PdfDownloadButton.test.tsx
git commit -m "fix(ui): PdfDownloadButton hover + focus states"
```

---

## Task 7: Trivial token swaps (DimensionCard shadow, DimensionGrid gap, QualityStatusLadder text)

**Why:** Audit findings H2 + M9 + M10. Three small drifts: DimensionCard has an inline shadow that violates "border-only outside ScoreCard/modal" rule; DimensionGrid uses `gap: 10px` (off the 4/8/12 spacing scale); QualityStatusLadder uses `color: "#fff"` instead of the now-available `--text-on-navy` token (Task 1).

**Files:**
- Modify: `components/DimensionCard.tsx:25` — remove inline `boxShadow`
- Modify: `components/DimensionGrid.tsx:39` — `gap: "10px"` → `gap: "var(--s-3)"`
- Modify: `components/QualityStatusLadder.tsx:23` — `color: active ? "#fff" : ...` → `color: active ? "var(--text-on-navy)" : ...`

- [ ] **Step 1: Write the regression test**

Create `tests/ui-token-regression.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const read = (p: string) => readFileSync(resolve(__dirname, "..", p), "utf8");

describe("UI token regression — no hardcoded values where tokens exist", () => {
  it("DimensionCard has no inline boxShadow (border-only per spec §7)", () => {
    const src = read("components/DimensionCard.tsx");
    expect(src).not.toMatch(/boxShadow:\s*["'`]0 1px 2px rgba\(14, 17, 22, 0\.03\)/);
  });

  it("DimensionGrid uses spacing token --s-3 instead of literal 10px", () => {
    const src = read("components/DimensionGrid.tsx");
    expect(src).not.toMatch(/gap:\s*["'`]10px/);
    expect(src).toMatch(/gap:\s*["'`]var\(--s-3\)/);
  });

  it("QualityStatusLadder uses --text-on-navy instead of hardcoded #fff", () => {
    const src = read("components/QualityStatusLadder.tsx");
    expect(src).not.toMatch(/color:\s*active\s*\?\s*["'`]#fff/);
    expect(src).toMatch(/var\(--text-on-navy\)/);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/ui-token-regression.test.ts`
Expected: 3 failing assertions.

- [ ] **Step 3: Apply the three swaps**

**3a.** In `components/DimensionCard.tsx` around line 25, delete the line:

```tsx
        boxShadow: "0 1px 2px rgba(14, 17, 22, 0.03)",
```

(Just delete it — the existing border already provides the visual separation per spec.)

**3b.** In `components/DimensionGrid.tsx` around line 39, change:

```tsx
          gap: "10px",
```

To:

```tsx
          gap: "var(--s-3)",
```

**3c.** In `components/QualityStatusLadder.tsx` around line 23, change:

```tsx
                color: active ? "#fff" : "var(--ink-500)",
```

To:

```tsx
                color: active ? "var(--text-on-navy)" : "var(--ink-500)",
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/ui-token-regression.test.ts`
Expected: PASS.

- [ ] **Step 5: Run full test suite to catch regressions**

Run: `pnpm vitest run`
Expected: ALL tests pass (existing ScoreCard, grade, url, schema, etc. + new ones from Tasks 1-7).

- [ ] **Step 6: Commit**

```bash
git add components/DimensionCard.tsx components/DimensionGrid.tsx components/QualityStatusLadder.tsx tests/ui-token-regression.test.ts
git commit -m "fix(tokens): remove inline shadow, align gap, use --text-on-navy"
```

---

## Final Verification (do not skip)

- [ ] **Run full test suite one more time**

```bash
pnpm vitest run
```

Expected: All tests pass, including the 7 new test files added by this plan.

- [ ] **Manual visual check via dev server**

```bash
pnpm dev
```

Then in browser at `http://localhost:3000`:
1. Submit a sample URL → confirm progress view spinner appears.
2. Open browser DevTools → emulate `prefers-reduced-motion: reduce` (Rendering panel) → confirm spinner stops animating.
3. Open a diagnosis result page (any `/d/[id]`) → confirm:
   - Dimension cards have border but no shadow
   - Alert bar buttons are visibly taller, hover changes background, "次回自動送信予定" line has dashed border + ⓘ
   - Email-preview modal: click button → overlay scrim renders, close button feels comfortably clickable
   - PDF download button: hover changes background
   - Quality-status ladder: active step text still readable (white-on-navy)

- [ ] **Confirm branch state**

```bash
git status     # should be clean
git log --oneline -10   # should show 7 new commits on feature/ui-ux
```

- [ ] **Report back**

Reply with: commit hashes, test pass count, and any visual surprises during the manual check. Do not open a PR — the user does that.

---

## What this plan deliberately does NOT do

- **No font swap, color-palette change, or layout refactor.** All recommendations from the generic UI-UX-pro-max output that conflict with this project's spec are ignored.
- **No edits to `design_handoff_review_app/`** (source-of-truth, 編集禁止 per CLAUDE.md §3).
- **No changes to non-UI code** (no `mac-scraper`, `lib/scraper`, `lib/email`, `lib/pdf`, `lib/db`).
- **No "示例数据" wording change** — TrendChart's existing Japanese "デモ用データです" already satisfies v0.4 §6 ④ (CLAUDE.md mixes Chinese gloss with Japanese requirement; rendered UI is Japanese).
- **No A/B/C/D grade-label enlargement** (low-priority audit finding; defer unless user requests).
- **No `prefers-reduced-motion` in `globals.css`** — handled locally in ProgressView only, because that's the sole component with infinite animations. Global rule would be over-reach.
