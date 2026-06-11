# Phase 52 / Phase 82 - Release Governance Readiness

Added release governance and rollback readiness for HaqSathi AI.

## Added

- Admin page: `/admin/release-governance`
- Protected API: `/api/admin/release-governance-readiness`
- Local evidence command: `npm run release-governance:readiness`
- Phase audit: `npm run phase82:audit`
- Launch evidence gate: Release Governance Readiness
- Evidence outputs:
  - `release-governance-readiness.json`
  - `release-controls.csv`
  - `release-lanes.csv`
  - `release-notes-template.md`
  - `rollback-checklist.md`
  - `post-release-watch.md`

## Why this matters

Every launch zip or Vercel deployment needs a version source of truth, release note, rollback target, owner signoff and post-release watch plan. This phase makes the final launch process more controlled and reversible.

## Run

```bash
npm run release-governance:readiness
npm run phase82:audit
npm run quality:release
```
