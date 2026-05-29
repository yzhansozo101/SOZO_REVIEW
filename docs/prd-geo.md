# PRD: GEO 增强 — SOZONEXT Review

> **本文档只描述「产品想做什么、用户/老板看到什么、什么算成功」。具体实现（文件结构、字段名、API 选型）由实现方决定。**
>
> 版本：v0.1 · 日期：2026-05-29 · 作者：Yuan Zhang · 状态：待评审
>
> **配套主文档**：[`prd.md`](prd.md) 主产品 PRD · [`system-design.md`](system-design.md) 系统设计 · [`adr/`](adr/) 决策记录
>
> **范围**：本 PRD 是 [`prd.md`](prd.md) 的**功能增量**，不替换主 PRD。

---

## 1. Problem Statement

SOZONEXT Review 已经上线在 `https://sozonext-review.vercel.app/`，但目前**任何 AI 搜索引擎都不知道它的存在**：

- 在 ChatGPT / Claude / Perplexity / Google AI Overview 里搜 "SOZONEXT review"、"airbnb 房源诊断 工具"、"民泊 健康診断 ツール" 等关键词，**0 命中**
- 站点首页除了 "URL を入力してください" 这一行，**没有任何产品介绍**，AI 爬虫即使爬到也读不出"这是个什么工具"
- 站点没有提交给任何搜索引擎，AI 索引数据里没有本站的 footprint

**影响**：
- **老板**：没法在 demo 时演示"AI 知道我们的产品"——这是 demo phase 的关键说服点之一
- **潜在用户**（民泊运营者）：通过 AI 助手寻找类似工具时无法发现 SOZONEXT
- **品牌**：SOZONEXT 这个公司名在 AI 训练数据中近乎不存在；未来想做内容营销也是从 0 起步

---

## 2. Goals

按重要度排序：

1. **老板能用 3 个准备好的关键词在 Perplexity / ChatGPT 演示出"AI 搜到本站"**（demo phase 内，ship 完 1-3 天内）
2. **核心 AI 爬虫（GPTBot、ClaudeBot、PerplexityBot、Google-Extended 等）可以正常访问本站，且能读取到 SOZONEXT 的产品介绍**
3. **品牌词 "SOZONEXT" 在 Bing 检索结果第 1 位**（Perplexity / ChatGPT-browse 的搜索后端是 Bing，这是命中的物理前提）
4. **AI 助手被问到"airbnb 诊断工具"或"民泊运营工具"时，本站有可能被引用为答案的一部分**（不强求命中，但能命中就是赢）
5. **保护用户隐私**：用户的具体诊断结果页 `/d/[id]` 不该被任何 AI 爬虫或搜索引擎索引

---

## 3. Non-Goals

明确不做（防止 scope creep）：

| 不做 | 原因 |
|---|---|
| **传统 SEO 优化**（Google 排名战） | demo phase 重点是 AI 引擎不是传统 search。GEO 的副产品会带一些 SEO，足够 |
| **内容营销（博客 / 文章 / 案例）** | 用户明确说"文章这些我会之后添加"。本期只铺基础设施 |
| **付费推广 / Google Ads / 行业广告投放** | $0 月成本约束（参见 [ADR-001](adr/0001-vercel-mac-split.md)） |
| **自定义域名** | demo phase 不 commit。`vercel.app` 子域足够支持品牌词搜索。等真上量再买 |
| **多语言完整 UI** | 产品 UI 保持 JA（与 [`prd.md`](prd.md) v0.4 一致）。GEO 只在站点内嵌入少量 ZH/EN brand snippet 让 AI 跨语言识别 |
| **用户分析（GA / Mixpanel）** | demo 阶段不需要数据决策 |
| **AI 引擎对接 API**（让本站主动 push 内容到 AI） | OpenAI / Anthropic / Perplexity 没有这种 API。GEO 只能是 pull-based |

---

## 4. Target Users

| 角色 | 与本期 GEO 的关系 |
|---|---|
| **老板**（demo 主要观众） | demo 时用 AI 搜索验证"我们的产品 AI 找得到"。**最重要的用户** |
| **民泊运营者 / Airbnb host**（潜在用户） | 在 AI 助手里问"如何提升 Airbnb 评分"、"民泊检诊工具"等问题时，可能被引导到本站 |
| **AI 爬虫**（非人类，但要伺候好） | GPTBot / ClaudeBot / PerplexityBot 等。要让它们能进、能读、能识别站点价值 |
| **SOZONEXT 内部成员**（间接） | 工程 / 销售对外讲 SOZONEXT 时，AI 助手有点"内容"可参考 |

---

## 5. User Stories

按 priority 排序：

### 老板（demo 用）

