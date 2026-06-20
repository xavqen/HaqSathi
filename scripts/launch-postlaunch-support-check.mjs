import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const outDir = process.env.LAUNCH_QA_OUTPUT_DIR || process.env.LAUNCH_EVIDENCE_DIR || './artifacts/live-launch-qa'
mkdirSync(outDir, { recursive: true })

function env(name, fallback = '') { return process.env[name] || fallback }
function enabled(name) { return env(name).toLowerCase() === 'true' }
function clean(value) { return String(value || '').trim() }
function configured(name) {
  const value = clean(env(name))
  return Boolean(value && !/change-this|your-domain|localhost|127\.0\.0\.1|example|PROJECT_REF|YOUR-PASSWORD|\[.*\]/i.test(value))
}
function looksLikeHttpsUrl(value) {
  try { const url = new URL(value); return url.protocol === 'https:' && !/localhost|127\.0\.0\.1|example|your-domain/i.test(url.hostname) } catch { return false }
}
function validEmail(value) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean(value)) && !/example|localhost|change-this/i.test(value) }

const secretPattern = /(AUTH_SECRET|DATABASE_URL|DIRECT_URL|SUPABASE_SERVICE_ROLE_KEY|RAZORPAY_KEY_SECRET|RAZORPAY_WEBHOOK_SECRET|UPSTASH_REDIS_REST_TOKEN|OPENAI_API_KEY|GEMINI_API_KEY|RESEND_API_KEY|postgresql:\/\/|sk_live_|sk_test_|rzp_live_|rzp_test_|eyJ[A-Za-z0-9_-]+\.)/i
const checks = []
function check(id, area, ok, status, evidence, nextStep, hardBlock = false) {
  const safeEvidence = String(evidence || '')
  checks.push({ id, area, ok, status: ok ? 'PASS' : hardBlock ? 'BLOCKED' : status, evidence: secretPattern.test(safeEvidence) ? '[redacted secret-like evidence]' : safeEvidence, nextStep })
}

const baseUrl = clean(env('POSTLAUNCH_SUPPORT_BASE_URL') || env('LAUNCH_QA_BASE_URL') || env('NEXT_PUBLIC_APP_URL'))
const supportEmail = clean(env('NEXT_PUBLIC_SUPPORT_EMAIL') || env('SUPPORT_EMAIL'))
const slaHours = Number(env('LAUNCH_SUPPORT_SLA_HOURS', '24'))

check('production-url', 'Production support base URL', looksLikeHttpsUrl(baseUrl), 'BLOCKED', baseUrl || 'missing', 'Set POSTLAUNCH_SUPPORT_BASE_URL or LAUNCH_QA_BASE_URL to https://haqsathi.site.', true)
check('support-email', 'Visible support email', validEmail(supportEmail), 'BLOCKED', supportEmail || 'missing', 'Set SUPPORT_EMAIL and NEXT_PUBLIC_SUPPORT_EMAIL to a real monitored inbox.', true)
check('support-owner', 'Support owner', configured('LAUNCH_SUPPORT_OWNER'), 'MANUAL_REQUIRED', configured('LAUNCH_SUPPORT_OWNER') ? 'owner configured' : 'missing', 'Set LAUNCH_SUPPORT_OWNER to the person watching launch support.')
check('abuse-owner', 'Abuse review owner', configured('LAUNCH_ABUSE_REVIEW_OWNER'), 'MANUAL_REQUIRED', configured('LAUNCH_ABUSE_REVIEW_OWNER') ? 'owner configured' : 'missing', 'Set LAUNCH_ABUSE_REVIEW_OWNER for fraud/payment/account/document-vault reports.')
check('contact-form-tested', 'Contact form tested', enabled('LAUNCH_CONTACT_FORM_TESTED'), 'MANUAL_REQUIRED', `LAUNCH_CONTACT_FORM_TESTED=${env('LAUNCH_CONTACT_FORM_TESTED', 'false')}`, 'Submit one safe test message through /contact and verify it reaches admin/support intake.')
check('abuse-report-flow-tested', 'Abuse/fraud flow tested', enabled('LAUNCH_ABUSE_REPORT_FLOW_TESTED'), 'MANUAL_REQUIRED', `LAUNCH_ABUSE_REPORT_FLOW_TESTED=${env('LAUNCH_ABUSE_REPORT_FLOW_TESTED', 'false')}`, 'Submit one safe fraud/payment/login test and verify it is tagged urgent without collecting secrets.')
check('support-macros-reviewed', 'Safe reply macros reviewed', enabled('LAUNCH_SUPPORT_MACROS_REVIEWED'), 'MANUAL_REQUIRED', `LAUNCH_SUPPORT_MACROS_REVIEWED=${env('LAUNCH_SUPPORT_MACROS_REVIEWED', 'false')}`, 'Review support macros for no OTP/PIN/CVV/password requests and no guaranteed legal/payment outcomes.')
check('first-24h-review', 'First 24h review owner confirmed', enabled('LAUNCH_FIRST_24H_REVIEW_CONFIRMED'), 'MANUAL_REQUIRED', `LAUNCH_FIRST_24H_REVIEW_CONFIRMED=${env('LAUNCH_FIRST_24H_REVIEW_CONFIRMED', 'false')}`, 'Confirm a real person will review support issues during the first 24 hours after launch.')
check('support-sla', 'Support SLA configured', Number.isFinite(slaHours) && slaHours > 0 && slaHours <= 48, 'MANUAL_REQUIRED', `LAUNCH_SUPPORT_SLA_HOURS=${env('LAUNCH_SUPPORT_SLA_HOURS', '24')}`, 'Set LAUNCH_SUPPORT_SLA_HOURS between 1 and 48 for launch support expectations.')

