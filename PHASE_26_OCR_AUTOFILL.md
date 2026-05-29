# Phase 26 — OCR Autofill Complaint

Added a mobile-first image/PDF/text upload tool that extracts complaint-ready fields.

## User features
- `/tools/ocr-autofill`
- `/dashboard/ocr-autofill`
- One-click autofill into `/complaint`
- Image preview on mobile
- Language-aware extraction instructions
- Safe fallback extraction when AI vision keys are not configured

## Admin features
- `/admin/ocr-reviews`
- Provider/confidence monitoring
- Recent extraction review cards

## AI vision support
Optional env keys:

```env
OPENAI_API_KEY=""
OPENAI_VISION_MODEL="gpt-4o-mini"
GEMINI_API_KEY=""
GEMINI_VISION_MODEL="gemini-1.5-flash"
```

If no AI vision key is set, the tool still works with notes/file-name heuristic extraction.

## Commands

```bash
npm install
npm run db:generate
npm run db:push
npm run phase26:audit
npm run scan:full
npm run dev
```
