# HaqSathi AI v3.0.105 — Auth, Billing & Navigation Fix Package

This package is the final launch/deploy code bundle for the current MVP scope.

## What this package includes

- Smart, professional, mobile-first frontend polish with PWA install flow.
- AI complaint/chat/OCR workflows with safety redaction and fallback behavior.
- Public legal/content/SEO fixes for pricing, legal pages, title tags, language hub and UPI fraud escalation.
- Security hardening for auth redirects, CSRF/origin guard, setup DB check restriction and support persistence.
- Production readiness gates for Vercel, Razorpay, Supabase Storage, Lighthouse, Playwright, support, rollback and evidence artifacts.
- Deterministic package pins and npm audit cleanup for the known lockfile vulnerabilities.

## Final local commands

Run these from the project root before deploying:

```bash
npm install
npm run scan:complete
npm run launch:final-ready
npm run quality:release
npm run build
```

If Prisma tries to download engines and your internet is blocked, run the same commands on your real PC/server with internet access.

## Vercel deploy steps

1. Import or update the project on Vercel.
2. Add all production env vars from `.env.example`.
3. Set these production values carefully:
   - `NEXT_PUBLIC_APP_URL=https://haqsathi.site`
   - `AUTH_SECRET`
   - `DATABASE_URL`
   - `DIRECT_URL`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `RAZORPAY_KEY_ID`
   - `NEXT_PUBLIC_RAZORPAY_KEY_ID`
   - `RAZORPAY_KEY_SECRET`
   - `RAZORPAY_WEBHOOK_SECRET`
   - `RESEND_API_KEY`
   - `SUPPORT_EMAIL`
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
4. Keep these dev-link flags false in production:
   - `PASSWORD_RESET_DEV_LINKS=false`
   - `EMAIL_VERIFICATION_DEV_LINKS=false`
5. Deploy on Vercel.
6. Run final live checks.

## Final live checks after deploy

```bash
LAUNCH_QA_BASE_URL=https://haqsathi.site npm run launch:qa
STRICT_LAUNCH_QA=true npm run launch:payment-storage-check
LIGHTHOUSE_BASE_URL=https://haqsathi.site npm run lighthouse:batch
PLAYWRIGHT_BASE_URL=https://haqsathi.site npm run test:e2e
OPS_HEALTH_BASE_URL=https://haqsathi.site npm run launch:ops-snapshot
POSTLAUNCH_SUPPORT_BASE_URL=https://haqsathi.site npm run launch:postlaunch-support
npm run launch:rollback-drill
npm run launch:evidence-gate
npm run launch:artifact-manifest
npm run launch:production-gate
```

## Launch decision rule

Launch only when:

- `/api/health` returns OK.
- `/api/ready` returns OK.
- `npm run launch:evidence-gate` says GO.
- `npm run launch:artifact-manifest` produces no secret-leak issue.
- Razorpay test payment and webhook evidence is saved.
- Supabase Storage upload/download evidence is saved.
- Lighthouse and Playwright reports are saved.
- Rollback owner, support owner and backup proof are ready.

## Manual items that code cannot replace

- Lawyer review of Privacy, Terms and Disclaimer.
- Real grievance officer/support details.
- Real Razorpay production account approval.
- Real Supabase bucket/RLS verification.
- Real Vercel production domain and DNS verification.
