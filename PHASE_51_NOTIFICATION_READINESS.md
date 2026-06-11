# Phase 51 — Notification Readiness

Version: `3.0.21-notification-readiness`

This phase adds a production-readiness layer for user notifications without changing existing reminder queue business logic.

## Added

- Notification readiness helper: `lib/notifications/readiness.ts`
- Admin readiness page: `/admin/notification-readiness`
- Protected admin API: `/api/admin/notification-readiness`
- Local evidence generator: `npm run notification:readiness`
- Audit: `npm run phase51:audit`
- Launch evidence gate: `Notification Readiness`
- Env controls for PWA push, WhatsApp, SMS and dry-run launch mode

## Why

HaqSathi already had reminder notification records and an admin notification center. Public launch still needs provider readiness proof before enabling live sends.

## Launch evidence required

1. Email reminder received in a real inbox.
2. PWA install and notification permission screenshot on deployed HTTPS domain.
3. VAPID keys confirmed only in environment variables.
4. WhatsApp/SMS provider sandbox or dry-run response screenshot.
5. Failed notification monitoring screenshot from `/admin/notifications`.
6. Readiness screenshot from `/admin/notification-readiness`.

## Safety rules

- Keep `NOTIFICATION_DRY_RUN=true` until provider tests pass.
- Do not send OTP, password, Aadhaar/PAN, bank account, or private complaint evidence inside push/SMS/WhatsApp text.
- Send reminder titles and dashboard links only for sensitive cases.
- Enable WhatsApp/SMS only after explicit consent and unsubscribe handling.
