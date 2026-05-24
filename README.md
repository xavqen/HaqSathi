# HaqSathi AI

AI-powered India-focused complaint, refund, UPI, document and scheme helper.

Tagline: **Aapka haq, complaint, refund, documents aur schemes — sab simple language me.**


## Latest package status

- Stable release: **v2.0.1**
- Static full-code scan included: `npm run scan:full`
- Use `npm run ship:prod` before production build.

## Stable v2.0.1 Included

- Complaint generator with AI/fallback drafts
- UPI fraud/wrong transfer helper
- Scheme finder
- Document checklist generator
- WhatsApp-style AI chat assistant
- Cookie-session auth: register, login, logout
- User dashboard: complaints, saved drafts, reminders, profile, billing
- Admin dashboard: users, complaints, SEO pages, schemes, analytics
- Admin scheme database CRUD
- Programmatic SEO pages and sitemap/robots
- Razorpay-ready checkout + verification routes
- Prisma PostgreSQL schema and seed data

## Run locally

```powershell
npm install
copy .env.example .env
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

Open:

```text
http://localhost:3000
```

## Test accounts after seed

```text
Admin: admin@haqsathi.local / Admin@123456
Demo:  demo@haqsathi.local / Demo@123456
```

You can change admin seed password:

```env
SEED_ADMIN_PASSWORD="YourStrongPassword@123"
```

Then run:

```powershell
npm run db:seed
```

## Supabase PostgreSQL setup

1. Supabase project create karo.
2. Project Settings → Database → Connection string copy karo.
3. `.env` me `DATABASE_URL` paste karo.
4. `npm run db:push` run karo.
5. `npm run db:seed` run karo.

## AI setup

Without keys app safe fallback drafts use karta hai.

To enable real AI:

```env
OPENAI_API_KEY="your_key"
OPENAI_MODEL="gpt-4o-mini"
```

or

```env
GEMINI_API_KEY="your_key"
GEMINI_MODEL="gemini-1.5-flash"
```

## Important URLs

- `/complaint`
- `/refund`
- `/upi-help`
- `/scheme-finder`
- `/documents`
- `/chat`
- `/dashboard`
- `/admin`
- `/sitemap.xml`
- `/robots.txt`

## Notes

- HaqSathi AI is not a government authority or legal service.
- Cyber fraud cases should be reported immediately through official emergency channels and bank support.
- Official scheme eligibility and links must be verified on official portals.


## Phase 3 additions

- Complaint status update from dashboard
- Complaint PDF export: `/api/complaints/[id]/export`
- WhatsApp share action for saved complaints
- Reminder mark done/cancel/delete
- Editable user profile
- Family profiles for Family plan
- Agent client case tracker for Agent plan
- Document vault metadata page with Supabase Storage-ready placeholder
- Razorpay webhook verification placeholder
- Admin payments page
- Expanded programmatic SEO seed pages

After pulling Phase 3, run:

```powershell
npm install
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

PDF export uses `pdfkit`. On Vercel this route runs as Node.js runtime.


## Phase 4 additions

- Free plan AI quota tracking: 3 complaint drafts/month.
- `/dashboard/usage` shows monthly usage and remaining quota.
- CSV export: `/api/dashboard/export/complaints`.
- Admin CSV export: `/api/admin/export/complaints` and `/api/admin/export/users`.
- Support tickets: `/dashboard/support` and `/admin/support`.
- Security headers via `proxy.ts`.
- Route audit command: `npm run routes:audit`.
- Public `/status` and `/changelog` pages.

After pulling this phase, run:

```powershell
npm install
npm run db:generate
npm run db:push
npm run db:seed
npm run routes:audit
npm run dev
```


## Phase 5 additions

- Blog/guide engine with `/blog` and `/blog/[slug]`.
- Admin blog CRUD at `/admin/blog`.
- Article schema and breadcrumb schema for blog SEO.
- Resend-ready transactional email service with logs at `/admin/emails`.
- User onboarding at `/dashboard/onboarding`.
- User activity timeline at `/dashboard/activity`.
- Full user JSON backup at `/dashboard/export`.
- Admin full JSON backup at `/admin/backups`.
- New Prisma models: BlogPost, EmailLog, UserActivity, OnboardingProgress, DataExport.
- Health audit command: `npm run health:audit`.

After pulling Phase 5, run:

```powershell
npm install
npm run db:generate
npm run db:push
npm run db:seed
npm run health:audit
npm run dev
```

Email sending is safe by default: if `RESEND_API_KEY` is empty, email attempts are logged as `SKIPPED` instead of failing the app.


## Phase 6 additions

