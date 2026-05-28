# ADR-002：抓取改用 Fetch + JSON 解析，弃用 Playwright

**Status:** Accepted
**Date:** 2026-05-27
**Deciders:** Yuan Zhang
**Supersedes:** SYSTEM_DESIGN_v0.1 中"Mac 跑 Playwright"方案
**Related:** [PRD](../prd.md) · [System Design](../system-design.md)

## Context

原计划用 Playwright headless chromium 渲染 Airbnb 房源页抓数据。实测发现 Airbnb 把所有需要的字段都 SSR 进 HTML 内联的 `<script id="data-deferred-state-0">` JSON 块里：

- 92 张照片 + 房间分类（roomTourLayoutInfos）
- 12 组设施
- 6 维度子评分（清潔さ / コミュニケーション / …）
- 10 个评论标签 + 数量
- highlights、house rules、坐标、address

只有"逐条评论文本"需要单独调 GraphQL（`/api/v3/StaysPdpReviewsQuery`），仍是 fetch，不需要浏览器。

## Decision

**Mac 端用 `fetch` + JSON 解析；不安装 Playwright / 任何 headless 浏览器。**

## Options Considered

### Option A：Fetch + 解析 data-deferred-state-0（采纳）
| 维度 | 评估 |
|---|---|
| 依赖大小 | ~50MB（pure Node + cheerio/regex）|
| 内存 | ~100MB |
| 单次 scrape 耗时 | 2-5s |
| 反爬风险 | 中（无指纹规避） |

**Pros：** 极简、快、Mac 资源占用小、易维护
**Cons：** Airbnb 改 SSR 结构 → 全断（要监控解析失败率）

### Option B：Playwright headless
| 维度 | 评估 |
|---|---|
| 依赖大小 | ~300MB（chromium） |
| 内存 | ~500MB（chromium 常驻） |
| 单次 scrape 耗时 | 15-20s（含浏览器启动） |
| 反爬风险 | 低（playwright-stealth 等可加） |

**Pros：** 抗反爬更强；JS 渲染兜底；可截图
**Cons：** 重；启动慢；Mac 资源开销大；本任务不需要 JS 渲染

## Trade-off Analysis

实测确认所需数据 100% 在 SSR HTML 内，Playwright 的"渲染能力"对本应用零增量价值，反而牺牲性能和复杂度。

## Consequences

- ✅ Mac 端可以是任何 ~100MB 的 Node 进程
- ✅ Scrape 延迟从 ~20s 降到 ~5s（包括评论 GraphQL）
- ✅ 整个诊断时间预算从 60s 接近上限 → 25s 宽裕
- ⚠️ Airbnb 改结构后立即失效：需在 Mac 端加"解析失败率"监控；失败到一定阈值告警
- ⚠️ Airbnb 反爬升级（UA/cookie 验证）即破：本 ADR 不预防，"反了再加"

## Action Items
- [ ] Mac scraper 用 `pino` 记录每次 fetch 的解析成功/失败
- [ ] 关键 JSON 路径在 `parse-deferred.ts` 用常量列举，便于结构变化时一处改
