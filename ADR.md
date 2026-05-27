# Architecture Decision Records — SOZO_REVIEW

> 关联：`SPEC_房源诊断系统_需求v0.4.md` · `SYSTEM_DESIGN_v0.2.md`
> 适用范围：demo 阶段（v0 ~ v1）。规模化部署需重审本文件全部决策。

每条 ADR 独立可读。状态用 **Accepted** 表示当前实施依据；后续如废弃会标 Superseded by ADR-N。

---

## ADR-001：混合部署 — Vercel Hobby + Mac 本地服务

**Status:** Accepted
**Date:** 2026-05-27
**Deciders:** Yuan Zhang

### Context

demo 阶段需求：
- 月成本目标 $0
- 老板能拿到一个 URL 自己点（不能只屏幕共享）
- 诊断流程涉及外部网页抓取 + AI 调用，可能 20-30s

约束矩阵：
- Vercel Hobby：函数 60s 上限、daily-only cron、$0
- Vercel Pro：60s 上限、灵活 cron、$20/月
- Railway/Render：无超时限制、$5-10/月
- 纯本地：演示要求屏幕共享，体验差

### Decision

**Vercel Hobby 部署 Next.js（前端 + 短任务 API），Mac 本地常驻一个 Node 服务承担"重活"（抓取 + AI），通过 Cloudflare Tunnel 暴露固定 HTTPS URL，Vercel 调它。**

### Options Considered

#### Option A：Vercel Hobby + Mac（采纳）
| 维度 | 评估 |
|---|---|
| 复杂度 | 中（多了一个本地服务和 tunnel） |
| 月成本 | **$0** |
| 可用性 | Mac 必须开机；演示前 checklist 可控 |
| 体验 | 用户拿到公网 URL 自己点 |
| 工程量 | 低（Mac 端纯 Node、不打包） |

**Pros：** 零成本；老板可自助点；Mac 端无超时限制
**Cons：** Mac 关机/睡眠/断网整套不可用；演示前必检

#### Option B：纯 Vercel Pro（$22/月）
| 维度 | 评估 |
|---|---|
| 复杂度 | 高（chromium 瘦身、cron 粒度绕过） |
| 月成本 | $20–22 |
| 工程量 | 高 |

**Cons：** 突破 $0 预算；为了 demo 一次性演示不划算

#### Option C：Railway/Render ($5-10/月)
**Pros：** 单一节点、无超时、cron 直接 node-cron
**Cons：** 仍要花钱；Playwright 装机本来也想节省（见 ADR-002 后已不再是优势）

#### Option D：纯本地 pnpm dev
**Pros：** $0、最简单
**Cons：** 老板拿不到 URL，必须屏幕共享演示

### Trade-off Analysis

- **A vs B**：A 省 $22/月，代价是 Mac 必须在线。demo 阶段使用频率低（每周 1-2 次演示），Mac 可控；上量后再迁
- **A vs C**：A 省 $5-10/月，代价同上。C 的优势主要在 Playwright 友好（不需要 sparticuz chromium），但 ADR-002 决定不用 Playwright 后，C 的优势缩水到只剩"Mac 不必开机"
- **A vs D**：A 提供公网可访问性，符合"老板自己点链接"的需求

### Consequences

- ✅ 月成本 $0
- ✅ Mac 端可自由用任何依赖（无 Vercel 包体限制）
- ⚠️ Demo 前必须确认：Mac 醒着、CF Tunnel 在跑、`SCRAPER_URL` 配置正确
- ⚠️ 不适合规模化：Mac 是单点故障 + 单点性能瓶颈。v1 阶段如果用户量 > 团队内部，应迁移到 Railway / 自有 VPS

### Action Items
- [ ] Mac 装 `caffeinate -d` 或调电源选项防睡眠
- [ ] Cloudflare Tunnel 配固定域名（`cloudflared tunnel create sozo-scraper`）
- [ ] 设演示前 checklist 文档

---

## ADR-002：抓取改用 Fetch + JSON 解析，弃用 Playwright

**Status:** Accepted
**Date:** 2026-05-27
**Deciders:** Yuan Zhang
**Supersedes:** SYSTEM_DESIGN_v0.1 中"Mac 跑 Playwright"方案

### Context

原计划用 Playwright headless chromium 渲染 Airbnb 房源页抓数据。实测发现 Airbnb 把所有需要的字段都 SSR 进 HTML 内联的 `<script id="data-deferred-state-0">` JSON 块里：

- 92 张照片 + 房间分类（roomTourLayoutInfos）
- 12 组设施
- 6 维度子评分（清潔さ / コミュニケーション / …）
- 10 个评论标签 + 数量
- highlights、house rules、坐标、address

