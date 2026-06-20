# Phase 124 — Live Launch QA Pack

Version: `3.0.94-live-launch-qa-pack`

## What changed

- Added a live route QA command for the final Vercel domain.
- Added payment/storage env and optional live provider checks for Razorpay, Supabase, DB and Upstash.
- Added a Lighthouse batch command for mobile + desktop Core Web Vitals evidence.
- Added a final production proof matrix to `/launch-readiness`.
- Expanded Playwright smoke coverage for pricing debug leaks, homepage tool count, fraud escalation visibility and public trust pages.

## Commands

```bash
npm run quality:release
npm run build
LAUNCH_QA_BASE_URL=https://haqsathi.site npm run launch:qa
npm run launch:payment-storage-check
LIGHTHOUSE_BASE_URL=https://haqsathi.site npm run lighthouse:batch
PLAYWRIGHT_BASE_URL=https://haqsathi.site npm run test:e2e
```

## Manual evidence still required

- Razorpay sandbox/live payment success, invalid signature rejection and webhook replay evidence.
- Supabase private bucket upload + signed download evidence.
- AI complaint/chat/OCR production-key proof with safe test data.
- Vercel production env screenshot with sensitive values masked.
- Lighthouse reports saved from the deployed domain.
