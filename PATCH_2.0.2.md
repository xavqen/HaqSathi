# HaqSathi AI 2.0.2 Patch

Fixes:
- Replaced PowerShell-only cleanup scripts with cross-platform Node scripts.
- Fixed full-code scanner Windows path normalization false positives.
- `npm run scan:full` should now pass for existing routes and API routes.

Run:

```powershell
npm install
npm run db:doctor
npm run db:generate
npm run db:push
npm run db:seed
npm run scan:full
npm run ship:prod
npm run dev
```
