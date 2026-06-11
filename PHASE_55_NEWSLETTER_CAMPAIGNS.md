# Phase 55 - Newsletter Campaign Readiness

Added a consent-first newsletter and email campaign readiness layer without changing existing business logic.

## Added

- Public `/newsletter` subscription page
- Protected `/api/newsletter/subscribe` endpoint with CSRF, rate-limit, consent validation and dry-run logging
- Admin `/admin/newsletter-readiness` command center
- Protected `/api/admin/newsletter-readiness` metrics API
- `lib/newsletter/readiness.ts` campaign controls and safety rules
- Local evidence generator: `npm run newsletter:readiness`
- Launch evidence gate: Newsletter Campaign Readiness
- Phase 55 audit integrated into `quality:release`

## Safe launch rule

Keep `NEWSLETTER_DRY_RUN=true` until sender domain, double opt-in, unsubscribe/preference URL, seed-list delivery and segment review are tested on the deployed domain.
