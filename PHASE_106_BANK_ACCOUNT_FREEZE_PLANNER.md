# Phase 106 - Bank Account Freeze Planner

Adds a practical user-facing banking safety tool for account freeze, lien, hold, KYC freeze, UPI dispute hold, ATM cash-not-dispensed and wrong debit issues.

## Added
- `/tools/bank-account-freeze-planner`
- `BankAccountFreezePlannerForm`
- `buildBankAccountFreezePlan`
- `/admin/bank-freeze-readiness`
- `/api/admin/bank-freeze-readiness`
- `npm run bank-freeze:readiness`
- `npm run phase106:audit`

## Safety rules
- No OTP, UPI PIN, CVV, password, full account/card number or full ID collection.
- No guarantee of unfreeze, refund, reversal or regulator outcome.
- Official bank/authority route only.
