import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const env = (name, fallback = '') => process.env[name] || fallback
const enabled = (name) => /^(true|1|yes|enabled|pass|reviewed)$/i.test(env(name))
const configured = (name) => {
  const value = env(name)
  return Boolean(value && !/change-this|your-domain|localhost|127\.0\.0\.1|haqsathi\.local|example|owner@example|YOUR_|none|empty|placeholder/i.test(value))
}
const safeMode = (name, fallback = 'manual_review') => ['manual_review', 'dry_run', 'moderated', 'approved_only', 'disabled'].includes(env(name, fallback))

const outputDir = env('FEEDBACK_EVIDENCE_DIR', './artifacts/feedback-readiness')
if (!existsSync(outputDir)) mkdirSync(outputDir, { recursive: true })

const controls = [
  ['feedback-owner-assigned', 'P0', 'Feedback owner assigned', configured('FEEDBACK_OWNER') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', `FEEDBACK_OWNER=${env('FEEDBACK_OWNER') || 'empty'}`],
  ['feedback-mode-safe', 'P0', 'Feedback mode is safe', safeMode('FEEDBACK_MODERATION_MODE') ? 'READY_TO_TEST' : 'BLOCKED', `FEEDBACK_MODERATION_MODE=${env('FEEDBACK_MODERATION_MODE', 'manual_review')}`],
  ['testimonial-consent-reviewed', 'P0', 'Testimonial consent reviewed', enabled('FEEDBACK_TESTIMONIAL_CONSENT_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `FEEDBACK_TESTIMONIAL_CONSENT_REVIEWED=${env('FEEDBACK_TESTIMONIAL_CONSENT_REVIEWED', 'false')}`],
  ['pii-redaction-reviewed', 'P0', 'PII redaction reviewed', enabled('FEEDBACK_PII_REDACTION_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `FEEDBACK_PII_REDACTION_REVIEWED=${env('FEEDBACK_PII_REDACTION_REVIEWED', 'false')}`],
  ['defamation-review-reviewed', 'P0', 'Defamation and unsafe claim review', enabled('FEEDBACK_DEFAMATION_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `FEEDBACK_DEFAMATION_REVIEWED=${env('FEEDBACK_DEFAMATION_REVIEWED', 'false')}`],
  ['spam-fraud-reviewed', 'P1', 'Spam/fraud review ready', enabled('FEEDBACK_SPAM_FRAUD_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `FEEDBACK_SPAM_FRAUD_REVIEWED=${env('FEEDBACK_SPAM_FRAUD_REVIEWED', 'false')}`],
  ['takedown-process-reviewed', 'P1', 'Takedown process reviewed', enabled('FEEDBACK_TAKEDOWN_PROCESS_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `FEEDBACK_TAKEDOWN_PROCESS_REVIEWED=${env('FEEDBACK_TAKEDOWN_PROCESS_REVIEWED', 'false')}`]
]

const lanes = [
  ['raw-feedback-intake', 'P0', 'Raw feedback intake', '/api/feedback + /admin/feedback', 'Raw support feedback stays private unless consented'],
  ['testimonial-consent', 'P0', 'Testimonial consent', 'success stories, reviews and public quotes', 'Only approved quotes with consent evidence can be published'],
  ['pii-redaction', 'P0', 'PII and secret redaction', 'feedback comments, screenshots, support notes', 'Published testimonials cannot expose complaint IDs or personal details'],
  ['defamation-unsafe-claims', 'P0', 'Defamation and unsafe claims review', 'negative reviews and named claims', 'Public reviews must be factual, non-harmful and not official/legal proof'],
  ['spam-fraud-review', 'P1', 'Spam and reward fraud review', 'review forms, referral-linked reviews, campaign traffic', 'Only human-reviewed non-incentivized testimonials should be highlighted'],
  ['rating-quality-insights', 'P2', 'Rating quality insights', '/admin/feedback rating trends', 'Show aggregate metrics only after sample-size and disclosure review']
]

const ready = controls.filter((control) => control[3] === 'PASS' || control[3] === 'READY_TO_TEST').length
const manualRequired = controls.filter((control) => control[3] === 'MANUAL_REQUIRED').length
const blocked = controls.filter((control) => control[3] === 'BLOCKED').length
const report = {
  generatedAt: new Date().toISOString(),
  version: '3.0.53-feedback-reviews-readiness',
  summary: { totalControls: controls.length, ready, manualRequired, blocked, moderationLanes: lanes.length },
  controls: controls.map(([id, priority, label, status, envValue]) => ({ id, priority, label, status, envValue })),
  moderationLanes: lanes.map(([id, priority, label, source, publishRule]) => ({ id, priority, label, source, publishRule })),
  outputDir,
  nextAction: blocked ? 'Fix blocked feedback moderation mode before accepting testimonials.' : manualRequired ? 'Complete P0 consent, PII redaction and unsafe-claim review before public social proof.' : 'Feedback moderation is ready.'
}

const csv = (rows) => rows.map((row) => row.map((value) => String(value).replaceAll(',', ';')).join(',')).join('\n')
writeFileSync(join(outputDir, 'feedback-readiness.json'), JSON.stringify(report, null, 2))
writeFileSync(join(outputDir, 'feedback-controls.csv'), csv([['id', 'priority', 'label', 'status', 'env_value'], ...controls]))
writeFileSync(join(outputDir, 'feedback-moderation-lanes.csv'), csv([['id', 'priority', 'label', 'source', 'publish_rule'], ...lanes]))
writeFileSync(join(outputDir, 'testimonial-consent-checklist.md'), `# Testimonial consent checklist\n\n- User clearly consented to public quote/testimonial.\n- Name/location/photo/screenshot use is separately approved.\n- User can request correction or removal.\n- No guarantee of official/legal outcome is implied.\n`)
writeFileSync(join(outputDir, 'feedback-redaction-checklist.md'), `# Feedback redaction checklist\n\nRemove before publishing:\n\n- OTPs, passwords, UPI PINs and CVV.\n- Full phone, email, address, card, bank or ID numbers.\n- Complaint IDs, private document text and screenshots with personal data.\n- Defamatory, hateful, threatening or unverified allegations.\n`)
writeFileSync(join(outputDir, 'public-review-publish-rules.md'), `# Public review publish rules\n\n1. Approved-only.\n2. Consent-backed.\n3. Privacy-safe.\n4. No unverified accusations.\n5. Incentives disclosed or excluded.\n6. Takedown owner assigned.\n`)

console.log(`✅ Feedback moderation evidence written to ${outputDir}`)
console.log(`Ready: ${ready} · Manual: ${manualRequired} · Blocked: ${blocked} · Lanes: ${lanes.length}`)
