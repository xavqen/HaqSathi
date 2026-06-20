# Phase 132 — Final Deploy Package

## Goal

Turn v3.0.101 into a final launch/deploy bundle with deterministic dependencies, safer auth dev-link defaults and one final deploy-ready gate.

## Implemented

- Pinned all package dependencies and devDependencies to lockfile versions.
- Added npm override so Next uses patched PostCSS 8.5.15 instead of vulnerable nested PostCSS 8.4.31.
- Updated package-lock so npm audit reports zero known vulnerabilities for the lockfile.
- Fixed email verification dev links to be non-production and explicit opt-in only.
- Changed `EMAIL_VERIFICATION_DEV_LINKS` default to false.
- Extended deep scan to catch unsafe email verification dev-link defaults.
- Added `npm run launch:final-ready`.
- Added Phase 132 audit.
- Added final deploy guide.

## Commands

```bash
npm run scan:complete
npm run launch:final-ready
npm run phase132:audit
npm run quality:release
npm run build
```

## Remaining live-only proof

Real production evidence is still required after Vercel deployment: payment, storage, Lighthouse, Playwright, ops snapshot, rollback drill, support gate and artifact manifest.
