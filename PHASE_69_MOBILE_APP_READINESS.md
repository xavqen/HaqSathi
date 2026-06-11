# Phase 69 — Mobile App Readiness

This phase adds a native/mobile-app release readiness layer without changing the existing web-app business logic.

## Added

- Admin page: `/admin/mobile-app-readiness`
- Protected API: `/api/admin/mobile-app-readiness`
- Readiness helper: `lib/mobile-app/readiness.ts`
- Evidence generator: `npm run mobile-app:readiness`
- Audit: `npm run phase69:audit`
- Launch gate: `Mobile App Readiness`

## Covered

- PWA-first, Android TWA and Capacitor release strategy
- Android package name and iOS bundle ID readiness
- Support URL and privacy URL readiness
- Play Store and App Store review gates
- Permission prompt safety
- Store listing assets
- Mobile payment/subscription policy review
- Real-device evidence checklist

## Safe default

Keep `NATIVE_APP_STRATEGY="pwa_first"` until the deployed website passes final production QA.
