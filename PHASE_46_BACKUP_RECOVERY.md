# Phase 46 — Backup + Restore Readiness

This release adds a practical production backup readiness layer without changing existing business logic.

## Added

- Backup readiness helper: `lib/backups/readiness.ts`
- Protected cron route: `/api/cron/backup-readiness`
- Local evidence command: `npm run backups:readiness`
- Admin backups workflow improvements
- Restore drill runbook improvements
- Launch evidence gate for backup and restore readiness
- Phase audit: `npm run phase46:audit`

## Production usage

1. Set `ADMIN_BACKUP_SECRET`, `CRON_SECRET`, `BACKUP_RETENTION_DAYS`, `BACKUP_RESTORE_TEST_OWNER`.
2. Use Supabase managed backups for the real database snapshot.
3. Download the admin JSON export from `/api/admin/export/full?secret=...` as a secondary app-level copy.
4. Schedule `/api/cron/backup-readiness` in Vercel Cron.
5. Run a monthly restore drill on staging or a temporary Supabase project.
6. Save JSON/CSV/screenshot evidence under `artifacts/backup-readiness`.

## Reminder

A backup is not trusted until restore is tested. This layer checks readiness and evidence; final production safety still requires a real restore drill.
