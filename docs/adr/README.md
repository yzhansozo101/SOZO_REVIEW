# Architecture Decision Records — SOZO Review

> 关联：[PRD](../prd.md) · [System Design](../system-design.md)
> 适用范围：demo 阶段（v0 ~ v1）。规模化部署需重审全部决策。

每条 ADR 独立可读，使用 [Michael Nygard 格式](https://github.com/joelparkerhenderson/architecture-decision-record/blob/main/locales/en/templates/decision-record-template-by-michael-nygard/index.md)。`Status` 用 **Accepted** 表示当前实施依据；后续如废弃会标 `Superseded by ADR-N`。

## 索引

| ID | 决策 | Status |
|---|---|---|
| [ADR-001](0001-vercel-mac-split.md) | 混合部署 — Vercel Hobby + Mac 本地服务 | Accepted |
| [ADR-002](0002-no-playwright.md) | 抓取改用 Fetch + JSON 解析，弃用 Playwright | Accepted |
| [ADR-003](0003-claude-agent-sdk.md) | AI 走本地 Claude Agent SDK，不用 Anthropic API key | Accepted |
| [ADR-004](0004-synchronous-flow.md) | 同步诊断流，不用作业队列 | Accepted |
| [ADR-005](0005-single-tool-use.md) | 单次 Claude `tool_use` 输出三份产物 | Accepted |

## 待来日重审的决策

不写 ADR 但需要 v1 重审：

| 决策 | 触发重审的条件 |
|---|---|
| Drizzle vs Prisma | 团队扩大、有人主推 Prisma |
| JSONB `dimensions` | 需要按维度做 SQL 聚合查询 |
| C1 mock 数据 | 真实历史评分数据可获得 |
| F7 无定时器 | 用户要求真正的"每周一自动发"|
| Resend | 月邮件量 > 3000，或要发到 SOZONEXT 真实运营邮箱 |
| 不用 Sentry | 生产用户量 > 10 |

## 新增 ADR 的步骤

1. 复制最新一个 ADR 文件，命名为 `NNNN-kebab-case-title.md`（编号递增）
2. 填写 `Status` / `Date` / `Deciders` / `Related` frontmatter
3. 内容遵循：Context → Decision → Options Considered → Trade-off Analysis → Consequences → Action Items
4. 本文件索引表追加一行
5. 如果新 ADR 替代旧 ADR，在旧 ADR 顶部加 `Superseded by ADR-NNNN`
