# Handoff: SOZO Review · 物件ヘルスチェック

> Design handoff package for **SOZONEXT 物件ヘルスチェック (Airbnb listing health diagnostic system)**.
> For: Claude Code / Codex implementation, May 2026.

---

## ⚡ TL;DR for the implementing agent

You are implementing the Airbnb listing diagnostic web app described in `spec/`. **The PRD and system design already exist and are the source of truth** — your job is to:

1. Follow the **tech stack and architecture** locked in `spec/SYSTEM_DESIGN_v0.2.md` (Next.js 15 App Router + TS, Vercel Hobby, Mac scraper via Cloudflare Tunnel, Claude Agent SDK, Neon + Drizzle, Resend, @react-pdf/renderer).
2. Follow the **feature requirements and acceptance criteria** in `spec/SPEC_v0.4.md`. UI is **all Japanese**.
3. Recreate the **visual look + flow** from `prototype/index.html`. It's a React-via-Babel HTML prototype — do NOT ship its build. **Rebuild it in Next.js using idiomatic App Router + TS + the design tokens in `design_system/colors_and_type.css`**.
4. Adhere to the **4 adopted layout directions** marked in `wireframes/Wireframes.html` (1C · 2B · 3A · 4B).

The README below maps everything together.

---

## 📁 What's in this bundle

```
design_handoff_review_app/
├── README.md                       ← you are here
├── spec/                           ← source of truth (do not edit)
│   ├── SPEC_v0.4.md                ← PRD: features, acceptance, edge cases (中文; UI=日本語)
│   ├── SYSTEM_DESIGN_v0.2.md       ← Architecture: stack, data flow, modules, schema
│   ├── ADR.md                      ← Architecture decision records
│   └── user_flow_v0.2.mermaid      ← User flow diagram
│
├── design_system/                  ← visual language, copy into your codebase
│   ├── DESIGN_NOTES.md             ← Content fundamentals, visual foundations, iconography
│   ├── SKILL.md                    ← Skill-style brief for Claude/Codex
│   ├── colors_and_type.css         ← All design tokens as CSS custom props
│   └── assets/
│       └── sozonext-logo.png       ← Real wordmark (173×47 — request hi-res from team)
│
├── prototype/                      ← VISUAL reference — do not ship
│   ├── index.html                  ← Open in browser to see the target UX
│   ├── kit.css                     ← Component styles
│   ├── App.jsx                     ← State machine: input → progress → result
│   ├── fixture.js                  ← Fake listing data shape
│   ├── DiagnosticForm.jsx          ← 1C — URL input + recent diagnoses list
│   ├── ProgressView.jsx            ← 2B — skeleton-preview loading screen
│   ├── ScoreCard.jsx               ← A1/A4/A7/C4 — hero score card
│   ├── QualityStatus.jsx           ← A5 — 8-step quality ladder
│   ├── DimensionGrid.jsx           ← B1–B12 — 5 dimension cards
│   ├── TrendChart.jsx              ← C1 — score history (2-point line)
│   ├── AIReport.jsx                ← E — editorial AI report w/ Top 3 + download PDF
│   ├── AlertBar.jsx                ← F1/F7 — email status strips
│   ├── EmailPreview.jsx            ← 4B — F1 alert + F7 weekly email modal preview
│   ├── AppHeader.jsx               ← Top chrome
│   └── Icons.jsx                   ← Lucide-style inline SVG icons
│
└── wireframes/
    └── Wireframes.html             ← All 14 layout options; 4 marked ADOPTED in green
```

---

## 🎯 Fidelity statement

The `prototype/` folder is **high-fidelity** (final colors, typography, spacing, copy, interaction states). The wireframes folder is **low-fidelity** (structural exploration only — only the 4 ADOPTED frames matter for implementation).

**Critical:** the prototype is a single-file React-via-Babel demo, not production code. **Don't copy its JSX directly.** Instead:

