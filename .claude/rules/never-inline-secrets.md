# Rule: Never inline secrets in plan docs, code, or commit messages

**Why this rule exists:** On 2026-05-28, I (Claude) wrote a real Neon `DATABASE_URL`
(including the password `npg_…`) into `docs/superpowers/plans/2026-05-27-phase1-foundation-skeleton.md`
Task 5 Step 5 to make Codex's `.env.local` setup easier. The file was pushed to GitHub.
Neon's secret-scanning bot detected it within minutes; we had to rotate the password
and use `git filter-repo` to scrub history. Force-push was required.

**The rule:**

When writing plans, code, commit messages, documentation, or any file that may be
committed to git, **never embed actual secret values**. This includes:

- Database connection strings with real passwords (Neon, Postgres, Supabase, …)
- API keys (Anthropic, Resend, OpenAI, Stripe, …)
- OAuth tokens / refresh tokens
- Service account JSON
- Webhook signing secrets
- Bearer tokens of any kind
- Cookies with auth data

**Always do instead:**

1. In plan docs: use `<DATABASE_URL>`, `<RESEND_API_KEY>`, `<your-token>` etc as
   visible placeholders. State explicitly in the plan: "Claude will fill .env.local
   manually during review; Codex must not commit .env.local."
2. In code: read from `process.env.X`. Never hard-code.
3. In `.env.example`: use obviously-fake values like `"postgresql://USER:PASSWORD@HOST/DB"`.
4. For Codex hand-off where Codex needs the real value at runtime, write it to
   `.env.local` (which is gitignored) **outside** of any committed file. Either
   ask the user to do it interactively, or write/edit `.env.local` directly via
   the Edit/Write tool — but never describe the value inside the plan markdown.

**How to apply when writing/reviewing:**

- Before saving a plan doc, scan the content: `grep -E '(api[_-]?key|password|secret|token|npg_|sk-|re_|csk_|pk_|AKIA)' draft.md`.
- Before `git commit`, mentally diff the staged change: does it contain anything
  that looks like a token? (Heuristic: long random-looking strings, especially
  with prefixes like `sk-`, `re_`, `pk_`, `npg_`, `xoxb-`, `eyJ` JWT, etc.)
- Before `git push`, especially if it's the first push of a new file, do a final
  grep for known leaked patterns.
- If a leak happens: rotate the secret first (it's effectively public the moment
  it lands on GitHub — GitHub indexes are scraped by bots within seconds).
  Only then do history cleanup (`git filter-repo --replace-text`).

**Vercel deployment note:** Real values go in Vercel Dashboard → Project →
Settings → Environment Variables (encrypted, injected at build/runtime). Never
in committed env files.
