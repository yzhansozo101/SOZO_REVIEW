# Replace F1/F7 notification UI with SOZONEXT marketing CTA

**Date**: 2026-05-29
**Status**: Approved (pending implementation plan)
**Branch**: `feature/notification`
**Author**: Brainstorming session with Claude

---

## Problem

The result page section "05 通知" currently displays the F1 alert email status and provides three buttons (alert preview, weekly summary preview, weekly test send). For the demo audience (boss + internal users) this UI is low-value: it neither helps the user understand their listing nor drives any business outcome.

Meanwhile the demo target audience (民泊 hosts who get a low score) is the exact ideal customer profile for SOZONEXT's existing 宿泊施設運営・集客支援 service line. The diagnostic result page is the highest-intent surface in the product (the user has just been told their listing is in trouble) and currently has no path to monetisation.

## Goal

Replace the "05 通知" section with a marketing CTA card that drives leads to SOZONEXT's minpaku operations service. Delete the now-unused F1/F7 email backend and supporting code.

## Non-goals

- No A/B testing infrastructure for CTA copy
- No analytics/conversion tracking (instrumented in a later PR if desired)
- No multi-language CTA copy (JA only — matches the rest of the product surface)
- No CTA on homepage / other pages (limited to result page bottom)
- No migration to drop the `alerts_sent` Postgres table (kept as dead schema; revisit later)

---

## Decisions

| Question | Decision |
|---|---|
| What does the CTA show? | Always, regardless of overall score |
| Conditional copy by grade? | No — single copy variant |
| Contact channels | Email + phone + website |
| Visual style | "A. white card with navy accents" — matches existing report card pattern |
| Section label | `05 サポート` (replaces `05 通知`) |
| Backend F1/F7 fate | Delete entirely (templates, send code, test endpoint, EmailPreview, tests) |
| `alerts_sent` table | Keep in DB; remove from `lib/db/schema.ts` exports |
| Resend dependency | Remove; package + env vars deleted |

---

## New component: `components/SupportCta.tsx`

Pure server component, no props, no client interactivity. All copy hardcoded.

### Visual structure

```
┌─────────────────────────────────────────────────────────┐
│  ⬤ (navy circle icon)   もっと結果を出しませんか？      │
│                          ──────                          │
│                          SOZONEXT は民泊運営代行の      │
│                          専門会社。リスティング改善から  │
│                          運営代行・収益コンサルまで     │
│                          一括サポートします。           │
│                                                          │
│  ──────────────────────────────                         │
│                                                          │
│  ✓ リスティング最適化代行                                │
│      写真・タイトル・紹介文を SOZONEXT が制作           │
│  ✓ 24h 運営代行                                          │
│      ゲスト対応・清掃・チェックイン代行                  │
│  ✓ 収益改善コンサル                                      │
│      価格戦略・RevPAR 改善・複数物件運用                 │
│                                                          │
│  ──────────────────────────────                         │
│                                                          │
│  ┌─────────────────────────────────┐                    │
│  │ minpaku_info@sozonext.com  →   │   📞 03-3842-1552   │
│  │  にメール相談する               │   🌐 sozonext.com → │
│  └─────────────────────────────────┘                    │
└─────────────────────────────────────────────────────────┘
```

### Layout

```
.support-cta (white card, shadow, var(--r-lg))
├── header (flex row)
│   ├── navy 28×28 icon circle (home SVG)
│   └── headline + description (h3 + p)
├── divider
├── bullets grid (3 rows × {checkmark, title, caption})
├── divider
└── contact row (flex)
    ├── email button (primary navy CTA)
    └── secondary contact (phone + website, stacked)
```

### Copy (JA, frozen)

**Headline**: `もっと結果を出しませんか？`

**Description**:
> SOZONEXT は民泊運営代行の専門会社。リスティング改善から運営代行・収益コンサルまで一括サポートします。

**Bullets**:
1. `リスティング最適化代行` — `写真・タイトル・紹介文を SOZONEXT が制作`
2. `24h 運営代行` — `ゲスト対応・清掃・チェックイン代行`
3. `収益改善コンサル` — `価格戦略・RevPAR 改善・複数物件運用`

