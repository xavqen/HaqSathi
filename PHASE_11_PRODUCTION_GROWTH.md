# Phase 11 Production Growth Layer

Added in v1.2.0:

- Referral link creation and dashboard stats
- Privacy Center with consent logs
- Data deletion request flow
- Weekly action digest for users
- Reminder notification queue
- Vercel cron config for daily reminder processing
- Admin compliance center
- Admin notification center

## Run

```powershell
npm run clean:next-conflict
npm install
npm run db:doctor
npm run db:generate
npm run db:push
npm run db:seed
npm run phase11:audit
npm run dev
```

## Cron

`vercel.json` runs `/api/cron/reminders` daily at 03:00 UTC.

If `CRON_SECRET` is set, call cron manually with:

```powershell
curl -H "Authorization: Bearer YOUR_SECRET" http://localhost:3000/api/cron/reminders
```
