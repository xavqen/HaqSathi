# Phase 25 — Mobile + Language Expansion

Added:

- Language Hub for all enabled Indian + global languages
- Dynamic language detail pages
- Language Draft Translator tool
- Mobile Readiness Checker tool
- Dashboard Mobile Command Center
- Admin Mobile UX QA desk
- Admin Language Coverage dashboard
- API routes for language draft packs and mobile readiness reports
- Phase 25 audit script

Run:

```bash
npm install
npm run db:generate
npm run db:push
npm run phase25:audit
npm run scan:full
npm run dev
```

Primary language remains English. Users can set a preferred language in Profile and use per-tool language selectors.
