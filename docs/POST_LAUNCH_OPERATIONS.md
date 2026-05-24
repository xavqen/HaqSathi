# Post Launch Operations

## Daily

- Check `/admin/system-doctor`.
- Check `/admin/incidents`.
- Review support tickets.
- Review failed emails/payments.
- Check most-used complaint categories.

## Weekly

- Review `/admin/seo-keywords`.
- Publish 3-5 SEO guides.
- Verify official source links.
- Export backup JSON/CSV where required.
- Review AI output feedback and unsafe cases.

## Monthly

- Review subscription conversion.
- Remove stale official links.
- Update scheme and document requirements.
- Run payment reconciliation.
- Run privacy deletion request queue.

## Emergency

If database fails:
1. Check Supabase status.
2. Run `npm run db:doctor` locally with production env.
3. Rotate DB password if credentials leaked.
4. Do not run destructive migrations without backup.

If AI output is unsafe:
1. Disable affected feature with feature flag.
2. Review prompt and logs.
3. Add stronger disclaimer/guardrail.
4. Re-enable after admin test.

If payment webhook fails:
1. Do not manually upgrade users blindly.
2. Verify Razorpay payment ID in dashboard.
3. Check signature secret.
4. Update subscription only after confirmed payment.
