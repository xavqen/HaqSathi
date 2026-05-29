# HaqSathi AI Full Code Scan Report

Package: `haqsathi-ai`  
Version: `2.0.1`  
Scan date: 2026-05-23

## Scope scanned

- 488 project files
- 169 app/page routes
- 86 API route files
- 72 Prisma models
- 12 Prisma enums
- All local `@/` and relative imports
- Literal internal page links
- Literal API fetch URLs and HTTP methods
- Environment variables used in code vs `.env.example`
- Known UI pitfall: `<Button asChild>` usage without Radix Slot support

## Fixes applied after scan

1. Removed unsupported `<Button asChild>` usage from `/release-stable`.
2. Added `npm run scan:full` static code scan command.
3. Added `scripts/full-code-scan.ts`.
4. Pinned `typescript` to `5.8.3` instead of `latest` to reduce build drift.
5. Updated `NEXT_PUBLIC_APP_VERSION` to `2.0.1`.
6. Updated service-worker cache name to `haqsathi-ai-v2-0-1`.
7. Updated production handoff release label from RC to stable patch.

## Static scan result

```text
HaqSathi AI full code scan
Files scanned: 488
Issues found: 0
✅ Static scan passed: imports, literal routes, API methods, env references and known UI pitfalls look OK.
```

## Still requires real local verification

These cannot be fully verified by static scan only:

- `npm install`
- `npm run db:doctor`
- `npm run db:push`
- `npm run db:seed`
- `npm run typecheck`
- `npm run build`
- Real Supabase Storage upload/download
- Real Razorpay checkout/webhook test
- Real Resend email delivery

## Recommended final command

```powershell
npm run clean:next-conflict
npm install
npm run db:doctor
npm run db:generate
npm run db:push
npm run db:seed
npm run scan:full
npm run ship:prod
npm run dev
```
