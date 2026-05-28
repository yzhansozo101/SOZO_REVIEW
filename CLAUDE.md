# CLAUDE.md

このファイルは Claude Code が本リポジトリで作業する際のガイドです。

---

## 1. プロジェクト概要

**SOZO Review · 物件ヘルスチェック** — Airbnb 房源健康诊断 web アプリ。

ユーザーが Airbnb の物件 URL を貼り付けると、システムが公開情報を取得し、**5 維度健康診断 + 综合评分 + AI 改善レポート + 警告メール**を出力する。

- **ユーザー**：SOZONEXT 内部運営(demo 阶段、主要观众是老板)
- **言語**：UI / PDF / メール / AI レポートすべて **日本語**(コードコメントと本ドキュメントは中文/英文 OK)
- **コスト制約**：月 **$0**(强约束)

## 2. 现在の状态

**实装前段階**。リポジトリには仕様書とデザインハンドオフ一式のみ存在し、**アプリのコードはまだ無い**。次のステップで Next.js プロジェクトをブートストラップする。

---

## 3. Source of Truth(編集禁止 / 实装の根拠)

| ファイル | 役割 |
|---|---|
| [docs/prd.md](docs/prd.md) | PRD:機能・受け入れ条件・エッジケース |
| [docs/system-design.md](docs/system-design.md) | アーキテクチャ・モジュール構成・DB スキーマ・API 契約 |
| [docs/adr/](docs/adr/) | 5 つのアーキテクチャ決定(Vercel+Mac / fetch / Claude SDK / 同期 / 単一 tool_use) |
| [docs/user-flow.md](docs/user-flow.md) | ユーザーフロー図(Mermaid 埋め込み) |
| [design_handoff_review_app/README.md](design_handoff_review_app/README.md) | Spec → コンポーネントマップ・実装チェックリスト |
| [design_handoff_review_app/prototype/](design_handoff_review_app/prototype/) | **ビジュアル参照のみ**(React-via-Babel、出荷しない) |
| [design_handoff_review_app/design_system/colors_and_type.css](design_handoff_review_app/design_system/colors_and_type.css) | デザイントークン CSS(そのまま流用) |
| [design_handoff_review_app/wireframes/Wireframes.html](design_handoff_review_app/wireframes/Wireframes.html) | 採用済み 4 レイアウト:**1C · 2B · 3A · 4B** のみ参照 |

**ルール**:仕様の解釈で迷ったら上記ファイルが正、コードや prototype が衝突したら仕様優先。仕様自体を変更したい場合は必ずユーザー確認。

---

## 4. 技术スタック(SYSTEM_DESIGN §1 で確定)

| レイヤ | 採用 |
|---|---|
| フロント + 短任務 API | **Next.js 15 (App Router) + TypeScript**、**Vercel Hobby ($0)** にデプロイ |
| スクレイピング + AI(重活) | **Mac 常駐 Node サービス**、Cloudflare Tunnel で固定 HTTPS 公開 |
| ブラウザ自動化 | **使わない**(Playwright 不要 → ADR-002)。`fetch` + `data-deferred-state-0` JSON 解析 |
| AI | **@anthropic-ai/claude-agent-sdk**(Mac の Claude Code Enterprise OAuth、$0)→ ADR-003 |
| DB | **Neon Postgres** + **Drizzle ORM** + `@neondatabase/serverless` |
| メール | **Resend**(無料 3000/月) |
| PDF | **@react-pdf/renderer** + **NotoSansJP** 埋め込み |
| 図表 | **Recharts** |
| 多言語 | **next-intl**(`ja` 単一ロケール) |

**月コスト合計 $0**:Vercel Hobby + Neon 無料 + Resend 無料 + Claude Code サブスクリプション。

---

## 5. リポジトリ構成(SYSTEM_DESIGN §3 で固定)

実装開始時、SYSTEM_DESIGN §3 のツリーに従う。要点:

```
repo/
├── app/                     # Next.js App Router(RSC 優先、'use client' は最小限)
│   ├── page.tsx             # URL 入力ページ(wireframe 1C)
│   ├── d/[id]/
│   │   ├── page.tsx         # 結果ページ(wireframe 3A 二列)
│   │   └── pdf/route.ts     # PDF stream
│   └── api/
│       ├── diagnose/route.ts        # POST → Mac → DB → return
│       ├── diagnose/[id]/route.ts   # GET
│       └── weekly/test/route.ts     # F7「テスト送信」
├── components/              # ScoreCard / QualityStatusLadder / DimensionCard / ...
├── lib/                     # db / scraper(client) / email / pdf / i18n / util
├── public/fonts/NotoSansJP-Regular.ttf
└── mac-scraper/             # 独立 Node プロジェクト(Express + Claude Agent SDK)
    └── src/{server,airbnb,score,ai,log}.ts
```

**重要分界**:
- Vercel 側関数 ≤ **60s**(Hobby 上限)
- 重活はすべて Mac:scrape + 評分計算 + AI を 1 回の HTTP で完成品 JSON として返す
- 状態は全部 Neon

---

## 6. v0.4 で押さえる仕様デルタ(prototype は v0.2 ベース)

prototype の見た目を流用する際、以下は **必ず v0.4 に直す**:

1. **UI 全日本語**(prototype 済)
2. **B7 描述完整性**:旧「7/7 全項目入力済み」→ v0.4 は **「文字数 + 章節 regex」評価**。コピーを `1,240 文字 · 主要章節✓` 系に書き換え
3. **A5 Quality Status**:「**※ Airbnb の内部判定とは異なる参考値です**」の小字脚注を必ず追加
4. **C1 趨勢グラフ**:近 1 年は **mock 1 点 + 現在 1 点** の 2 点折れ線、「示例数据」の注釈必須
5. **F7 週次サマリー**:**定時器は実装しない**、「🧪 立即测试发送」ボタンのみ。次回送信時刻は mock 文言

