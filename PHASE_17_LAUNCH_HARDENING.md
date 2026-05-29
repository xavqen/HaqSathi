# Phase 17 - Final Launch Hardening

This phase is a no-new-risk launch polish layer. It adds production guardrails instead of core feature sprawl.

## Added

- Health endpoint: `/api/health`
- Readiness endpoint: `/api/ready`
- Friendly `error.tsx`, `global-error.tsx`, `not-found.tsx`, `loading.tsx`
- Cookie consent banner
- Analytics-ready scripts for GA/Plausible
- Admin Env Health page
- Admin SEO Audit page
- Admin Security Hardening page
- Admin Build Center
- Admin Backup/Restore runbook
- Public `/launch-readiness`
- Public `/deploy-guide`
- Scripts: `build:guard`, `env:audit`, `phase17:audit`, `smoke:local`, `launch:final`

## Recommended final local command

```powershell
npm run clean:next-conflict
npm install
npm run db:doctor
npm run db:generate
npm run db:push
npm run db:seed
npm run launch:final
npm run build
npm run dev
```

## Feature freeze advice

After this phase, do not add more major features before launch. Only fix build errors, payment/email/storage wiring issues, SEO content, and mobile UI problems.
