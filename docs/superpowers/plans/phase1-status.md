# Phase 1 Status

**Completed:** 2026-05-27

## What works
- `pnpm test` at repo root passes: 36 tests
- `cd mac-scraper && pnpm test` passes: 5 tests
- `pnpm dev` (Next.js) + `cd mac-scraper && pnpm dev` run together
- Paste URL -> `POST /api/diagnose` -> mac-scraper returns fixture -> writes to Neon -> redirects to `/d/[id]` -> renders ScoreCard
- Latest smoke diagnosis row: `4fbbbd16-e4de-4b94-9178-b125b2a4f442` (`listing_id = 1174411978184206231`, `grade = B`)
- Design tokens are wired into the Japanese UI

## Smoke check notes
- mac-scraper health check returned `{"ok":true}`
- `POST /api/diagnose` returned `{"diagnosis_id":"4fbbbd16-e4de-4b94-9178-b125b2a4f442","redirect":"/d/4fbbbd16-e4de-4b94-9178-b125b2a4f442"}`
- `GET /d/4fbbbd16-e4de-4b94-9178-b125b2a4f442` returned HTTP 200
- On this machine, the first Next.js dev start hit `EMFILE: too many open files, watch` and only served 404s. Restarting with `ulimit -n 4096` and `WATCHPACK_POLLING=true` fixed route discovery; then `GET /` returned HTTP 200.

## Known gaps (Plan 2-4 处理)
- Mac scraper 还是 fixture, 没真抓 Airbnb
- AI 报告占位文字, 无 Claude Agent SDK
- 没 5 维度卡片网格、Quality Status 8 档、TrendChart、AI 报告全文
- 没邮件 (F1 / F7)、PDF 下载
- 没错误页 5A/5B/5C
- v0.4 deltas 中: A5 参考值脚注 / B7 文字数+章节 / F7 mock 文案 — 留到 Plan 4 最终核对

## Next plan
docs/superpowers/plans/2026-05-XX-phase2-real-scraping.md (待写)
