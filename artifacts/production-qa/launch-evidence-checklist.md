# HaqSathi AI Production QA Evidence Pack

Generated: 2026-05-29T09:22:21.320Z
Version: 3.0.10-production-qa-pack

## Go/No-Go Gates

| Priority | Gate | Command / Action | Evidence to save | Result | Notes |
|---|---|---|---|---|---|
| P0 | Clean install build | `npm ci && npm run db:generate && npm run release:typecheck && npm run build` | Terminal/CI log | TODO | TODO |
| P0 | Vercel runtime QA | `Open production URL, /api/health, /api/ready, sitemap and robots` | Vercel URL + screenshots | TODO | TODO |
| P0 | Razorpay lifecycle | `Successful + failed test payment and webhook verification` | Event IDs + DB rows | TODO | TODO |
| P0 | Resend delivery | `Register, verify email, forgot password and test email` | Inbox screenshots + EmailLog | TODO | TODO |
| P0 | Supabase Storage vault | `Upload/download/deny cross-user access` | Self-test JSON + metadata row | TODO | TODO |
| P0 | Security abuse check | `CSRF, rate limit, headers and env exposure checks` | Blocked request + header proof | TODO | TODO |
| P1 | Official link review | `Verify every public source URL and notes` | Reviewer CSV + screenshots | TODO | TODO |
| P1 | Translation review | `Review priority pages/locales` | Reviewer CSV + screenshots | TODO | TODO |
| P1 | Playwright production | `E2E_BASE_URL=https://domain npm run test:e2e` | Playwright report | TODO | TODO |
| P1 | Lighthouse production | `LIGHTHOUSE_BASE_URL=https://domain npm run lighthouse:local` | Lighthouse report | TODO | TODO |

## Final rule

Do not send SEO/ads/social traffic until all P0 gates are PASS and every P1 gate has either PASS or a written risk acceptance note.