- 作为老板，我希望在 Perplexity 输入 `SOZONEXT review` 时，**第一条结果就是我们的站**，这样我能在 demo 里直接展示"AI 知道我们"
- 作为老板，我希望在 ChatGPT 问 `What is SOZONEXT?` 时，**ChatGPT 的回答里提到我们的工具**，这样我能演示"AI 已经理解我们的产品"
- 作为老板，我希望有一份**「演示话术 + 验证步骤」**文档，照着演就 OK，不用临场背
- 作为老板，我希望即使 AI 还没完全索引完，也能用 `curl + AI User-Agent` 这种**"备份演示"** 直接证明"爬虫能访问、schema 也都对"，万无一失

### 民泊运营者（外部潜在用户）

- 作为想优化 Airbnb 房源的运营者，我希望在 ChatGPT 问"如何提升民泊评分"时，**AI 回答里能提到 SOZONEXT 这个工具**作为推荐之一
- 作为运营者，当我点进 SOZONEXT 主页，希望**一眼看出这是个什么工具**（不只看到一个空表单）

### AI 爬虫（不是人，但要服务好）

- 作为 GPTBot / ClaudeBot / PerplexityBot，我希望能**正常访问网站所有公开页面**，不被 robots.txt 阻拦
- 作为 AI 爬虫，我希望能**一次性读到产品的概要**（不用爬遍所有页面），节省爬取成本
- 作为 AI 爬虫，我希望网站**显式标注哪些页面不该索引**（用户的私域诊断结果），这样我不会引用到用户的隐私数据

### 用户（保护隐私）

- 作为已经做过诊断的用户，我希望我的具体诊断结果 URL **不会出现在 AI 搜索结果里**，这是隐私保护

---

## 6. Requirements

### Must-Have (P0) — Demo 不可缺

| ID | Requirement | Acceptance Criteria |
|---|---|---|
| **R1** | 站点对核心 AI 爬虫开放 | GPTBot / ChatGPT-User / OAI-SearchBot / ClaudeBot / Claude-Web / PerplexityBot / Perplexity-User / Google-Extended / Applebot-Extended 都可以正常访问首页并拿到 200 + 完整 HTML |
| **R2** | 用户诊断结果页（`/d/[id]`）对所有爬虫禁止 | 用任何 AI/搜索爬虫 UA 模拟访问 `/d/任意id`，应明确拿到"不要索引"的信号 |
| **R3** | 站点提供机器可读的产品介绍 | AI 助手可以一次性拿到一份"这站是什么、做什么、品牌是 SOZONEXT"的简洁说明，**不用爬全站** |
| **R4** | 首页包含足够的产品介绍文字 | 首页除表单外，包含 hero 介绍、使用步骤、关于 SOZONEXT 的说明。整页有意义的文字 ≥ 200 字 |
| **R5** | 多语言品牌识别 | 站点内 SOZONEXT 品牌名 + 简短描述在 JA / ZH / EN 三种语言都至少出现一次 |
| **R6** | 站点向 Bing 提交验证完成 | Bing Webmaster Tools dashboard 显示 verify = success（Perplexity / ChatGPT-browse 后端用 Bing） |
| **R7** | 站点的索引地图（sitemap）已提交给 Bing | Bing 收到 sitemap 提交，pages discovered ≥ 1 |
| **R8** | 老板有一份「演示话术」文档 | 包含：3 个准备好的关键词、用什么 AI 工具（Perplexity / ChatGPT）、预期看到什么、**备份演示路径**（万一 AI 还没索引完） |

### Nice-to-Have (P1) — 命中率优化

| ID | Requirement | 备注 |
|---|---|---|
| **R9** | 结构化元数据（schema）覆盖品牌 + 产品 + 网站三个维度 | 让 AI 搜索结果展示更丰富时占便宜 |
| **R10** | 多语 sitemap / 多语 page metadata（hreflang） | 提升 ZH / EN 用户的命中概率 |
| **R11** | 提交 Google Search Console | Google AI Overview 的索引前提（可选，因为重点不是 Google） |
| **R12** | Open Graph + Twitter Card | 任何人贴本站链接到 Slack / Twitter 时显示得像个正经产品（不影响 AI 索引，影响人类观感） |

### Future Considerations (P2) — 之后才做

| ID | Requirement | 触发条件 |
|---|---|---|
| **R13** | 内容铺设：FAQ / 文章 / 案例 | 用户明说"晚点加"。等 demo 通过、决定继续投入后 |
| **R14** | 自定义域名（`sozonext-review.com` 等） | demo 完成后，如果决定长期投入 |
| **R15** | 外部品牌曝光：公司主页链接 / LinkedIn / 业界文章引用 | 真正想冲 ChatGPT 原生训练数据级引用时 |
| **R16** | 多语言完整 UI | 业务扩展到非日文用户时 |
| **R17** | AI 引用监控（专门 dashboard 看哪些 AI 何时引用了本站） | 长期运营才需要 |

---

## 7. Success Metrics

### Demo Success（最关键，ship 完 1-3 天内）

