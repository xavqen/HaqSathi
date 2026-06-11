# Phase 113 — Premium Motion Spotlight

This release adds a high-end interaction polish layer inspired by Stripe, Linear and Vercel.

## Added

- `SpotlightLink` for animated hover spotlight cards and links.
- `SpotlightSurface` for premium pointer-reactive panels.
- `MotionNumber` for reveal-counting metrics.
- `MotionPresencePanel` for reusable smooth mount/unmount panels.
- Mobile-safe spotlight disabling on coarse pointers.
- Reduced-motion safe fallbacks.
- Phase 113 audit wired into release checks.

## Safety

- No route, API, database or business logic behavior was changed.
- Animations use transform/opacity and pointer CSS variables.
- Touch devices avoid expensive pointer spotlight effects.
