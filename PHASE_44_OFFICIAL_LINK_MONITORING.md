# Phase 44 — Official Link Monitoring

This phase adds the first production-grade official link monitoring layer without changing existing business logic.

## Added

- `/api/cron/link-checks` protected cron route for DB-backed official link reachability checks.
- `lib/link-checks/checker.ts` shared checker with HEAD/GET fallback, timeouts and status mapping.
- `npm run link-checks:local` seed-based local checker that writes JSON/CSV evidence under `artifacts/link-checks`.
- Stronger `/admin/link-checks` command center with status metrics, copy-ready commands and manual review guidance.
- Launch evidence gate for automated official link monitoring.
- Phase 44 audit included in `quality:release`.

## Production setup

1. Set `CRON_SECRET` in Vercel.
2. Add a Vercel Cron job for `/api/cron/link-checks`.
3. Keep `LINK_CHECK_TIMEOUT_MS` around `8000` and `LINK_CHECK_BATCH_LIMIT` around `25`.
4. Review flagged links in `/admin/link-checks`.

## Important safety rule

Automated checks only prove URL reachability. They do not prove government deadlines, eligibility, instructions or filing paths are still correct. Anything deadline-specific must still be manually verified before public launch.
