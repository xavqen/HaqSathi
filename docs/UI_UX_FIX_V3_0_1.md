# HaqSathi AI v3.0.1 UI/UX Fix Pack

This package keeps the v3.0.1 feature set and applies only UI/UX, mobile optimization and responsive layout fixes.

## Fixed

- Rebuilt mobile header with compact brand, smart CTA and scrollable quick navigation.
- Fixed Start Free behavior:
  - Logged out users go to `/login?next=/tools`.
  - Logged in users go to `/tools`.
- Rebuilt mobile bottom navigation with safe-area support and horizontal overflow protection.
- Hid floating feedback button on mobile so it no longer overlaps bottom navigation.
- Rebuilt homepage in English-first, mobile-first design.
- Rebuilt `/tools` as an all-tools hub with search, category chips and responsive cards.
- Improved dashboard/admin sidebars: desktop gets sticky side nav, mobile gets horizontal quick nav.
- Improved input/select/textarea touch size to avoid mobile zoom and cramped forms.
- Added stronger global responsive CSS to prevent horizontal page shift.

## Run

```powershell
npm install
npm run db:generate
npm run db:push
npm run ui:scan
npm run scan:full
npm run dev
```