- **Match its visual output pixel-by-pixel** in Next.js components.
- **Reuse `design_system/colors_and_type.css` verbatim** (drop it in `app/globals.css` or `styles/tokens.css`).
- **Refactor each .jsx into a real Server/Client component** following Next.js App Router conventions (RSC where possible; `'use client'` only where state/effects are needed — the form, the progress timer, the modal).

---

## 🗺️ Spec → component map

The implementer needs to know which spec section drives which UI piece. Here it is:

| Spec ID | Feature | UI component in `prototype/` |
|---|---|---|
| §2 flow step 1-2 | URL input | `DiagnosticForm.jsx` (wireframe 1C — input field + recent diagnoses list) |
| §2 flow step 3-4 | 10-30s wait | `ProgressView.jsx` (wireframe 2B — skeleton preview of result page) |
| A1 / A4 | Letter grade + color | `ScoreCard.jsx` — `.kit-score.grade-{a,b,c,d}` |
| A5 | Quality Status 8-step | `QualityStatus.jsx` — v0.4 requires "※参考値" footnote (see ⚠ below) |
| A7 | "次評価まで N 点" hint | `ScoreCard.jsx` — `.kit-score-upgrade` |
| B1, B2, B3 | Photo count / cover / category coverage | `DimensionGrid.jsx` — `photo` card |
| B6 | Title SEO (placeholder) | `DimensionGrid.jsx` — `title` card with ⏳ marker |
| B7 | Description completeness (v0.4: **length + section regex**, not 7 fields) | `DimensionGrid.jsx` — `desc` card. **⚠ update copy** to match v0.4 |
| B8 | Multi-language coverage | `DimensionGrid.jsx` — `desc` note + `colors-badges` (locale chips) |
| B10 | Amenity ↔ description consistency | `DimensionGrid.jsx` — `amenity` card |
| B12 | Top negative review keywords | `DimensionGrid.jsx` — `review` card |
| C1 | Score history (2-point line) | `TrendChart.jsx` |
| C4 | vs-previous delta | `ScoreCard.jsx` — `.kit-score-delta` |
| E | AI report | `AIReport.jsx` (Newsreader + Noto Serif JP for editorial body) |
| E (PDF) | PDF download | "PDFをダウンロード" button → implement with @react-pdf/renderer per SYSTEM_DESIGN §3 |
| F1 | Alert email (score < 60) | `AlertBar.jsx` warn state + `EmailPreview.jsx` (kind='f1') |
| F7 | Weekly summary | `AlertBar.jsx` info row + `EmailPreview.jsx` (kind='f7') |
| §5 errors | Invalid URL / scrape fail / AI fail | `DiagnosticForm.jsx` validation; build server-error views per wireframes 5A/5B/5C (not in prototype yet — see wireframe HTML) |

---

## ⚠ Spec v0.2 → v0.4 deltas that affect the prototype

The prototype was built against v0.2. The v0.4 changes that **require small UI adjustments**:

1. **All-Japanese UI** ✅ already done in prototype.
2. **B7 description scoring** — the prototype's `desc` card says "7/7 全項目入力済み" but v0.4 changed the rule to "total length + section regex matches". **Update copy** in the dimension card to something like "1,240 文字 · 主要章節✓" once the real evaluator is built. Visual layout stays.
3. **A5 Quality Status** — v0.4 requires a small footnote "※ Airbnb の内部判定とは異なる参考値です" under the ladder. The prototype currently has no footnote — **add it**.

---

## 🎨 Design tokens (excerpt — full set in `design_system/colors_and_type.css`)

### Colors
- **Paper** `#FAF8F4` (canvas) · **Card** `#FFFFFF` · **Ink scale** `#0E1116 → #E7E9EC`
- **Sozonext Navy** `#024280` (brand primary — sampled from logo). Variants 700 `#013366`, 100 `#DBE5F0`.
- **Sozonext Sky** `#2E8FCE` (estimated from low-res logo — request hi-res). Used sparingly.
- **Diagnostic 4-state** (these own the result page):
  - A (健全): fill `#E4F2EB` · ink `#1F5C3D` · base `#2F8F5E`
  - B (良好): fill `#EDF1DD` · ink `#4F661F` · base `#7A9C2F`
  - C (要注意): fill `#FAEFD9` · ink `#8A5512` · base `#D98B1F`
  - D (危険): fill `#F7E1DE` · ink `#842318` · base `#C7382B`

