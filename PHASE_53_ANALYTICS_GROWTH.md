# Phase 53 — Analytics Growth Readiness

Version: `3.0.23-analytics-growth-readiness`

## Added

- Privacy-safe first-party analytics client.
- Consent-aware page view tracking.
- Protected, rate-limited event API: `/api/analytics/event`.
- Admin readiness API: `/api/admin/analytics-readiness`.
- Admin dashboard: `/admin/analytics-readiness`.
- PII redaction for analytics metadata.
- UTM and provider readiness checks.
- Local evidence generator: `npm run analytics:readiness`.
- Launch evidence gate: `Analytics Growth Readiness`.
- Phase audit: `npm run phase53:audit`.

## Launch rule

Keep `NEXT_PUBLIC_FIRST_PARTY_ANALYTICS=false` and `ANALYTICS_EVENT_API_ENABLED=false` until cookie consent, privacy policy, provider domain, UTM campaign URL, and deployed-domain event proof are verified.

## Safe events

Only these coarse events are allowed:

- `page_view`
- `tool_open`
- `complaint_start`
- `pricing_view`
- `pwa_prompt_seen`
- `outbound_link_click`
- `search_submitted`

Never send complaint text, uploaded document content, OTPs, phone numbers, emails, bank details, UPI IDs, Aadhaar/PAN, tokens or secrets into analytics.
