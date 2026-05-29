# Phase 18 - Final QA + Release Freeze

This phase does not add a new product module. It adds the launch safety layer needed before production.

## Added

- Final QA admin page: `/admin/final-qa`
- Route inventory admin page: `/admin/route-inventory`
- Release notes admin page: `/admin/release-notes`
- Public final checklist: `/final-launch-checklist`
- CI workflow: `.github/workflows/ci.yml`
- Final audit scripts:
  - `npm run deps:guard`
  - `npm run final:audit`
  - `npm run route:inventory`
  - `npm run prelaunch:full`
  - `npm run qa:all`
- Dependency guard for Prisma and Next pinning
- Generated route inventory support

## Final launch command

```powershell
npm run clean:next-conflict
npm install
npm run db:doctor
npm run db:generate
npm run db:push
npm run db:seed
npm run qa:all
npm run build
npm run smoke:local
npm run dev
```

## Freeze rule

After this phase, avoid adding new features until real users test the app. Only fix bugs, verify official links, improve content, and polish UI.