**Email button label**: `minpaku_info@sozonext.com にメール相談する →`

**Phone label**: `📞 03-3842-1552`（icon is SVG, not emoji)

**Website label**: `🌐 sozonext.com →`（icon is SVG)

### Contact details

| Channel | Value | Link |
|---|---|---|
| Email | `minpaku_info@sozonext.com` | `mailto:minpaku_info@sozonext.com?subject=リスティング改善のご相談&body=SOZONEXT Review で診断後、より良い結果のためご相談したく連絡いたしました。%0A%0A物件 URL:%0A%0Aご質問・ご要望:%0A` |
| Phone | `03-3842-1552` | `tel:+81338421552` (international format — most portable for mobile dialers) |
| Website | `https://sozonext.com` | `https://sozonext.com` (target=`_blank`, rel=`noopener noreferrer`) |

### Design tokens

- Card: `background: var(--card)`, `border: 1px solid var(--ink-100)`, `borderRadius: var(--r-lg)`, `padding: var(--s-6)`, `boxShadow: var(--shadow-card)`
- Icon circle: 28×28, `background: var(--sozonext-navy)`, white SVG inside
- Headline (h3): `fontSize: 20px`, `fontWeight: 600`, `color: var(--ink-900)`
- Description (p): `fontSize: 14.5px`, `color: var(--ink-600)`, `lineHeight: 1.6`
- Bullet checkmark: 22×22 circle, `background: var(--grade-a)`, white SVG checkmark
- Bullet title: `fontSize: 14.5px`, `fontWeight: 600`, `color: var(--ink-800)`
- Bullet caption: `fontSize: 13px`, `color: var(--ink-500)`
- Email button: navy primary CTA (reuses `.btn-primary` class, hover → `var(--sozonext-navy-700)`)
- Secondary contacts: `fontSize: 13.5px`, `color: var(--ink-700)`, icon `var(--sozonext-navy)`
- Dividers: `borderTop: 1px solid var(--ink-100)`
- Responsive: contact row stacks vertically below 640px

### Accessibility

