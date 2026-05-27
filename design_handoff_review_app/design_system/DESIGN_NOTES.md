# Sozonext Design System

> Internal design system for **SOZONEXT** — a hospitality-operations company building tools for Airbnb hosts. This repo defines the visual language, content tone, and reusable UI building blocks for Sozonext's internal products, starting with the **房源健康诊断系统 (Listing Health Diagnostic System)** demo'd in v0.2.

---

## Sources & Context

This system was assembled from a single spec document — no production code or prior brand assets existed when this was built. **The visual direction here is a committed proposal, not a continuation of an established brand.** Flag any pieces you want changed.

| Source | What it is | Where |
|---|---|---|
| `Review App/SPEC_房源诊断系统_需求v0.2.md` | Full product spec (Chinese), v0.2, 2026-05-27, by Yuan Zhang | Local mount (Review App) |
| `Review App/用户流程图_v0.2.mermaid` | User flow diagram | Local mount (Review App) |

No Figma, no logo file, no codebase, no prior design tokens were provided. If those exist elsewhere, attach them and we'll reconcile.

---

## What Sozonext does

SOZONEXT is a small operations team managing Airbnb listings. Their main pain: a host portfolio drifts out of compliance silently — photos missing categories, descriptions getting stale, negative review themes piling up — and they only find out when a listing gets demoted or removed. The Review App is the first product: paste an Airbnb URL, get back a **letter grade (A/B/C/D) + 5-dimension breakdown + AI improvement report + alert email** in under 30 seconds.

The audience for the demo is **the boss** — they need to see status in one glance. So the design language is built around:

- **Single-glance status** — a hero score card that reads at 3m
- **Actionable density** — every metric carries a concrete next step
- **Quiet authority** — this is a B2B ops tool used daily; no marketing flourish
- **Multilingual respect** — Japanese, Chinese (simplified), and English all need to look native, not Anglo-bolted

---

## Products covered

1. **Review App** (`ui_kits/review_app/`) — the listing-health diagnostic web app. The only product with a defined spec right now.

---

## Index — what's in this folder

```
README.md                  ← you are here. Read first.
SKILL.md                   ← invocation rules for Claude as a Sozonext designer
colors_and_type.css        ← every CSS variable: color, type, spacing, radius, shadow, semantic tokens
fonts/                     ← (empty — see Typography note below)
assets/                    ← brand mark, dimension icons, illustration placeholders
preview/                   ← Design System tab cards (one HTML per token group)
ui_kits/
  review_app/
    README.md              ← what's in the kit, how to compose it
    index.html             ← interactive click-through of the diagnostic flow
    *.jsx                  ← reusable components (ScoreCard, DimensionCard, etc.)
```

---

## CONTENT FUNDAMENTALS

