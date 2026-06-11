# Phase 90 — Document Expiry & Renewal Planner

Added a practical user-facing tool and launch readiness layer for document renewals.

## User feature
- `/tools/document-expiry-planner`
- Renewal date planning for passport, driving license, insurance, PUC, income/caste/domicile certificates, bank KYC and scholarship documents.
- Generates renewal window, reminder dates, checklist, next actions and privacy/fraud warnings.
- Works with document type + expiry date only; no sensitive ID/bank data needed.

## Admin readiness
- `/admin/document-expiry-readiness`
- `/api/admin/document-expiry-readiness`
- `npm run document-expiry:readiness`
- `npm run phase90:audit`

## Safety rule
Do not ask for OTP, password, UPI PIN, CVV, full card/bank details, Aadhaar/PAN numbers or raw document scans in this planner.
