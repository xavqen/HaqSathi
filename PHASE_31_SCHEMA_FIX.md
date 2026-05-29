# Phase 31 Schema Fix

Fixed Prisma relation validation errors:

- Added `User.smartComplaintPlans` opposite relation for `SmartComplaintPlan.user`.
- Added `OcrAutofillResult.complaintId` and `OcrAutofillResult.complaint` opposite relation for `Complaint.ocrAutofillResults`.
- Added index on `OcrAutofillResult.complaintId`.

After extracting this version, run:

```powershell
npm install
npm run db:generate
npm run db:push
npm run phase31:audit
npm run scan:full
npm run dev
```
