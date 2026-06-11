import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const outputDir = process.env.NEWSLETTER_EVIDENCE_DIR || './artifacts/newsletter-readiness'
mkdirSync(outputDir, { recursive: true })

const env = (name) => process.env[name] || ''
const enabled = (name) => /^(true|1|yes|enabled)$/i.test(env(name))
const configured = (name) => Boolean(env(name) && !/change-this|example|todo|your-|localhost|haqsathi\.local/i.test(env(name)))
const clampNumber = (value, fallback, min, max) => {
  const parsed = Number(value || fallback)
  if (!Number.isFinite(parsed)) return fallback
  return Math.min(Math.max(parsed, min), max)
}

const provider = env('NEWSLETTER_PROVIDER') || 'resend'
const dryRun = enabled('NEWSLETTER_DRY_RUN') || !env('NEWSLETTER_DRY_RUN')
const doubleOptIn = enabled('NEWSLETTER_REQUIRE_DOUBLE_OPT_IN') || !env('NEWSLETTER_REQUIRE_DOUBLE_OPT_IN')
const segmentReview = enabled('NEWSLETTER_SEGMENT_REVIEW_REQUIRED') || !env('NEWSLETTER_SEGMENT_REVIEW_REQUIRED')
const maxDaily = clampNumber(env('NEWSLETTER_MAX_SENDS_PER_DAY'), 500, 1, 100000)
const hasSender = configured('RESEND_API_KEY') && configured('RESEND_FROM_EMAIL')
const hasOwner = configured('NEWSLETTER_REVIEW_OWNER') || configured('SUPPORT_AGENT_OWNER')
const unsubscribeReady = configured('NEXT_PUBLIC_UNSUBSCRIBE_URL') || configured('NEXT_PUBLIC_APP_URL')

const controls = [
  ['provider-config', 'Email provider configuration', hasSender ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', `NEWSLETTER_PROVIDER=${provider}; RESEND_FROM_EMAIL=${env('RESEND_FROM_EMAIL') || 'empty'}`],
  ['dry-run', 'Campaign dry-run guard', dryRun ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', `NEWSLETTER_DRY_RUN=${env('NEWSLETTER_DRY_RUN') || 'true'}`],
  ['double-opt-in', 'Consent and double opt-in', doubleOptIn ? 'READY_TO_TEST' : 'BLOCKED', `NEWSLETTER_REQUIRE_DOUBLE_OPT_IN=${env('NEWSLETTER_REQUIRE_DOUBLE_OPT_IN') || 'true'}`],
  ['unsubscribe', 'Unsubscribe path', unsubscribeReady ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', `NEXT_PUBLIC_UNSUBSCRIBE_URL=${env('NEXT_PUBLIC_UNSUBSCRIBE_URL') || 'empty'}`],
  ['send-limit', 'Daily send safety cap', maxDaily <= 5000 ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', `NEWSLETTER_MAX_SENDS_PER_DAY=${maxDaily}`],
  ['segment-review', 'Audience segment review', segmentReview ? 'READY_TO_TEST' : 'BLOCKED', `NEWSLETTER_SEGMENT_REVIEW_REQUIRED=${env('NEWSLETTER_SEGMENT_REVIEW_REQUIRED') || 'true'}`],
  ['owner-assigned', 'Campaign review owner', hasOwner ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', `NEWSLETTER_REVIEW_OWNER=${env('NEWSLETTER_REVIEW_OWNER') || 'empty'}`],
  ['evidence-output', 'Readiness evidence output', 'PASS', `NEWSLETTER_EVIDENCE_DIR=${outputDir}`]
]

const report = {
  generatedAt: new Date().toISOString(),
  version: '3.0.25-newsletter-campaign-readiness',
  mode: env('NEWSLETTER_MODE') || 'readiness',
  summary: {
    totalControls: controls.length,
    ready: controls.filter((control) => control[2] === 'PASS' || control[2] === 'READY_TO_TEST').length,
    manualRequired: controls.filter((control) => control[2] === 'MANUAL_REQUIRED').length,
    blocked: controls.filter((control) => control[2] === 'BLOCKED').length
  },
  controls: controls.map(([id, label, status, note]) => ({ id, label, status, note })),
  launchEvidence: [
    'Subscribe from /newsletter using a real inbox',
    'Confirm provider/domain readiness',
    'Verify double opt-in and unsubscribe/preference URL',
    'Send one seed-list test campaign only',
    'Save admin page, provider dashboard and inbox screenshots'
  ]
}

const csvRows = [
  ['control_id', 'label', 'status', 'note'],
  ...controls.map((row) => row.map((value) => String(value).replaceAll(',', ';')))
]

writeFileSync(join(outputDir, 'newsletter-campaign-readiness.json'), JSON.stringify(report, null, 2))
writeFileSync(join(outputDir, 'newsletter-campaign-readiness.csv'), csvRows.map((row) => row.join(',')).join('\n'))

console.log(`✅ Newsletter campaign readiness evidence written to ${outputDir}`)
console.log(`Controls: ${report.summary.totalControls} · Ready: ${report.summary.ready} · Manual QA: ${report.summary.manualRequired} · Blocked: ${report.summary.blocked}`)