The **canonical product language is Japanese (日本語)**. The v0.2 spec doc happens to be written in Chinese (the author's working language) but the UI ships in JA. English appears inline as a technical term (URL, Quality Status, Wi-Fi, Airbnb) and is never translated or lowercased. Chinese and Korean are nice-to-have, not required.

### Voice

- **Decisive, never apologetic.** This is an internal tool for an ops person who already knows the domain. Use plain assertive Japanese with light keigo (デスマス form for system copy; imperative コマンド form for buttons). The example the spec gives for *bad* writing is “建议提升用户体验” (vague platitude); the example of *good* writing is “紹介文にWi-Fi速度を明記することを推奨します”.
- **Direct + actionable.** Every assessment ends in a verb the user can do. 「浴室写真が不足」 is incomplete; 「浴室写真を 2、3 枚追加してください」 is right.
- **Numbers over adjectives.** 「レビュー数が不足」 → 「レビュー数 < 3, 参考程度」. The reader trusts thresholds.
- **Casing.** Japanese is the canonical language. English appears mid-sentence as a term (Quality Status, cover photo, Wi-Fi, Airbnb) — keep its original casing, do NOT lowercase brand/product terms. Don't translate "Airbnb", "cover photo", "Quality Status" — those are terms of art.
- **First/second person.** Avoid both. The tool addresses no one directly — it states findings. 「写真が不足しています」 not 「あなたの写真が不足しています」. The exception is the AI report's closing call-to-action.

### Tone by surface

| Surface | Tone | Example |
|---|---|---|
| Score card | Telegraphic | `B · 78 点 · Aまであと 12 点` |
| Dimension cards | Diagnostic | `写真 12 枚 · 🟢 十分 · 浴室カテゴリ不足` |
| AI report body | Editorial, dense | Full paragraphs, can use light hedging (`全体的に良好、主な課題はレビュー項目`) |
| Empty states | Honest about why | `レビュー数 < 3、参考程度` not `データなし` |
| Errors | Cause + recovery | `物件データを取得できません。URLを確認して再試行してください` |

### Emoji use

The spec is explicit (§9): **don't pile on emoji, but use them as status anchors**. Approved set:

- ✅ pass / consistent
- ⚠️ warn / partial
- ❌ fail / missing
- 🟢 good / 🟡 ok / 🔴 needs attention / ⭐ excellent
- 📷 📝 🛋️ 💬 🔤 — the 5 dimension domain icons (photo / title / description / amenities / reviews)
- ↑ ↓ = — trend arrows (not emoji, plain glyphs)

**No** decorative emoji (no 🚀 🎉 ✨ 💡 in copy). No emoji in headlines.

### Numbers, units, dates

- Scores: `78 点` (with the 点 unit, half-width space before)
- Letter grades: standalone, large, no period — `A` not `A.`
- Deltas: `↑ +0.2` (arrow, space, signed number); colors red/green/gray
- Dates: `2026-05-27` ISO format in UI; `来週月曜 09:00` for human-relative
- Counts: `4/5` ratios, never `4 of 5` / `5 中 4`

---

## VISUAL FOUNDATIONS

The committed direction is **"quiet ops tool with editorial restraint"**. Think Linear's density and Stripe's typographic care, but with a Japanese sensibility (generous whitespace, decisive single-accent color, paper-warm neutrals). No gradient backgrounds. No glassmorphism. No rainbow status pills.

### Color

A small palette held to deliberately. The accent (Sozo Indigo) appears once or twice per screen, never as a fill on large surfaces. Diagnostic states own the color budget on result pages.

- **Paper** `#FAF8F4` — warm off-white, the canvas
- **Card** `#FFFFFF` — pure white, only on elevated surfaces
- **Ink scale** — 900 → 100, used for text + borders + dividers. Always neutral, never blue-tinted.
- **Sozonext Navy** `#024280` — the primary brand color, sampled directly from the official wordmark + the front shape of the cross-mark. Used for the wordmark, primary buttons, focused-state outlines, links. Never as a fill behind body text.
- **Sozonext Sky** `#2E8FCE` — the back shape of the cross-mark, estimated (the supplied logo is only 173×47 px so the lighter blue antialiased toward white). Used sparingly as a secondary accent and for the back-shape of the mark wherever it's redrawn. **Awaiting a hi-res logo from the user to confirm the exact sky-blue hex.**
- **Diagnostic 4-state** — A green / B lime / C amber / D red. These are *louder* than the brand color and that's correct: they're the product's main signal.

Full token list lives in `colors_and_type.css` and the `Colors` cards in the Design System tab.

### Type

- **UI sans:** `Geist` (display + body) — clean grotesque, tight tracking. **Substitute** for whatever geometric sans the official SOZONEXT wordmark uses; awaiting the brand font file.
- **Editorial serif:** `Newsreader` — used sparingly for the AI report body, big-quote callouts, and the wordmark italic
- **Mono:** `Geist Mono` — URLs, code, scores in tabular contexts
- **CJK:** `Noto Sans JP` for ja, `Noto Sans SC` for zh-Hans. Latin glyphs in CJK contexts fall back to Geist via the stack.

**Substitution flag:** The user provided no font files. All fonts are loaded from Google Fonts CDN. If Sozonext has licensed type, drop the `.woff2` files in `fonts/` and update `colors_and_type.css`.

Type sizing follows a tight modular scale (12 / 14 / 16 / 18 / 24 / 32 / 48 / 72 / 120). The score-card letter is **120px+** — it has to read at distance per spec A1.

### Spacing & layout

- 4px base unit. Spacing tokens: 4, 8, 12, 16, 24, 32, 48, 64, 96.
- Grid: 12-column on desktop, gutter 24px, max content width 1280px.
- Result page: two-column on ≥1024px (left = score + dimensions, right = AI report), single column below.
- Generous line-height (1.6 body, 1.2 display) — CJK glyphs need air.

### Borders, radii, shadows

- **Borders:** 1px `ink-100` (#E7E9EC) for cards and dividers. The result page leans on hairline borders, not shadows, for separation.
- **Radii:** 6 (chips, buttons), 10 (cards), 14 (the hero score card), 999 (pills). No "big rounded" 24px+ corners — feels too soft for a diagnostic tool.
- **Shadow:** one shadow only, applied to the score card and modals. `0 1px 2px rgba(14,17,22,0.04), 0 8px 24px -8px rgba(14,17,22,0.08)`. Everything else uses borders.

### Backgrounds & textures

- Background is flat paper (#FAF8F4). No textures, no patterns, no gradients on backgrounds.
- The score card itself is the **only** element allowed a tinted background fill — that fill is the diagnostic color (semantic A/B/C/D), at ~12% opacity, with the letter and score in full-saturation ink.
- Full-bleed imagery is permitted on the marketing surface only (none built here yet) — never on app surfaces.

### Hover & press

- Buttons: hover lifts text contrast and adds a subtle bg-tint (`ink-50`); press shrinks to 98% scale + bg-tint deepens. No color shift.
- Cards (clickable): hover applies the inner shadow + border darkens to `ink-200`. No translate, no scale.
- Links: hover underlines (offset 3px); no color change.

### Motion

- All transitions are 120ms (interactive) or 240ms (entrance), `cubic-bezier(0.2, 0, 0, 1)` (Material-ish but flatter on entry).
- No bounces. No spring. The product is data, not a toy.
- The progress indicator during the 10-30s scrape uses a determinate-feel bar with stepped labels ("抓取中... 分析中... 生成报告...") rather than a spinner — see spec §2.

### Transparency & blur

- One legitimate blur: the modal scrim (`rgba(14,17,22,0.32)` with `backdrop-filter: blur(2px)`).
- No frosted nav, no blurred cards. The product is not iOS.

### Imagery

- The only real imagery in the product is the Airbnb listing's cover photo (B2 dimension). It's rendered at its native crop in a small thumbnail with `ink-100` border, no filter, no overlay.
- No stock photography. No illustrations of "people working". If imagery is needed for empty states, use a subtle line illustration (none built yet).

---

## ICONOGRAPHY

**Current state:** no icon set was provided. The spec leans on **emoji as status markers** (✅ ⚠️ ❌ 🟢 🟡 ❌ ⭐) — these are kept verbatim because they're part of the product's spec'd visual language, not decoration.

For UI-chrome icons (search, settings, close, chevron, download, mail, copy, link), we use **Lucide** via CDN. Stroke 1.5px, 20px default size. This is a substitution — flag for the user if they want a different family (Phosphor, Tabler, Iconoir, custom).

### Rules

- **Status indicators** → emoji from the approved set above (✅ ⚠️ ❌ 🟢 🟡 🔴 ⭐). Keep these as text glyphs, not images.
- **Domain icons for the 5 dimensions** → emoji from spec (📷 标题=🔤 描述=📝 设施=🛋️ 评论=💬). Rendered at 24px with line-height: 1.
- **UI chrome** → Lucide icons. Listed below.
- **Logo / wordmark** → drawn as text (`SOZONEXT` in Geist 600, plus an italic Newsreader `next.` in Sozo Indigo). See `assets/wordmark.svg`. There is no separate "mark" yet.
- **No Unicode-as-icon** (❯ ✚ ◯ etc) anywhere except the trend arrows (↑ ↓ =).

Icons in use across the Review App UI kit:

| Lucide name | Where |
|---|---|
| `link-2` | URL input field prefix |
| `loader-2` | Diagnose button (spinning state) |
| `download` | "下载 PDF" button |
| `mail` | Email-alert status bar |
| `mail-check` | Email-sent confirmation |
| `arrow-up-right` | "上次诊断 vs 本次" delta when positive |
| `arrow-down-right` | …when negative |
| `minus` | …when flat |
| `chevron-right` | Dimension card expand affordance |
| `info` | Inline help tooltips |
| `external-link` | Outbound to Airbnb listing |
| `play` | "立即测试发送周报" |

---

## SKILL.md

See `SKILL.md` for invocation rules when this design system is used as a Claude skill (either in this product or copied into Claude Code).
