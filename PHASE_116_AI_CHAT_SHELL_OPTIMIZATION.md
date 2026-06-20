# Phase 116 — AI Chat + Global Shell Optimization

Focus: reduce AI/chat friction while keeping the global app shell lightweight.

## What changed

- Chat page is a static route shell with ISR safety.
- Chat assistant is dynamically loaded with a skeleton loader.
- Chat API supports lightweight NDJSON streaming.
- Chat client reads streamed chunks, then final structured action plan.
- Retry, stop, timeout and JSON fallback paths were added.
- Rendered chat messages are capped to protect low-end Android devices.
- Chat scroll area uses containment to reduce layout work.
- API uses async Upstash-ready rate limit and no-store headers.
- User language preference query now selects only needed fields.

## Commands

```bash
npm run perf:ai-shell
npm run quality:release
npm run build
```

## Result

The most expensive AI workflow now feels faster, avoids broken loading states, and does not add global bundle cost to non-chat pages.
