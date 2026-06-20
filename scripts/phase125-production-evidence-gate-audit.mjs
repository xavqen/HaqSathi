import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const issues = []
const exists = (file) => existsSync(join(root, file))
const read = (file) => readFileSync(join(root, file), 'utf8')
const pkg = JSON.parse(read('package.json'))
const env = read('.env.example')
const health = read('app/api/health/route.ts')
const sw = read('public/sw.js')
const finalMatrix = read('lib/launch/final-qa-matrix.ts')
const launchPage = read('app/launch-readiness/page.tsx')
const evidenceGate = read('scripts/launch-evidence-gate.mjs')

function pass(name, condition) {
  if (!condition) issues.push(name)
}

pass('version is a compatible 3.0 release', String(pkg.version || '').startsWith('3.0.'))
pass('phase125 audit script is registered', pkg.scripts['phase125:audit'] === 'node scripts/phase125-production-evidence-gate-audit.mjs')
pass('quality release includes phase125', pkg.scripts['quality:release'].includes('phase125:audit'))
pass('evidence gate script is registered', pkg.scripts['launch:evidence-gate'] === 'node scripts/launch-evidence-gate.mjs')
pass('production gate command is registered', pkg.scripts['launch:production-gate'] && pkg.scripts['launch:production-gate'].includes('launch:evidence-gate'))
pass('final QA matrix exposes evidence gate', finalMatrix.includes('npm run launch:evidence-gate') && finalMatrix.includes('Final go/no-go evidence gate'))
pass('launch readiness page explains final blocker rule', launchPage.includes('Final blocker rule') && launchPage.includes('Do not launch'))
pass('evidence gate checks live QA, payment/storage, Lighthouse and Playwright artifacts', evidenceGate.includes('live-launch-qa-report.json') && evidenceGate.includes('payment-storage-readiness.json') && evidenceGate.includes('LIGHTHOUSE_PRODUCTION_PASSED') && evidenceGate.includes('PLAYWRIGHT_PRODUCTION_PASSED'))
pass('evidence gate requires launch approvals and owners', evidenceGate.includes('LAUNCH_PAYMENT_APPROVED') && evidenceGate.includes('LAUNCH_FOUNDER_SIGNOFF') && evidenceGate.includes('LAUNCH_ROLLBACK_OWNER') && evidenceGate.includes('LAUNCH_INCIDENT_OWNER'))
pass('evidence gate writes JSON and CSV artifacts', evidenceGate.includes('final-evidence-gate.json') && evidenceGate.includes('final-evidence-gate.csv'))
pass('env exposes final evidence gate knobs', env.includes('LAUNCH_EVIDENCE_DIR') && env.includes('LAUNCH_STRICT_EVIDENCE_GATE') && env.includes('PLAYWRIGHT_REPORT_DIR'))
pass('env, health and service worker are current', env.includes('NEXT_PUBLIC_APP_VERSION="3.0.') && health.includes('3.0.') && sw.includes('haqsathi-ai-v3-0-'))
pass('phase notes exist', exists('PHASE_125_PRODUCTION_EVIDENCE_GATE.md'))

console.log('\nPhase 125 production evidence gate audit')
console.log('Checks: 13')
console.log(`Issues found: ${issues.length}`)
if (issues.length) {
  for (const issue of issues) console.error('❌ ' + issue)
  process.exit(1)
}
console.log('✅ Phase 125 audit passed: final production evidence gate, no-go controls, artifacts and launch commands are wired.\n')
