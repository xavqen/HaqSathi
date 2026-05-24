# Launch Day Checklist

## 1. Environment

- `NEXT_PUBLIC_APP_URL` points to production domain.
- `AUTH_SECRET` is long and random.
- `DATABASE_URL` uses Supabase pooler URL.
- `DIRECT_URL` uses direct/session DB URL.
- `NEXT_PUBLIC_SUPABASE_URL` is set.
- `SUPABASE_SERVICE_ROLE_KEY` is set only on server env.
- `SUPABASE_STORAGE_BUCKET=documents`.
- Razorpay keys are live keys only after testing.
- Resend key/domain verified before enabling emails.

## 2. Supabase

- Database connection passes `npm run db:doctor`.
- `npm run db:push` completed once.
- `npm run db:seed` completed.
- Storage bucket `documents` exists.
- Bucket is private.
- Signed URL download works.

## 3. Vercel

- All env variables added to Vercel project settings.
- Build command: `npm run build`.
- Install command: `npm install`.
- Output: default Next.js.
- Cron route protected with `CRON_SECRET` before real launch.

## 4. Payment QA

- Razorpay checkout opens.
- Payment success redirects correctly.
- Signature verification passes.
- User plan upgrades after payment.
- Failed/cancelled payment does not upgrade plan.

## 5. Email QA

- Forgot password link is received.
- Reset token expires correctly.
- Support email log stores status.
- Reminder email cron does not spam.

## 6. Public QA

- Home page loads on mobile.
- Complaint generator works.
- Scheme finder works.
- Document checklist works.
- UPI helper works.
- SEO pages render.
- Sitemap and robots render.
- PWA manifest renders.

## 7. Admin QA

- Admin login works.
- Normal user cannot access `/admin`.
- Admin dashboards load without DB errors.
- Export pages do not leak private data.

## Final launch rule

Launch only after `npm run ship:prod` and `npm run build` pass.
