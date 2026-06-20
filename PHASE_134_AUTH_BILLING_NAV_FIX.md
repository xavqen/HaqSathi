# Phase 134 — Auth, Billing & Navigation Fix

## Fixed

- Logged-in users no longer get stuck on `/login` after clicking Start Free or other login/register links.
- `/login` and `/register` now redirect already-authenticated users to the safe `next` path.
- Homepage Start Free CTAs are auth-aware: guests go to login, logged-in users go directly to tools.
- Billing now resolves the effective plan from three sources:
  - user record plan,
  - active subscription,
  - latest paid Razorpay order.
- Billing page syncs stale `FREE` user records when payment/subscription evidence shows a paid plan.
- Checkout buttons now show Current / Included / Upgrade / Login to upgrade correctly.
- Billing APIs return clean `401` JSON with login path instead of forcing route redirects.
- Desktop top navigation now supports mouse-wheel horizontal scrolling inside the nav pill.
- UI scan was updated to recognize the new reusable desktop scroll nav component.

## Verify locally

```bash
npm install
npm run scan:complete
npm run phase134:audit
npm run launch:final-ready
npm run build
```

## Manual browser checks

1. Login, open home page, click Start Free — should go to `/tools`, not `/login`.
2. While logged out, click Start Free — should go to login first.
3. Open `/dashboard/billing` after a successful paid order/subscription — current plan should show the paid plan.
4. Hover over the desktop nav pill and use mouse wheel — nav should scroll horizontally.