---

## 7. 設計トークン(`design_system/colors_and_type.css` をそのまま使う)

主要トークン:
- **Paper** `#FAF8F4` / **Card** `#FFFFFF` / **Sozonext Navy** `#024280`(ブランド primary)
- 診断 4 段階カラー:A 緑 / B 黄緑 / C 黄 / D 赤(ScoreCard + DimensionCard の fill/ink/base 三色 — README §🎨 参照)
- フォント:UI=Geist + Noto Sans JP / レポート本文=Newsreader + Noto Serif JP / mono=Geist Mono
- スケール:12 / 14 / 16 / 18 / 24 / 32 / 48 / 72 / **120**(評価カードの大文字)
- 影は 1 種類のみ:`0 1px 2px rgba(14,17,22,.04), 0 8px 24px -8px rgba(14,17,22,.08)`(score card + modal のみ。他はボーダー)
- モーション:120ms interactive / 240ms entrance、`cubic-bezier(0.2, 0, 0, 1)`、バウンス/スプリングなし

ファイルを `app/globals.css` か `styles/tokens.css` にコピーして一度だけ import。

---

## 8. 诊断主流程(SYSTEM_DESIGN §6)

```
POST /api/diagnose { url }       ← Vercel 60s 予算
  → 1. URL 検証(airbnb.{com,jp,...}/rooms/{id})
  → 2. UPSERT listings
  → 3. 1 時間以内のキャッシュ命中 → 旧結果へ 302
  → 4. POST Mac /diagnose(45s timeout)
        Mac: fetch PDP → 解析 deferred-state → reviews GraphQL
             → 5 維度評分 → Claude Agent SDK 1 回 tool_use → 完成 JSON
  → 5. INSERT diagnoses(snapshot + AI 全部入り)
  → 6. score < 60 かつ未送信 → Resend F1 メール送信
  → 7. { diagnosis_id, redirect } を返す
```

時間予算:Mac 15–20s + Vercel overhead 5s ≈ **25s**(60s 上限内に余裕)。

---

## 9. AI 統合の固定方針(ADR-005)

**1 回の Claude 呼び出しで tool_use により 3 種類の成果物を同時に返す**:
1. 日本語 markdown レポート(`report_md`)
2. B12 高頻度ネガティブキーワード配列(`negative_keywords`)
3. F1 メールで使う Top 3 改善案(`top3`)

- Tool schema は `mac-scraper/src/ai/prompts/tools.ts` に集中、TS 型は schema から導出
- Zod で 2 次検証、失敗時は `ai_status="fallback"` で日本語兜底文言を返す
- リトライは 1 回のみ

---

## 10. 受け入れ:demo 成功の定義(SPEC §8)

1. 真の Airbnb URL を貼る → 「診断する」
2. ~25 秒で完全な結果ページ(評価カード + 5 維度 + AI レポート + 趨勢)
3. 「PDF をダウンロード」→ 日本語が文字化けせず DL
4. 評価 < 60 → テストメール受信箱に F1 警告メール着信
5. 「🧪 立即测试发送」→ 受信箱に F7 週次サマリー着信

このフローが一気に通る = demo 成功。

---

## 11. 必ず守る / やってはいけないこと

**プロジェクトルール(`.claude/rules/` 配下、すべて必読・必遵守):**
- [`.claude/rules/never-inline-secrets.md`](.claude/rules/never-inline-secrets.md) — plan/コード/コミット文に **本物の token / password / API key を絶対書かない**。`<placeholder>` を使い、実値は `.env.local`(gitignore)か Vercel 環境変数のみ

**守る**:
- 仕様変更は必ずユーザー確認。SPEC/SYSTEM_DESIGN/ADR は許可無く編集しない
- v0.4 デルタ(§6)を反映していない prototype のコピペを残さない
- データ取得失敗時は **fallback の偽データを表示しない**(明確なエラー文言のみ)
- メール送信先は `ALERT_EMAIL_TO` のテストアドレス、運営の本物アドレスには絶対送らない
- Mac scraper の HTTP は Bearer secret (`SCRAPER_SECRET`) 認証必須

**やらない(scope creep 防止、SPEC §6)**:
- ユーザー認証 / アカウント管理 / 権限
- 複数物件バッチ / portfolio dashboard
- Booking / VRBO など多プラットフォーム集約
- Slack / Lark 連携(メールのみ)
- 工単 / チケットシステム
- AI による物件文言の自動修正
- 真の履歴データ永続化(demo は単発診断)
- F7 真の定時送信(v1 で扱う)

---

## 12. 演示前 checklist(SYSTEM_DESIGN §16)

- [ ] Mac がスリープしない(`caffeinate -d` or 電源設定)
- [ ] Cloudflare Tunnel プロセス稼働中(`pm2 status`)
- [ ] Vercel 環境変数 (`DATABASE_URL` / `RESEND_API_KEY` / `ALERT_EMAIL_TO` / `SCRAPER_URL` / `SCRAPER_SECRET`) 設定済み
- [ ] Mac の Claude Code がログイン済み、サブスクリプション有効

---

## 13. ブランチ運用

- `main`:安定線(現状は仕様/ハンドオフのみ)
- `feature/prototype`:現在の作業ブランチ(プロトタイプ実装)
- 実装は feature ブランチで進め、main への直接コミットはしない
