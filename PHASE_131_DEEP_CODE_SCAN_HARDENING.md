# Phase 131 — Deep Code Scan Hardening

## What changed

- Added `npm run scan:deep` for a second, deeper static scan across the full project.
- Added `npm run scan:complete` to run both the existing full scan and the new deep scan.
- Hardened password-reset dev links so they are impossible in production and require explicit local opt-in.
- Hid local-development reset-link copy from production users.
- Hid dashboard billing dry-run copy from production users.
- Redacted seed-script login passwords from console output.
- Added Phase 131 audit and release-chain enforcement.

## Why this matters

This catches issues feature audits can miss: user-facing dev/debug copy, reset-token leakage during misconfigured email setup, seed secret logs, client-side server env usage, missing package script targets, public asset secret tokens, and duplicate metadata title suffixes.

## Commands

```bash
npm run scan:complete
npm run phase131:audit
npm run quality:release
```
