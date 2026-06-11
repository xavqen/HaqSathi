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

const helper = exists('lib/abuse/prevention-readiness.ts') ? read('lib/abuse/prevention-readiness.ts') : ''
const adminPage = exists('app/admin/abuse-prevention/page.tsx') ? read('app/admin/abuse-prevention/page.tsx') : ''
const adminApi = exists('app/api/admin/abuse-prevention-readiness/route.ts') ? read('app/api/admin/abuse-prevention-readiness/route.ts') : ''
const localScript = exists('scripts/abuse-prevention-readiness-local.mjs') ? read('scripts/abuse-prevention-readiness-local.mjs') : ''
const adminShell = exists('components/admin/admin-shell.tsx') ? read('components/admin/admin-shell.tsx') : ''
const env = read('.env.example')
const evidence = read('lib/qa/launch-evidence.ts')

require(pkg.version.startsWith('3.0.'), 'package version must remain in the 3.0 release line')
require(pkg.scripts['abuse:readiness'] === 'node scripts/abuse-prevention-readiness-local.mjs', 'abuse:readiness script missing')
require(pkg.scripts['phase73:audit'] === 'node scripts/phase73-abuse-prevention-audit.mjs', 'phase73:audit script missing')
require((pkg.scripts['quality:release'] || '').includes('phase73:audit'), 'quality:release must include phase73 audit')
require(exists('lib/abuse/prevention-readiness.ts'), 'abuse prevention readiness helper missing')
for (const token of ['getAbusePreventionReadinessReport', 'ABUSE_RISK_ROUTE_TARGETS', 'ABUSE_PROTECTION_MODE', 'ABUSE_RATE_LIMIT_REVIEWED', 'ABUSE_SECRET_REDACTION_REVIEWED', 'ABUSE_AI_PROMPT_REVIEWED']) {
  require(helper.includes(token), `helper missing ${token}`)
}
require(exists('app/admin/abuse-prevention/page.tsx'), 'admin abuse prevention page missing')
require(adminPage.includes('Abuse prevention readiness') && adminPage.includes('/api/admin/abuse-prevention-readiness') && adminPage.includes('Phase 73'), 'admin page must show title, API and phase badge')
require(exists('app/api/admin/abuse-prevention-readiness/route.ts'), 'abuse prevention admin API missing')
require(adminApi.includes('requireAdmin') && adminApi.includes('getAbusePreventionReadinessReport'), 'admin API must require admin and return abuse prevention readiness report')
require(exists('scripts/abuse-prevention-readiness-local.mjs'), 'abuse prevention local evidence script missing')
require(localScript.includes('abuse-prevention-controls.csv') && localScript.includes('abuse-prevention-routes.csv') && localScript.includes('abuse-prevention-risk-signals.csv'), 'local evidence script must write controls, routes and risk signals CSV files')
require(adminShell.includes('/admin/abuse-prevention'), 'admin shell must link abuse prevention readiness')
for (const key of ['ABUSE_PREVENTION_OWNER', 'ABUSE_PROTECTION_MODE', 'ABUSE_RISK_ROUTE_TARGETS', 'ABUSE_RATE_LIMIT_REVIEWED', 'ABUSE_SIGNUP_GUARD_REVIEWED', 'ABUSE_SECRET_REDACTION_REVIEWED', 'ABUSE_PAYMENT_FRAUD_REVIEWED', 'ABUSE_FILE_UPLOAD_REVIEWED', 'ABUSE_AI_PROMPT_REVIEWED', 'ABUSE_REPORTING_REVIEWED', 'ABUSE_EVIDENCE_DIR']) {
  require(env.includes(`${key}=`), `.env.example missing ${key}`)
}
require(evidence.includes('Abuse Prevention Readiness'), 'launch evidence gate missing Abuse Prevention Readiness')
require(exists('PHASE_73_ABUSE_PREVENTION_READINESS.md'), 'Phase 73 notes missing')

console.log('\nHaqSathi Phase 73 abuse prevention readiness audit')
console.log('Checks: 17')
console.log(`Issues found: ${issues.length}`)
if (issues.length) {
  for (const issue of issues) console.error('❌ ' + issue)
  process.exit(1)
}
console.log('✅ Phase 73 audit passed: abuse prevention helper, admin page, API, envs, evidence script and launch gate are installed.\n')
