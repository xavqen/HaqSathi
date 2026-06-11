export type AbusePreventionStatus = 'PASS' | 'READY_TO_TEST' | 'MANUAL_REQUIRED' | 'BLOCKED'
export type AbusePreventionPriority = 'P0' | 'P1' | 'P2'

export type AbusePreventionControl = {
  id: string
  label: string
  status: AbusePreventionStatus
  priority: AbusePreventionPriority
  envValue: string
  passCondition: string
  evidenceRequired: string
  riskIfSkipped: string
}

export type AbuseRouteReview = {
  route: string
  priority: AbusePreventionPriority
  abuseCases: string[]
  evidenceRequired: string[]
}

export type AbuseRiskSignal = {
  id: string
  priority: AbusePreventionPriority
  signal: string
  safeResponse: string
}

function env(name: string, fallback = '') {
  return process.env[name] || fallback
}

function enabled(name: string) {
  return /^(true|1|yes|enabled|pass|reviewed)$/i.test(env(name))
}

function configured(name: string) {
  const value = env(name)
  return Boolean(value && !/change-this|your-domain|localhost|127\.0\.0\.1|haqsathi\.local|example|PROJECT_REF|YOUR-PASSWORD/i.test(value))
}

function control(
  id: string,
  label: string,
  status: AbusePreventionStatus,
  priority: AbusePreventionPriority,
  envValue: string,
  passCondition: string,
  evidenceRequired: string,
  riskIfSkipped: string
): AbusePreventionControl {
  return { id, label, status, priority, envValue, passCondition, evidenceRequired, riskIfSkipped }
}

const routeTargets = env('ABUSE_RISK_ROUTE_TARGETS', '/login,/signup,/complaint,/upi-help,/chat,/dashboard/document-vault,/api/newsletter/subscribe,/api/referrals/invite,/api/analytics/event,/api/system/client-error')
  .split(',')
  .map((route) => route.trim())
  .filter(Boolean)

const routeReviews: AbuseRouteReview[] = routeTargets.map((route, index) => ({
  route,
  priority: index < 5 ? 'P0' : index < 8 ? 'P1' : 'P2',
  abuseCases: [
    'Rapid repeated requests from one IP/session/device are throttled or safely degraded',
    'Requests containing OTP, password, UPI PIN or full card details are rejected, redacted or warned before storage',
    'High-risk money, refund, fraud, upload or AI actions have visible safety copy and audit evidence',
    'Authenticated-only flows do not leak private data through cache, logs, analytics or public errors',
    'Blocked or suspicious actions produce a safe user message without exposing internal rules'
  ],
  evidenceRequired: [
    'Mobile screenshot of blocked/throttled state where applicable',
    'Desktop screenshot or API response proof',
    'Rate-limit/redaction evidence JSON from local readiness run',
    'Reviewer name/date/status in launch evidence folder'
  ]
}))

const riskSignals: AbuseRiskSignal[] = [
  {
    id: 'credential-secrets',
    priority: 'P0',
    signal: 'User enters OTP, password, UPI PIN, CVV, full card number or full bank login details.',
    safeResponse: 'Warn, redact before logging, and never ask the user to share secrets with HaqSathi AI.'
  },
  {
    id: 'request-flood',
    priority: 'P0',
    signal: 'Many complaint, chat, referral, newsletter, analytics or error events from same IP/session in a short time.',
    safeResponse: 'Apply rate-limit, return a friendly retry message, and log a privacy-safe abuse signal.'
  },
  {
    id: 'payment-misuse',
    priority: 'P0',
    signal: 'Repeated failed payments, webhook replay, invalid signature, refund abuse or plan-upgrade mismatch.',
    safeResponse: 'Keep subscription unchanged until signature/database evidence is valid and mark for finance review.'
  },
  {
    id: 'file-upload-risk',
    priority: 'P1',
    signal: 'Executable file, script marker, suspicious PDF content, oversized upload or mismatched MIME/signature.',
    safeResponse: 'Block upload, show simple reason, and keep no unsafe file in public/cacheable storage.'
  },
  {
    id: 'ai-prompt-abuse',
    priority: 'P1',
    signal: 'Prompt asks for fraud, fake documents, impersonation, bypassing official systems or guaranteed legal outcomes.',
    safeResponse: 'Refuse unsafe action, redirect to lawful guidance, and add reviewer evidence for AI safety tuning.'
  },
  {
    id: 'spam-growth-abuse',
    priority: 'P2',
    signal: 'Referral/newsletter/support forms used for spam, fake emails or repeated invites.',
    safeResponse: 'Throttle, require consent, mask emails in admin surfaces, and keep reward payout in manual review.'
  }
]