- All icon SVGs have `aria-hidden="true"`
- Email button is a `<a>` not `<button>` (semantic — it's a link)
- Phone link uses `tel:` URI for mobile click-to-call
- Website link has `rel="noopener noreferrer"` and `target="_blank"`
- Tab order: email button → phone → website (left-to-right, top-to-bottom)
- Color contrast: all foreground/background pairs verified 4.5:1+

---

## Result page integration

`app/d/[id]/page.tsx`:

- Replace `<AlertBar>` import + render with `<SupportCta />`
- Remove `alerts_sent` query (DB call, lines ~108–114)
- Remove `alert` variable and `alertEmailTo` derivation
- Section wrapper unchanged: `<section style={{ display: "grid", gap: "var(--s-3)" }}>` + `<SectionLabel n="05" title="サポート" />` + `<SupportCta />`

---

## Backend deletion

### Files deleted

```
app/api/diagnose/route.ts          # F1 send block (~lines 64–98) removed; otherwise unchanged
app/api/weekly/test/route.ts       # entire file deleted
app/api/weekly/                    # parent dir deleted (empty)
lib/email/alert.tsx                # F1AlertEmail template
lib/email/weekly.tsx                # F7WeeklyEmail template
lib/email/resend.ts                 # Resend client wrapper (no longer used)
lib/email/                         # parent dir deleted (empty)
components/AlertBar.tsx
components/EmailPreview.tsx
tests/AlertBar.test.tsx
tests/EmailPreview.test.tsx
tests/email-alert.test.ts
tests/email-weekly.test.ts
```

### Files modified

- `app/api/diagnose/route.ts` — remove F1 send branch (the `if (score < 60 && !alertSentRows.length)` block) and its surrounding imports (`F1AlertEmail`, `alertsSent`)
- `app/d/[id]/page.tsx` — see above
- `tests/api-diagnose.test.ts` — remove any assertions related to F1 send behavior; keep other diagnose-path assertions
- `lib/db/schema.ts` — remove `alertsSent` export (table itself stays in Neon)

### Schema migration

**No migration committed.** The `alerts_sent` table is left in Neon as inert. Add a one-line code comment in `lib/db/schema.ts` where the export was removed: `// alertsSent table dropped from schema export 2026-05-29 (notification system removed). Table still exists in DB.`

### Package + env cleanup

- `package.json` — remove `"resend": "^6.12.4"` from dependencies. Remove `"@react-email/components": "^1.0.12"` if it's only used by F1/F7 templates (verify before deletion; if any other code uses it, keep).
- `.env.example` — remove `RESEND_API_KEY` and `ALERT_EMAIL_TO` lines.
- Vercel env vars: noted in changelog for ops to remove manually post-merge.

---

## Tests

### Deleted

- `tests/AlertBar.test.tsx`
- `tests/EmailPreview.test.tsx`
- `tests/email-alert.test.ts`
- `tests/email-weekly.test.ts`
- F1-related assertions inside `tests/api-diagnose.test.ts`

### Added

`tests/SupportCta.test.tsx`:

1. Renders all 3 service bullets (text content match)
2. Email button has `href` starting with `mailto:minpaku_info@sozonext.com` and containing `subject=`
3. Phone link has `href="tel:+81338421552"`
4. Website link has `href="https://sozonext.com"`, `target="_blank"`, `rel="noopener noreferrer"`
5. All icon SVGs have `aria-hidden="true"`
6. Email button has `class` or inline style matching the navy primary CTA pattern (reuses test pattern from PdfDownloadButton test if applicable)

### Modified

- `tests/api-diagnose.test.ts`: remove F1 send assertions; keep coverage for URL validation, cache hit, diagnose call, DB insert, response shape

---

## Documentation updates

### `CLAUDE.md`

- §4 技術スタック table: remove the Resend row
- §6 v0.4 デルタ #5 (F7 週次サマリー): rewrite to describe the SupportCta surface, or delete if no longer a delta point
- §10 demo 成功の定義: replace items #4 + #5 with a single new item: `4. 結果ページ最下部に「SOZONEXT サポート」カードが表示され、メール/電話/URL リンクがクリック可能`
- §11 守る: delete the line about `ALERT_EMAIL_TO` test address
- §11 やらない: F7 真の定時送信 line can be removed (no longer relevant)
- §12 演示前 checklist: remove `RESEND_API_KEY` / `ALERT_EMAIL_TO` from the env var list

### `docs/prd.md`

- Remove F1 (アラートメール) and F7 (週次サマリー) feature sections
- Add a new feature entry: `F8 SOZONEXT サポート CTA` (with this spec as reference)
- Update demo flow / acceptance to match CLAUDE.md §10

### `docs/system-design.md`

- §6 主流程: remove step 6 (F1 send) and the `alerts_sent` insert
- Remove the email-flow architecture section
- DB schema diagram: mark `alerts_sent` as deprecated or remove

### `docs/system-design-geo.md`

- No changes expected (GEO doc does not reference email behavior). Verify with grep before closing.

### `docs/adr/`

- Add `ADR-006-remove-f1-f7-emails-for-marketing-cta.md` capturing: context, decision, consequences. Brief — 1 page.

---

## Out of scope (future work)

- Analytics: instrument CTA clicks (email/phone/website) once we want conversion tracking
- A/B test CTA copy variants
- Multi-language (EN/ZH) CTA variants
- Homepage hero CTA placement
- Drop `alerts_sent` table via a real down migration (low value; punt indefinitely)

---

## Implementation notes

- **`@react-email/components` removal**: grep for `@react-email/components` outside `lib/email/` before removing from `package.json`. If anything else uses it, keep the dependency.
- **Vercel env vars**: post-merge, manually remove `RESEND_API_KEY` and `ALERT_EMAIL_TO` from the Vercel project's env settings. Not blocking the merge.
