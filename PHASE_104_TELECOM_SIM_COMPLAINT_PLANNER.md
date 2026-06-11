# Phase 104 - Telecom SIM Complaint Planner

Added a practical user-facing tool for mobile recharge, telecom bill, SIM block, porting/MNP, KYC misuse and spam/scam call/SMS complaint planning.

## Added

- `/tools/telecom-sim-complaint-planner`
- `TelecomSimComplaintPlannerForm`
- Recharge/bill/SIM/porting/KYC complaint plan generator
- Operator proof checklist
- Official escalation route
- Copy-ready telecom complaint message
- OTP, SIM swap/porting OTP, UPI PIN, CVV, password and full ID safety warnings
- `/admin/telecom-sim-readiness`
- `/api/admin/telecom-sim-readiness`
- `npm run telecom-sim:readiness`
- `npm run phase104:audit`

## Safety boundary

This workflow is guidance only. It must not promise refund, activation, porting approval, bill reversal or regulatory outcome. It must never ask users for OTP, SIM swap/porting OTP, UPI PIN, CVV, passwords, full Aadhaar/ID numbers or remote access.
