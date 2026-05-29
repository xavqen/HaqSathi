# Phase 15 — Launch Assurance + Verification Layer

Added production-readiness features:

- Verified official source registry: `/official-sources`
- Admin source verification: `/admin/source-verification`
- Production QA tracker: `/admin/production-qa`
- Feature flags: `/admin/feature-flags`
- Incident register: `/admin/incidents`
- Support macros: `/admin/support-macros`
- Metric snapshots: `/admin/metrics-snapshots`
- Grievance route finder: `/tools/grievance-route-finder`
- Fee/refund calculator: `/tools/fee-refund-calculator`
- Appeal draft helper: `/tools/appeal-draft`
- Case package builder: `/dashboard/case-package`

Run:

```powershell
npm run clean:next-conflict
npm install
npm run db:doctor
npm run db:generate
npm run db:push
npm run db:seed
npm run phase15:audit
npm run dev
```
