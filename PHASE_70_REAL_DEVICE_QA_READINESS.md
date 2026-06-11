# Phase 70 — Real Device QA Readiness

This phase adds a screenshot-driven real-device QA layer for HaqSathi AI.

## Added

- Admin page: `/admin/real-device-qa`
- Protected API: `/api/admin/real-device-qa-readiness`
- Local evidence generator: `npm run device-qa:readiness`
- Device matrix for Android, iPhone Safari, tablet, laptop and wide desktop
- Bug capture template for responsive UI regressions
- Launch evidence gate: `Real Device QA Readiness`
- Phase audit: `npm run phase70:audit`

## Why

Static responsive audits can pass while real devices still show broken UI due to browser chrome, keyboard behavior, safe areas, sticky bars, narrow dropdowns and long Hinglish text.

## Minimum proof before public launch

- Small Android Chrome screenshots
- Large Android Chrome screenshots
- iPhone Safari safe-area screenshots or BrowserStack proof
- Tablet portrait screenshots
- Laptop desktop screenshots
- Bug report evidence for every P0/P1 UI issue