只有"逐条评论文本"需要单独调 GraphQL（`/api/v3/StaysPdpReviewsQuery`），仍是 fetch，不需要浏览器。

### Decision

**Mac 端用 `fetch` + JSON 解析；不安装 Playwright / 任何 headless 浏览器。**

### Options Considered

#### Option A：Fetch + 解析 data-deferred-state-0（采纳）
| 维度 | 评估 |
|---|---|
| 依赖大小 | ~50MB（pure Node + cheerio/regex）|
| 内存 | ~100MB |
| 单次 scrape 耗时 | 2-5s |
| 反爬风险 | 中（无指纹规避） |

**Pros：** 极简、快、Mac 资源占用小、易维护
**Cons：** Airbnb 改 SSR 结构 → 全断（要监控解析失败率）

#### Option B：Playwright headless
| 维度 | 评估 |
|---|---|
| 依赖大小 | ~300MB（chromium） |
| 内存 | ~500MB（chromium 常驻） |
| 单次 scrape 耗时 | 15-20s（含浏览器启动） |
| 反爬风险 | 低（playwright-stealth 等可加） |

**Pros：** 抗反爬更强；JS 渲染兜底；可截图
**Cons：** 重；启动慢；Mac 资源开销大；本任务不需要 JS 渲染

### Trade-off Analysis

实测确认所需数据 100% 在 SSR HTML 内，Playwright 的"渲染能力"对本应用零增量价值，反而牺牲性能和复杂度。

### Consequences

- ✅ Mac 端可以是任何 ~100MB 的 Node 进程
- ✅ Scrape 延迟从 ~20s 降到 ~5s（包括评论 GraphQL）
- ✅ 整个诊断时间预算从 60s 接近上限 → 25s 宽裕
- ⚠️ Airbnb 改结构后立即失效：需在 Mac 端加"解析失败率"监控；失败到一定阈值告警
- ⚠️ Airbnb 反爬升级（UA/cookie 验证）即破：本 ADR 不预防，"反了再加"

### Action Items
- [ ] Mac scraper 用 `pino` 记录每次 fetch 的解析成功/失败
- [ ] 关键 JSON 路径在 `parse-deferred.ts` 用常量列举，便于结构变化时一处改

---

## ADR-003：AI 走本地 Claude Agent SDK，不用 Anthropic API key

**Status:** Accepted
**Date:** 2026-05-27
**Deciders:** Yuan Zhang

### Context

需要 Claude 做两件事：
1. 生成日语诊断报告（含 Top 3 改善案）
2. 从评论里抽取高频负面关键词（B12）

约束：
- 月成本目标 $0
- 用户本机有 Claude Code Enterprise 订阅
- Anthropic API key 调用按 token 计费，无免费 tier

### Decision

**AI 调用放 Mac scraper 同进程，使用 `@anthropic-ai/claude-agent-sdk`，通过本机 Claude Code 的 OAuth 登录态走 Enterprise 订阅配额。API 账单 $0。**

### Options Considered

#### Option A：Claude Agent SDK on Mac（采纳）
| 维度 | 评估 |
|---|---|
| 月成本 | **$0** |
| 延迟 | 本机调用，无网络往返开销 |
| 鉴权 | 复用 Claude Code OAuth |
| TOS | 灰区：SDK 设计用于本地 agent；非显式商业部署 |

**Pros：** 零成本；同进程少一跳；token 不过期
**Cons：** Mac 必须登录 Claude Code；TOS 不适合规模化；rate limit 是订阅级（demo 量不会碰到）

#### Option B：Anthropic API key（claude-sonnet-4-5）
| 维度 | 评估 |
|---|---|
| 月成本 | ~$2（按 100 次诊断估）|
| 延迟 | HTTPS 一跳 |
| TOS | 明确合规 |

**Pros：** 合规、可部署任何环境
**Cons：** 突破 $0 预算

#### Option C：Claude Haiku via API
**Pros：** $0.5/月
**Cons：** 日语报告质量下降；仍要 API key

#### Option D：Gemini Flash 免费 tier
**Pros：** $0、合规
**Cons：** 不是 Claude；prompt 重写；日语报告语感不同

### Trade-off Analysis

- A vs B：A 省 $2/月。$2 对个人是无所谓，但本项目硬约束 $0 → A 胜
- A vs D：A 保留 Claude 报告质量；D 要换模型重调 prompt，工作量大
- A 的 TOS 灰区只在 demo 阶段成立，v1 必须切换到 B