- Public template library: `/templates`
- Template generator pages: `/templates/[slug]`
- User template history: `/dashboard/templates`
- Notification preferences: `/dashboard/settings`
- Official resource directory: `/resources`
- Admin template management: `/admin/templates`
- Admin resource view: `/admin/resources`
- Admin feedback view: `/admin/feedback`

After pulling Phase 6, run:

```bash
npm install
npm run db:generate
npm run db:push
npm run db:seed
npm run routes:audit
npm run health:audit
npm run dev
```


## Phase 7 additions

- PWA manifest + service worker + offline page
- Universal app search at `/search`
- Admin launch checklist at `/admin/launch`
- Admin audit log at `/admin/audit`
- Dashboard security page at `/dashboard/security`
- Global safety disclaimer banner
- Floating feedback widget
- Client error logging endpoint in dry-run mode

Run before launch:

```bash
npm run db:generate
npm run db:push
npm run db:seed
npm run launch:audit
npm run build
```

## Phase 8 fix pack

Your reported issue was **Prisma P1000 database authentication failed**. That is not a code bug; it means `.env` has invalid Supabase database credentials. This pack adds safer error handling and tools so the app does not crash with empty JSON responses.

### Fixed

- `middleware.ts` renamed to `proxy.ts` for Next.js 16.
- Added `prisma.config.ts` and removed deprecated `package.json#prisma` config.
- Added `directUrl = env("DIRECT_URL")` in Prisma schema.
- Added `npm run db:doctor` to validate and explain DB URL issues.
- Added `/setup` page and `/api/setup/db-check` endpoint.
- Login/register APIs now return clean JSON errors when DB credentials are wrong.
- Auth form no longer crashes on non-JSON/empty server responses.
- Added `data-scroll-behavior="smooth"` to the root html element.

### Correct Supabase DB setup

1. Open Supabase Dashboard.
2. Select your project.
3. Click **Connect** or go to **Project Settings → Database**.
4. Copy the **Prisma / Transaction pooler** connection string into `DATABASE_URL`.
5. Copy the **Direct connection** string into `DIRECT_URL`.
6. Replace the placeholder password with your real DB password.
7. If your password contains symbols like `@ # / ? :`, URL-encode it.
8. Run:

```powershell
npm run db:doctor
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

### Example `.env` shape

```env
DATABASE_URL="postgresql://postgres.PROJECT_REF:YOUR_PASSWORD@aws-0-region.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres:YOUR_PASSWORD@db.PROJECT_REF.supabase.co:5432/postgres"
```

If `npm run db:doctor` says authentication failed, reset your DB password in Supabase and paste the fresh connection strings again.

## Phase 9 huge feature expansion

Added in `0.9.0`:

- Public tools hub: `/tools`
- Complaint deadline calculator: `/tools/deadline-calculator`
- Complaint strength checker: `/tools/complaint-strength-checker`
- Evidence checklist generator: `/tools/evidence-checklist`
- Risk assessment: `/tools/risk-assessment`
- Case command center: `/dashboard/cases`
- Escalation plans: `/dashboard/escalations`
- Language and assistant style preferences: `/dashboard/language`
- User risk report history: `/dashboard/risk-reports`
- Admin growth dashboard: `/admin/growth`
- Admin SEO content ideas: `/admin/content-ideas`
- Admin case intelligence: `/admin/case-intelligence`

After updating from Phase 8, run:

```powershell
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

## Phase 10 / 1.0 completion layer

Added final launch-oriented modules:

- Legal notice style draft generator: `/tools/legal-notice-draft`
- RTI application helper: `/tools/rti-helper`
- Consumer forum pack builder: `/tools/consumer-forum-pack`
- Bank escalation planner: `/tools/bank-escalation`
- Evidence pack builder and history: `/dashboard/evidence-packs`
- Reminder calendar ICS export: `/dashboard/calendar`
- Saved official links: `/dashboard/saved-links`
- Admin operations center: `/admin/ops`

After unzipping, run:

```powershell
npm install
npm run db:doctor
npm run db:generate
npm run db:push
npm run db:seed
npm run complete:audit
npm run dev
```

Important: set valid `DATABASE_URL` and `DIRECT_URL` in `.env` before `db:push`. If Supabase auth fails, use the pooled URL with the correct username format and reset the database password if needed.

## Phase 10 v1.1.0 launch hardening

Added:

- Real Supabase Storage document upload/download with signed URLs
- Real password reset token flow with Resend-ready email
- Live Razorpay checkout + payment signature verification
- `npm run clean:next-conflict` for Next.js 16 proxy cleanup
- `npm run phase10:audit`

Upgrade commands:

