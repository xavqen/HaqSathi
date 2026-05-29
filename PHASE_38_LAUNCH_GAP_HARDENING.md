# Phase 38 - Launch Gap Hardening

This patch reduces the remaining production gaps without pretending that external production QA is complete.

## Added / improved

- Email verification token lifecycle with resend + confirm routes.
- Resend email templates for verification and reset links.
- Upstash Redis-ready async rate limiter with in-memory fallback.
- Same-origin CSRF guard for auth, billing, vault upload, OCR and logout POST routes.
- Stronger security headers in `next.config.ts`.
- Razorpay webhook lifecycle handling for paid and failed payments.
- Supabase Storage admin self-test endpoint for vault readiness.
- OCR fallback improvement: amount/date/VPA extraction, low-quality hints and sensitive-data masking.
- Expanded official-data seed entries for consumer, cyber, banking, UPI, documents and common schemes.
- Playwright mobile/desktop public smoke tests.
- Lighthouse local runner script.
- Phase 38 audit script and `quality:release` command.

## Still manual / external before final launch

- Full human-reviewed translation for every public/admin/dashboard page.
- Live verification of every official link and scheme deadline.
- Real Razorpay webhook test in dashboard with production keys.
- Real Resend domain verification and inbox delivery test.
- Real Supabase private bucket upload/download test using production bucket policy.
- Playwright and Lighthouse runs against deployed Vercel preview/production URL.
