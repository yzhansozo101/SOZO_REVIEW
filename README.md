# SOZO Review · 物件ヘルスチェック

Airbnb 物件の健康診断 web アプリ。URL を貼り付けると 5 維度健康診断 + 综合评分 + AI 改善レポート + PDF + 警告メールを出力する。

**Status**: demo phase, 4 plans complete (foundation → real scraping → Claude Agent SDK → email/PDF/polish). SPEC §8 受け入れ条件全通。

## Quick start

```bash
# install
pnpm install
cd mac-scraper && pnpm install && cd ..

# env
cp .env.example .env.local   # then fill DATABASE_URL etc. — never commit
# also: mac-scraper/.env with PORT=8787 and SCRAPER_SECRET matching .env.local

# auth Claude Code CLI (one-time, needed for AI reports)
claude /login

# dev (two terminals)
cd mac-scraper && pnpm dev
# in another terminal at repo root:
ulimit -n 4096 && WATCHPACK_POLLING=true pnpm dev

# open http://localhost:3000
```

## Docs

- [`CLAUDE.md`](CLAUDE.md) — project overview + rules
- [`SPEC_房源诊断系统_需求v0.4.md`](SPEC_%E6%88%BF%E6%BA%90%E8%AF%8A%E6%96%AD%E7%B3%BB%E7%BB%9F_%E9%9C%80%E6%B1%82v0.4.md) — PRD
- [`SYSTEM_DESIGN_v0.2.md`](SYSTEM_DESIGN_v0.2.md) — architecture
- [`ADR.md`](ADR.md) — architecture decisions
- [`docs/superpowers/plans/phase*-status.md`](docs/superpowers/plans/) — what each phase delivered
- [`.claude/rules/`](.claude/rules/) — project memory (e.g. never inline secrets)

## Stack

Next.js 15 App Router · TypeScript · Drizzle ORM · @neondatabase/serverless · next-intl · Express (mac-scraper) · Vitest · @anthropic-ai/claude-agent-sdk · @react-pdf/renderer · @react-email/components · resend · recharts

## License

Internal demo. Not for redistribution.
