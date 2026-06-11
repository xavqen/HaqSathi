# Phase 96 - Utility Bill Dispute Planner

Adds a practical user-facing utility bill dispute planner for electricity, water, gas, broadband, DTH and mobile postpaid issues.

## Added
- `/tools/utility-bill-dispute-planner`
- `UtilityBillDisputePlannerForm`
- proof checklist, overcharge estimate, due-date urgency and escalation route
- admin readiness page `/admin/utility-bill-readiness`
- protected API `/api/admin/utility-bill-readiness`
- evidence command `npm run utility-bill:readiness`
- `phase96:audit` included in `quality:release`

## Safety
Users are warned not to share OTP, UPI PIN, CVV, passwords, screen-sharing access, full bank/card details or unredacted bill/payment details.
