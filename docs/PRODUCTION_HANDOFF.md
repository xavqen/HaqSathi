# HaqSathi AI Production Handoff

Current release: `2.0.1`

## Feature freeze status

No new major features should be added before first launch. Only fix actual build/runtime bugs.

## Ready modules

- Complaint generator
- Refund/UPI/cyber flows
- Scheme finder
- Document checklist
- Dashboard/admin
- SEO pages/blog/templates
- Document vault with Supabase Storage-ready flow
- Razorpay-ready billing
- Resend-ready password reset/reminder email
- Case operations, authority directory, state guides, final QA pages

## Final local test

```powershell
npm run clean:next-conflict
npm install
npm run db:doctor
npm run db:generate
npm run db:push
npm run db:seed
npm run doctor:all
npm run release:final-check
npm run build
npm run dev
```

## Manual test URLs

- `/`
- `/complaint`
- `/upi-help`
- `/scheme-finder`
- `/documents`
- `/login`
- `/register`
- `/dashboard`
- `/admin`
- `/release-final`
- `/admin/system-doctor`

## Launch rule

If `npm run build` fails, stop and fix the exact error. Do not continue adding features.
