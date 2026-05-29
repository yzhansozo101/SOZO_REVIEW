# 把 F1/F7 通知 UI 换成 SOZONEXT 营销 CTA

**日期**：2026-05-29
**状态**：已批准（待写实施计划）
**分支**：`feature/notification`
**作者**：Brainstorming 会话（Claude 主持）

---

## 问题

结果页"05 通知"区域当前展示 F1 アラートメール发送状态 + 3 个按钮（アラート预览 / 週次サマリー预览 / 週次サマリー手动测试发送）。对 demo 受众（老板 + 内部用户）来说，这块 UI 价值不高：既没帮用户理解他们的 listing，也没驱动任何商业结果。

而 demo 的目标受众（拿到低分的民泊 host）正是 SOZONEXT 现有"宿泊施設運営・集客支援"业务线的理想客户画像（ICP）。诊断结果页是整个产品里**用户意图最高**的页面（用户刚被告知自己的 listing 有问题），但目前没有任何转化路径。

## 目标

把"05 通知"区域换成一个营销 CTA 卡片，把流量引到 SOZONEXT 的民泊代运营业务。同时彻底删除现在没人用的 F1/F7 邮件后端和配套代码。

## 不做（Non-goals）

- 不做 CTA 文案的 A/B 测试基础设施
- 不做点击/转化埋点（如有需要后续 PR 单独做）
- 不做多语言 CTA（仅日文 —— 与产品其他界面一致）
- 不在首页 / 其他页面放 CTA（限于结果页底部）
- 不做 drop `alerts_sent` Postgres 表的 migration（保留为 dead schema，以后再说）

---

## 已决定的事项

| 问题 | 决定 |
|---|---|
| CTA 什么时候显示？ | 总是显示，不看 score |
| 文案是否随 grade 变化？ | 否 —— 单一文案 |
| 联系渠道 | 邮件 + 电话 + 官网 |
| 视觉风格 | 「A. 白卡 + Navy 重点」——与现有 report card 同语言 |
| Section 标签 | `05 サポート`（替换原 `05 通知`）|
| 后端 F1/F7 归宿 | 全删（模板、发送代码、测试 endpoint、EmailPreview、相关测试）|
| `alerts_sent` 表 | DB 表保留；从 `lib/db/schema.ts` export 中移除 |
| Resend 依赖 | 移除；package + env vars 一并删 |

---

## 新组件：`components/SupportCta.tsx`

纯 server component，无 props，无客户端交互。文案全部硬编码。

### 视觉结构

```
┌─────────────────────────────────────────────────────────┐
│  ⬤ (navy 圆形 icon)   もっと結果を出しませんか？        │
│                        ──────                            │
│                        SOZONEXT は民泊運営代行の        │
│                        専門会社。リスティング改善から    │
│                        運営代行・収益コンサルまで        │
│                        一括サポートします。              │
│                                                          │
│  ──────────────────────────────                         │
│                                                          │
│  ✓ リスティング最適化代行                                │
│      写真・タイトル・紹介文を SOZONEXT が制作           │
│  ✓ 24h 運営代行                                          │
│      ゲスト対応・清掃・チェックイン代行                  │
│  ✓ 収益改善コンサル                                      │
│      価格戦略・RevPAR 改善・複数物件運用                 │
│                                                          │
│  ──────────────────────────────                         │
│                                                          │
│  ┌─────────────────────────────────┐                    │
│  │ minpaku_info@sozonext.com  →   │   📞 03-3842-1552   │
│  │  にメール相談する               │   🌐 sozonext.com → │
│  └─────────────────────────────────┘                    │
└─────────────────────────────────────────────────────────┘
```

### 布局

```
.support-cta（白卡 + shadow + var(--r-lg)）
├── header（flex row）
│   ├── 28×28 navy icon 圆（home SVG）
│   └── 标题 + 描述（h3 + p）
├── divider
├── bullets 网格（3 行 × {checkmark, title, caption}）
├── divider
└── 联系信息行（flex）
    ├── 邮件按钮（navy primary CTA）
    └── 次要联系（电话 + 官网，竖排）
```

### 文案（日文，冻结）

**标题**：`もっと結果を出しませんか？`

**描述**：
> SOZONEXT は民泊運営代行の専門会社。リスティング改善から運営代行・収益コンサルまで一括サポートします。

**Bullets**：
1. `リスティング最適化代行` — `写真・タイトル・紹介文を SOZONEXT が制作`
2. `24h 運営代行` — `ゲスト対応・清掃・チェックイン代行`
3. `収益改善コンサル` — `価格戦略・RevPAR 改善・複数物件運用`

