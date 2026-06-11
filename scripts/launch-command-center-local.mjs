import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const outputDir = process.env.LAUNCH_COMMAND_EVIDENCE_DIR || './artifacts/launch-command-center'
mkdirSync(outputDir, { recursive: true })

function env(name, fallback = '') {
  return process.env[name] || fallback
}

function enabled(name) {
  return env(name).toLowerCase() === 'true'
}

function configured(name) {
  const value = env(name)
  return Boolean(value && !/change-this|your-domain|localhost|127\.0\.0\.1|haqsathi\.local|example|PROJECT_REF|YOUR-PASSWORD/i.test(value))
}

function productionUrlReady() {
  const value = env('VERCEL_PRODUCTION_URL') || env('NEXT_PUBLIC_APP_URL')
  return /^https:\/\//i.test(value) && !/localhost|127\.0\.0\.1|example|your-domain/i.test(value)
}

const controls = [
  ['founder-signoff', 'Founder final approval', enabled('LAUNCH_FOUNDER_SIGNOFF') ? 'GO' : 'MANUAL_REQUIRED', 'Founder', `LAUNCH_FOUNDER_SIGNOFF=${env('LAUNCH_FOUNDER_SIGNOFF', 'false')}`],
  ['go-no-go-meeting', 'Go/no-go meeting completed', enabled('LAUNCH_GO_NO_GO_COMPLETED') ? 'GO' : 'MANUAL_REQUIRED', 'Founder/QA', `LAUNCH_GO_NO_GO_COMPLETED=${env('LAUNCH_GO_NO_GO_COMPLETED', 'false')}`],
  ['production-domain', 'Production domain ready', productionUrlReady() ? 'READY_TO_TEST' : 'BLOCKED', 'Developer', `VERCEL_PRODUCTION_URL=${env('VERCEL_PRODUCTION_URL') || 'empty'}; NEXT_PUBLIC_APP_URL=${env('NEXT_PUBLIC_APP_URL') || 'empty'}`],
  ['deployment-qa-proof', 'Deployment QA proof saved', enabled('LAUNCH_DEPLOYMENT_QA_APPROVED') || (enabled('PLAYWRIGHT_PRODUCTION_PASSED') && enabled('LIGHTHOUSE_PRODUCTION_PASSED') && enabled('MOBILE_VIEWPORT_QA_PASSED') && enabled('DESKTOP_VIEWPORT_QA_PASSED')) ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', 'QA', `LAUNCH_DEPLOYMENT_QA_APPROVED=${env('LAUNCH_DEPLOYMENT_QA_APPROVED', 'false')}`],
  ['payment-proof', 'Payment lifecycle proof saved', enabled('LAUNCH_PAYMENT_APPROVED') || (configured('RAZORPAY_KEY_ID') && configured('RAZORPAY_WEBHOOK_SECRET') && env('PAYMENT_DRY_RUN') === 'false') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', 'Finance/Developer', `LAUNCH_PAYMENT_APPROVED=${env('LAUNCH_PAYMENT_APPROVED', 'false')}`],
  ['email-proof', 'Email delivery proof saved', enabled('LAUNCH_EMAIL_APPROVED') || (configured('RESEND_API_KEY') && configured('RESEND_FROM_EMAIL') && env('EMAIL_DELIVERY_DRY_RUN') === 'false') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', 'Developer', `LAUNCH_EMAIL_APPROVED=${env('LAUNCH_EMAIL_APPROVED', 'false')}`],
  ['storage-proof', 'Supabase storage proof saved', enabled('LAUNCH_STORAGE_APPROVED') || (configured('NEXT_PUBLIC_SUPABASE_URL') && configured('SUPABASE_SERVICE_ROLE_KEY') && configured('SUPABASE_STORAGE_BUCKET')) ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', 'Developer', `LAUNCH_STORAGE_APPROVED=${env('LAUNCH_STORAGE_APPROVED', 'false')}`],
  ['official-data-proof', 'Official data proof saved', enabled('LAUNCH_OFFICIAL_DATA_APPROVED') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', 'Content/QA', `LAUNCH_OFFICIAL_DATA_APPROVED=${env('LAUNCH_OFFICIAL_DATA_APPROVED', 'false')}`],
  ['ai-safety-proof', 'AI safety proof saved', enabled('LAUNCH_AI_SAFETY_APPROVED') || env('AI_GUARDRAILS_MODE', 'review') !== 'off' ? 'READY_TO_TEST' : 'BLOCKED', 'AI Safety/QA', `LAUNCH_AI_SAFETY_APPROVED=${env('LAUNCH_AI_SAFETY_APPROVED', 'false')}; AI_GUARDRAILS_MODE=${env('AI_GUARDRAILS_MODE', 'review')}`],
  ['support-proof', 'Support operations proof saved', enabled('LAUNCH_SUPPORT_APPROVED') || configured('SUPPORT_EMAIL') || configured('SUPPORT_ESCALATION_EMAIL') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', 'Support/Admin', `LAUNCH_SUPPORT_APPROVED=${env('LAUNCH_SUPPORT_APPROVED', 'false')}`],
  ['rollback-owner', 'Rollback owner assigned', configured('LAUNCH_ROLLBACK_OWNER') ? 'GO' : 'MANUAL_REQUIRED', 'Developer/Founder', `LAUNCH_ROLLBACK_OWNER=${env('LAUNCH_ROLLBACK_OWNER') || 'empty'}`],
  ['incident-owner', 'Incident owner assigned', configured('LAUNCH_INCIDENT_OWNER') ? 'GO' : 'MANUAL_REQUIRED', 'Ops/Support', `LAUNCH_INCIDENT_OWNER=${env('LAUNCH_INCIDENT_OWNER') || 'empty'}`]
]

const blocked = controls.filter((control) => control[2] === 'BLOCKED').length
const manualRequired = controls.filter((control) => control[2] === 'MANUAL_REQUIRED').length
const readyToTest = controls.filter((control) => control[2] === 'READY_TO_TEST').length
const go = controls.filter((control) => control[2] === 'GO').length
const decision = blocked > 0 ? 'BLOCKED' : manualRequired > 0 ? 'MANUAL_REQUIRED' : readyToTest > 0 ? 'READY_TO_TEST' : 'GO'

const report = {
  generatedAt: new Date().toISOString(),
  version: '3.0.34-launch-command-center',
  decision,
  summary: { totalControls: controls.length, go, readyToTest, manualRequired, blocked },
  controls: controls.map(([id, label, status, owner, envValue]) => ({ id, label, status, owner, envValue }))
}

const rows = [['id', 'label', 'status', 'owner', 'env_value'], ...controls].map((row) => row.map((value) => String(value).replaceAll(',', ';')))
writeFileSync(join(outputDir, 'launch-command-center.json'), JSON.stringify(report, null, 2))
writeFileSync(join(outputDir, 'launch-command-center-controls.csv'), rows.map((row) => row.join(',')).join('\n'))

console.log(`✅ Launch command center evidence written to ${outputDir}`)
console.log(`Decision: ${decision} · GO: ${go} · Ready: ${readyToTest} · Manual: ${manualRequired} · Blocked: ${blocked}`)
