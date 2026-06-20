# Phase 128 — Incident Rollback Runbook

## What changed

- Added a lightweight rollback drill command for production launch.
- Added JSON/CSV rollback evidence artifacts.
- Added incident/rollback checklist to the launch readiness page.
- Evidence gate and artifact manifest now include rollback drill proof.
- Production gate now runs rollback readiness before final evidence review.

## New command

```bash
npm run launch:rollback-drill
```

Recommended final flow:

```bash
LAUNCH_QA_BASE_URL=https://haqsathi.site npm run launch:qa
STRICT_LAUNCH_QA=true npm run launch:payment-storage-check
LIGHTHOUSE_BASE_URL=https://haqsathi.site npm run lighthouse:batch
PLAYWRIGHT_BASE_URL=https://haqsathi.site npm run test:e2e
OPS_HEALTH_BASE_URL=https://haqsathi.site npm run launch:ops-snapshot
npm run launch:rollback-drill
npm run launch:evidence-gate
npm run launch:artifact-manifest
```

## Manual envs before public launch

- `LAUNCH_LAST_GOOD_DEPLOYMENT_URL`
- `LAUNCH_ROLLBACK_OWNER`
- `LAUNCH_INCIDENT_OWNER`
- `LAUNCH_BACKUP_CONFIRMED=true`
- `LAUNCH_ROLLBACK_TESTED=true`
- `LAUNCH_MAINTENANCE_NOTICE_READY=true`

## Launch rule

If rollback drill is blocked or manual-required, keep HaqSathi AI in soft launch.
