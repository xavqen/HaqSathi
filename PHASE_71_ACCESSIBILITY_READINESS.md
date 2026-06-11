# Phase 71 — Accessibility Readiness

This phase adds a production accessibility readiness layer for HaqSathi AI.

## Added

- Accessibility readiness helper: `lib/accessibility/readiness.ts`
- Admin page: `/admin/accessibility-readiness`
- Protected API: `/api/admin/accessibility-readiness`
- Local evidence generator: `npm run accessibility:readiness`
- Launch evidence gate: Accessibility Readiness
- Phase audit: `npm run phase71:audit`

## Checks covered

- Keyboard navigation
- Visible focus states
- Form labels and validation errors
- Text contrast review
- Screen-reader smoke testing
- Reduced-motion review
- Core route checklist
- Assistive-technology matrix

## Safe launch rule

Keep accessibility review flags set to `false` until real deployed-domain evidence is saved for P0/P1 routes.