```powershell
npm run clean:next-conflict
npm run db:doctor
npm run db:generate
npm run db:push
npm run db:seed
npm run phase10:audit
npm run dev
```

Extra env for launch features:

```env
NEXT_PUBLIC_SUPABASE_URL="https://PROJECT_REF.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
SUPABASE_STORAGE_BUCKET="documents"
RESEND_API_KEY=""
RAZORPAY_KEY_ID=""
NEXT_PUBLIC_RAZORPAY_KEY_ID=""
RAZORPAY_KEY_SECRET=""
RAZORPAY_WEBHOOK_SECRET=""
PASSWORD_RESET_DEV_LINKS="true"
```

## Phase 11 additions

Version `1.2.0` adds production growth/compliance features:

- `/dashboard/referrals` referral invite system
- `/dashboard/privacy-center` consent and deletion request controls
- `/dashboard/digest` weekly action digest
- `/admin/compliance` consent/deletion request monitoring
- `/admin/notifications` reminder email queue monitoring
- `/api/cron/reminders` daily reminder notification cron

Run audit:

```bash
npm run phase11:audit
```


## Phase 13 additions

Communication log, case outcomes, authority directory, SEO keyword backlog, revenue insights, and call-script generator are included. Run `npm run phase13:audit` after `db:push` and `db:seed`.

## Phase 14 - Trust operations

New v1.5.0 pages:

- `/state-guides`
- `/success-stories`
- `/tools/sla-planner`
- `/dashboard/sla-tracker`
- `/dashboard/case-health`
- `/dashboard/agent-invoices`
- `/admin/data-quality`
- `/admin/link-checks`
- `/admin/prompt-lab`
- `/admin/state-guides`
- `/admin/success-stories`
- `/admin/invoices`

After extracting this version run:

```powershell
npm run clean:next-conflict
npm install
npm run db:doctor
npm run db:generate
npm run db:push
npm run db:seed
npm run phase14:audit
npm run dev
```


## Phase 15 launch assurance

Added official source registry, source verification dashboard, production QA tracker, feature flags, incident register, support macros, metric snapshots, grievance route finder, fee refund calculator, appeal draft helper, and user case package builder.

Run:

```powershell
npm run clean:next-conflict
npm install
npm run db:doctor
npm run db:generate
npm run db:push
npm run db:seed
npm run phase15:audit
npm run dev
```

## Phase 16 - Scale, localization, partner operations

Version `1.7.0` adds final scale-facing layers:

- `/partners` public partner onboarding
- `/knowledge-base` public playbook library
- `/tools/notice-reply-draft`
- `/tools/status-message-builder`
- `/tools/document-gap-analyzer`
- `/dashboard/verification-requests`
- `/dashboard/print-center`
- `/dashboard/learning`
- `/dashboard/partner`
- `/admin/partner-leads`
- `/admin/moderation`
- `/admin/experiments`
- `/admin/playbooks`
- `/admin/localization`
- `/admin/print-jobs`

Run:

```powershell
npm run clean:next-conflict
npm install
npm run db:doctor
npm run db:generate
npm run db:push
npm run db:seed
npm run phase16:audit
npm run dev
```


## Phase 17 - Final Launch Hardening

Run final checks:

```powershell
npm run clean:next-conflict
npm install
npm run db:doctor
npm run db:generate
npm run db:push
npm run db:seed
npm run launch:final
npm run build
npm run dev
```

Open `/admin/build-center`, `/admin/env-health`, `/admin/seo-audit`, `/admin/security-hardening`, `/launch-readiness`, and `/deploy-guide`.

## Phase 18 Final QA

Final launch hardening commands:

```powershell
npm run clean:next-conflict
npm install
npm run db:doctor
npm run db:generate
npm run db:push
npm run db:seed
npm run qa:all
npm run build
npm run smoke:local
npm run dev
```

New final QA pages:

- `/final-launch-checklist`
- `/admin/final-qa`
- `/admin/route-inventory`
- `/admin/release-notes`

After Phase 18, freeze new features and focus only on bug fixes, verified official source data, live payment/email testing, and mobile QA.


## v2.0.0 RC1 - Final release candidate

Run this before launch:

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

New RC routes:

- `/release-candidate`
- `/api/diagnostics/build`

Feature freeze is active. Add only bug fixes, verified content, deployment fixes, and official-data updates before first public launch.

## Google Login Setup

Add this in `.env` after creating a Google OAuth Web Client:

```env
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_AUTH_REDIRECT_URI="http://localhost:3000/api/auth/google/callback"
```

Google Cloud Console redirect URI for local dev:

```text
http://localhost:3000/api/auth/google/callback
```

Then run:

```powershell
npm run db:generate
npm run db:push
npm run dev
```
