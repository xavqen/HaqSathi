# Phase 22 — Google Auth + Logged-in UX Polish

Added in v2.1.0:

- Google OAuth login/register routes:
  - `/api/auth/google`
  - `/api/auth/google/callback`
- Google button on Login and Register pages.
- Existing email users can connect Google from `/dashboard/profile`.
- Navbar now shows user name, avatar, plan badge and account menu after login.
- `Start Free` CTA is hidden after login and replaced with plan-aware `Upgrade/Premium/Family/Agent` badge.
- Logout is removed from the navbar and moved to `/dashboard/profile`.
- Dashboard got a rounded all-in-one command center with quick actions.
- User model now stores `googleId`, `avatarUrl`, and `emailVerifiedAt`.

## Google Cloud setup

1. Open Google Cloud Console.
2. Create/select project.
3. APIs & Services → OAuth consent screen → configure app name/support email.
4. APIs & Services → Credentials → Create Credentials → OAuth client ID.
5. App type: Web application.
6. Authorized JavaScript origin:
   - `http://localhost:3000`
   - production domain later, for example `https://yourdomain.com`
7. Authorized redirect URI:
   - `http://localhost:3000/api/auth/google/callback`
   - production later: `https://yourdomain.com/api/auth/google/callback`
8. Copy client ID/secret into `.env`.

```env
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_AUTH_REDIRECT_URI="http://localhost:3000/api/auth/google/callback"
```

Run:

```powershell
npm install
npm run db:generate
npm run db:push
npm run scan:full
npm run dev
```
