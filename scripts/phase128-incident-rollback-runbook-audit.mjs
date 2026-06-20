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
const rollbackScript = read('scripts/launch-rollback-drill.mjs')
const evidenceGate = read('scripts/launch-evidence-gate.mjs')
const artifactManifest = read('scripts/launch-artifact-manifest.mjs')
const finalMatrix = read('lib/launch/final-qa-matrix.ts')
const launchPage = read('app/launch-readiness/page.tsx')
const incidentLib = read('lib/launch/incident-rollback.ts')
const opsLib = read('lib/launch/production-ops.ts')

function pass(name, condition) {
  if (!condition) issues.push(name)
}

pass('version is a compatible 3.0 release', String(pkg.version || '').startsWith('3.0.'))
pass('phase128 audit script is registered', pkg.scripts['phase128:audit'] === 'node scripts/phase128-incident-rollback-runbook-audit.mjs')
pass('quality release includes phase128', pkg.scripts['quality:release'].includes('phase128:audit'))
pass('rollback drill command is registered', pkg.scripts['launch:rollback-drill'] === 'node scripts/launch-rollback-drill.mjs')
pass('production gate includes rollback drill before evidence gate', pkg.scripts['launch:production-gate'].includes('launch:ops-snapshot') && pkg.scripts['launch:production-gate'].includes('launch:rollback-drill') && pkg.scripts['launch:production-gate'].includes('launch:evidence-gate') && pkg.scripts['launch:production-gate'].indexOf('launch:rollback-drill') < pkg.scripts['launch:production-gate'].indexOf('launch:evidence-gate'))
pass('rollback script writes JSON and CSV artifacts', rollbackScript.includes('rollback-drill.json') && rollbackScript.includes('rollback-drill.csv'))
pass('rollback script checks owners, backup, rollback and maintenance notice', rollbackScript.includes('LAUNCH_ROLLBACK_OWNER') && rollbackScript.includes('LAUNCH_INCIDENT_OWNER') && rollbackScript.includes('LAUNCH_BACKUP_CONFIRMED') && rollbackScript.includes('LAUNCH_ROLLBACK_TESTED') && rollbackScript.includes('LAUNCH_MAINTENANCE_NOTICE_READY'))
pass('rollback script redacts secret-like evidence', rollbackScript.includes('secretPattern') && rollbackScript.includes('[redacted secret-like evidence]'))
pass('evidence gate requires rollback drill artifact', evidenceGate.includes('rollback-drill.json') && evidenceGate.includes('rollback-drill-artifact') && evidenceGate.includes('ROLLBACK_DRILL_READY'))
pass('artifact manifest includes rollback drill proof', artifactManifest.includes("id: 'rollback-drill'") && artifactManifest.includes('rollback-drill.json'))
pass('final QA matrix exposes incident rollback runbook', finalMatrix.includes('incident-rollback-runbook') && finalMatrix.includes('npm run launch:rollback-drill'))
pass('launch readiness page renders incident rollback checklist', launchPage.includes('getIncidentRollbackChecklist') && launchPage.includes('Incident rollback runbook'))
pass('incident rollback launch library exists', incidentLib.includes('incidentRollbackChecklist') && incidentLib.includes('LAUNCH_LAST_GOOD_DEPLOYMENT_URL'))
pass('production ops checklist references rollback drill artifact', opsLib.includes('rollback-drill-artifact') && opsLib.includes('npm run launch:rollback-drill'))
pass('env exposes rollback drill controls', env.includes('STRICT_ROLLBACK_DRILL') && env.includes('LAUNCH_LAST_GOOD_DEPLOYMENT_URL') && env.includes('LAUNCH_BACKUP_CONFIRMED') && env.includes('LAUNCH_ROLLBACK_TESTED') && env.includes('LAUNCH_MAINTENANCE_NOTICE_READY'))
pass('env, health, ready and service worker are current', env.includes('NEXT_PUBLIC_APP_VERSION="3.0.') && health.includes('3.0.') && ready.includes('3.0.') && sw.includes('haqsathi-ai-v3-0-'))
pass('phase notes exist', exists('PHASE_128_INCIDENT_ROLLBACK_RUNBOOK.md'))

console.log('\nPhase 128 incident rollback runbook audit')
console.log('Checks: 17')
console.log(`Issues found: ${issues.length}`)
if (issues.length) {
  for (const issue of issues) console.error('❌ ' + issue)
  process.exit(1)
}
console.log('✅ Phase 128 audit passed: rollback drill, incident owners, backup proof, evidence gate and artifact manifest wiring are in place.\n')