### Type
- **UI sans:** `Geist` (Google Fonts) + `Noto Sans JP` for Japanese
- **Editorial serif:** `Newsreader` + `Noto Serif JP` (only for AI report body, big quotes)
- **Mono:** `Geist Mono`
- **Scale:** 12 / 14 / 16 / 18 / 24 / 32 / 48 / 72 / **120** (score-card letter)

### Spacing / radii / shadow
- 4px base; tokens `--s-1` through `--s-9` (4 → 96px)
- Radii: 4 / 6 (buttons) / 10 (cards) / 14 (hero score card) / 999 (pills)
- **One shadow only:** `0 1px 2px rgba(14,17,22,.04), 0 8px 24px -8px rgba(14,17,22,.08)` — score card + modals. Everything else uses borders.

### Motion
- 120ms interactive / 240ms entrance, `cubic-bezier(0.2, 0, 0, 1)`. No bounces, no springs.

---

## 🖼️ Screen-by-screen spec

### Screen 1 · `/` Input (1C)
- **Purpose:** paste an Airbnb URL → click 診断する → progress.
- **Layout:** centered ≤760px column. Eyebrow → headline → URL field + button row → error → recent-diagnoses list (clickable rows).
- **Components:**
  - URL field: `<input>` inside `.kit-field` with `IconLink` prefix. Default border `#C8CCD1`. Focus → `--sozonext-navy` + 3px ring `rgba(2,66,128,.18)`. Error → `#C7382B` + ring.
  - Primary button: bg `--sozonext-navy`, hover `--sozonext-navy-700`, 14×24 padding, 6px radius.
  - History rows: `.kit-history-row` grid `1fr auto 16px`, grade pill on the right, chevron right.
- **Validation:** `/airbnb\.[a-z.]+\/rooms\/\d+/i` regex. Inline error message under the field.
- **Behavior:** clicking a history row pre-fills URL and triggers diagnosis.

### Screen 2 · Progress (2B · skeleton)
- **Purpose:** show that work is happening; preview the result page layout to anchor the wait.
- **Layout:** progress banner (spinner + step label + step counter) above a full skeleton of the result page (gray bars where score / quality / dimensions / report will go).
- **Phases:** 取得中… → 5項目を分析中… → AIレポート生成中… (use real backend phase events; no fake timers in prod — see SYSTEM_DESIGN §3 for the SSE / polling pattern).
- **Skeletons:** `.sk-bar` with shimmer (linear-gradient + translateX keyframe).

### Screen 3 · Result (3A · two-column)
- **Purpose:** the payoff. Score + breakdown on the left; AI report on the right (sticky on ≥1024px).
- **Layout:**
  ```
  meta row (listing name + URL + diagnosed-at)
  ┌──── left col (1fr) ──────┐  ┌──── right col (1fr) ────┐
  │ ScoreCard (hero)          │  │ AIReport (sticky)        │
  │ QualityStatus (8-step)    │  │  - header + PDF btn      │
  │ DimensionGrid (5 cards)   │  │  - Newsreader lead       │
  │ TrendChart                │  │  - Top 3 priorities      │
  │ AlertBar (F1 + F7)        │  │  - 5項目別の分析          │
  │                            │  │  - リスク                 │
  └────────────────────────────┘  └──────────────────────────┘
  ```
- **Score card** = page focal point. Letter 120-144px Geist 600, score number tabular-nums 32-36px, delta in mono, upgrade hint in row.
- **Dimension cards** = 5-col grid (`.kit-dim-grid`). Each: icon + grade pill + title + big stat + 1-line note.

