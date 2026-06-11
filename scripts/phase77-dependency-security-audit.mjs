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

const helper = exists('lib/security/dependency-readiness.ts') ? read('lib/security/dependency-readiness.ts') : ''
const adminPage = exists('app/admin/dependency-readiness/page.tsx') ? read('app/admin/dependency-readiness/page.tsx') : ''
const adminApi = exists('app/api/admin/dependency-readiness/route.ts') ? read('app/api/admin/dependency-readiness/route.ts') : ''
const localScript = exists('scripts/dependency-readiness-local.mjs') ? read('scripts/dependency-readiness-local.mjs') : ''
const adminShell = exists('components/admin/admin-shell.tsx') ? read('components/admin/admin-shell.tsx') : ''
const env = read('.env.example')
const evidence = read('lib/qa/launch-evidence.ts')

require(pkg.version === '3.0.47-dependency-security-readiness' || /^3\.0\.(4[8-9]|[5-9][0-9])-/.test(pkg.version), 'package version must be 3.0.47 dependency security or newer release')
require(pkg.scripts['dependency:readiness'] === 'node scripts/dependency-readiness-local.mjs', 'dependency:readiness script missing')
require(pkg.scripts['phase77:audit'] === 'node scripts/phase77-dependency-security-audit.mjs', 'phase77:audit script missing')
require((pkg.scripts['quality:release'] || '').includes('phase77:audit'), 'quality:release must include phase77 audit')
require(exists('lib/security/dependency-readiness.ts'), 'dependency readiness helper missing')
for (const token of ['getDependencyReadinessReport', 'DEPENDENCY_SECURITY_OWNER', 'DEPENDENCY_POLICY_MODE', 'DEPENDENCY_AUDIT_REVIEWED', 'DEPENDENCY_LICENSE_REVIEWED', 'DEPENDENCY_CI_INSTALL_REVIEWED']) {
  require(helper.includes(token), `helper missing ${token}`)
}
for (const lane of ['runtime-framework', 'database-auth', 'license-compliance', 'supply-chain']) {
  require(helper.includes(lane), `risk lane missing ${lane}`)
}
require(exists('app/admin/dependency-readiness/page.tsx'), 'admin dependency readiness page missing')
require(adminPage.includes('Dependency security readiness') && adminPage.includes('/api/admin/dependency-readiness') && adminPage.includes('Phase 77'), 'admin page must show title, API and phase badge')
require(exists('app/api/admin/dependency-readiness/route.ts'), 'dependency readiness API route missing')
require(adminApi.includes('requireAdmin') && adminApi.includes('getDependencyReadinessReport'), 'admin API must require admin and return report')
require(exists('scripts/dependency-readiness-local.mjs'), 'dependency readiness local evidence script missing')
for (const token of ['dependency-readiness.json', 'dependency-controls.csv', 'dependency-risk-lanes.csv', 'dependency-inventory.csv', 'package-lock.json']) {
  require(localScript.includes(token), `local script missing ${token}`)
}
require(adminShell.includes('/admin/dependency-readiness'), 'admin shell must link dependency readiness page')
for (const key of ['DEPENDENCY_SECURITY_OWNER', 'DEPENDENCY_POLICY_MODE', 'DEPENDENCY_LOCKFILE_REVIEWED', 'DEPENDENCY_AUDIT_REVIEWED', 'DEPENDENCY_HIGH_CRITICAL_GATE_REVIEWED', 'DEPENDENCY_LICENSE_REVIEWED', 'DEPENDENCY_UPDATE_CADENCE_REVIEWED', 'DEPENDENCY_OVERRIDES_REVIEWED', 'DEPENDENCY_CI_INSTALL_REVIEWED', 'DEPENDENCY_EVIDENCE_DIR']) {
  require(env.includes(key), `.env.example missing ${key}`)
}
require(evidence.includes('Dependency Security Readiness') && evidence.includes('npm run dependency:readiness'), 'launch evidence gate missing dependency security readiness')

console.log('\nPhase 77 dependency security readiness audit')
console.log(`Issues found: ${issues.length}`)
if (issues.length) {
  for (const issue of issues) console.error('❌ ' + issue)
  process.exit(1)
}
console.log('✅ Phase 77 dependency security readiness checks passed.\n')
