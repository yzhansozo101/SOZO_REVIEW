# SOZO Review · Docs

仕様 / 设计 / 决策记录的入口。实装时这里是 source of truth。

## ナビ

| 文件 | 役割 |
|---|---|
| [prd.md](prd.md) | 产品需求规格 (PRD)。功能 / 受入条件 / 边缘 case |
| [system-design.md](system-design.md) | 架构・模块树・DB schema・API 契约・主流程 |
| [user-flow.md](user-flow.md) | 用户主流程图（Mermaid） |
| [adr/](adr/) | 5 件 Architecture Decision Records (Vercel+Mac / fetch / Claude SDK / 同步 / 单 tool_use) |

## 注意

- 仕様の解釈で迷ったら上記が正。コードや prototype が衝突したら仕様優先
- 仕様自体を変更したい場合は必ずユーザー確認(详见 [CLAUDE.md](../CLAUDE.md) §3)
- 既存的 design handoff snapshot 在 [`design_handoff_review_app/spec/`](../design_handoff_review_app/spec/)、是 2026-05-27 时点的冻结副本，**不要更新它，更新 `docs/` 即可**
- 工程实装的阶段计划在 [`docs/superpowers/plans/`](superpowers/plans/)

## 版本说明

文件名故意 **不带 `v0.x`**。版本演进用 git 历史追踪。如需引用历史版本：

- 临时查看：`git log --follow docs/prd.md`
- 永久存档：把旧版复制到 `docs/archive/prd-v0.2.md`（目前没有）
