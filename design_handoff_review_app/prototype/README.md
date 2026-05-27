# Review App UI Kit

High-fidelity interactive mock of Sozonext's **房源健康诊断系统 (Listing Health Diagnostic System)** — the product defined in `Review App/SPEC_房源诊断系统_需求v0.2.md`.

## What's here

`index.html` — the orchestrated click-through demo. Click 诊断 to run a fake diagnostic flow that walks through:

1. **Input** — URL field + "诊断" button, with the visual style from the score-card preview
2. **Progress** — stepped wait (URL 校验 → 抓取数据 → 5 维度分析 → AI 报告生成 → 完成)
3. **Result** — hero score card (B · 78), 8-step Quality Status, 5 dimension cards, trend chart, AI report with Top 3, email alert bar

The data is fake but representative of what the spec calls for (B6 SEO is the explicit "开发中" placeholder; C1 trend is a 2-point line per spec; F1 alert shows the >60 healthy state).

## Components (JSX)

| File | What it is |
|---|---|
| `App.jsx` | State machine — `input → loading → result`, the entry component |
| `AppHeader.jsx` | Top bar — wordmark + email-config slot + GH-link feel |
| `DiagnosticForm.jsx` | URL input + diagnose button + URL validation |
| `ProgressView.jsx` | The 5-step stepped progress used during the 10-30s scrape |
| `ScoreCard.jsx` | Hero score card — letter A/B/C/D + 分 + trend delta + upgrade hint (A1, A4, A7, C4) |
| `QualityStatus.jsx` | 8-step horizontal ladder (A5) |
| `DimensionCard.jsx` + `DimensionGrid.jsx` | 5-up row of dimension summaries (B series) |
| `TrendChart.jsx` | C1 — 2-point line with "data accumulating" footer |
| `AIReport.jsx` | E — editorial-style report with Top 3 priority list + Download PDF button |
| `AlertBar.jsx` | F1 / F7 — email-alert status strip at result-page bottom |

## How to extend

- Add a new screen: add a `view` value in `App.jsx`'s state machine.
- Add a new dimension card: pass into `DimensionGrid`'s `data` prop.
- Restyle: edit `colors_and_type.css` at the repo root. The UI kit doesn't redefine tokens.

## Not implemented (intentional)

- No real Airbnb scraping — fake fixture only
- No real AI call — pre-baked report copy
- No real email send — alert bar shows the spec'd UI states only
- B6 (SEO) is the spec'd "⏳ 功能开发中" placeholder
- No login / account / multi-listing dashboard (per spec §6 "明确不做")
