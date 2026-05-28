# Phase 3 Status

**Completed:** 2026-05-28

## What works
- 真 Airbnb URL → real fetch + parse + 5 dim score → **Claude Agent SDK 一次 tool_use 产出 3 份产物**
  - 日语 markdown 报告(總評 + 5 維度分析 + Top3 + リスク)
  - Top3 改善案(issue / action / impact)
  - negative_keywords(本次房源 reviews fetch 失败,故为空数组,但 schema/UI 都已通)
- 走本机 Claude Code OAuth($0 直接 API,前提:`claude /login` 已认证 CLI)
- zod 校验 + 1 次重试 + fallback(401 / schema-invalid 都兜得住)
- 结果页二栏布局:左 ScoreCard + DimensionGrid,右 AIReport(≥1024px sticky)

## Smoke run
- listing `1174411978184206231` 真实诊断,diagnosis_id `25a3080c-67ff-4415-b817-5c638ace1ce3`
- `ai_status = ok`
- `length(ai_report_md) = 1817` 字
- `top3` 数组长度 = 3
- 报告片段示例:「設備スコアが 32 点と突出して低く...cover が「間取り図」になっており、サムネイル一覧での視覚的訴求力を大きく損なっています」(具体到设施数、cover 类型的可执行建议)
- root pnpm test:**26 passed**(5 files)
- mac-scraper pnpm test:**58 passed**(13 files)
- 合計 **84 tests pass**

## Known issues / 临时变更
- **timeout**:`/api/diagnose` route 把 fetchDiagnosis 的 timeoutMs 从 45s 升到 120s(真 AI 30-60s)。Plan 4 需在 Vercel 60s 限制内调优 prompt / 分流。
- **Claude Code CLI auth**:本机桌面 Claude Code app 的 OAuth 与 `claude` CLI 不共享凭据;需先跑 `claude /login` 让 CLI 独立认证。ADR-003 应更新注解。
- **B12 negative_keywords 现为空**:本 listing 的 reviews GraphQL hash 过期 → reviews 列表为空 → AI 收到的 review 文本为空。Plan 2 / Plan 3 设计正确兜底(空数组、UI 显示「✅ 高頻度の否定キーワードは検出されませんでした」)。要看 B12 真效果,需要换一个 reviews hash 仍有效的房源,或调用 PDP 主流程时实时刷新 hash(Plan 4 任务)。

## Known gaps(Plan 4)
- 没邮件(F1 score<60 / F7 週次サマリー)
- 没 PDF 下载(react-pdf + NotoSansJP)
- 没错误页 5A/5B/5C
- 没 Quality Status ladder UI(A5 + 「※参考値」脚注)
- A7 升档动态文案 / C4 变化箭头未实装
- F7 mock 文案
- v0.4 deltas 最终核对
- timeout 优化(120s → 真 AI 调优)

## Next plan
docs/superpowers/plans/2026-MM-DD-phase4-email-pdf-polish.md(待写)
