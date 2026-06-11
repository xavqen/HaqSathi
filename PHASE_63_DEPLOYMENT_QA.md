# Phase 63 — Live Deployment QA Readiness

This phase adds the final deployed-domain QA layer for HaqSathi AI.

## Added

- Deployment QA readiness helper: `lib/deployment/qa-readiness.ts`
- Admin command center: `/admin/deployment-qa`
- Protected readiness API: `/api/admin/deployment-qa-readiness`
- Local evidence generator: `npm run deployment:qa-readiness`
- Phase audit: `npm run phase63:audit`
- Launch evidence gate: `Live Deployment QA Readiness`

## What it checks

- Vercel production URL readiness
- Vercel preview URL readiness
- Build log review
- Runtime/function log review
- Production Playwright proof
- Production Lighthouse proof
- Mobile viewport QA proof
- Desktop viewport QA proof
- Vercel cron job readiness
- SEO indexing review

## Required real-world evidence

- Production deployment URL
- Vercel build log screenshot
- Runtime log screenshot after smoke testing
- Playwright report against deployed URL
- Lighthouse report against deployed URL
- Android Chrome screenshots
- Desktop admin/dashboard screenshots
- Sitemap/robots/canonical proof
- Cron route dry-run proof

## Notes

This does not change business logic. It adds release gates and evidence tracking so the app is not marked ready based only on local/static checks.
