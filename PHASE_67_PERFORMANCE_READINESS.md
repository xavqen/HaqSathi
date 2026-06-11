# Phase 67 — Performance readiness

This phase adds a production performance readiness layer for HaqSathi AI.

## Added

- Admin page: `/admin/performance-readiness`
- Protected API: `/api/admin/performance-readiness`
- Local evidence generator: `npm run performance:readiness`
- Launch evidence gate: `Performance Readiness`
- Core Web Vitals budgets: LCP, CLS, INP
- Lighthouse threshold controls for performance, accessibility, best practices and SEO
- Route targets for mobile + desktop speed testing
- Bundle/image/font/mobile-throttle review controls

## Commands

```bash
npm run performance:readiness
npm run lighthouse:local
npm run phase67:audit
npm run quality:release
```

## Launch rule

Do not mark performance review flags true until real deployed-domain evidence is saved for mobile, desktop, Lighthouse, bundle output, image/font delivery and low-end mobile behavior.
