# Phase 61 — Payment Lifecycle Readiness

This phase adds a payment/subscription launch readiness layer without changing existing checkout, verify or webhook business logic.

## Added

- `lib/payment-lifecycle-readiness.ts`
- `/admin/payment-lifecycle`
- `/api/admin/payment-lifecycle-readiness`
- `npm run payment:readiness`
- `npm run phase61:audit`
- Launch evidence gate: Payment Lifecycle Readiness

## What it checks

- Razorpay key and webhook readiness
- Valid signature before plan upgrade
- Webhook signature and replay evidence
- Failed payment retry and grace policy
- Manual refund/cancel workflow
- Receipt/invoice sender readiness
- Finance/support ownership
- HTTPS-only payment failure alert webhook

## Launch rule

Do not accept real paid users until Razorpay sandbox payment success, failed payment, invalid signature rejection, webhook replay and cancellation/refund evidence are saved.
