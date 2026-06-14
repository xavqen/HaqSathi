# Phase 115 — Performance Production Pass

This release switches from feature expansion to real performance stabilization.

## What changed

- Root layout no longer reads cookies or queries the database.
- User/account navbar state is fetched through a no-store client API after the static shell loads.
- Non-critical runtime widgets are deferred until the browser is idle.
- Base Card and Button components no longer import Framer Motion globally.
- Homepage and key marketing pages are static/ISR-ready.
- Blog query now selects only the fields required for the listing page.
- next/font is used to prevent external font blocking and layout shift.
- Package import optimization is enabled for lucide-react and framer-motion.
- A Phase 115 audit guards the performance architecture.

## Why this matters

The homepage and public shell should ship less JavaScript, avoid database work during first paint, and keep interactive runtime code out of the critical render path.