if (looksLikeHttpsUrl(baseUrl)) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), Number(env('POSTLAUNCH_SUPPORT_TIMEOUT_MS', '12000')))
  try {
    const response = await fetch(`${baseUrl.replace(/\/$/, '')}/contact`, { signal: controller.signal, headers: { 'User-Agent': 'HaqSathi-PostLaunchSupportCheck/1.0' } })
    const text = await response.text()
    check('contact-page-live', 'Contact page live', response.ok && /support|contact|message|help/i.test(text), 'READY_TO_RUN', `status=${response.status}; supportCopy=${/support|contact|message|help/i.test(text)}`, 'Deploy and verify /contact renders the support form.')
    check('privacy-copy-live', 'Secret-safety copy live', response.ok && /OTP|PIN|CVV|password|secret/i.test(text), 'READY_TO_RUN', `status=${response.status}; secretSafetyCopy=${/OTP|PIN|CVV|password|secret/i.test(text)}`, 'Ensure /contact tells users not to share OTP, PIN, CVV or passwords.')
  } catch (error) {
    check('contact-page-live', 'Contact page live', false, 'READY_TO_RUN', error?.name === 'AbortError' ? 'timeout' : String(error?.message || error), 'Deploy and verify /contact is reachable.')
    check('privacy-copy-live', 'Secret-safety copy live', false, 'READY_TO_RUN', 'not checked because /contact failed', 'Ensure /contact tells users not to share OTP, PIN, CVV or passwords.')
  } finally {
    clearTimeout(timeout)
  }
}

const blocked = checks.filter((item) => item.status === 'BLOCKED').length
const manualRequired = checks.filter((item) => item.status === 'MANUAL_REQUIRED').length
const readyToRun = checks.filter((item) => item.status === 'READY_TO_RUN').length
const pass = checks.filter((item) => item.status === 'PASS').length
const decision = blocked > 0 ? 'POSTLAUNCH_SUPPORT_BLOCKED' : manualRequired > 0 || readyToRun > 0 ? 'POSTLAUNCH_SUPPORT_EVIDENCE_REQUIRED' : 'POSTLAUNCH_SUPPORT_READY'

const report = {
  version: '3.0.105-motion-hydration-stability',
  generatedAt: new Date().toISOString(),
  strict: enabled('STRICT_POSTLAUNCH_SUPPORT') || enabled('LAUNCH_STRICT_EVIDENCE_GATE'),
  decision,
  summary: { total: checks.length, pass, readyToRun, manualRequired, blocked },
  checks,
  escalationRules: [
    'Fraud, unauthorized payment, account access and document-vault issues are urgent support tickets.',
    'Never ask users for OTP, UPI PIN, card CVV, passwords, full card numbers or banking secrets.',
    'Support replies must be guidance-only; do not guarantee refunds, complaint outcomes or legal results.',
    'During the first 24 hours, review contact messages and support tickets at least every LAUNCH_SUPPORT_SLA_HOURS hours.'
  ]
}

const jsonPath = path.join(outDir, 'postlaunch-support-check.json')
const csvPath = path.join(outDir, 'postlaunch-support-check.csv')
writeFileSync(jsonPath, JSON.stringify(report, null, 2))
writeFileSync(csvPath, ['id,area,status,evidence,next_step', ...checks.map((item) => [item.id, item.area, item.status, item.evidence, item.nextStep].map((value) => `"${String(value).replaceAll('"', "'")}"`).join(','))].join('\n'))

for (const item of checks) console.log(`${item.status === 'PASS' ? '✅' : item.status === 'BLOCKED' ? '❌' : '⚠️'} ${item.area}: ${item.status}`)
console.log(`\nPost-launch support gate: ${decision}`)
console.log(`Report saved to ${jsonPath}`)

if ((enabled('STRICT_POSTLAUNCH_SUPPORT') || enabled('LAUNCH_STRICT_EVIDENCE_GATE')) && decision !== 'POSTLAUNCH_SUPPORT_READY') process.exit(1)
