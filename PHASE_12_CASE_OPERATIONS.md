# Phase 12 - Case Operations + Filing Guides

Added launch features:

- Emergency first-response center: `/emergency`
- Official filing guides: `/filing-guides`
- Filing guide detail pages: `/filing-guides/[slug]`
- Ombudsman escalation planner: `/tools/ombudsman-planner`
- User action plan board: `/dashboard/action-plan`
- Private case notes: `/dashboard/case-notes`
- Admin filing guide monitor: `/admin/filing-guides`
- Admin AI quality review page: `/admin/ai-reviews`

New Prisma models:

- `CaseTask`
- `CaseNote`
- `AiOutputReview`
- `OfficialFilingGuide`

Run after update:

```powershell
npm run clean:next-conflict
npm install
npm run db:doctor
npm run db:generate
npm run db:push
npm run db:seed
npm run phase12:audit
npm run dev
```
