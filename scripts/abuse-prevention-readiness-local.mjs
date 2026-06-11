import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const outputDir = process.env.ABUSE_EVIDENCE_DIR || './artifacts/abuse-prevention'
mkdirSync(outputDir, { recursive: true })

function env(name, fallback = '') {
  return process.env[name] || fallback
}

function enabled(name) {
  return /^(true|1|yes|enabled|pass|reviewed)$/i.test(env(name))
}

function configured(name) {
  const value = env(name)
  return Boolean(value && !/change-this|your-domain|localhost|127\.0\.0\.1|haqsathi\.local|example|PROJECT_REF|YOUR-PASSWORD/i.test(value))
}

const routes = env('ABUSE_RISK_ROUTE_TARGETS', '/login,/signup,/complaint,/upi-help,/chat,/dashboard/document-vault,/api/newsletter/subscribe,/api/referrals/invite,/api/analytics/event,/api/system/client-error')
  .split(',')
  .map((route) => route.trim())
  .filter(Boolean)

const controls = [
  ['owner-assigned', 'P0', 'Abuse/fraud prevention owner assigned', configured('ABUSE_PREVENTION_OWNER') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', `ABUSE_PREVENTION_OWNER=${env('ABUSE_PREVENTION_OWNER') || 'empty'}`],
  ['mode-selected', 'P0', 'Protection mode selected safely', ['dry_run', 'enforced', 'monitor'].includes(env('ABUSE_PROTECTION_MODE', 'dry_run')) ? 'READY_TO_TEST' : 'BLOCKED', `ABUSE_PROTECTION_MODE=${env('ABUSE_PROTECTION_MODE', 'dry_run')}`],
  ['rate-limit-reviewed', 'P0', 'Rate-limit and bot throttling reviewed', enabled('ABUSE_RATE_LIMIT_REVIEWED') || configured('UPSTASH_REDIS_REST_URL') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', `ABUSE_RATE_LIMIT_REVIEWED=${env('ABUSE_RATE_LIMIT_REVIEWED', 'false')}`],
  ['signup-login-guard-reviewed', 'P0', 'Signup/login abuse guard reviewed', enabled('ABUSE_SIGNUP_GUARD_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `ABUSE_SIGNUP_GUARD_REVIEWED=${env('ABUSE_SIGNUP_GUARD_REVIEWED', 'false')}`],
  ['secret-redaction-reviewed', 'P0', 'Secret-data redaction reviewed', enabled('ABUSE_SECRET_REDACTION_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `ABUSE_SECRET_REDACTION_REVIEWED=${env('ABUSE_SECRET_REDACTION_REVIEWED', 'false')}`],
  ['payment-fraud-reviewed', 'P1', 'Payment/refund fraud review completed', enabled('ABUSE_PAYMENT_FRAUD_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `ABUSE_PAYMENT_FRAUD_REVIEWED=${env('ABUSE_PAYMENT_FRAUD_REVIEWED', 'false')}`],
  ['file-upload-abuse-reviewed', 'P1', 'Document upload abuse reviewed', enabled('ABUSE_FILE_UPLOAD_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `ABUSE_FILE_UPLOAD_REVIEWED=${env('ABUSE_FILE_UPLOAD_REVIEWED', 'false')}`],
  ['ai-prompt-abuse-reviewed', 'P1', 'AI prompt misuse guard reviewed', enabled('ABUSE_AI_PROMPT_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `ABUSE_AI_PROMPT_REVIEWED=${env('ABUSE_AI_PROMPT_REVIEWED', 'false')}`],
  ['reporting-path-reviewed', 'P2', 'Abuse report and escalation path reviewed', enabled('ABUSE_REPORTING_REVIEWED') || configured('ABUSE_ALERT_WEBHOOK_URL') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', `ABUSE_REPORTING_REVIEWED=${env('ABUSE_REPORTING_REVIEWED', 'false')}`],
  ['evidence-dir', 'P2', 'Abuse prevention evidence directory configured', 'READY_TO_TEST', `ABUSE_EVIDENCE_DIR=${outputDir}`]
]

const routeRows = routes.map((route, index) => [
  route,
  index < 5 ? 'P0' : index < 8 ? 'P1' : 'P2',
  'Repeated requests; secret data redaction; money/upload/AI safety copy; private data cache/log protection; safe blocked response',
  'Mobile screenshot; desktop/API proof; rate-limit/redaction JSON; reviewer/date/status note'
])

const riskSignals = [
  ['credential-secrets', 'P0', 'OTP/password/UPI PIN/CVV/full-card/full-bank-login data entered', 'Warn and redact before any storage or logging'],
  ['request-flood', 'P0', 'Repeated auth, complaint, chat, referral, newsletter, analytics or error events', 'Rate-limit and log privacy-safe abuse signal'],
  ['payment-misuse', 'P0', 'Failed payments, invalid signature, webhook replay, refund abuse or plan mismatch', 'Keep subscription unchanged and mark finance review'],
  ['file-upload-risk', 'P1', 'Executable/script/suspicious PDF/oversized upload/MIME mismatch', 'Block upload and avoid public/cacheable storage'],
  ['ai-prompt-abuse', 'P1', 'Fake documents, impersonation, fraud, secret harvesting or guaranteed outcome prompt', 'Refuse unsafe action and redirect to lawful guidance'],
  ['spam-growth-abuse', 'P2', 'Referral/newsletter/support spam or repeated fake invites', 'Throttle, require consent and keep rewards in manual review']
]

const ready = controls.filter((control) => control[3] === 'PASS' || control[3] === 'READY_TO_TEST').length
const manualRequired = controls.filter((control) => control[3] === 'MANUAL_REQUIRED').length
const blocked = controls.filter((control) => control[3] === 'BLOCKED').length

const report = {
  generatedAt: new Date().toISOString(),
  version: '3.0.43-abuse-prevention-readiness',
  summary: {
    totalControls: controls.length,
    ready,
    manualRequired,
    blocked,
    routes: routes.length,
    p0Routes: routeRows.filter((row) => row[1] === 'P0').length,
    riskSignals: riskSignals.length
  },
  controls: controls.map(([id, priority, label, status, envValue]) => ({ id, priority, label, status, envValue })),
  routeReviews: routeRows.map(([route, priority, checks, evidence]) => ({ route, priority, checks, evidence })),
  riskSignals: riskSignals.map(([id, priority, signal, safeResponse]) => ({ id, priority, signal, safeResponse })),
  nextAction: blocked ? 'Fix blocked abuse/fraud prevention configuration before launch review.' : manualRequired ? 'Complete abuse, fraud, spam and redaction review before public launch.' : 'Abuse prevention readiness gates are complete for launch review.'
}

const csv = (rows) => rows.map((row) => row.map((value) => String(value).replaceAll(',', ';')).join(',')).join('\n')
writeFileSync(join(outputDir, 'abuse-prevention-readiness.json'), JSON.stringify(report, null, 2))
writeFileSync(join(outputDir, 'abuse-prevention-controls.csv'), csv([['id', 'priority', 'label', 'status', 'env_value'], ...controls]))
writeFileSync(join(outputDir, 'abuse-prevention-routes.csv'), csv([['route', 'priority', 'checks', 'evidence_required'], ...routeRows]))
writeFileSync(join(outputDir, 'abuse-prevention-risk-signals.csv'), csv([['id', 'priority', 'signal', 'safe_response'], ...riskSignals]))

console.log(`✅ Abuse prevention readiness evidence written to ${outputDir}`)
console.log(`Ready: ${ready} · Manual: ${manualRequired} · Blocked: ${blocked} · Routes: ${routes.length} · Risk signals: ${riskSignals.length}`)
