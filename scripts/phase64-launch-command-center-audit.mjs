import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const issues = []
const exists = (file) => existsSync(join(root, file))
const read = (file) => readFileSync(join(root, file), 'utf8')
const pkg = JSON.parse(read('package.json'))

function require(condition, message) {
  if (!condition) issues.push(message)
}

const helper = exists('lib/launch/command-center.ts') ? read('lib/launch/command-center.ts') : ''
const adminPage = exists('app/admin/launch-command-center/page.tsx') ? read('app/admin/launch-command-center/page.tsx') : ''
const adminApi = exists('app/api/admin/launch-command-center/route.ts') ? read('app/api/admin/launch-command-center/route.ts') : ''
const adminShell = exists('components/admin/admin-shell.tsx') ? read('components/admin/admin-shell.tsx') : ''
const env = read('.env.example')
const evidence = read('lib/qa/launch-evidence.ts')

require(/3\.0\.(3[4-9]|[4-9][0-9])/.test(pkg.version), 'package version must be v3.0.34+')
require(pkg.scripts['launch:command-center'] === 'node scripts/launch-command-center-local.mjs', 'launch:command-center script missing')
require(pkg.scripts['phase64:audit'] === 'node scripts/phase64-launch-command-center-audit.mjs', 'phase64:audit script missing')
require((pkg.scripts['quality:release'] || '').includes('phase64:audit'), 'quality:release must include phase64 audit')
require(exists('lib/launch/command-center.ts'), 'launch command center helper missing')
for (const token of ['getLaunchCommandCenterReport', 'getLaunchEvidenceSummary', 'LAUNCH_FOUNDER_SIGNOFF', 'LAUNCH_GO_NO_GO_COMPLETED', 'LAUNCH_ROLLBACK_OWNER', 'LAUNCH_INCIDENT_OWNER', 'LAUNCH_PAYMENT_APPROVED', 'LAUNCH_EMAIL_APPROVED', 'LAUNCH_DEPLOYMENT_QA_APPROVED']) {
  require(helper.includes(token), `helper missing ${token}`)
}
require(exists('app/admin/launch-command-center/page.tsx'), 'admin launch command center page missing')
require(adminPage.includes('Launch command center') && adminPage.includes('npm run launch:command-center') && adminPage.includes('/api/admin/launch-command-center') && adminPage.includes('/admin/deployment-qa'), 'admin page must show title, command, API and deployment QA link')
require(exists('app/api/admin/launch-command-center/route.ts'), 'launch command center admin API missing')
require(adminApi.includes('requireAdmin') && adminApi.includes('getLaunchCommandCenterReport'), 'admin API must require admin and return launch command report')
require(exists('scripts/launch-command-center-local.mjs'), 'launch command local evidence script missing')
require(adminShell.includes('/admin/launch-command-center'), 'admin shell must link launch command center')
for (const key of ['LAUNCH_COMMAND_MODE', 'LAUNCH_COMMAND_EVIDENCE_DIR', 'LAUNCH_FOUNDER_SIGNOFF', 'LAUNCH_GO_NO_GO_COMPLETED', 'LAUNCH_DEPLOYMENT_QA_APPROVED', 'LAUNCH_PAYMENT_APPROVED', 'LAUNCH_EMAIL_APPROVED', 'LAUNCH_STORAGE_APPROVED', 'LAUNCH_OFFICIAL_DATA_APPROVED', 'LAUNCH_AI_SAFETY_APPROVED', 'LAUNCH_SUPPORT_APPROVED', 'LAUNCH_ROLLBACK_OWNER', 'LAUNCH_INCIDENT_OWNER']) {
  require(env.includes(`${key}=`), `.env.example missing ${key}`)
}
require(evidence.includes('Launch Command Center'), 'launch evidence gate missing launch command center')
require(exists('PHASE_64_LAUNCH_COMMAND_CENTER.md'), 'Phase 64 notes missing')

console.log('\nHaqSathi Phase 64 launch command center audit')
console.log('Checks: 15')
console.log(`Issues found: ${issues.length}`)
if (issues.length) {
  for (const issue of issues) console.error('❌ ' + issue)
  process.exit(1)
}
console.log('✅ Phase 64 audit passed: launch command center helper, admin page, API, evidence script, envs and launch gate are installed.\n')
