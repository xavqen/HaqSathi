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

const helper = exists('lib/legal/compliance-readiness.ts') ? read('lib/legal/compliance-readiness.ts') : ''
const adminPage = exists('app/admin/legal-compliance-readiness/page.tsx') ? read('app/admin/legal-compliance-readiness/page.tsx') : ''
const adminApi = exists('app/api/admin/legal-compliance-readiness/route.ts') ? read('app/api/admin/legal-compliance-readiness/route.ts') : ''
const localScript = exists('scripts/legal-compliance-readiness-local.mjs') ? read('scripts/legal-compliance-readiness-local.mjs') : ''
const adminShell = exists('components/admin/admin-shell.tsx') ? read('components/admin/admin-shell.tsx') : ''
const env = read('.env.example')
const evidence = read('lib/qa/launch-evidence.ts')

require(pkg.version.startsWith('3.0.'), 'package version must remain in the 3.0 release line')
require(pkg.scripts['legal:readiness'] === 'node scripts/legal-compliance-readiness-local.mjs', 'legal:readiness script missing')
require(pkg.scripts['phase72:audit'] === 'node scripts/phase72-legal-compliance-audit.mjs', 'phase72:audit script missing')
require((pkg.scripts['quality:release'] || '').includes('phase72:audit'), 'quality:release must include phase72 audit')
require(exists('lib/legal/compliance-readiness.ts'), 'legal compliance readiness helper missing')
for (const token of ['getLegalComplianceReadinessReport', 'LEGAL_COMPLIANCE_ROUTE_TARGETS', 'LEGAL_GUIDANCE_DISCLAIMER_REVIEWED', 'LEGAL_PRIVACY_POLICY_REVIEWED', 'LEGAL_TERMS_REVIEWED', 'LEGAL_DPDP_REVIEWED']) {
  require(helper.includes(token), `helper missing ${token}`)
}
require(exists('app/admin/legal-compliance-readiness/page.tsx'), 'admin legal compliance readiness page missing')
require(adminPage.includes('Legal compliance readiness') && adminPage.includes('/api/admin/legal-compliance-readiness') && adminPage.includes('Phase 72'), 'admin page must show title, API and phase badge')
require(exists('app/api/admin/legal-compliance-readiness/route.ts'), 'legal compliance readiness admin API missing')
require(adminApi.includes('requireAdmin') && adminApi.includes('getLegalComplianceReadinessReport'), 'admin API must require admin and return legal compliance readiness report')
require(exists('scripts/legal-compliance-readiness-local.mjs'), 'legal compliance readiness local evidence script missing')
require(localScript.includes('legal-compliance-controls.csv') && localScript.includes('legal-compliance-pages.csv') && localScript.includes('legal-compliance-copy-risks.csv'), 'local evidence script must write controls, pages and copy risks CSV files')
require(adminShell.includes('/admin/legal-compliance-readiness'), 'admin shell must link legal compliance readiness')
for (const key of ['LEGAL_COMPLIANCE_OWNER', 'LEGAL_COMPLIANCE_ROUTE_TARGETS', 'LEGAL_COMPLIANCE_EVIDENCE_DIR', 'LEGAL_GUIDANCE_DISCLAIMER_REVIEWED', 'LEGAL_PRIVACY_POLICY_REVIEWED', 'LEGAL_TERMS_REVIEWED', 'LEGAL_DPDP_REVIEWED', 'LEGAL_ADS_AFFILIATE_REVIEWED', 'LEGAL_MINOR_SAFETY_REVIEWED']) {
  require(env.includes(`${key}=`), `.env.example missing ${key}`)
}
require(evidence.includes('Legal Compliance Readiness'), 'launch evidence gate missing Legal Compliance Readiness')
require(exists('PHASE_72_LEGAL_COMPLIANCE_READINESS.md'), 'Phase 72 notes missing')

console.log('\nHaqSathi Phase 72 legal compliance readiness audit')
console.log('Checks: 17')
console.log(`Issues found: ${issues.length}`)
if (issues.length) {
  for (const issue of issues) console.error('❌ ' + issue)
  process.exit(1)
}
console.log('✅ Phase 72 audit passed: legal compliance helper, admin page, API, envs, evidence script and launch gate are installed.\n')
