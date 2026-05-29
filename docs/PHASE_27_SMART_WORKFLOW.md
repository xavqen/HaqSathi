# Phase 27 Smart Complaint Workflow

This phase adds a mobile-first smart complaint wizard that combines issue intake, evidence gap checking, readiness scoring, complaint draft, WhatsApp/support message, call script and follow-up action plan.

## Routes
- `/tools/smart-complaint-wizard`
- `/dashboard/smart-wizard`
- `/admin/smart-wizard-insights`
- `/api/tools/smart-complaint-wizard`

## Database
- `SmartComplaintPlan` stores user workflow output and readiness score.

## Run
```powershell
npm run db:generate
npm run db:push
npm run phase27:audit
npm run scan:full
npm run dev
```
