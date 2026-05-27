---
name: sozonext-design
description: Use this skill to generate well-branded interfaces and assets for SOZONEXT, either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping the SOZONEXT brand and its products (starting with the Airbnb 物件ヘルスチェック / Listing Health Diagnostic system).
user-invocable: true
---

Read the README.md file within this skill, and explore the other available files.

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view. If working on production code, you can copy assets and read the rules here to become an expert in designing with this brand.

Key things to remember:

- **Primary UI language is Japanese.** Chinese spec docs exist (the v0.2 Review App spec) but the product surface ships in 日本語. English is used inline for technical terms (URL, Quality Status, Wi-Fi) and never lowercased.
- **The brand is Sozonext Navy (#024280) + a lighter sky (#2E8FCE).** The logo is `assets/sozonext-logo.png` (low-res — request a higher version if precise reproduction is needed). The wordmark is set in a tight geometric sans (Geist as substitute until a brand font is supplied).
- **Diagnostic colors own the result page** — A green / B lime / C amber / D red. The brand navy stays restrained to the chrome (header, buttons, links). Don't double up.
- **One shadow, one accent color, one type family per surface.** No gradients on backgrounds, no rounded-corner-with-colored-left-border tropes.
- **Status emoji are part of the spec** (✅ ⚠️ ❌ 🟢 🟡 🔴 ⭐ + the five domain glyphs 📷🔤📝🛋️💬). Use them as text glyphs, never as decoration in headlines or hero copy.
- **The score-card letter is the hero.** Always paired with the numeric score, the prev-vs-current delta, and the "next-grade lift" hint. Letter size starts at 120px+.

If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some clarifying questions (which product surface? what audience? Japanese-only or bilingual? any new components needed?), and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.

## File map for Claude

- `README.md` — content fundamentals, visual foundations, iconography, full index
- `colors_and_type.css` — every CSS token (colors, type scale, spacing, radii, shadow, motion). Import this once at the top of any new HTML file.
- `assets/sozonext-logo.png` — the real wordmark (low-res; flag for re-upload)
- `assets/wordmark.svg`, `assets/mark.svg` — placeholder wordmark + mark (deprecated; use the real PNG)
- `preview/*.html` — Design System tab cards. Browse these to see how each token / component is meant to look in isolation.
- `ui_kits/review_app/` — the full Review App interactive mock. Read `README.md` inside for the component map.
