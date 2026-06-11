import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const outputDir = process.env.ONBOARDING_ASSISTANT_EVIDENCE_DIR || './artifacts/onboarding-assistant-readiness'
mkdirSync(outputDir, { recursive: true })

const env = (name, fallback = '') => process.env[name] || fallback
const enabled = (name) => /^(true|1|yes|enabled|pass|reviewed)$/i.test(env(name))
const configured = (name) => {
  const value = env(name)
  return Boolean(value && !/change-this|your-domain|localhost|127\.0\.0\.1|haqsathi\.local|example|owner@example|YOUR_|none|empty|placeholder/i.test(value))
}
const safeMode = ['guided', 'manual_review', 'dry_run', 'rules_only', 'disabled'].includes(env('ONBOARDING_ASSISTANT_MODE', 'guided'))

const controls = [
  ['owner-assigned', 'P0', 'Onboarding owner assigned', configured('ONBOARDING_ASSISTANT_OWNER') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', `ONBOARDING_ASSISTANT_OWNER=${env('ONBOARDING_ASSISTANT_OWNER') || 'empty'}`],
  ['mode-safe', 'P0', 'Assistant mode is safe', safeMode ? 'READY_TO_TEST' : 'BLOCKED', `ONBOARDING_ASSISTANT_MODE=${env('ONBOARDING_ASSISTANT_MODE', 'guided')}`],
  ['p0-route-review', 'P0', 'P0 routes reviewed', enabled('ONBOARDING_P0_ROUTES_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `ONBOARDING_P0_ROUTES_REVIEWED=${env('ONBOARDING_P0_ROUTES_REVIEWED', 'false')}`],
  ['sensitive-data-warning', 'P0', 'Sensitive-data warning reviewed', enabled('ONBOARDING_SENSITIVE_DATA_WARNING_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `ONBOARDING_SENSITIVE_DATA_WARNING_REVIEWED=${env('ONBOARDING_SENSITIVE_DATA_WARNING_REVIEWED', 'false')}`],
  ['language-routing-review', 'P1', 'Language and state routing reviewed', enabled('ONBOARDING_LANGUAGE_ROUTING_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `ONBOARDING_LANGUAGE_ROUTING_REVIEWED=${env('ONBOARDING_LANGUAGE_ROUTING_REVIEWED', 'false')}`],
  ['first-action-analytics-review', 'P2', 'First-action analytics reviewed', enabled('ONBOARDING_FIRST_ACTION_ANALYTICS_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `ONBOARDING_FIRST_ACTION_ANALYTICS_REVIEWED=${env('ONBOARDING_FIRST_ACTION_ANALYTICS_REVIEWED', 'false')}`]
]

const steps = [
  ['goal-detection', 'P0', 'Goal detection', '/dashboard/onboarding', 'Ask issue type, state and non-sensitive summary only'],
  ['tool-routing', 'P0', 'Tool routing', '/tools', 'Route to one safe first action'],
  ['language-state-context', 'P1', 'Language and state context', '/profile/settings', 'Keep legal/payment/privacy terms consistent'],
  ['first-success-path', 'P1', 'First success path', '/dashboard', 'Help user finish one useful action'],
  ['privacy-safe-education', 'P0', 'Privacy-safe education', '/privacy', 'Warn before AI/chat/voice/upload fields']
]

const ready = controls.filter((control) => control[3] === 'PASS' || control[3] === 'READY_TO_TEST').length
const manualRequired = controls.filter((control) => control[3] === 'MANUAL_REQUIRED').length
const blocked = controls.filter((control) => control[3] === 'BLOCKED').length
const report = {
  generatedAt: new Date().toISOString(),
  version: '3.0.54-onboarding-assistant-readiness',
  summary: { totalControls: controls.length, ready, manualRequired, blocked, guidedSteps: steps.length },
  controls: controls.map(([id, priority, label, status, envValue]) => ({ id, priority, label, status, envValue })),
  guidedSteps: steps.map(([id, priority, label, route, safePrompt]) => ({ id, priority, label, route, safePrompt })),
  outputDir,
  nextAction: blocked ? 'Fix blocked onboarding assistant mode.' : manualRequired ? 'Complete P0 route and sensitive-data warning review.' : 'Onboarding assistant is ready.'
}

const csv = (rows) => rows.map((row) => row.map((value) => String(value).replaceAll(',', ';')).join(',')).join('\n')
writeFileSync(join(outputDir, 'onboarding-assistant-readiness.json'), JSON.stringify(report, null, 2))
writeFileSync(join(outputDir, 'onboarding-controls.csv'), csv([['id', 'priority', 'label', 'status', 'env_value'], ...controls]))
writeFileSync(join(outputDir, 'onboarding-guided-steps.csv'), csv([['id', 'priority', 'label', 'route', 'safe_prompt'], ...steps]))
writeFileSync(join(outputDir, 'first-run-checklist.md'), `# First-run onboarding checklist\n\n- Goal, state and language selection works on mobile and desktop.\n- One recommended next action is visible.\n- Sensitive-data warning is visible before AI, chat, voice and upload flows.\n- Official verification reminder is visible for high-risk flows.\n- No raw complaint/document text is sent to analytics.\n`)
writeFileSync(join(outputDir, 'unsafe-onboarding-prompt-rules.md'), `# Unsafe onboarding prompt rules\n\nNever ask for:\n\n- OTP, password, UPI PIN or CVV.\n- Full bank/card details.\n- Private IDs or document screenshots before privacy notices.\n\nNever claim guaranteed refund, legal win, scheme eligibility or official government approval.\n`)
writeFileSync(join(outputDir, 'first-session-route-map.md'), `# First-session route map\n\n- Complaint/refund -> /complaint\n- UPI/payment issue -> /upi-help\n- Scheme eligibility -> /scheme-finder\n- Documents/form issue -> /documents\n- Unknown issue -> /tools\n`)

console.log(`✅ Onboarding assistant evidence written to ${outputDir}`)
console.log(`Ready: ${ready} · Manual: ${manualRequired} · Blocked: ${blocked} · Guided steps: ${steps.length}`)
