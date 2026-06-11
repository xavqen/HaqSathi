import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const outputDir = process.env.TRANSLATION_REVIEW_EVIDENCE_DIR || './artifacts/translation-review'
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

const priorityLanguages = env('TRANSLATION_PRIORITY_LANGUAGES', 'ENGLISH,HINGLISH,HINDI,BENGALI,MARATHI,TAMIL,TELUGU,GUJARATI,URDU').split(',').map((value) => value.trim()).filter(Boolean)

const controls = [
  ['review-owner', 'Translation review owner assigned', configured('TRANSLATION_REVIEW_OWNER') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', `TRANSLATION_REVIEW_OWNER=${env('TRANSLATION_REVIEW_OWNER') || 'empty'}`],
  ['priority-languages', 'Priority launch languages selected', priorityLanguages.length ? 'READY_TO_TEST' : 'BLOCKED', `TRANSLATION_PRIORITY_LANGUAGES=${priorityLanguages.join('|')}`],
  ['human-review-required', 'Human review gate enabled', enabled('TRANSLATION_HUMAN_REVIEW_REQUIRED') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', `TRANSLATION_HUMAN_REVIEW_REQUIRED=${env('TRANSLATION_HUMAN_REVIEW_REQUIRED', 'true')}`],
  ['rtl-review', 'RTL review evidence saved', enabled('TRANSLATION_RTL_REVIEW_PASSED') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', `TRANSLATION_RTL_REVIEW_PASSED=${env('TRANSLATION_RTL_REVIEW_PASSED', 'false')}`],
  ['legal-review', 'Legal/privacy translation review saved', enabled('TRANSLATION_LEGAL_REVIEW_PASSED') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', `TRANSLATION_LEGAL_REVIEW_PASSED=${env('TRANSLATION_LEGAL_REVIEW_PASSED', 'false')}`],
  ['evidence-dir', 'Translation evidence directory configured', configured('TRANSLATION_REVIEW_EVIDENCE_DIR') ? 'READY_TO_TEST' : 'READY_TO_TEST', `TRANSLATION_REVIEW_EVIDENCE_DIR=${outputDir}`]
]

const lanes = [
  ['public-home-pricing-auth', 'P0', '/', '/pricing', '/login', '/register'],
  ['core-tools-complaint-upi-docs', 'P0', '/complaint', '/upi-help', '/scheme-finder', '/documents'],
  ['dashboard-vault-reminders', 'P0', '/dashboard', '/dashboard/document-vault', '/dashboard/reminders', '/dashboard/security'],
  ['official-content-guides', 'P1', '/official-sources', '/authority-directory', '/filing-guides', '/state-guides'],
  ['legal-privacy-compliance', 'P1', '/privacy', '/terms', '/disclaimer', '/privacy-center'],
  ['growth-support-emails', 'P2', '/newsletter', '/referrals', '/support', '/contact']
]

const ready = controls.filter((control) => control[2] === 'READY_TO_TEST').length
const manualRequired = controls.filter((control) => control[2] === 'MANUAL_REQUIRED').length
const blocked = controls.filter((control) => control[2] === 'BLOCKED').length
const report = {
  generatedAt: new Date().toISOString(),
  version: '3.0.35-translation-review-readiness',
  summary: { totalControls: controls.length, ready, manualRequired, blocked, priorityLanguages: priorityLanguages.length, lanes: lanes.length },
  controls: controls.map(([id, label, status, envValue]) => ({ id, label, status, envValue })),
  lanes: lanes.map(([id, priority, ...pages]) => ({ id, priority, pages, priorityLanguages })),
  nextAction: manualRequired || blocked ? 'Complete reviewer screenshots and mark approved env flags only after real human review.' : 'Translation review readiness controls are ready for final launch evidence.'
}

const controlRows = [['id', 'label', 'status', 'env_value'], ...controls].map((row) => row.map((value) => String(value).replaceAll(',', ';')))
const laneRows = [['id', 'priority', 'pages', 'languages'], ...lanes.map(([id, priority, ...pages]) => [id, priority, pages.join('|'), priorityLanguages.join('|')])]

writeFileSync(join(outputDir, 'translation-review-readiness.json'), JSON.stringify(report, null, 2))
writeFileSync(join(outputDir, 'translation-review-controls.csv'), controlRows.map((row) => row.join(',')).join('\n'))
writeFileSync(join(outputDir, 'translation-review-lanes.csv'), laneRows.map((row) => row.join(',')).join('\n'))

console.log(`✅ Translation review readiness evidence written to ${outputDir}`)
console.log(`Ready: ${ready} · Manual: ${manualRequired} · Blocked: ${blocked} · Priority languages: ${priorityLanguages.length}`)
