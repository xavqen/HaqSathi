# Phase 72 — Legal Compliance Readiness

This phase adds a production launch guard for legal copy, privacy behavior, terms/refund clarity, ads disclosure, minor safety and guidance-only disclaimers.

## Added

- Admin page: `/admin/legal-compliance-readiness`
- Protected API: `/api/admin/legal-compliance-readiness`
- Helper: `lib/legal/compliance-readiness.ts`
- Local evidence generator: `npm run legal:readiness`
- Audit: `npm run phase72:audit`
- Launch evidence gate: `Legal Compliance Readiness`
- Env controls for reviewer, priority route targets and review flags

## Review rule

Do not mark review flags true until evidence is saved for privacy, terms, disclaimer, pricing, high-risk tools, ads/referrals and minor-sensitive flows.

## Commands

```bash
npm run legal:readiness
npm run phase72:audit
npm run quality:release
```
