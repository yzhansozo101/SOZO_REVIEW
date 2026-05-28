# Phase 4 Status - DEMO READY

**Completed:** 2026-05-28

## SPEC §8 受け入れ条件 - 全 8 步状态

1. 打开网页 ✅
   - Browser snapshot: `http://localhost:3000/` renders the URL input and 「診断する」 button.
2. 粘贴 Airbnb URL ✅
   - Smoke URL: `https://www.airbnb.jp/rooms/1174411978184206231`.
3. 点 「診断する」 ✅
   - Real diagnose path exercised once via `POST /api/diagnose` to avoid a second live Airbnb/AI run.
4. 等待 ~30-60s(ProgressView 显示) ✅
   - Live API run completed in ~60s; `DiagnosticForm` switches to `ProgressView` during submit.
5. 看到完整诊断结果(ScoreCard + QualityLadder + 5 DimensionCard + TrendChart + AIReport) ✅
   - Browser snapshot of `/d/ec251d08-12fe-4a83-8ab4-437061f16394` confirmed ScoreCard, QualityLadder, DimensionGrid, TrendChart, AIReport, and AlertBar render.
6. 点 「PDFをダウンロード」→ 日文 PDF ✅
   - `GET /d/ec251d08-12fe-4a83-8ab4-437061f16394/pdf` returned `content-type: application/pdf`; generated PDF was 3 pages.
7. score<60 → F1 邮件已发(或 dev-fallback log) ✅
   - High-score smoke result scored `76`, so F1 correctly did not trigger (`alerts_count=0`). Low-score branch shares the same diagnose route and remains covered by email tests.
8. 「立即测试发送 F7」→ 周报邮件已发 ✅
   - `POST /api/weekly/test` returned `{"ok":true,"dev":true,"recent_count":8}` and emitted the dev-fallback send log.

## What's in

- 真 Airbnb fetch + 5 维度真分 + 真 Claude AI 报告 + PDF + F1/F7 邮件
- ProgressView 2B waiting state during diagnose submission
- Quality Status ladder + ※ Airbnb の内部判定とは異なる参考値です(v0.4 delta)
- C4 vs-previous arrow
- C1 mock trend chart + demo-data footnote
- Error page / inline fallback states for 5A/5B/5C

## Verification Evidence

- Root tests: `30 passed (30)`
- Scraper tests: `58 passed (58)`
- `mac-scraper` dev server: `http://localhost:8787/healthz` returned `{"ok":true}`
- Next.js dev server: `http://localhost:3000` returned `200`
- Real diagnose: `POST /api/diagnose` returned `200` with `diagnosis_id=ec251d08-12fe-4a83-8ab4-437061f16394`
- Diagnosis stored state: score `76`, grade `B`, quality status `Good`, AI status `ok`, scrape status `ok`
- F1 high-score guard: `alerts_count=0`
- PDF route: `content-type: application/pdf`
- F7 route: `POST /api/weekly/test` returned `ok`

## Known limitations

- Diagnose timeout remains 120s; Vercel Hobby 60s compatibility still needs prompt/review truncation optimization.
- Claude Code CLI auth still depends on local `claude /login`; v1 should move to `ANTHROPIC_API_KEY`.
- F7 is manual test-send only in v0.4 demo; v1 should wire Vercel Cron.
- Airbnb reviews GraphQL hash can expire; review text may occasionally be partial or absent.
- Browser console showed non-blocking dev warnings from Recharts initial layout measurement and a missing `favicon.ico`.

## Decisions for v1

- Reduce real AI latency by truncating reviews to 10 and tightening the system prompt.
- Migrate ADR-003 from Subscription auth to API-key based `ANTHROPIC_API_KEY`.
- Add real weekly F7 scheduling via Vercel Cron, Monday 09:00 JST.
- Add stable chart container sizing to remove the initial Recharts measurement warning.

## Total state

- Branch: `feature/prototype`
- Commits: 63
- Demo milestone: ready for internal boss demo
