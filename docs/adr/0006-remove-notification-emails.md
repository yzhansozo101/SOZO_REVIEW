# ADR-0006: Remove F1/F7 notification emails in favor of SupportCta

**Date:** 2026-05-29
**Status:** Accepted
**Supersedes:** N/A
**Superseded by:** N/A

## Context

The result page section "05 通知" displayed F1 alert email status
(triggered when overall score < 60, sent via Resend) and three
buttons: F1 alert preview, F7 weekly summary preview, F7 manual test
send. The actual F1 email did fire end-to-end against a real inbox
(part of CLAUDE.md §10 demo acceptance criteria #4). F7 was a manual
test-only endpoint, intentionally not scheduled.

For the v0.4 demo audience (boss + internal users), this UI surface
was confusing rather than valuable. It mixed product behavior ("we
emailed you") with developer affordances (preview / test send)
without serving either persona well. Meanwhile the diagnostic result
page is the highest-intent surface in the product — a user who just
saw their listing scored a "D" is the exact ICP for SOZONEXT's
existing 民泊運営代行 service line — and had no conversion path.

## Decision

Replace the entire notification UI section with a marketing CTA
card (`components/SupportCta.tsx`) that drives leads to SOZONEXT's
operations service via email / phone / website.

Delete the F1/F7 backend in full:
- `/api/diagnose` no longer sends F1 alerts
- `/api/weekly/test` route is removed
- `lib/email/{alert,weekly,resend}.tsx` deleted
- `components/{AlertBar,EmailPreview}.tsx` deleted
- `tests/{AlertBar,EmailPreview,email-alert,email-weekly}.test.*` deleted
- F1 assertions in `tests/api-diagnose.test.ts` removed
- `resend` + `@react-email/components` dependencies removed from
  `package.json`
- `RESEND_API_KEY` + `ALERT_EMAIL_TO` removed from `.env.example`
- `alertsSent` table dropped from `lib/db/schema.ts` export (the
  underlying Neon table is kept as dead schema; not worth a real
  drop migration)

## Consequences

**Good:**
- One clear next action for the demo user (contact SOZONEXT)
- Smaller bundle, fewer deps, fewer env vars to provision in Vercel
- Demo acceptance criteria simplify (no inbox-checking required)
- Result page bottom matures from dev tooling into a sales surface

**Trade-offs:**
- Real "we noticed your listing is in trouble" notification capability
  is gone. If we ever want it back, we'd resurrect the Resend wrapper
  and a new template — non-trivial but bounded.
- The `alerts_sent` Neon table is now orphaned. Acceptable —
  dropping it requires coordinating a migration, and it costs
  approximately nothing to keep.

**Operations follow-up (manual, post-merge):**
- Remove `RESEND_API_KEY` and `ALERT_EMAIL_TO` from Vercel project
  env vars
- Optionally revoke the Resend API key
