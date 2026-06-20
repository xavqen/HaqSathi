# Phase 126 — Launch Artifact Integrity Gate

## Goal
Make final launch evidence safer and more verifiable before sharing it with collaborators, clients or future developers.

## Added
- `npm run launch:artifact-manifest`
- SHA-256 hashes for launch QA, payment/storage, Lighthouse, Playwright and final evidence artifacts
- Secret-leak scan for common server-only credentials in generated reports
- JSON + CSV manifest output under `artifacts/live-launch-qa/`
- Final QA matrix item for artifact integrity
- Production gate now runs evidence gate and artifact manifest after live QA checks

## Why it matters
A launch can pass locally but still fail trust review if screenshots/reports are mixed from different runs or accidentally include secrets. This phase gives every evidence file a fingerprint and blocks sharing when sensitive-looking tokens appear.

## Recommended final launch order

```bash
npm install
npm run quality:release
npm run build
LAUNCH_QA_BASE_URL=https://haqsathi.site npm run launch:qa
STRICT_LAUNCH_QA=true npm run launch:payment-storage-check
LIGHTHOUSE_BASE_URL=https://haqsathi.site npm run lighthouse:batch
PLAYWRIGHT_BASE_URL=https://haqsathi.site npm run test:e2e
npm run launch:evidence-gate
npm run launch:artifact-manifest
```

Use `STRICT_LAUNCH_ARTIFACTS=true` only after all required artifacts exist.
