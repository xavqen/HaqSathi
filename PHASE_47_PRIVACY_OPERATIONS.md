# Phase 47 - Privacy Operations Readiness

This phase adds a practical production privacy operations layer without changing existing business logic.

## Added

- `lib/privacy/operations.ts` readiness helper
- Protected cron endpoint: `/api/cron/privacy-ops`
- Admin command center: `/admin/privacy-ops`
- Local evidence generator: `npm run privacy:readiness`
- Phase audit: `npm run phase47:audit`
- Launch evidence gate for export/deletion readiness
- Privacy Center export UX improvement

## Manual QA still required

- Login as a real user and download `/api/dashboard/export/data`
- Submit a deletion request from `/dashboard/privacy-center`
- Confirm the request appears in `/admin/privacy-ops`
- Save reviewer evidence before irreversible deletion
- Test deployed `/api/cron/privacy-ops` using `Authorization: Bearer CRON_SECRET`
