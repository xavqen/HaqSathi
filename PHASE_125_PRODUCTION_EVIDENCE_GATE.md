# Phase 125 — Production Evidence Gate

## Goal
Add a final no-go gate so HaqSathi AI is not treated as launch-ready until real deployed-domain proof exists.

## Added
- `npm run launch:evidence-gate`
- `npm run launch:production-gate`
- `scripts/launch-evidence-gate.mjs`
- `scripts/phase125-production-evidence-gate-audit.mjs`
- Final evidence gate card on `/launch-readiness`
- Final QA matrix item for the go/no-go gate
- Env knobs: `LAUNCH_EVIDENCE_DIR`, `LAUNCH_STRICT_EVIDENCE_GATE`, `PLAYWRIGHT_REPORT_DIR`

## Evidence checked
- Live route QA artifact
- Payment/storage readiness artifact
- Lighthouse reports
- Playwright report
- Manual approvals for payment, email, storage, official data, AI safety, support and deployment QA
- Rollback owner
- Incident owner
- Founder signoff and go/no-go completion

## Launch rule
If `npm run launch:evidence-gate` returns `NO_GO_BLOCKED` or `NO_GO_EVIDENCE_REQUIRED`, keep the app in soft launch.
