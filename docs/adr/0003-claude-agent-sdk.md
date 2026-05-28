# ADR-003：AI 走本地 Claude Agent SDK，不用 Anthropic API key

**Status:** Accepted
**Date:** 2026-05-27
**Deciders:** Yuan Zhang
**Related:** [PRD](../prd.md) · [System Design](../system-design.md)

## Context

需要 Claude 做两件事：
1. 生成日语诊断报告（含 Top 3 改善案）
2. 从评论里抽取高频负面关键词（B12）

约束：
- 月成本目标 $0
- 用户本机有 Claude Code Enterprise 订阅
- Anthropic API key 调用按 token 计费，无免费 tier

## Decision

**AI 调用放 Mac scraper 同进程，使用 `@anthropic-ai/claude-agent-sdk`，通过本机 Claude Code 的 OAuth 登录态走 Enterprise 订阅配额。API 账单 $0。**

## Options Considered

### Option A：Claude Agent SDK on Mac（采纳）
| 维度 | 评估 |
|---|---|
| 月成本 | **$0** |
| 延迟 | 本机调用，无网络往返开销 |
| 鉴权 | 复用 Claude Code OAuth |
| TOS | 灰区：SDK 设计用于本地 agent；非显式商业部署 |

**Pros：** 零成本；同进程少一跳；token 不过期
**Cons：** Mac 必须登录 Claude Code；TOS 不适合规模化；rate limit 是订阅级（demo 量不会碰到）

### Option B：Anthropic API key（claude-sonnet-4-5）
| 维度 | 评估 |
|---|---|
| 月成本 | ~$2（按 100 次诊断估）|
| 延迟 | HTTPS 一跳 |
| TOS | 明确合规 |

**Pros：** 合规、可部署任何环境
**Cons：** 突破 $0 预算

### Option C：Claude Haiku via API
**Pros：** $0.5/月
**Cons：** 日语报告质量下降；仍要 API key

### Option D：Gemini Flash 免费 tier
**Pros：** $0、合规
**Cons：** 不是 Claude；prompt 重写；日语报告语感不同

## Trade-off Analysis

- A vs B：A 省 $2/月。$2 对个人是无所谓，但本项目硬约束 $0 → A 胜
- A vs D：A 保留 Claude 报告质量；D 要换模型重调 prompt，工作量大
- A 的 TOS 灰区只在 demo 阶段成立，v1 必须切换到 B

## Consequences

- ✅ 月成本 $0
- ✅ 日语报告质量保持 Sonnet 水平
- ⚠️ TOS：Claude Agent SDK 设计用于本地 agent 自动化，包装成"为远程 Vercel 服务"用是灰区。仅供内部 demo，不可对外发布
- ⚠️ 单点：Mac 关机即 AI 不可用
- ⚠️ v1 必须切回 API key 部署模式

## Action Items
- [ ] 实现 `lib/ai/claude-agent.ts`，封装 SDK，对外暴露 `generate(snapshot, dims) → AIResult`
- [ ] 设 v1 切换分支点：在配置层切 `provider=local|api`，代码不变