### Consequences

- ✅ 月成本 $0
- ✅ 日语报告质量保持 Sonnet 水平
- ⚠️ TOS：Claude Agent SDK 设计用于本地 agent 自动化，包装成"为远程 Vercel 服务"用是灰区。仅供内部 demo，不可对外发布
- ⚠️ 单点：Mac 关机即 AI 不可用
- ⚠️ v1 必须切回 API key 部署模式

### Action Items
- [ ] 实现 `lib/ai/claude-agent.ts`，封装 SDK，对外暴露 `generate(snapshot, dims) → AIResult`
- [ ] 设 v1 切换分支点：在配置层切 `provider=local|api`，代码不变

---

## ADR-004：同步诊断流，不用作业队列

**Status:** Accepted
**Date:** 2026-05-27
**Deciders:** Yuan Zhang

### Context

诊断流程：scrape (5s) + score (<1s) + AI (15s) ≈ 20-25s。

可选模式：
- **同步**：POST 阻塞到完成，前端转圈 + 文案模拟进度
- **异步**：POST 返 job_id，前端轮询/SSE 拿进度

### Decision

**同步：`POST /api/diagnose` 阻塞返回结果。**

### Options Considered

#### Option A：同步（采纳）
| 维度 | 评估 |
|---|---|
| 代码复杂度 | 极低 |
| 用户体验 | 转圈 ~25s |
| 失败恢复 | 简单（前端报错重试） |

**Pros：** 一条线性代码，无 job table、无 worker、无重试逻辑
**Cons：** 用户必须在页面等；Vercel 60s 是硬上限，无 buffer

#### Option B：异步 job + SSE 推进度
| 维度 | 评估 |
|---|---|
| 代码复杂度 | 高（job table、worker、连接管理）|
| 用户体验 | 可显示"抓取中→分析中→生成报告"真实阶段 |
| 失败恢复 | 复杂 |

**Pros：** 体验好；不受单次超时限制
**Cons：** 工程量翻倍；demo 量级无价值

### Trade-off Analysis

25s 同步在 Hobby 60s 上限内余量 35s，安全。SSE 的体验提升对一次性 demo 不值这个复杂度。

### Consequences

- ✅ 代码量小，DB 不需要 `jobs` 表
- ⚠️ 如果 Airbnb 慢或 AI 慢导致超 60s，请求被 Vercel 截断 → 前端显示 504。降级方案：DB 已记录失败标记 row，前端可让用户"查看上次的失败"
- ⚠️ 未来如要支持批量诊断（多个 URL 一起跑），必须改异步

### Action Items
- [ ] Mac 端设 45s 内部 timeout，主动 abort 让 Vercel 有 15s 处理
- [ ] 前端 loading 文案做时序模拟（"取得中" → "分析中" → "レポート生成中"），用户感知不是"卡住"

---

## ADR-005：单次 Claude `tool_use` 输出三份产物

**Status:** Accepted
**Date:** 2026-05-27
**Deciders:** Yuan Zhang

### Context

AI 需要产出三份内容：
1. 日语 markdown 报告（E）
2. B12 高频负面关键词数组
3. Top 3 改善案数组（F1 邮件需要）

可以一次结构化输出 / 分多次调用。

### Decision

**一次 Claude 调用，用 tool_use 强制 schema 同时返回三份产物。**

### Options Considered

#### Option A：单次 tool_use（采纳）
**Pros：** 一次往返；模型上下文统一；省时
**Cons：** Prompt 较长；schema 改动需双向调

#### Option B：两次调用（B12 → 喂入 Report prompt）
**Pros：** 关注点分离；报告 prompt 能直接引用确切关键词
**Cons：** 延迟翻倍；token 用量基本同

#### Option C：三次并发调用
**Pros：** 各模块独立，可替换
**Cons：** Top 3 应来自报告分析，独立调用一致性差；并发节省的时间被 AI 启动开销吃掉

### Trade-off Analysis

诊断主流程总时间预算紧，一次调用是延迟最优。schema 双向调成本一次性，可接受。

### Consequences

- ✅ AI 阶段 ~15s 而非 ~30s
- ⚠️ Tool schema 改动要同时调 `lib/ai/claude-agent.ts` 类型和 DB 写入字段映射
- ⚠️ 如果 AI 在结构化输出里某字段不达标（如 top3 只产了 2 条），需补救逻辑

### Action Items
- [ ] 在 `ai/prompts/tools.ts` 集中定义 schema，TS 类型从 schema 推导
- [ ] 加 schema 校验：tool_use 入参用 zod 二次验证，不通过 → fallback

---

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
