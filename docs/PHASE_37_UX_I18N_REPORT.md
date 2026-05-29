# Phase 37 UX + i18n polish report

Base: v3.0.6 product polish i18n shell.

## What changed

- Core public pages now read selected language from the app language cookie.
- Added page-level copy dictionary for complaint, UPI, scheme, documents, refund, pricing, login and register pages.
- Mobile bottom navigation now shows active state and hides on auth/admin screens.
- Forms, inputs, textareas and long content received stronger responsive defaults.
- Pricing page was rebuilt from dense one-line JSX into a cleaner mobile/desktop layout.

## Commands

```powershell
npm run phase37:audit
npm run content:polish:audit
npm run product:polish:audit
npm run ui:scan
npm run scan:full
```
