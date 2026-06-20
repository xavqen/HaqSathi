# Phase 118 — SEO Canonical Stability

This patch hardens launch SEO so Vercel, Google Search Console and social previews use one clean production origin.

## What changed

- Added `getSiteUrl()` as the single source for production origin resolution.
- `absoluteUrl()` now normalizes missing protocols, trailing slashes and root paths.
- Metadata, sitemap, robots, article schema and blog breadcrumbs now use normalized URLs.
- Robots now keeps admin, API and authenticated dashboard routes out of indexing.
- Added an audit to prevent raw `NEXT_PUBLIC_APP_URL` string-building from returning in SEO-critical files.

## Why it matters

Google Search Console can show sitemap/canonical issues when environment URLs are inconsistent, especially with `haqsathi.site/`, preview domains, missing `https://`, or localhost fallbacks. This phase reduces those launch failures.
