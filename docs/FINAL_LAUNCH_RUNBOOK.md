# HaqSathi AI Final Launch Runbook

## 1. Local setup

```powershell
npm run clean:next-conflict
npm install
npm run db:doctor
npm run db:generate
npm run db:push
npm run db:seed
```

## 2. Prelaunch QA

```powershell
npm run prelaunch:full
npm run build
npm run smoke:local
```

## 3. Manual QA checklist

- Register a new user
- Login as demo user
- Login as admin
- Generate complaint draft
- Generate UPI guide
- Generate scheme result
- Generate document checklist
- Upload/download private document
- Create reminder
- Create support ticket
- Test forgot password
- Test Razorpay checkout in test mode
- Open sitemap and robots
- Test mobile viewport in Chrome DevTools

## 4. Production deploy

- Add all env variables in Vercel
- Confirm Supabase allowed origins / CORS where needed
- Create `documents` storage bucket
- Verify Resend sender domain
- Configure Razorpay webhook endpoint
- Run production build
- Deploy to Vercel

## 5. After launch

- Monitor `/admin/incidents`
- Monitor `/admin/support`
- Monitor `/admin/source-verification`
- Update official links weekly
- Review AI outputs from `/admin/ai-reviews`
