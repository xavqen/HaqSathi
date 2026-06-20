# Phase 117 — Chat Reliability + Mobile Stream Polish

Focus: make the AI chat feel more reliable on weak phones and avoid unnecessary API work.

## What changed

- Fixed non-stream fallback so it reuses the current response instead of creating a duplicate chat request.
- Added a safer NDJSON parser that ignores malformed partial lines instead of breaking the whole chat.
- Added final-buffer parsing for streamed responses so the last event is not lost on slow networks.
- Added sticky-bottom auto-scroll with a user-scroll guard, so streaming follows the answer only when the user is near the bottom.
- Quick prompts now send directly in one tap instead of only filling the text box.
- Added client-side and server-side blocking for obvious OTP/PIN/CVV/password number sharing.
- Added `maxDuration = 30` to the chat route for clearer serverless execution limits.
- Bounded `sessionId` input length to reduce malformed payload risk.
- Fixed old syntax blockers in `insurance-claim-planner-form.tsx`, `client-error-listener.tsx` and `launch-evidence.ts`.
- Added compatibility bridge comments for older phase audit ladders so newer 3.0.x releases do not break the release chain.

## Commands

```bash
npm run phase117:audit
npm run chat:reliability
npm run quality:release
npm run build
```

## Result

Chat now avoids duplicate API calls, streams more safely on unstable mobile networks, preserves manual scrolling, blocks obvious sensitive secrets before they are sent or saved, and keeps the static release audit ladder compatible with newer versions.