**邮件按钮文案**：`minpaku_info@sozonext.com にメール相談する →`

**电话标签**：`📞 03-3842-1552`（图标用 SVG，不要 emoji）

**官网标签**：`🌐 sozonext.com →`（图标用 SVG）

### 联系信息

| 渠道 | 值 | Link |
|---|---|---|
| 邮件 | `minpaku_info@sozonext.com` | `mailto:minpaku_info@sozonext.com?subject=リスティング改善のご相談&body=SOZONEXT Review で診断後、より良い結果のためご相談したく連絡いたしました。%0A%0A物件 URL:%0A%0Aご質問・ご要望:%0A` |
| 电话 | `03-3842-1552` | `tel:+81338421552`（国际格式 —— 对各手机拨号器最兼容）|
| 官网 | `https://sozonext.com` | `https://sozonext.com`（`target="_blank"`、`rel="noopener noreferrer"`）|

### 设计 tokens

- 卡片：`background: var(--card)`、`border: 1px solid var(--ink-100)`、`borderRadius: var(--r-lg)`、`padding: var(--s-6)`、`boxShadow: var(--shadow-card)`
- Icon 圆：28×28、`background: var(--sozonext-navy)`、内含白色 SVG
- 标题（h3）：`fontSize: 20px`、`fontWeight: 600`、`color: var(--ink-900)`
- 描述（p）：`fontSize: 14.5px`、`color: var(--ink-600)`、`lineHeight: 1.6`
- Bullet checkmark：22×22 圆、`background: var(--grade-a)`、内含白色 SVG checkmark
- Bullet 标题：`fontSize: 14.5px`、`fontWeight: 600`、`color: var(--ink-800)`
- Bullet caption：`fontSize: 13px`、`color: var(--ink-500)`
- 邮件按钮：navy primary CTA（复用 `.btn-primary` class，hover → `var(--sozonext-navy-700)`）
- 次要联系：`fontSize: 13.5px`、`color: var(--ink-700)`、icon 用 `var(--sozonext-navy)`
- Dividers：`borderTop: 1px solid var(--ink-100)`
- 响应式：联系信息行在 640px 以下竖排

### A11y

- 所有 icon SVG 都加 `aria-hidden="true"`
- 邮件按钮是 `<a>` 不是 `<button>`（语义正确 —— 它是个链接）
- 电话链接用 `tel:` URI，移动端可一键拨号
- 官网链接加 `rel="noopener noreferrer"` 和 `target="_blank"`
- Tab 顺序：邮件按钮 → 电话 → 官网（自左到右、自上到下）
- 颜色对比：所有前景/背景对都验证过 ≥ 4.5:1

---

## 结果页接入

`app/d/[id]/page.tsx`：

- 把 `<AlertBar>` 的 import + 渲染换成 `<SupportCta />`
- 移除 `alerts_sent` 查询（DB 调用，约 108–114 行）
- 移除 `alert` 变量 和 `alertEmailTo` 派生
- Section 外壳不动：`<section style={{ display: "grid", gap: "var(--s-3)" }}>` + `<SectionLabel n="05" title="サポート" />` + `<SupportCta />`

---

## 后端删除

### 删除的文件

```
app/api/diagnose/route.ts          # F1 发送块（约 64–98 行）移除；其余不动
app/api/weekly/test/route.ts       # 整个文件删
app/api/weekly/                    # 父目录删（已空）
lib/email/alert.tsx                # F1AlertEmail 模板
lib/email/weekly.tsx                # F7WeeklyEmail 模板
lib/email/resend.ts                 # Resend client wrapper（不再用）
lib/email/                         # 父目录删（已空）
components/AlertBar.tsx
components/EmailPreview.tsx
tests/AlertBar.test.tsx
tests/EmailPreview.test.tsx
tests/email-alert.test.ts
tests/email-weekly.test.ts
```

### 修改的文件

- `app/api/diagnose/route.ts` — 删除 F1 发送分支（`if (score < 60 && !alertSentRows.length)` 那一块）和相关 import（`F1AlertEmail`、`alertsSent`）
- `app/d/[id]/page.tsx` — 见上
- `tests/api-diagnose.test.ts` — 删除 F1 发送相关的断言；其余诊断路径断言保留
- `lib/db/schema.ts` — 移除 `alertsSent` export（表本身留在 Neon）

### Schema migration

