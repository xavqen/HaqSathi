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

const helper = exists('lib/support/triage-readiness.ts') ? read('lib/support/triage-readiness.ts') : ''
const adminPage = exists('app/admin/support-triage/page.tsx') ? read('app/admin/support-triage/page.tsx') : ''
const apiRoute = exists('app/api/admin/support-triage-readiness/route.ts') ? read('app/api/admin/support-triage-readiness/route.ts') : ''
const adminShell = exists('components/admin/admin-shell.tsx') ? read('components/admin/admin-shell.tsx') : ''
const env = read('.env.example')
const evidence = read('lib/qa/launch-evidence.ts')

require(/3\.0\.(2[2-9]|[3-9][0-9])/.test(pkg.version), 'package version must be v3.0.22+')
require(pkg.scripts['support:readiness'] === 'node scripts/support-triage-readiness-local.mjs', 'support:readiness script missing')
require(pkg.scripts['phase52:audit'] === 'node scripts/phase52-support-triage-audit.mjs', 'phase52:audit script missing')
require((pkg.scripts['quality:release'] || '').includes('phase52:audit'), 'quality:release must include phase52 audit')
require(exists('lib/support/triage-readiness.ts'), 'support triage helper missing')
for (const token of ['getSupportTriageReport', 'getSupportTriageControls', 'Live chat widget provider', 'SUPPORT_CHAT_MODE', 'SUPPORT_PRIVACY_SAFE_MODE']) {
  require(helper.includes(token), `support triage helper missing ${token}`)
}
require(exists('app/admin/support-triage/page.tsx'), 'admin support triage page missing')
require(adminPage.includes('npm run support:readiness') && adminPage.includes('/api/admin/support-triage-readiness') && adminPage.includes('Minimum launch evidence'), 'admin support triage page must show command, API path and evidence')
require(exists('app/api/admin/support-triage-readiness/route.ts'), 'support triage admin API missing')
require(apiRoute.includes('requireAdmin') && apiRoute.includes('getSupportTriageReport'), 'support triage API must require admin and return report')
require(adminShell.includes('/admin/support-triage'), 'admin shell must link support triage page')
for (const key of ['SUPPORT_CHAT_MODE', 'SUPPORT_AGENT_OWNER', 'SUPPORT_SLA_HOURS', 'SUPPORT_ESCALATION_EMAIL', 'SUPPORT_WEBHOOK_URL', 'LIVE_CHAT_PROVIDER', 'LIVE_CHAT_WIDGET_URL', 'SUPPORT_MACRO_REVIEW_REQUIRED', 'SUPPORT_PRIVACY_SAFE_MODE', 'SUPPORT_TRIAGE_EVIDENCE_DIR']) {
  require(env.includes(`${key}=`), `.env.example missing ${key}`)
}
require(evidence.includes('Support Triage Readiness'), 'launch evidence gate missing support triage readiness')
require(exists('scripts/support-triage-readiness-local.mjs'), 'support triage local evidence script missing')
require(exists('PHASE_52_SUPPORT_TRIAGE.md'), 'Phase 52 notes missing')

console.log('\nHaqSathi Phase 52 support triage audit')
console.log('Checks: 15')
console.log(`Issues found: ${issues.length}`)
if (issues.length) {
  for (const issue of issues) console.error('❌ ' + issue)
  process.exit(1)
}
console.log('✅ Phase 52 audit passed: support triage helper, admin page, API, evidence script, envs and launch gate are installed.\n')