const controls: AbusePreventionControl[] = [
  control(
    'owner-assigned',
    'Abuse/fraud prevention owner assigned',
    configured('ABUSE_PREVENTION_OWNER') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
    'P0',
    `ABUSE_PREVENTION_OWNER=${env('ABUSE_PREVENTION_OWNER') || 'empty'}`,
    'A named owner is responsible for launch-time abuse, fraud, spam and misuse review.',
    'Owner name in env/evidence notes and /admin/abuse-prevention screenshot.',
    'Abuse issues may be noticed only after users, payments, referrals or document uploads are already affected.'
  ),
  control(
    'mode-selected',
    'Protection mode selected safely',
    ['dry_run', 'enforced', 'monitor'].includes(env('ABUSE_PROTECTION_MODE', 'dry_run')) ? 'READY_TO_TEST' : 'BLOCKED',
    'P0',
    `ABUSE_PROTECTION_MODE=${env('ABUSE_PROTECTION_MODE', 'dry_run')}`,
    'Launch has a clear mode: dry_run for first QA, monitor for observation, enforced only after false-positive review.',
    'Mode screenshot and reviewer note explaining why the mode is safe for current launch stage.',
    'Rules can block real users too early or fail silently during a fraud/spam spike.'
  ),
  control(
    'rate-limit-reviewed',
    'Rate-limit and bot throttling reviewed',
    enabled('ABUSE_RATE_LIMIT_REVIEWED') || configured('UPSTASH_REDIS_REST_URL') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
    'P0',
    `ABUSE_RATE_LIMIT_REVIEWED=${env('ABUSE_RATE_LIMIT_REVIEWED', 'false')}; UPSTASH_REDIS_REST_URL=${configured('UPSTASH_REDIS_REST_URL') ? 'configured' : 'empty'}`,
    'Complaint, chat, auth, referral, newsletter, analytics and error-report APIs have rate-limit or throttling evidence.',
    '429/API retry proof, Upstash or fallback logs, and local abuse readiness JSON.',
    'Bots can overload expensive AI/API routes, create spam, or damage production costs.'
  ),
  control(
    'signup-login-guard-reviewed',
    'Signup/login abuse guard reviewed',
    enabled('ABUSE_SIGNUP_GUARD_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED',
    'P0',
    `ABUSE_SIGNUP_GUARD_REVIEWED=${env('ABUSE_SIGNUP_GUARD_REVIEWED', 'false')}`,
    'Repeated login/signup/reset attempts are throttled and do not reveal whether an email/account exists.',
    'Auth screenshots, reset-email rate-limit proof, and safe error-copy screenshot.',
    'Account enumeration, reset spam and fake-account creation can happen before launch traffic stabilizes.'
  ),
  control(
    'secret-redaction-reviewed',
    'Secret-data redaction reviewed',
    enabled('ABUSE_SECRET_REDACTION_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED',
    'P0',
    `ABUSE_SECRET_REDACTION_REVIEWED=${env('ABUSE_SECRET_REDACTION_REVIEWED', 'false')}`,
    'OTP, passwords, UPI PINs, CVV/full card numbers and bank-login secrets are never requested, logged or stored raw.',
    'Redaction test payloads, screenshots of warnings and evidence that logs/admin pages mask sensitive values.',
    'Sensitive data can leak into logs, analytics, support queues, AI prompts or document vault metadata.'
  ),
  control(
    'payment-fraud-reviewed',
    'Payment/refund fraud review completed',
    enabled('ABUSE_PAYMENT_FRAUD_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED',
    'P1',
    `ABUSE_PAYMENT_FRAUD_REVIEWED=${env('ABUSE_PAYMENT_FRAUD_REVIEWED', 'false')}`,
    'Webhook replay, invalid signature, failed payment, refund/cancel abuse and plan-upgrade mismatch have evidence.',
    'Razorpay sandbox proof, invalid webhook proof, failed payment proof and manual-review note.',
    'Users may get paid access without valid payment or refund/cancel disputes may be mishandled.'
  ),
  control(
    'file-upload-abuse-reviewed',
    'Document upload abuse reviewed',
    enabled('ABUSE_FILE_UPLOAD_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED',
    'P1',
    `ABUSE_FILE_UPLOAD_REVIEWED=${env('ABUSE_FILE_UPLOAD_REVIEWED', 'false')}`,
    'Unsafe extensions, MIME/signature mismatch, oversized uploads and suspicious PDF/script markers are blocked or quarantined.',
    'Vault safety evidence, blocked upload screenshot and storage bucket policy screenshot.',
    'Unsafe uploads can create malware, storage-cost, privacy or cache risks.'
  ),
  control(
    'ai-prompt-abuse-reviewed',
    'AI prompt misuse guard reviewed',
    enabled('ABUSE_AI_PROMPT_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED',
    'P1',
    `ABUSE_AI_PROMPT_REVIEWED=${env('ABUSE_AI_PROMPT_REVIEWED', 'false')}`,
    'AI flows refuse fake documents, impersonation, fraud, secret harvesting and guaranteed outcome claims.',
    'AI safety test cases, refusal screenshots and reviewer notes for high-risk tool prompts.',
    'The app can be used to create harmful/fraudulent drafts or mislead users about official/legal outcomes.'
  ),
  control(
    'reporting-path-reviewed',
    'Abuse report and escalation path reviewed',
    enabled('ABUSE_REPORTING_REVIEWED') || configured('ABUSE_ALERT_WEBHOOK_URL') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
    'P2',
    `ABUSE_REPORTING_REVIEWED=${env('ABUSE_REPORTING_REVIEWED', 'false')}; ABUSE_ALERT_WEBHOOK_URL=${configured('ABUSE_ALERT_WEBHOOK_URL') ? 'configured' : 'empty'}`,
    'Support/admin team has a clear route for suspicious activity, fraud, spam and privacy-sensitive incidents.',
    'Support macro, webhook test or admin escalation screenshot.',
    'High-risk activity may sit in logs without owner, SLA or escalation path.'
  ),
  control(
    'evidence-dir',
    'Abuse prevention evidence directory configured',
    Boolean(env('ABUSE_EVIDENCE_DIR', './artifacts/abuse-prevention')) ? 'READY_TO_TEST' : 'BLOCKED',
    'P2',
    `ABUSE_EVIDENCE_DIR=${env('ABUSE_EVIDENCE_DIR', './artifacts/abuse-prevention')}`,
    'Local evidence generator writes abuse prevention JSON and CSV files.',
    'Generated artifacts/abuse-prevention folder.',
    'Launch reviewers cannot verify what abuse controls were reviewed before launch.'
  )
]

const runbook = [
  'Run npm run abuse:readiness and open /admin/abuse-prevention.',
  'Keep ABUSE_PROTECTION_MODE=dry_run during early QA, then switch to monitor/enforced only after false-positive review.',
  'Test repeated requests for auth, complaint, chat, referral, newsletter, analytics and client-error endpoints.',
  'Test secret-data redaction with OTP, UPI PIN, passwords, CVV and card-like payloads.',
  'Verify payment webhook replay/invalid-signature behavior and keep refunds/cancellations in manual review until evidence is saved.',
  'Save blocked/throttled screenshots, API response proof and reviewer notes in the evidence directory.'
]

export function getAbusePreventionReadinessReport() {
  const ready = controls.filter((item) => item.status === 'PASS' || item.status === 'READY_TO_TEST').length
  const manualRequired = controls.filter((item) => item.status === 'MANUAL_REQUIRED').length
  const blocked = controls.filter((item) => item.status === 'BLOCKED').length
  const p0Controls = controls.filter((item) => item.priority === 'P0').length
  const p0Routes = routeReviews.filter((item) => item.priority === 'P0').length

  return {
    generatedAt: new Date().toISOString(),
    version: '3.0.43-abuse-prevention-readiness',
    summary: {
      totalControls: controls.length,
      ready,
      manualRequired,
      blocked,
      p0Controls,
      routeTargets: routeReviews.length,
      p0Routes,
      riskSignals: riskSignals.length
    },
    controls,
    routeReviews,
    riskSignals,
    runbook,
    nextAction: blocked
      ? 'Fix blocked abuse/fraud prevention configuration before launch review.'
      : manualRequired
        ? 'Complete rate-limit, secret-redaction, payment/upload/AI misuse and reporting review before public launch.'
        : 'Abuse prevention readiness gates are complete for launch review.'
  }
}
