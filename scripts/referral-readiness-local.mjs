import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const outputDir = process.env.REFERRAL_EVIDENCE_DIR || './artifacts/referral-growth'
mkdirSync(outputDir, { recursive: true })

const env = (name) => process.env[name] || ''
const enabled = (name) => /^(true|1|yes|enabled)$/i.test(env(name))
const configured = (name) => Boolean(env(name) && !/change-this|example|todo|your-|localhost|haqsathi\.local/i.test(env(name)))
const referralEnabled = enabled('REFERRAL_PROGRAM_ENABLED') || !env('REFERRAL_PROGRAM_ENABLED')
const payoutMode = env('REFERRAL_PAYOUT_MODE') || 'bonus_usage'
const fraudReview = enabled('REFERRAL_FRAUD_REVIEW_REQUIRED') || !env('REFERRAL_FRAUD_REVIEW_REQUIRED')
const maxInvites = Number(env('REFERRAL_MAX_INVITES_PER_DAY') || '10')
const minConversionAgeDays = Number(env('REFERRAL_MIN_CONVERSION_AGE_DAYS') || '0')
const hasOwner = configured('REFERRAL_REVIEW_OWNER') || configured('SUPPORT_AGENT_OWNER')
const termsUrl = configured('NEXT_PUBLIC_REFERRAL_TERMS_URL') || configured('NEXT_PUBLIC_APP_URL')

const controls = [
  ['referral-program-switch', 'Referral program launch switch', referralEnabled ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', `REFERRAL_PROGRAM_ENABLED=${env('REFERRAL_PROGRAM_ENABLED') || 'true'}`],
  ['reward-mode', 'Reward mode is non-cash by default', payoutMode === 'bonus_usage' ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', `REFERRAL_PAYOUT_MODE=${payoutMode}`],
  ['fraud-review', 'Fraud/manual review guard', fraudReview ? 'READY_TO_TEST' : 'BLOCKED', `REFERRAL_FRAUD_REVIEW_REQUIRED=${env('REFERRAL_FRAUD_REVIEW_REQUIRED') || 'true'}`],
  ['invite-rate-limit', 'Invite creation rate limit', maxInvites > 0 && maxInvites <= 50 ? 'READY_TO_TEST' : 'BLOCKED', `REFERRAL_MAX_INVITES_PER_DAY=${maxInvites}`],
  ['conversion-aging', 'Conversion aging window', minConversionAgeDays >= 0 && minConversionAgeDays <= 30 ? 'READY_TO_TEST' : 'BLOCKED', `REFERRAL_MIN_CONVERSION_AGE_DAYS=${minConversionAgeDays}`],
  ['owner-assigned', 'Referral review owner', hasOwner ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', `REFERRAL_REVIEW_OWNER=${env('REFERRAL_REVIEW_OWNER') || 'empty'}`],
  ['terms-and-disclosure', 'Referral terms/disclosure', termsUrl ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', `NEXT_PUBLIC_REFERRAL_TERMS_URL=${env('NEXT_PUBLIC_REFERRAL_TERMS_URL') || 'empty'}`],
  ['evidence-output', 'Referral evidence output', 'PASS', `REFERRAL_EVIDENCE_DIR=${outputDir}`]
]

const report = {
  generatedAt: new Date().toISOString(),
  version: '3.0.24-referral-growth-readiness',
  mode: env('REFERRAL_PROGRAM_MODE') || 'readiness',
  summary: {
    totalControls: controls.length,
    ready: controls.filter((control) => control[2] === 'PASS' || control[2] === 'READY_TO_TEST').length,
    manualRequired: controls.filter((control) => control[2] === 'MANUAL_REQUIRED').length,
    blocked: controls.filter((control) => control[2] === 'BLOCKED').length
  },
  controls: controls.map(([id, label, status, note]) => ({ id, label, status, note })),
  launchEvidence: [
    'Create referral link from a real logged-in account',
    'Open referral link on another browser/device and confirm ref code preservation',
    'Verify conversion status update and reward rule',
    'Save /admin/referral-readiness screenshot',
    'Confirm terms/reward disclosure before public promotion'
  ]
}

const csvRows = [
  ['control_id', 'label', 'status', 'note'],
  ...controls.map((row) => row.map((value) => String(value).replaceAll(',', ';')))
]

writeFileSync(join(outputDir, 'referral-growth-readiness.json'), JSON.stringify(report, null, 2))
writeFileSync(join(outputDir, 'referral-growth-readiness.csv'), csvRows.map((row) => row.join(',')).join('\n'))

console.log(`✅ Referral growth readiness evidence written to ${outputDir}`)
console.log(`Controls: ${report.summary.totalControls} · Ready: ${report.summary.ready} · Manual QA: ${report.summary.manualRequired} · Blocked: ${report.summary.blocked}`)
