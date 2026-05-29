# Phase 36 — I18N Shell + UX Continuation

Base: v3.0.5 product polish branch.

## What changed

- Added public language switcher in the top header.
- Added `/api/language/cookie` so logged-out users can also change app shell language.
- Added shell dictionaries for English, Hinglish, Hindi, Bengali, Marathi, Tamil, Telugu and Urdu.
- Navbar, account menu, disclaimer banner, footer, homepage and `/tools` shell now read translated labels from the selected language cookie.
- Preserved English as default product language.
- Kept AI assistant preference in Dashboard → Language for logged-in users.
- Added `npm run phase36:audit`.

## UX decision

Full translation of every one of the 200+ pages should happen in a controlled rollout. This phase translates the public shell and highest-traffic entry pages first so the app feels multilingual without breaking tool logic.

## Next recommended cleanup

1. Translate dashboard shell groups and account pages.
2. Translate top 10 public tools only, then expand category-wise.
3. Add Playwright screenshots for mobile 360px, 390px, 430px and desktop 1366px.
4. Add a language coverage admin report.
