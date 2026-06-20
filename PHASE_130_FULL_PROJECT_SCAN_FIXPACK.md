# Phase 130 — Full Project Scan Fixpack

## What was scanned
- Alias and relative imports across app, components, lib and scripts.
- Literal page links and public asset links.
- Literal API fetch URLs and HTTP method compatibility.
- `process.env.*` usage vs `.env.example` coverage.
- Sensitive setup-route output.
- Contact/support persistence behavior.
- Server-only AI instruction boundaries.

## Bugs fixed
1. Added `lib/auth/guards.ts` compatibility exports so 16 admin readiness API routes no longer import a missing module.
2. Hardened `/api/setup/db-check`; production access now requires admin session or `SETUP_DB_CHECK_SECRET`, and the route no longer returns any database URL.
3. Made `/api/contact` persistence transactional and fail closed with `503` instead of returning `ok: true` after a database error.
4. Added missing public legal/grievance env keys and `SETUP_DB_CHECK_SECRET` to `.env.example`.
5. Marked AI language instruction helper as server-only.
6. Added `npm run scan:full` and Phase 130 audit to the release chain.

## New commands
```bash
npm run scan:full
npm run phase130:audit
```
