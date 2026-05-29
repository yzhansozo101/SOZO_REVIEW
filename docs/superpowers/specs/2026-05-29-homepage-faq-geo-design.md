# Homepage FAQ GEO Design

Date: 2026-05-29  
Branch: `fix/geo`

## Context

The homepage already exposes GEO-oriented metadata:

- SEO metadata in `app/layout.tsx`
- `Organization`, `WebSite`, and `WebApplication` JSON-LD from `lib/schema.ts`
- Japanese marketing sections with English and Chinese brand snippets

There is no FAQ section today. `docs/system-design-geo.md` explicitly deferred `FAQPage` because there was no real Q&A content at the time. The current goal is to add a small, truthful FAQ that improves AI/search extractability without over-optimizing or making unsupported ranking claims.

## Goals

- Add a visible homepage FAQ section in Japanese.
- Include light English and Chinese brand recognition through the existing multilingual brand area, not by duplicating the full FAQ.
- Add matching `FAQPage` JSON-LD to the homepage graph.
- Keep FAQ answers factual, demo-safe, and consistent with current product behavior.
- Avoid claiming Airbnb official affiliation or guaranteed search-ranking improvements.

## Non-Goals

- No separate `/faq` route.
- No article or content library.
- No CMS or database-backed FAQ.
- No hidden-only SEO content.
- No claim that SOZONEXT Review is Airbnb official or that it guarantees ranking outcomes.

## Recommended Approach

Add a compact homepage `Faq` server component and extend the existing schema builder.

This is preferred over a separate FAQ page because the site currently has one public landing page, and the homepage is the page most crawlers and AI systems will index first. It is also preferred over JSON-LD-only FAQ because visible content and structured data should match.

## Content Design

The visible FAQ should contain six Japanese Q&A items:

1. `SOZONEXT Review とは何ですか？`
   - Answer: SOZONEXT's Airbnb listing health-check tool for diagnosing public listing information and producing improvement reports.

2. `どのような項目を診断しますか？`
   - Answer: Photos, title, description, amenities, and reviews; the result is shown as a five-dimension score and Japanese AI report.

3. `Airbnb の公式評価と同じですか？`
   - Answer: No. It is not Airbnb's internal or official judgment. It is a reference score for operation improvement based on public information.

4. `Airbnb アカウントへのログインは必要ですか？`
   - Answer: No. A public Airbnb listing URL is enough for the demo; no host account permission is required.

5. `検索順位やスーパーホスト維持に役立ちますか？`
   - Answer: It can help identify improvement actions for photos, titles, descriptions, amenities, and review quality, but it does not guarantee search ranking or badge outcomes.

6. `料金はかかりますか？`
   - Answer: The demo is free to use. The current architecture is designed around the project's zero monthly cost constraint.

The English and Chinese brand snippets remain separate, small, and subdued. They should continue to identify SOZONEXT Review cross-language, without translating the full FAQ.

## Architecture

### Components

- Add `components/marketing/Faq.tsx`
  - Server component.
  - Exports `FAQ_ITEMS` as a readonly array so the UI and JSON-LD can share the same content.
  - Renders a full-width homepage section constrained to the existing `760px` layout.
  - Uses simple semantic markup: `<section>`, `<h2>`, `<dl>`, `<dt>`, `<dd>`.
  - Uses existing design tokens and spacing patterns from `HowItWorks` and `AboutSozonext`.

### Page Wiring

- Update `app/page.tsx`
  - Import `Faq`.
  - Render order:
    - `Hero`
    - `DiagnosticForm`
    - `HowItWorks`
    - `AboutSozonext`
    - `Faq`
    - `MultilingualBrandSnippets`

### Structured Data

- Update `lib/schema.ts`
  - Import or duplicate the FAQ item data from a shared place.
  - Prefer placing FAQ content in `components/marketing/Faq.tsx` only if it does not create an undesirable schema-to-component dependency.
  - Better boundary: create `lib/marketing/faq.ts` with `FAQ_ITEMS`, then import it from both `Faq.tsx` and `lib/schema.ts`.
  - Add a fourth graph node:
    - `@type`: `FAQPage`
    - `@id`: `https://sozonext-review.vercel.app/#faq`
    - `mainEntity`: array of `Question` objects with `acceptedAnswer`.

The final homepage graph should be:

1. `Organization`
2. `WebSite`
3. `WebApplication`
4. `FAQPage`

## Data Flow

`lib/marketing/faq.ts`

- Owns the canonical FAQ question and answer text.
- Used by the visible React component and JSON-LD builder.

`components/marketing/Faq.tsx`

- Reads `FAQ_ITEMS`.
- Renders visible Japanese FAQ content.

`lib/schema.ts`

- Reads `FAQ_ITEMS`.
- Converts them into Schema.org `FAQPage` JSON-LD.

`components/marketing/StructuredData.tsx`

- No behavior change; continues to inject the homepage graph.

## Testing

Update or add tests:

- `tests/schema.test.ts`
  - Expects `homepageGraph()` to contain four nodes.
  - Expects the fourth node type to be `FAQPage`.
  - Expects `FAQPage.mainEntity` to include six questions.
  - Expects one answer to state that the score is not Airbnb's official judgment.
  - Expects one answer to avoid guaranteed ranking language.

- Optional lightweight component test only if current testing patterns make it cheap:
  - Render `Faq` and assert the section heading and at least one question are visible.

Verification commands:

- `pnpm test`
- `env -u DATABASE_URL PNPM_CONFIG_IGNORE_SCRIPTS=true pnpm build`

## Acceptance Criteria

- Homepage visibly includes a Japanese FAQ section.
- Homepage HTML includes `FAQPage` JSON-LD inside the existing `application/ld+json` script.
- FAQ visible text and JSON-LD answers use the same source content.
- No answer claims official Airbnb status or guaranteed search-ranking improvement.
- Tests and production build pass.

## Open Decisions

None. The user confirmed: Japanese-first FAQ, with English and Chinese brand support.

## Self-Review

- Completion marker scan: no unfinished markers remain.
- Consistency check: visible FAQ and JSON-LD both come from one shared content source.
- Scope check: one homepage section plus one schema extension; no separate page or CMS.
- Ambiguity check: ranking language is explicitly non-guaranteed, and Airbnb official affiliation is explicitly denied.
