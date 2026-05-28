# ADR-001：混合部署 — Vercel Hobby + Mac 本地服务

**Status:** Accepted
**Date:** 2026-05-27
**Deciders:** Yuan Zhang
**Related:** [PRD](../prd.md) · [System Design](../system-design.md)

## Context

demo 阶段需求：
- 月成本目标 $0
- 老板能拿到一个 URL 自己点（不能只屏幕共享）
- 诊断流程涉及外部网页抓取 + AI 调用，可能 20-30s

约束矩阵：
- Vercel Hobby：函数 60s 上限、daily-only cron、$0
- Vercel Pro：60s 上限、灵活 cron、$20/月
- Railway/Render：无超时限制、$5-10/月
- 纯本地：演示要求屏幕共享，体验差

## Decision

**Vercel Hobby 部署 Next.js（前端 + 短任务 API），Mac 本地常驻一个 Node 服务承担"重活"（抓取 + AI），通过 Cloudflare Tunnel 暴露固定 HTTPS URL，Vercel 调它。**

## Options Considered

### Option A：Vercel Hobby + Mac（采纳）
| 维度 | 评估 |
|---|---|
| 复杂度 | 中（多了一个本地服务和 tunnel） |
| 月成本 | **$0** |
| 可用性 | Mac 必须开机；演示前 checklist 可控 |
| 体验 | 用户拿到公网 URL 自己点 |
| 工程量 | 低（Mac 端纯 Node、不打包） |

**Pros：** 零成本；老板可自助点；Mac 端无超时限制
**Cons：** Mac 关机/睡眠/断网整套不可用；演示前必检

### Option B：纯 Vercel Pro（$22/月）
| 维度 | 评估 |
|---|---|
| 复杂度 | 高（chromium 瘦身、cron 粒度绕过） |
| 月成本 | $20–22 |
| 工程量 | 高 |

**Cons：** 突破 $0 预算；为了 demo 一次性演示不划算

### Option C：Railway/Render ($5-10/月)
**Pros：** 单一节点、无超时、cron 直接 node-cron
**Cons：** 仍要花钱；Playwright 装机本来也想节省（见 [ADR-002](0002-no-playwright.md) 后已不再是优势）

### Option D：纯本地 pnpm dev
**Pros：** $0、最简单
**Cons：** 老板拿不到 URL，必须屏幕共享演示

## Trade-off Analysis

- **A vs B**：A 省 $22/月，代价是 Mac 必须在线。demo 阶段使用频率低（每周 1-2 次演示），Mac 可控；上量后再迁
- **A vs C**：A 省 $5-10/月，代价同上。C 的优势主要在 Playwright 友好（不需要 sparticuz chromium），但 [ADR-002](0002-no-playwright.md) 决定不用 Playwright 后，C 的优势缩水到只剩"Mac 不必开机"
- **A vs D**：A 提供公网可访问性，符合"老板自己点链接"的需求

## Consequences

- ✅ 月成本 $0
- ✅ Mac 端可自由用任何依赖（无 Vercel 包体限制）
- ⚠️ Demo 前必须确认：Mac 醒着、CF Tunnel 在跑、`SCRAPER_URL` 配置正确
- ⚠️ 不适合规模化：Mac 是单点故障 + 单点性能瓶颈。v1 阶段如果用户量 > 团队内部，应迁移到 Railway / 自有 VPS

## Action Items
- [ ] Mac 装 `caffeinate -d` 或调电源选项防睡眠
- [ ] Cloudflare Tunnel 配固定域名（`cloudflared tunnel create sozo-scraper`）
- [ ] 设演示前 checklist 文档
