# Phase 43 — Popover Overflow Fix

This patch fixes the UI break shown on `/tools` where header dropdowns could become too narrow on desktop and could overflow/clamp off-screen on mobile.

## Fixed

- Replaced fragile Tailwind arbitrary `w-[min(...)]` dropdown widths with stable CSS classes.
- Added `.hs-popover`, `.hs-language-popover`, and `.hs-account-popover` rules in `app/globals.css`.
- Made mobile dropdowns fixed, viewport-contained, scrollable, and safe-area aware.
- Removed aggressive `overflow-wrap:anywhere` from global text rules to stop one-letter-per-line menu labels.
- Kept all business logic, routes, IDs, API calls, data attributes, colors, typography, and branding unchanged.

## Result

- Desktop account menu keeps proper width.
- Mobile language switcher no longer clips off-screen.
- Header menus do not create horizontal scrolling.
- Bottom navigation and content remain usable while dropdowns are open.
