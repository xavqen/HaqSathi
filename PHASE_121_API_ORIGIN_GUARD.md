# Phase 121 - API Origin Guard

Version: `v3.0.91` / `3.0.91-api-origin-guard`

## Why this patch matters

Many user, dashboard, AI and admin API routes accept mutating requests. Earlier protection existed on key auth/payment routes, but not every route used the same CSRF helper. That left the project dependent on every future route remembering to add the guard manually.

## What changed

- Added `lib/security/request-origin.ts` as one shared API mutation origin policy.
- Added a global proxy guard for all mutating `/api/*` requests.
- Blocks cross-site browser POST/PATCH/PUT/DELETE requests before route handlers run.
- Keeps same-origin/same-site browser calls working.
- Keeps server-to-server calls working when browsers do not send Origin/Sec-Fetch headers.
- Keeps explicit bypasses for signed/webhook/cron/health-style routes.
- Updated `csrfGuard()` to use the same shared origin policy.
- Release version and service-worker cache moved to `v3.0.91`.

## Guard behavior

The proxy allows:

- safe methods: `GET`, `HEAD`, `OPTIONS`
- same-origin app requests
- same-site app requests
- explicit server/webhook/cron bypass routes
- server-to-server requests without browser origin metadata

The proxy blocks:

- cross-site mutating browser requests
- mutating requests with an Origin host outside the allowed app hosts
- unknown mutating methods on API routes

## Manual QA

1. Open the app normally and submit login/register/chat/tool forms.
2. From browser devtools, POST to `/api/profile` with `Origin: https://evil.example` and confirm `403`.
3. Confirm Razorpay webhook and cron routes still rely on their own signatures/secrets.
4. Run `npm run phase121:audit` before release.
