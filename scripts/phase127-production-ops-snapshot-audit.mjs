import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const issues = []
const exists = (file) => existsSync(join(root, file))
const read = (file) => readFileSync(join(root, file), 'utf8')
const pkg = JSON.parse(read('package.json'))
const env = read('.env.example')
const health = read('app/api/health/route.ts')
const ready = read('app/api/ready/route.ts')
const sw = read('public/sw.js')
const opsScript = read('scripts/launch-ops-snapshot.mjs')
const finalMatrix = read('lib/launch/final-qa-matrix.ts')
const launchPage = read('app/launch-readiness/page.tsx')
const statusPage = read('app/status/page.tsx')
const evidenceGate = read('scripts/launch-evidence-gate.mjs')

function pass(name, condition) {
  if (!condition) issues.push(name)
}

pass('version is a compatible 3.0 release', String(pkg.version || '').startsWith('3.0.'))
pass('phase127 audit script is registered', pkg.scripts['phase127:audit'] === 'node scripts/phase127-production-ops-snapshot-audit.mjs')
pass('quality release includes phase127', pkg.scripts['quality:release'].includes('phase127:audit'))
pass('ops snapshot command is registered', pkg.scripts['launch:ops-snapshot'] === 'node scripts/launch-ops-snapshot.mjs')
pass('production gate includes ops snapshot', pkg.scripts['launch:production-gate'].includes('launch:ops-snapshot') && pkg.scripts['launch:production-gate'].includes('launch:evidence-gate'))
pass('health endpoint exposes current safe metadata', health.includes('3.0.') && health.includes('Cache-Control') && health.includes('no-store'))
pass('ready endpoint returns structured production checks', ready.includes('readinessChecks') && ready.includes('databaseConnectivity') && ready.includes('Cache-Control'))
pass('ops script checks public health and readiness endpoints', opsScript.includes('/api/health') && opsScript.includes('/api/ready') && opsScript.includes('production-ops-snapshot.json'))
pass('ops script scans endpoint bodies for secrets', opsScript.includes('secretPattern') && opsScript.includes('SUPABASE_SERVICE_ROLE_KEY') && opsScript.includes('RAZORPAY_KEY_SECRET'))
pass('ops script writes JSON and CSV artifacts', opsScript.includes('production-ops-snapshot.json') && opsScript.includes('production-ops-snapshot.csv'))
pass('final QA matrix exposes production ops snapshot', finalMatrix.includes('production-ops-snapshot') && finalMatrix.includes('npm run launch:ops-snapshot'))
pass('launch readiness page shows production ops checklist', launchPage.includes('getProductionOpsChecklist') && launchPage.includes('Production operations snapshot'))
pass('status page points to health and ready endpoints', statusPage.includes('/api/health') && statusPage.includes('/api/ready'))
pass('evidence gate requires ops snapshot artifact', evidenceGate.includes('production-ops-snapshot.json') && evidenceGate.includes('ops-snapshot-artifact'))
pass('env exposes ops snapshot controls', env.includes('OPS_HEALTH_BASE_URL') && env.includes('STRICT_PRODUCTION_OPS') && env.includes('OPS_SNAPSHOT_TIMEOUT_MS'))
pass('env, health and service worker are current', env.includes('NEXT_PUBLIC_APP_VERSION="3.0.') && health.includes('3.0.') && sw.includes('haqsathi-ai-v3-0-'))
pass('phase notes exist', exists('PHASE_127_PRODUCTION_OPS_SNAPSHOT.md'))

console.log('\nPhase 127 production ops snapshot audit')
console.log('Checks: 17')
console.log(`Issues found: ${issues.length}`)
if (issues.length) {
  for (const issue of issues) console.error('❌ ' + issue)
  process.exit(1)
}
console.log('✅ Phase 127 audit passed: production health, readiness, ops snapshot artifacts and launch gate wiring are in place.\n')
