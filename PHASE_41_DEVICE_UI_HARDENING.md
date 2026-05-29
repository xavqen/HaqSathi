# Phase 41 — Device UI Hardening

This patch focuses on making the app feel stable and smooth on both mobile and desktop.

## Fixed

- Added keyboard skip link and a real `#main-content` anchor.
- Hardened mobile CTA/button wrapping so long text does not overflow.
- Reduced card padding on phones while keeping desktop spacing strong.
- Moved cookie consent above the mobile bottom navigation.
- Added viewport-safe focus rings and touch behavior.
- Made wide tables horizontally scrollable on small screens.
- Reinforced `min-width: 0` on grid/flex children to stop layout overflow.
- Kept desktop header compact and mobile navigation horizontally scrollable.
- Added Phase 41 audit into `quality:release`.

## Verify

```bash
npm run ui:scan
npm run phase41:audit
npm run quality:release
```
