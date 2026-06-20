# Phase 120 - Auth Redirect Safety

Version: `v3.0.90` / `3.0.90-auth-redirect-safety`

## Why this patch matters

Login, registration and Google OAuth all use a `next` destination after authentication. If that value is not sanitized consistently, crafted links can create unsafe post-login redirects, broken navigation, or accidental API/auth-route landings.

## What changed

- Added one shared redirect sanitizer: `lib/security/redirect.ts`.
- Client login now sanitizes `next` before `router.push()`.
- Google OAuth button now sends only a safe path into `/api/auth/google`.
- Google OAuth server flow stores only safe next paths in the httpOnly cookie.
- Protected route login links now use `buildLoginPath()`.
- Email verification and password reset links now use `absoluteUrl()` instead of raw `NEXT_PUBLIC_APP_URL` string concatenation.
- Release version and service-worker cache moved to `v3.0.90`.

## Safety rules

The sanitizer allows same-site relative paths only. It rejects:

- external URLs such as `https://evil.example`
- protocol-relative URLs like `//evil.example`
- encoded slash/backslash tricks near the beginning of the path
- backslashes and control characters
- API/internal asset routes such as `/api`, `/_next`, `/sw.js`, `/offline.html`
- overlong redirect values

## Manual QA

1. Visit `/login?next=/tools` and verify login routes to `/tools`.
2. Visit `/login?next=https://example.com` and verify login routes to `/dashboard`.
3. Visit `/login?next=//example.com` and verify login routes to `/dashboard`.
4. Visit `/login?next=/api/auth/logout` and verify login routes to `/dashboard`.
5. Start Google login from `/login?next=/tools` and verify the OAuth cookie stores a safe local path.
