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

const helper = exists('lib/security/account-security.ts') ? read('lib/security/account-security.ts') : ''
const adminPage = exists('app/admin/account-security/page.tsx') ? read('app/admin/account-security/page.tsx') : ''
const apiRoute = exists('app/api/admin/account-security-readiness/route.ts') ? read('app/api/admin/account-security-readiness/route.ts') : ''
const dashboardSecurity = exists('app/dashboard/security/page.tsx') ? read('app/dashboard/security/page.tsx') : ''
const adminShell = exists('components/admin/admin-shell.tsx') ? read('components/admin/admin-shell.tsx') : ''
const env = read('.env.example')
const evidence = read('lib/qa/launch-evidence.ts')

require(/3\.0\.(19|[2-9][0-9])/.test(pkg.version), 'package version must be v3.0.19+')
require(pkg.scripts['account-security:readiness'] === 'node scripts/account-security-readiness-local.mjs', 'account-security:readiness script missing')
require(pkg.scripts['phase49:audit'] === 'node scripts/phase49-account-security-audit.mjs', 'phase49:audit script missing')
require((pkg.scripts['quality:release'] || '').includes('phase49:audit'), 'quality:release must include phase49 audit')
require(exists('lib/security/account-security.ts'), 'account security helper missing')
for (const token of ['getAccountSecurityReadinessReport', 'PASSKEYS_ENABLED', 'TWO_FACTOR_ENFORCEMENT', 'BACKUP_CODES_ENABLED', 'minimumEvidence']) {
  require(helper.includes(token), `account security helper missing ${token}`)
}
require(exists('app/admin/account-security/page.tsx'), 'admin account security page missing')
require(adminPage.includes('npm run account-security:readiness') && adminPage.includes('/api/admin/account-security-readiness') && adminPage.includes('Minimum launch evidence'), 'admin account security page must show commands, API path and evidence')
require(exists('app/api/admin/account-security-readiness/route.ts'), 'account security admin API missing')
require(apiRoute.includes('requireAdmin') && apiRoute.includes('getAccountSecurityReadinessReport'), 'account security API must require admin and return report')
require(dashboardSecurity.includes('2FA') && dashboardSecurity.includes('Passkeys') && dashboardSecurity.includes('Backup codes'), 'dashboard security page must show account security readiness cards')
require(adminShell.includes('/admin/account-security'), 'admin shell must link account security page')
for (const key of ['ACCOUNT_SECURITY_MODE', 'TWO_FACTOR_ENFORCEMENT', 'PASSKEYS_ENABLED', 'PASSKEY_RP_ID', 'BACKUP_CODES_ENABLED', 'SESSION_REVIEW_ENABLED', 'ACCOUNT_SECURITY_ALERT_EMAIL', 'ACCOUNT_SECURITY_EVIDENCE_DIR']) {
  require(env.includes(`${key}=`), `.env.example missing ${key}`)
}
require(evidence.includes('2FA + Passkey Readiness'), 'launch evidence gate missing account security readiness')
require(exists('scripts/account-security-readiness-local.mjs'), 'account security local evidence script missing')
require(exists('PHASE_49_ACCOUNT_SECURITY.md'), 'Phase 49 notes missing')

console.log('\nHaqSathi Phase 49 account security audit')
console.log('Checks: 18')
console.log(`Issues found: ${issues.length}`)
if (issues.length) {
  for (const issue of issues) console.error('❌ ' + issue)
  process.exit(1)
}
console.log('✅ Phase 49 audit passed: account security helper, admin page, API, dashboard cards, envs, evidence script and launch gate are installed.\n')
