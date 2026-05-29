# Phase 24 — AI case automation + mobile action layer

Added:

- AI Document Reader: `/tools/document-reader`
- AI Case Coach: `/tools/case-coach`
- Auto Follow-up Planner: `/tools/follow-up-automation`
- Dashboard histories: `/dashboard/document-reader`, `/dashboard/case-coach`, `/dashboard/follow-ups`
- Admin automation intelligence: `/admin/automation`
- Mobile bottom quick action bar
- New Prisma models: `DocumentParseResult`, `CaseCoachReport`, `FollowUpAutomation`
- New API routes under `/api/tools/*`

Run:

```bash
npm install
npm run db:generate
npm run db:push
npm run phase24:audit
npm run scan:full
npm run dev
```

Notes:

- Document reader is text-first. For screenshots/PDFs, paste extracted text or upload `.txt`.
- It avoids OCR dependency to keep install light and build stable.
- Sensitive data warnings are included for OTP/PIN/password handling.
