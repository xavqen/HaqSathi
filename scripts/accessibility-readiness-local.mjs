import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const outputDir = process.env.ACCESSIBILITY_EVIDENCE_DIR || './artifacts/accessibility-readiness'
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

const routes = env('ACCESSIBILITY_ROUTE_TARGETS', '/,/complaint,/upi-help,/scheme-finder,/documents,/tools,/chat,/dashboard,/pricing,/admin/launch-command-center')
  .split(',')
  .map((route) => route.trim())
  .filter(Boolean)

const controls = [
  ['production-url', 'P0', 'Production URL configured for accessibility QA', configured('VERCEL_PRODUCTION_URL') || configured('NEXT_PUBLIC_APP_URL') ? 'READY_TO_TEST' : 'BLOCKED', `VERCEL_PRODUCTION_URL=${env('VERCEL_PRODUCTION_URL') || 'empty'}`],
  ['owner-assigned', 'P0', 'Accessibility QA owner assigned', configured('ACCESSIBILITY_QA_OWNER') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', `ACCESSIBILITY_QA_OWNER=${env('ACCESSIBILITY_QA_OWNER') || 'empty'}`],
  ['keyboard-reviewed', 'P0', 'Keyboard navigation reviewed', enabled('ACCESSIBILITY_KEYBOARD_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `ACCESSIBILITY_KEYBOARD_REVIEWED=${env('ACCESSIBILITY_KEYBOARD_REVIEWED', 'false')}`],
  ['focus-reviewed', 'P0', 'Visible focus states reviewed', enabled('ACCESSIBILITY_FOCUS_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `ACCESSIBILITY_FOCUS_REVIEWED=${env('ACCESSIBILITY_FOCUS_REVIEWED', 'false')}`],
  ['forms-reviewed', 'P0', 'Form labels and errors reviewed', enabled('ACCESSIBILITY_FORM_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `ACCESSIBILITY_FORM_REVIEWED=${env('ACCESSIBILITY_FORM_REVIEWED', 'false')}`],
  ['contrast-reviewed', 'P1', 'Text contrast reviewed', enabled('ACCESSIBILITY_CONTRAST_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `ACCESSIBILITY_CONTRAST_REVIEWED=${env('ACCESSIBILITY_CONTRAST_REVIEWED', 'false')}`],
  ['screen-reader-reviewed', 'P1', 'Screen reader semantics reviewed', enabled('ACCESSIBILITY_SCREEN_READER_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `ACCESSIBILITY_SCREEN_READER_REVIEWED=${env('ACCESSIBILITY_SCREEN_READER_REVIEWED', 'false')}`],
  ['reduced-motion-reviewed', 'P2', 'Reduced motion behavior reviewed', enabled('ACCESSIBILITY_REDUCED_MOTION_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `ACCESSIBILITY_REDUCED_MOTION_REVIEWED=${env('ACCESSIBILITY_REDUCED_MOTION_REVIEWED', 'false')}`],
  ['evidence-dir', 'P2', 'Accessibility evidence directory configured', 'READY_TO_TEST', `ACCESSIBILITY_EVIDENCE_DIR=${outputDir}`]
]

const assistiveTech = [
  ['keyboard-only', 'P0', 'Keyboard only', 'Tab order; Escape closes menus; Enter/Space activate buttons; no focus trap'],
  ['android-talkback', 'P1', 'Android TalkBack', 'Bottom nav labels; form field names; warning/status text; menu announcements'],
  ['ios-voiceover', 'P1', 'iOS VoiceOver', 'Safari headings; safe-area controls; CTA labels; external link clarity'],
  ['desktop-nvda', 'P2', 'Desktop NVDA/Chrome', 'Landmarks; headings; form errors; admin table navigation']
]

const routeRows = routes.map((route, index) => [
  route,
  index < 6 ? 'P0' : index < 9 ? 'P1' : 'P2',
  'Keyboard navigation; visible focus; heading order; accessible names; contrast; form labels/errors',
  'Keyboard screenshot/recording; mobile focus screenshot; desktop focus screenshot; Lighthouse or axe report'
])

const ready = controls.filter((control) => control[3] === 'PASS' || control[3] === 'READY_TO_TEST').length
const manualRequired = controls.filter((control) => control[3] === 'MANUAL_REQUIRED').length
const blocked = controls.filter((control) => control[3] === 'BLOCKED').length

const report = {
  generatedAt: new Date().toISOString(),
  version: '3.0.41-accessibility-readiness',
  summary: {
    totalControls: controls.length,
    ready,
    manualRequired,
    blocked,
    routes: routes.length,
    p0Routes: routeRows.filter((row) => row[1] === 'P0').length,
    assistiveTechTargets: assistiveTech.length
  },
  controls: controls.map(([id, priority, label, status, envValue]) => ({ id, priority, label, status, envValue })),
  routeChecks: routeRows.map(([route, priority, checks, evidence]) => ({ route, priority, checks, evidence })),
  assistiveTech: assistiveTech.map(([id, priority, label, checks]) => ({ id, priority, label, checks })),
  nextAction: blocked ? 'Set a real deployed HTTPS URL before accessibility launch review.' : manualRequired ? 'Collect accessibility evidence before public launch.' : 'Accessibility readiness gates are complete for launch review.'
}

const csv = (rows) => rows.map((row) => row.map((value) => String(value).replaceAll(',', ';')).join(',')).join('\n')
writeFileSync(join(outputDir, 'accessibility-readiness.json'), JSON.stringify(report, null, 2))
writeFileSync(join(outputDir, 'accessibility-controls.csv'), csv([['id', 'priority', 'label', 'status', 'env_value'], ...controls]))
writeFileSync(join(outputDir, 'accessibility-routes.csv'), csv([['route', 'priority', 'checks', 'evidence_required'], ...routeRows]))
writeFileSync(join(outputDir, 'accessibility-assistive-tech.csv'), csv([['id', 'priority', 'label', 'checks'], ...assistiveTech]))

console.log(`✅ Accessibility readiness evidence written to ${outputDir}`)
console.log(`Ready: ${ready} · Manual: ${manualRequired} · Blocked: ${blocked} · Routes: ${routes.length} · Assistive targets: ${assistiveTech.length}`)
