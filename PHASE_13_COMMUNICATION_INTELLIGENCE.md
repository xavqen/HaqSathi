# Phase 13 — Communication + Authority Intelligence

Added launch-polish systems that make HaqSathi AI better for real complaint follow-up operations.

## Added

- Public Authority Directory: `/authority-directory`
- Call Script Generator: `/tools/call-script-generator`
- Dashboard Communication Log: `/dashboard/communications`
- Dashboard Case Outcomes: `/dashboard/outcomes`
- Admin Authority Directory: `/admin/authority-directory`
- Admin SEO Keyword Backlog: `/admin/seo-keywords`
- Admin Revenue Insights: `/admin/revenue-insights`

## New database models

- `CommunicationLog`
- `CaseOutcome`
- `AuthorityDirectoryEntry`
- `AuthorityBookmark`
- `SeoKeywordOpportunity`

## Run

```powershell
npm run clean:next-conflict
npm install
npm run db:doctor
npm run db:generate
npm run db:push
npm run db:seed
npm run phase13:audit
npm run dev
```
