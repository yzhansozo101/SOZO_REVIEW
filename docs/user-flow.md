# User Flow — SOZO Review

> 用户主流程：URL 输入 → 抓取 → 5 维度分析 → AI 报告 → 结果页 + 邮件预警
> 关联：[PRD §3](prd.md) · [System Design §6](system-design.md)

GitHub 自动渲染下面的 ```mermaid``` 代码块。需要导出 SVG/PNG 时用 [Mermaid Live Editor](https://mermaid.live/) 粘贴。

```mermaid
flowchart TD
    Start([👤 用户打开网页]) --> Input[/输入 Airbnb 房源 URL/]
    Input --> Diagnose[/点击 「诊断」 按钮/]
    Diagnose --> Validate{URL 是否<br/>有效 Airbnb 链接?}

    Validate -- 否 --> Err1[❌ 表单提示<br/>「请输入有效的 Airbnb URL」]
    Err1 --> Input

    Validate -- 是 --> Loading[显示进度<br/>「抓取中... 分析中... 生成报告...」]

    Loading --> Cache{本地是否<br/>已缓存该房源?}
    Cache -- 是 --> LoadCache[读取缓存数据]
    Cache -- 否 --> Crawl[爬取公开数据<br/>标题・描述・照片・设施・评论・评分]

    Crawl --> CrawlOK{抓取成功?}
    CrawlOK -- 否 --> Err2[❌ 显示错误<br/>「无法获取房源数据<br/>请检查 URL 或稍后重试」]
    CrawlOK -- 是 --> SaveCache[写入本地缓存]

    SaveCache --> Analyze
    LoadCache --> Analyze[运行 5 维度分析<br/>📷 写真 / 🔤 标题 / 📝 描述<br/>🛋️ 设施 / 💬 评论]

    Analyze --> AICall[调用 AI<br/>生成综合诊断报告]
    AICall --> AIOK{AI 调用成功?}
    AIOK -- 否 --> AIRetry[重试 1 次]
    AIRetry --> AIOK2{是否成功?}
    AIOK2 -- 否 --> AIFail[报告标记<br/>「AI 分析暂时不可用」]
    AIOK2 -- 是 --> Render
    AIOK -- 是 --> Render
    AIFail --> Render

    Render[渲染结果页] --> Result([🎯 完整结果展示])

    Result --> D1[🏷️ 评分卡<br/>字母 A/B/C/D + 颜色<br/>+ 8 档质量阶梯<br/>+ 升档提示<br/>+ vs 上次 diff]
    Result --> D2[📊 5 维度卡片<br/>每个含子评分+建议]
    Result --> D3[📄 AI 报告区<br/>含 Top 3 改进建议]
    Result --> D4[📈 趋势曲线<br/>近一年 → 当前]
    Result --> D5[📧 邮件预警状态条]

    Result --> Score{综合评分<br/>是否 < 60?}
    Score -- 是 --> SendAlert[F1: 自动发送<br/>预警邮件到运营测试邮箱]
    Score -- 否 --> NoAlert[显示<br/>「评分健康，未触发预警」]
    SendAlert --> EmailOK{邮件发送成功?}
    EmailOK -- 是 --> AlertShown[UI 显示<br/>「✅ 已发送预警至 X」]
    EmailOK -- 否 --> EmailErr[UI 显示<br/>「⚠️ 邮件发送失败，不阻断诊断」]

    Result -.用户主动.-> PDF[/点击 「下载 PDF」/]
    PDF --> PDFFile[生成 PDF 并下载到本地]

    Result -.用户主动.-> TestWeekly[/点击<br/>「立即测试发送周报」/]
    TestWeekly --> WeeklyEmail[F7: 发送周摘要邮件]

    Cron([🕘 每周一 09:00<br/>定时器自动触发]) --> WeeklyEmail

    style Start fill:#4CAF50,color:#fff
    style Result fill:#1F4E79,color:#fff
    style Err1 fill:#F44336,color:#fff
    style Err2 fill:#F44336,color:#fff
    style SendAlert fill:#FF9800,color:#fff
    style WeeklyEmail fill:#FF9800,color:#fff
    style AIFail fill:#FFC107
    style EmailErr fill:#FFC107
    style D1 fill:#E3F2FD
    style D2 fill:#E3F2FD
    style D3 fill:#E3F2FD
    style D4 fill:#E3F2FD
    style D5 fill:#E3F2FD
    style Cron fill:#9C27B0,color:#fff
```
