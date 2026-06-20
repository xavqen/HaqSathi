# Phase 119 — PWA Install + Cache Stability

Version: `v3.0.89` / `3.0.89-pwa-install-stability`

## Why this patch

The previous shell still carried an old `v3.0.85` service-worker cache name. That can keep stale UI/API assumptions alive after deployment. The service worker also treated broad document navigations as cacheable, which is risky for private route cache behavior on `/dashboard`, auth routes and document-vault workflows.

## What changed

- Bumped the service-worker cache to `haqsathi-ai-v3-0-89-pwa-install-stability`.
- Added explicit cache bypass prefixes for `/api`, `/admin`, `/dashboard`, `/document-vault`, login/register and password/email verification routes.
- Removed generic `document` from static runtime cache destinations.
- Added token/code query bypass so verification/reset URLs are not stored offline.
- Made PWA registration production-on by default, while still allowing `NEXT_PUBLIC_ENABLE_PWA="false"` to disable it.
- Added a visible PWA update event so users can refresh after a new shell activates.
- Upgraded the install card with installed-mode detection, manual install guidance and compact mode.
- Added the compact install card directly on the chat page before the assistant.

## Result

The app is safer for mobile install, less likely to serve stale private shells, and more useful for users who open the AI chat from phone after installing.
