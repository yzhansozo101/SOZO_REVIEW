# ADR-004：同步诊断流，不用作业队列

**Status:** Accepted
**Date:** 2026-05-27
**Deciders:** Yuan Zhang
**Related:** [PRD](../prd.md) · [System Design](../system-design.md)

## Context

诊断流程：scrape (5s) + score (<1s) + AI (15s) ≈ 20-25s。

可选模式：
- **同步**：POST 阻塞到完成，前端转圈 + 文案模拟进度
- **异步**：POST 返 job_id，前端轮询/SSE 拿进度

## Decision

**同步：`POST /api/diagnose` 阻塞返回结果。**

## Options Considered

### Option A：同步（采纳）
| 维度 | 评估 |
|---|---|
| 代码复杂度 | 极低 |
| 用户体验 | 转圈 ~25s |
| 失败恢复 | 简单（前端报错重试） |

**Pros：** 一条线性代码，无 job table、无 worker、无重试逻辑
**Cons：** 用户必须在页面等；Vercel 60s 是硬上限，无 buffer

### Option B：异步 job + SSE 推进度
| 维度 | 评估 |
|---|---|
| 代码复杂度 | 高(job table、worker、连接管理)|
| 用户体验 | 可显示"抓取中→分析中→生成报告"真实阶段 |
| 失败恢复 | 复杂 |

**Pros：** 体验好；不受单次超时限制
**Cons：** 工程量翻倍；demo 量级无价值

## Trade-off Analysis

25s 同步在 Hobby 60s 上限内余量 35s，安全。SSE 的体验提升对一次性 demo 不值这个复杂度。

## Consequences

- ✅ 代码量小，DB 不需要 `jobs` 表
- ⚠️ 如果 Airbnb 慢或 AI 慢导致超 60s，请求被 Vercel 截断 → 前端显示 504。降级方案：DB 已记录失败标记 row，前端可让用户"查看上次的失败"
- ⚠️ 未来如要支持批量诊断（多个 URL 一起跑），必须改异步

## Action Items
- [ ] Mac 端设 45s 内部 timeout，主动 abort 让 Vercel 有 15s 处理
- [ ] 前端 loading 文案做时序模拟("取得中" → "分析中" → "レポート生成中")，用户感知不是"卡住"
