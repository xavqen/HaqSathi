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
const artifactManifest = read('scripts/launch-artifact-manifest.mjs')
const evidenceGate = read('scripts/launch-evidence-gate.mjs')

function pass(name, condition) {
  if (!condition) issues.push(name)
}

pass('version is a compatible 3.0 release', String(pkg.version || '').startsWith('3.0.'))
pass('phase126 audit script is registered', pkg.scripts['phase126:audit'] === 'node scripts/phase126-artifact-integrity-gate-audit.mjs')
pass('quality release includes phase126', pkg.scripts['quality:release'].includes('phase126:audit'))
pass('artifact manifest command is registered', pkg.scripts['launch:artifact-manifest'] === 'node scripts/launch-artifact-manifest.mjs')
pass('production gate includes final evidence and artifact integrity', pkg.scripts['launch:production-gate'].includes('launch:evidence-gate') && pkg.scripts['launch:production-gate'].includes('launch:artifact-manifest'))
pass('artifact manifest hashes files with sha256', artifactManifest.includes('createHash') && artifactManifest.includes('sha256'))
pass('artifact manifest checks required live QA files', artifactManifest.includes('live-launch-qa-report.json') && artifactManifest.includes('payment-storage-readiness.json') && artifactManifest.includes('final-evidence-gate.json') && artifactManifest.includes('production-ops-snapshot.json'))
pass('artifact manifest scans for likely secret leaks', artifactManifest.includes('RAZORPAY_KEY_SECRET') && artifactManifest.includes('SUPABASE_SERVICE_ROLE_KEY') && artifactManifest.includes('DATABASE_URL') && artifactManifest.includes('AUTH_SECRET'))
pass('artifact manifest writes JSON and CSV', artifactManifest.includes('launch-artifact-manifest.json') && artifactManifest.includes('launch-artifact-manifest.csv'))
pass('final QA matrix exposes artifact integrity step', finalMatrix.includes('launch-artifact-integrity') && finalMatrix.includes('npm run launch:artifact-manifest') && finalMatrix.includes('SHA-256'))
pass('launch readiness page mentions artifact secret scanning', launchPage.includes('launch:artifact-manifest') && launchPage.includes('secret-leak scanning'))
pass('evidence gate runbook points to artifact manifest', evidenceGate.includes('launch:artifact-manifest'))
pass('env exposes artifact controls', env.includes('STRICT_LAUNCH_ARTIFACTS') && env.includes('LAUNCH_ARTIFACT_MAX_SECRET_SCAN_BYTES'))
pass('env, health and service worker are current', env.includes('NEXT_PUBLIC_APP_VERSION="3.0.') && health.includes('3.0.') && sw.includes('haqsathi-ai-v3-0-'))
pass('phase notes exist', exists('PHASE_126_ARTIFACT_INTEGRITY_GATE.md'))

console.log('\nPhase 126 artifact integrity gate audit')
console.log('Checks: 15')
console.log(`Issues found: ${issues.length}`)
if (issues.length) {
  for (const issue of issues) console.error('❌ ' + issue)
  process.exit(1)
}
console.log('✅ Phase 126 audit passed: launch artifact hashing, secret scanning, evidence matrix and production gate are wired.\n')