**不提交 migration**。`alerts_sent` 表保留在 Neon 里成为 dead schema。在 `lib/db/schema.ts` 原 export 位置加一行代码注释：`// alertsSent table dropped from schema export 2026-05-29 (notification system removed). Table still exists in DB.`

### Package + env 清理

- `package.json` — 删除 `"resend": "^6.12.4"`。如果 `"@react-email/components": "^1.0.12"` 只被 F1/F7 模板用到，也删（删之前要 grep 确认没其他用户）。
- `.env.example` — 删除 `RESEND_API_KEY` 和 `ALERT_EMAIL_TO` 两行。
- Vercel 环境变量：在 PR 描述里告知 ops 人工删除。

---

## 测试

### 删除

- `tests/AlertBar.test.tsx`
- `tests/EmailPreview.test.tsx`
- `tests/email-alert.test.ts`
- `tests/email-weekly.test.ts`
- `tests/api-diagnose.test.ts` 里的 F1 相关断言

### 新增

`tests/SupportCta.test.tsx`：

1. 渲染包含全部 3 条 service bullets（文本匹配）
2. 邮件按钮 `href` 以 `mailto:minpaku_info@sozonext.com` 开头且包含 `subject=`
3. 电话链接 `href="tel:+81338421552"`
4. 官网链接 `href="https://sozonext.com"`、`target="_blank"`、`rel="noopener noreferrer"`
5. 所有 icon SVG 都有 `aria-hidden="true"`
6. 邮件按钮的 class / inline style 匹配 navy primary CTA pattern（参考 PdfDownloadButton 的测试 pattern）

### 修改

- `tests/api-diagnose.test.ts`：删除 F1 发送断言；保留 URL 校验、缓存命中、diagnose 调用、DB insert、响应 shape 的覆盖

---

## 文档更新

### `CLAUDE.md`

- §4 技术栈表：删除 Resend 那一行
- §6 v0.4 デルタ #5（F7 週次サマリー）：改写描述 SupportCta；或者整条删
- §10 demo 成功标准：把 #4 + #5 合并替换为：`4. 結果ページ最下部に「SOZONEXT サポート」カードが表示され、メール/電話/URL リンクがクリック可能`
- §11 守る：删掉关于 `ALERT_EMAIL_TO` 测试地址那一行
- §11 やらない：F7 真の定時送信 那一行可移除（无意义了）
- §12 演示前 checklist：从 env var 列表删 `RESEND_API_KEY` / `ALERT_EMAIL_TO`

### `docs/prd.md`

- 删除 F1（アラートメール）和 F7（週次サマリー）功能段
- 新增功能条目 `F8 SOZONEXT サポート CTA`（引用本 spec）
- 更新 demo flow / 验收标准对齐 CLAUDE.md §10

### `docs/system-design.md`

- §6 主流程：删步骤 6（F1 发送）和 `alerts_sent` insert
- 删除邮件流架构段
- DB schema 图：把 `alerts_sent` 标记 deprecated 或删除

### `docs/system-design-geo.md`

- 应不受影响（GEO 文档不涉及邮件行为）。关 PR 前先 grep 验证。

### `docs/adr/`

- 新增 `ADR-006-remove-f1-f7-emails-for-marketing-cta.md`：记录背景、决定、影响。简短，1 页。

---

## 执行方式

- **本 spec 的实施由 Claude 执行**（走 superpowers 流程）：先生成 implementation plan，然后 task-by-task 落代码、跑测试、出 PR
- 关键约束（per `.claude/rules/never-inline-secrets.md`）：plan / 代码 / commit 文案里**绝对不能出现真实 secret 值**。本次涉及到的 `RESEND_API_KEY`、`ALERT_EMAIL_TO` 都是被删除的，应该不会出现 placeholder 需求

---

## 范围外（后续工作）

- 埋点：CTA 点击（邮件 / 电话 / 官网）的转化跟踪 —— 等需要量化的时候再说
- A/B 测试 CTA 文案变体
- 多语言（EN / ZH）CTA 变体
- 首页 hero 区域也放 CTA
- 真把 `alerts_sent` 表 drop 掉（价值低，无限期推迟）

---

## 实施备忘

- **`@react-email/components` 删除**：从 `package.json` 删之前，grep 一下 `lib/email/` 之外是否还有用到。如果有别的代码用它，保留依赖。
- **Vercel env vars**：PR merge 后，需要人工到 Vercel 项目设置里删 `RESEND_API_KEY` 和 `ALERT_EMAIL_TO`。不阻塞 merge。
