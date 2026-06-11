import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const outputDir = process.env.VOICE_INPUT_EVIDENCE_DIR || './artifacts/voice-input-readiness'
mkdirSync(outputDir, { recursive: true })

const env = (name) => process.env[name] || ''
const enabled = (name) => /^(true|1|yes|enabled)$/i.test(env(name))
const configured = (name) => Boolean(env(name) && !/change-this|example|todo|your-|localhost|haqsathi\.local/i.test(env(name)))

const voiceEnabled = enabled('NEXT_PUBLIC_VOICE_INPUT_ENABLED') || !env('NEXT_PUBLIC_VOICE_INPUT_ENABLED')
const consentRequired = enabled('VOICE_INPUT_REQUIRE_CONSENT') || !env('VOICE_INPUT_REQUIRE_CONSENT')
const manualFallback = enabled('VOICE_INPUT_MANUAL_FALLBACK') || !env('VOICE_INPUT_MANUAL_FALLBACK')
const piiMasking = enabled('VOICE_INPUT_PII_MASKING') || !env('VOICE_INPUT_PII_MASKING')
const ownerReady = configured('VOICE_INPUT_REVIEW_OWNER') || configured('SUPPORT_AGENT_OWNER')

const controls = [
  ['browser-support', 'Browser speech support fallback', voiceEnabled && manualFallback ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', `NEXT_PUBLIC_VOICE_INPUT_ENABLED=${env('NEXT_PUBLIC_VOICE_INPUT_ENABLED') || 'true'}; VOICE_INPUT_MANUAL_FALLBACK=${env('VOICE_INPUT_MANUAL_FALLBACK') || 'true'}`],
  ['privacy-consent', 'Mic consent and privacy copy', consentRequired ? 'READY_TO_TEST' : 'BLOCKED', `VOICE_INPUT_REQUIRE_CONSENT=${env('VOICE_INPUT_REQUIRE_CONSENT') || 'true'}`],
  ['pii-safety', 'Sensitive data warning and masking readiness', piiMasking ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', `VOICE_INPUT_PII_MASKING=${env('VOICE_INPUT_PII_MASKING') || 'true'}`],
  ['language-coverage', 'English/Hinglish/Hindi language hints', 'READY_TO_TEST', `VOICE_INPUT_DEFAULT_LOCALE=${env('VOICE_INPUT_DEFAULT_LOCALE') || 'en-IN'}`],
  ['mobile-touch', 'Mobile touch target and safe layout', 'READY_TO_TEST', 'Complaint voice helper has min-height controls and no auto-start'],
  ['review-owner', 'Voice QA owner assigned', ownerReady ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', `VOICE_INPUT_REVIEW_OWNER=${env('VOICE_INPUT_REVIEW_OWNER') || 'empty'}`]
]

const report = {
  generatedAt: new Date().toISOString(),
  version: '3.0.26-voice-input-readiness',
  mode: env('VOICE_INPUT_MODE') || 'assistive',
  summary: {
    totalControls: controls.length,
    ready: controls.filter((control) => control[2] === 'PASS' || control[2] === 'READY_TO_TEST').length,
    manualRequired: controls.filter((control) => control[2] === 'MANUAL_REQUIRED').length,
    blocked: controls.filter((control) => control[2] === 'BLOCKED').length
  },
  controls: controls.map(([id, label, status, note]) => ({ id, label, status, note })),
  launchEvidence: [
    'Chrome Android voice dictation screenshot',
    'Desktop Chrome voice dictation screenshot',
    'Unsupported browser fallback screenshot',
    'Complaint form with voice-filled description screenshot',
    'Admin readiness page screenshot and local evidence JSON/CSV'
  ]
}

const csvRows = [
  ['control_id', 'label', 'status', 'note'],
  ...controls.map((row) => row.map((value) => String(value).replaceAll(',', ';')))
]

writeFileSync(join(outputDir, 'voice-input-readiness.json'), JSON.stringify(report, null, 2))
writeFileSync(join(outputDir, 'voice-input-readiness.csv'), csvRows.map((row) => row.join(',')).join('\n'))

console.log(`✅ Voice input readiness evidence written to ${outputDir}`)
console.log(`Controls: ${report.summary.totalControls} · Ready: ${report.summary.ready} · Manual QA: ${report.summary.manualRequired} · Blocked: ${report.summary.blocked}`)
