# Phase 65 — Translation Review Readiness

This phase adds the human translation QA layer needed before scaling HaqSathi to many languages.

## Added

- Admin page: `/admin/translation-review`
- Protected API: `/api/admin/translation-review-readiness`
- Local evidence generator: `npm run translation:readiness`
- Priority review lanes for public pages, core tools, dashboard/vault, official data, legal/privacy and growth/support copy
- Glossary lock for brand names, OTP/PIN/password warnings, official portal wording and legal guidance disclaimers
- RTL review gate for Urdu, Arabic, Hebrew, Persian, Kashmiri and Sindhi layouts
- Launch evidence gate: Translation Review Readiness
- Audit: `npm run phase65:audit`

## Production rule

Machine translations must be treated as draft. Mark review env flags true only after screenshots, reviewer/date notes and P0 page checks are saved.
