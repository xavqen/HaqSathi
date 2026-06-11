# Phase 109 - Lost Document Report Planner

Added a lost document report and duplicate/reissue planner for Aadhaar, PAN, passport, DL/RC, bank card, SIM/phone, voter ID and certificates.

## Includes

- User tool: `/tools/lost-document-report-planner`
- Admin readiness: `/admin/lost-document-readiness`
- Protected API: `/api/admin/lost-document-readiness`
- Evidence generator: `npm run lost-document:readiness`
- Audit: `npm run phase109:audit`

## Safety

The planner prioritizes blocking misuse risks, official police/lost-report routes, duplicate/reissue official channels and redaction of identity numbers, QR/barcodes, OTP, passwords, CVV and UPI PIN.
