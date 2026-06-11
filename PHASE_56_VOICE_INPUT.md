# Phase 56 — Voice Input Readiness

This phase adds optional voice dictation support to the complaint generator and a production readiness layer for safely launching microphone-assisted complaint input.

## Added

- `components/forms/voice-input-assist.tsx`
- Complaint form integration for applying transcript to issue description
- `lib/voice/readiness.ts`
- `/admin/voice-input-readiness`
- `/api/admin/voice-input-readiness`
- `npm run voice:readiness`
- `npm run phase56:audit`

## Safety position

Voice input is optional and assistive only. The normal typing flow remains unchanged. The browser handles microphone permission and speech recognition. Users are warned not to speak OTPs, passwords, full bank details, card numbers or secret IDs.

## Required live QA

1. Test Chrome Android speech recognition.
2. Test desktop Chrome speech recognition.
3. Test unsupported browser fallback.
4. Verify transcript preview before applying.
5. Confirm complaint generation still works with typed-only input.