### Screen 4 · Email previews (4B)
- **Modal** opened from the Alert bar's "プレビュー" buttons. Two kinds:
  - **F1 alert** (score < 60): grade-colored hero block + Top 3 issues table + CTA button "→ レポートを開く" + footnote about dedup.
  - **F7 weekly**: grade-distribution bars (A green / B lime / C amber / D red) + Top 3 risks table + next-send footnote.
- Modal chrome: 720px max width, `--paper` envelope around a `--card` "email body". Headers grid (From / To / Subject) + 24px content.
- **Important:** what's shown in the modal *should match the real email Resend will send*. Implement the email template as MJML or `@react-email/components` matching this layout.

---

## 🔌 Integration checklist (for the implementing agent)

- [ ] Bootstrap Next.js 15 App Router project per `spec/SYSTEM_DESIGN_v0.2.md` §3
- [ ] Drop `design_system/colors_and_type.css` into `app/globals.css` (or `styles/tokens.css` imported once)
- [ ] Add Google Fonts: Geist, Geist Mono, Newsreader, Noto Sans JP, Noto Sans SC via `next/font/google`
- [ ] Add `next-intl` with single `ja` locale (per SYSTEM_DESIGN)
- [ ] Build `app/page.tsx` matching `prototype/DiagnosticForm.jsx`
- [ ] Build `app/d/[id]/page.tsx` matching the result-page layout
- [ ] Build API routes `/api/diagnose`, `/api/diagnose/[id]`, `/api/weekly/test` per SYSTEM_DESIGN §3
- [ ] Implement Mac scraper service (Node fetch + JSON parse, no Playwright) per SYSTEM_DESIGN §4
- [ ] Wire Claude Agent SDK on the Mac side for AI report generation
- [ ] @react-pdf/renderer for PDF with NotoSansJP embedded
- [ ] Resend integration for F1 + F7; use the modal designs as exact email templates
- [ ] Implement v0.4 deltas: B7 length+regex scoring; A5 "参考値" footnote
- [ ] Implement error screens 5A/5B/5C from `wireframes/Wireframes.html` (not in prototype)

---

## 🤖 How to brief Claude Code

Tell Claude Code:

> Read every file in `spec/` first (it's the source of truth — SPEC_v0.4 is the PRD, SYSTEM_DESIGN_v0.2 is the architecture).
> Then open `prototype/index.html` in a browser to see the target UX. Use it as the **visual reference**, not as code to copy.
> Then read `README.md` (this file) for the spec-to-component map.
> Then read `design_system/colors_and_type.css` and copy it into the new Next.js project's global stylesheet.
> Build the Next.js app per SYSTEM_DESIGN's module tree.
> When in doubt about a visual detail, screenshot the prototype and reproduce pixel-for-pixel.

## 🤖 How to brief Codex / ChatGPT

Codex doesn't have file-system tools by default. Paste:

1. The full content of `spec/SPEC_v0.4.md`
2. The full content of `spec/SYSTEM_DESIGN_v0.2.md`
3. The full content of this README
4. The full content of `design_system/colors_and_type.css`
5. 3-4 screenshots of `prototype/index.html` (input / loading / result / email modal)

Tell it: "Implement this as a Next.js 15 App Router project matching the design system. Reproduce the prototype visually. Follow the system design's architecture and module layout."

---

## 🙋‍♂️ Open questions for the team (flag back)

1. **Hi-res logo** — supplied PNG is 173×47. Sky-blue hex `#2E8FCE` is estimated.
2. **Brand font** — wordmark uses an unidentified geometric sans. We're substituting **Geist** until the licensed font is shared.
3. **Quality Status JP wording** — translated to 健全 / 指導 / 警告 / 保留 / 追加警告 / 削除予定 / 一時停止 / 削除済み. Confirm matches Airbnb's actual Japanese locale terms if known.
4. **AI report tone** — Japanese デスマス form, ops-team voice, no honorifics for the listing. Confirm.
