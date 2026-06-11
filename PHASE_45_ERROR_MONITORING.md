# Phase 45 — Error Monitoring + Incident Center

This phase adds a production-safe monitoring layer without changing existing product flows.

## Added

- Browser error and unhandled rejection capture with dedupe.
- Server-side normalization, sensitive text redaction and fingerprinting.
- Rate-limited `/api/system/client-error` ingestion route.
- `/api/system/heartbeat` readiness endpoint for monitoring state.
- Optional webhook alerts through `ERROR_ALERT_WEBHOOK_URL`.
- Optional critical auto-incident creation with `ERROR_AUTO_INCIDENTS=true`.
- Admin page: `/admin/error-monitoring`.
- Local evidence generator: `npm run error-monitor:local`.
- Release audit: `npm run phase45:audit`.

## Production setup

1. Keep `CLIENT_ERROR_LOG_DRY_RUN="true"` while testing locally.
2. On staging, set `CLIENT_ERROR_LOG_DRY_RUN="false"`.
3. Open `/api/system/heartbeat` to confirm monitoring state.
4. Trigger one safe synthetic frontend error.
5. Confirm it appears in `/admin/error-monitoring`.
6. Optional: add a Slack/Discord webhook URL to `ERROR_ALERT_WEBHOOK_URL`.
7. Optional: set `ERROR_AUTO_INCIDENTS="true"` only after confirming incident noise is low.

## Privacy guardrails

- Secrets, tokens, passwords and common API keys are redacted before storage.
- Stack traces are truncated.
- Events are rate-limited per IP.
- Fingerprints group duplicate errors without requiring full raw payload retention.
