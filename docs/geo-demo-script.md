# GEO Demo Script — 老板向け演示话术

> 给老板演示"AI 知道我们的产品"的标准脚本。**关键词需要老板/Yuan 确认填空**（PRD §8 OQ）。
>
> 关联：[`prd-geo.md`](prd-geo.md) · [`system-design-geo.md`](system-design-geo.md)
>
> 版本：v0.1 (stub) · 日期：2026-05-29

---

## 0. 准备（演示前 10 分钟）

- [ ] 确认 production URL 可访问：https://sozonext-review.vercel.app/
- [ ] 用 Chrome 隐身窗口确认首页正常加载 + hero 文案显示
- [ ] 登录 Perplexity（perplexity.ai）+ ChatGPT（chat.openai.com）+ Bing（bing.com）
- [ ] 备份演示工具就绪（见 §3 备份路径）

---

## 1. 主演示路径（3 个关键词）

### 1.1 品牌词（铁中 — 100% 命中）

**关键词**：`SOZONEXT review` 或 `SOZONEXT airbnb`

**演示步骤**：
1. 打开 Perplexity → 输入关键词 → 按 Enter
2. **预期结果**：首屏第 1-3 条引用 `sozonext-review.vercel.app`，答案里出现"Airbnb 物件健康診断ツール"
3. 老板视角："AI 已经认识 SOZONEXT 这个品牌"

**为什么这条铁中**：品牌词全网无竞争对手，Bing 站长工具验证 + sitemap 已提交，Perplexity 后端是 Bing，所以本站只要被 Bing 索引就必然出现。

### 1.2 JA 长尾（大概率命中）

**关键词**：**TBD**（待 Yuan / 老板从下列建议中选 1 个）：
- `民泊 健康診断 ツール`（窄、低竞争，**推荐**）
- `Airbnb 物件 ヘルスチェック`（与产品 UI 措辞完全对齐）
- `スーパーホスト維持 ツール`（host 真痛点，B2B 感强）
- `Airbnb 検索順位 改善`（host 真痛点，转化向）

**演示步骤**：同上。

**预期**：Day 3-7 后稳定命中 page 1。Day 0-2 命中率约 40-60%（Bing 索引滞后）。

### 1.3 ZH/EN 兜底（多语 fingerprint 验证）

**关键词**：**TBD**（待选 1 个）：
- `airbnb 房源诊断 工具`（ZH，命中率取决于 Bing 中文索引深度）
- `SOZONEXT airbnb` 中文界面搜（应该命中，因为是品牌词）
- `Airbnb listing audit Japan`（EN，竞争激烈但 SOZONEXT 出现概率不低）

**演示步骤**：同上。

**预期**：用于证明"AI 在非日文语境也能 fingerprint 出 SOZONEXT 品牌"。

---

## 2. 演示话术（讲给老板听的台词）

> "我们这一周做的事情是让 AI 搜索引擎能找到我们的产品。
>
> 第一个关键词演示——这是品牌词，搜出我们是必然的，证明我们的站点已经被 Perplexity 和 ChatGPT 看到了。
>
> 第二个关键词演示——这是民泊行业的具体长尾词，竞争很少，证明 AI 在用户找类似工具的时候会推荐我们。
>
> 第三个关键词演示——证明无论日文中文英文用户搜，我们的品牌都被 AI 识别出来。
>
> 接下来如果想更进一步，我们会铺一些内容文章，让 AI 不只是搜到我们，而是在用户问'怎么优化 Airbnb 房源'这种问题的时候，主动把我们作为答案的一部分推荐出去。"

---

## 3. 备份演示路径（万一某个关键词当天没命中）

AI 索引有 1-3 天滞后。如果 demo 当天某个关键词还没出现，**用以下任意一条做技术演示**，老板一样能感受到"AI 真的能进来"。

### 3.1 用 AI 爬虫 UA 现场抓取（最有冲击力）

打开 Mac terminal，演示：

```bash
# 模拟 OpenAI 的 GPTBot 访问我们的站
curl -A "GPTBot/1.0; (+https://openai.com/gptbot)" \
  https://sozonext-review.vercel.app/ | less
```

**老板看点**：
- HTTP 200 响应
- HTML 里出现 SOZONEXT 品牌词 ×3、5 維度評価、スーパーホスト維持 等关键词
- `<script type="application/ld+json">` 里完整的结构化数据

**讲法**："这是 ChatGPT 实际爬取我们站的方式。看，我们对它完全开放，而且页面上的关键词、品牌、产品介绍都被它能读到。"

### 3.2 Google Rich Results Test（视觉冲击）

打开浏览器：[Rich Results Test](https://search.google.com/test/rich-results?url=https%3A%2F%2Fsozonext-review.vercel.app%2F)

**老板看点**：
- "Page is eligible for rich results"
- 解析出 3 个 schema：Organization / WebSite / WebApplication
- 显示我们的产品 name、description、品牌

**讲法**："这是 Google 看到我们的样子，它知道我们是个 BusinessApplication，运营方是 SOZONEXT。"

### 3.3 Schema Markup Validator（更严格）

打开：[Schema.org Validator](https://validator.schema.org/#url=https%3A%2F%2Fsozonext-review.vercel.app%2F)

**老板看点**：3 个 Schema.org 类型都 valid，0 errors。

### 3.4 Bing Webmaster Tools 后台

登录 Bing Webmaster Tools → SOZONEXT Review 站点 → Dashboard

**老板看点**：
- ✅ Verified
- Pages discovered / indexed 数量
- Sitemap submitted

---

## 4. 演示 Q&A 准备

**问**："这个能让我们的产品出现在 ChatGPT 训练数据里吗？"
**答**："ChatGPT 原生训练数据更新需要几个月。我们今天做的是让 ChatGPT 实时搜索（browse 模式）和 Perplexity（始终实时）能找到我们。下一步如果继续投入，我们会铺设内容文章，那时才能进入训练数据的范围。"

**问**："多少人现在搜得到我们？"
**答**："品牌词搜索是确定能搜到。长尾词进入 page 1 大概率需要 1-2 周完成 Bing 索引。这是 demo 验证'我们走对了路'，不是 launch。"

**问**："不用买域名？"
**答**："`vercel.app` 子域是临时 demo 用，能跑通整个流程。如果想冲长尾排名最大化，下一步建议买个 .com 域名（一年 $10）切过去，所有 SEO 设置都不变。"

**问**："多少钱？"
**答**："这一波 GEO 工作的运行成本是 $0/月，跟整个 demo 一致。文件全部静态、Vercel Hobby 免费、不依赖任何付费服务。"

---

## 5. 演示后跟进

- [ ] 老板回答 PRD §8 的 OQ（用哪 3 个具体关键词、什么时机演示）
- [ ] 把本文档 §1.2 / §1.3 的 TBD 填上具体词
- [ ] 演示 1 周后做 metrics review（哪些关键词命中、哪些没）
- [ ] 决定是否进入 P1（多语 / Google）或 P2（内容 / 外链 / 自定义域名）