- ✅ **老板演示验证**：用准备好的 3 个关键词在 Perplexity / ChatGPT 实际操作，**至少 2 个关键词命中本站**
- ✅ **备份演示**：用 `curl + GPTBot UA` 演示给老板看"AI 爬虫能正常进站"，schema validator / Rich Results Test 截图都通过

### Leading Indicators（1 天内可观察）

- **Bing 验证完成** = success
- **Bing sitemap 提交完成**，indexed pages ≥ 1
- **用 6 种 AI 爬虫 UA 模拟访问首页**：6/6 拿到 200 + 完整内容
- **`/d/[id]` 用任何 UA 访问** = 明确不索引信号
- **schema 验证器**（Google Rich Results Test、Schema.org validator）通过

### Lagging Indicators（1-4 周）

- **Perplexity 搜 `SOZONEXT review`** = 本站出现在前 5 结果（铁中）
- **Perplexity 搜 `民泊 健康診断 ツール`** = 本站出现在 page 1（大概率）
- **Bing 搜 `SOZONEXT`** = 本站为第 1 结果
- **ChatGPT-browse 问 `What is SOZONEXT?`** = 答案中引用本站

### Long-term（数月，依赖训练数据更新）

- **ChatGPT (no browse) / Claude (no search) 原生回答 `What is SOZONEXT?`** = 提到本站
- 这条不在本期 commit，仅作为长期信号留意

---

## 8. Open Questions

| Q | 谁回答 | Blocking? |
|---|---|---|
| 演示时要用哪 3 个具体关键词？建议 1 个品牌词 + 1 个 JA 长尾 + 1 个 ZH/EN 兜底 | 老板 / Yuan | 演示前必须确定，但不阻塞 ship |
| 演示时机？建议 ship 后 **3-7 天**（给 Bing 索引时间），但品牌词当天就能演示 | 老板 / Yuan | 不阻塞 ship |
| 一周后要不要测一组关键词的命中率，作为继续投入（P1 / P2）的 GO/NO-GO 信号？ | 老板 / Yuan | 不阻塞 |
| Bing 用了，要不要顺手把 Google Search Console 也提了（R11）？目前规划是 P1 | 老板 / Yuan | 不阻塞 |
| 如果 P0 全做完老板还是不满意（比如希望训练数据里也有），愿意 commit 内容铺设 + 外部曝光（P2 路径）吗？ | 老板 | 不阻塞 demo |

---

## 9. Timeline Considerations

| Day | 目标 | 验证手段 |
|---|---|---|
| **Day 0**（今天） | Ship 全部 P0 上线 + Bing 验证完成 + 提交 sitemap | curl 模拟爬虫 / schema 验证器 |
| **Day 1-3** | 等 Bing 索引（自动）。准备「演示话术」文档 | Bing Webmaster pages indexed > 0 |
| **Day 3-7** | Perplexity / ChatGPT-browse 命中率稳定 | 实际搜索测试 |
| **Day 7** | 给老板 demo | 现场演示 |
| **Day 7+** | 评估 metrics，决定是否进入 P1（多语 / Google）或 P2（内容 / 外链） | 关键词命中率统计 |

**没有硬 deadline**（demo 阶段，节奏可调）。**没有外部依赖**（不依赖任何第三方排期）。

---

## 10. Dependencies

| 依赖 | 状态 |
|---|---|
| Vercel production deploy 顺畅 | ✅ 已确认 |
| Bing Webmaster Tools 账号可用 | ✅ 已确认（正在 verify） |
| Vercel `vercel.app` 子域 — robots/sitemap/llms.txt 可以正常服务 | ✅ 已确认 |
| 主 PRD（[`prd.md`](prd.md)）核心功能稳定 | ✅ Phase 1-4 已 complete |

---

## 11. 与主 PRD（[`prd.md`](prd.md)）的关系

本 PRD 是**新增功能**，**不修改**主 PRD：

- 主 PRD 关注"用户输入 URL → 得到诊断"的核心流程
- 本 PRD 关注"潜在用户和 AI 助手如何发现这个工具"
- 主 PRD 的 5 维度评分 / AI 报告 / PDF / 邮件等功能**不受任何影响**
- 唯一首页 UI 变化：表单上下加内容段（hero + how-it-works + about），表单本身保持原样

---

## 12. 与 ADR 的关系

本 PRD 内的所有决策都**遵守已有 ADR**：

- [ADR-001](adr/0001-vercel-mac-split.md) `$0 月成本`：本期不买域名、不付费工具，纯 $0
- [ADR-002](adr/0002-no-playwright.md) `不引入额外依赖`：本期实现不引入新的运行时依赖
- [ADR-004](adr/0004-synchronous-flow.md) `同步主流程`：本期 GEO 工作不影响诊断主流程，纯静态资源 + metadata

如果实现阶段需要引入新决策（如 dynamic sitemap vs static），由实现方写新 ADR。
