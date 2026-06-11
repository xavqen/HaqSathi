# Phase 54 — Referral Growth Readiness

This phase adds a safe launch layer around the existing referral system.

## Added

- Referral growth readiness helper in `lib/referrals.ts`
- Admin page: `/admin/referral-readiness`
- Protected API: `/api/admin/referral-readiness`
- Local evidence generator: `npm run referral:readiness`
- Launch evidence gate: Referral Growth Readiness
- Phase audit: `npm run phase54:audit`

## Launch rules

- Keep `REFERRAL_PAYOUT_MODE=bonus_usage` for MVP.
- Keep `REFERRAL_FRAUD_REVIEW_REQUIRED=true` before public campaigns.
- Use low invite limits to reduce spam and abuse.
- Save JSON/CSV evidence before influencer, agent or paid referral promotion.
- Do not enable cash payouts until tax, KYC, refund-abuse and fraud checks are ready.
