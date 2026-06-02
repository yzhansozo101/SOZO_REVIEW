# ADR-005：单次 Claude `tool_use` 输出三份产物

**Status:** Accepted
**Date:** 2026-05-27
**Deciders:** Yuan Zhang
**Related:** [PRD](../prd.md) · [System Design](../system-design.md) · [ADR-003](0003-claude-agent-sdk.md)

## Context

AI 需要产出三份内容：
1. 日语 markdown 报告（E）
2. B12 高频负面关键词数组
3. Top 3 改善案数组（结果页 Top3Priorities 组件使用；原文档曾提到 F1 邮件用途，该邮件已废止 — 见 [ADR-006](0006-remove-notification-emails.md)）

可以一次结构化输出 / 分多次调用。

## Decision

**一次 Claude 调用，用 tool_use 强制 schema 同时返回三份产物。**

## Options Considered

### Option A：单次 tool_use（采纳）
**Pros：** 一次往返；模型上下文统一；省时
**Cons：** Prompt 较长；schema 改动需双向调

### Option B：两次调用（B12 → 喂入 Report prompt）
**Pros：** 关注点分离；报告 prompt 能直接引用确切关键词
**Cons：** 延迟翻倍；token 用量基本同

### Option C：三次并发调用
**Pros：** 各模块独立，可替换
**Cons：** Top 3 应来自报告分析，独立调用一致性差；并发节省的时间被 AI 启动开销吃掉

## Trade-off Analysis

诊断主流程总时间预算紧，一次调用是延迟最优。schema 双向调成本一次性，可接受。

## Consequences

- ✅ AI 阶段 ~15s 而非 ~30s
- ⚠️ Tool schema 改动要同时调 `lib/ai/claude-agent.ts` 类型和 DB 写入字段映射
- ⚠️ 如果 AI 在结构化输出里某字段不达标（如 top3 只产了 2 条），需补救逻辑

## Action Items
- [ ] 在 `ai/prompts/tools.ts` 集中定义 schema，TS 类型从 schema 推导
- [ ] 加 schema 校验：tool_use 入参用 zod 二次验证，不通过 → fallback
