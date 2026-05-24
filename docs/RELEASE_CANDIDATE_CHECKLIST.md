# HaqSathi AI Release Candidate Checklist

## Feature freeze rule
Do not add new large features before launch. Only fix verified build/runtime bugs, production env issues, verified official data, payment/email/storage bugs, and mobile UI breakage.

## Local RC command

```bash
npm run clean:next-conflict
npm install
npm run db:doctor
npm run db:generate
npm run db:push
npm run db:seed
npm run preflight:prod
npm run build
npm run dev
```

## Manual test routes

- `/`
- `/complaint`
- `/upi-help`
- `/scheme-finder`
- `/documents`
- `/chat`
- `/dashboard`
- `/admin`
- `/api/health`
- `/api/ready`
- `/api/diagnostics/build`

## Launch blockers

- `npm run build` fails
- Supabase DB/Storage fails
- Razorpay checkout or signature verification fails
- Resend forgot-password email fails
- Admin login fails
- Dashboard protected pages open without login
- Mobile layout is broken on key pages
