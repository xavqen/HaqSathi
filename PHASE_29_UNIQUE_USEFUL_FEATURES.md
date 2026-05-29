# Phase 29: Unique + Useful Features

Added high-value features that make HaqSathi AI more than a complaint generator:

- Scam Radar: suspicious SMS/WhatsApp/call/UPI risk scoring.
- Rights Explainer: simple rights + what-to-ask guidance.
- Refund Negotiation Builder: staged message ladder and evidence plan.
- Issue Trends: public-safe community trend intelligence.
- Authority Router Pro: choose the right escalation path.

Run:

```powershell
npm install
npm run db:generate
npm run db:push
npm run phase29:audit
npm run scan:full
npm run dev
```

New routes:

- `/tools/scam-radar`
- `/tools/rights-explainer`
- `/tools/refund-negotiation`
- `/tools/authority-router-pro`
- `/issue-trends`
- `/dashboard/scam-radar`
- `/dashboard/rights`
- `/dashboard/refund-negotiations`
- `/dashboard/authority-routes`
- `/dashboard/issue-trends`
