# Phase 52 — Support Triage Readiness

## Added

- Human support / live-chat readiness helper.
- Admin page: `/admin/support-triage`.
- Admin API: `/api/admin/support-triage-readiness`.
- Local evidence generator: `npm run support:readiness`.
- Launch evidence gate for support triage.
- Env controls for support owner, SLA, escalation, live chat provider, webhook and privacy-safe support mode.

## Notes

- Existing support ticket creation logic was not changed.
- Ticket mode remains the safe MVP default.
- Third-party live chat should only be enabled after cookie/privacy review.
- Support replies must not ask for OTPs, passwords, full card numbers, full Aadhaar/PAN or unnecessary private files.

## Commands

```bash
npm run support:readiness
npm run phase52:audit
npm run quality:release
```
