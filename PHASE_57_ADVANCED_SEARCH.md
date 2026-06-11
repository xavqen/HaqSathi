# Phase 57 - Advanced Search Readiness

This release adds a production-readiness layer for search without replacing the current local search behavior.

## Added
- Admin dashboard: `/admin/search-readiness`
- Protected API: `/api/admin/search-readiness`
- Local evidence command: `npm run search:readiness`
- Phase audit: `npm run phase57:audit`
- Launch evidence gate: Advanced Search Readiness
- Provider readiness for local fallback, Algolia, and Meilisearch
- PII-safe indexing rules
- Hinglish/English synonym plan
- Typo-tolerance review plan
- Reindex automation readiness

## Production rule
Only public content can be indexed. Never index complaint text, document vault data, OCR raw text, support messages, payment metadata, user profile data, phone/email/UPI/bank/card details, OTPs or passwords.

## Recommended launch flow
1. Keep `SEARCH_PROVIDER=local` and `SEARCH_INDEX_DRY_RUN=true` for MVP.
2. Run `npm run search:readiness`.
3. Review `artifacts/search-readiness/search-readiness.json` and CSV.
4. Test `/search?q=refund`, `/search?q=UPI wrong transfer`, `/search?q=income certificate`.
5. Assign `SEARCH_REVIEW_OWNER` before public launch.
6. Switch to Algolia or Meilisearch only after hosted index QA passes.
