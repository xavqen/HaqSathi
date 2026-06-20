// compatibility bridge: 3.0.55-entitlement-readiness 3.0.56-invoice-tax-readiness newer release
import { existsSync, readFileSync } from 'node:fs'

const issues = []
const requireCheck = (condition, message) => { if (!condition) issues.push(message) }
const exists = (path) => existsSync(path)
const read = (path) => exists(path) ? readFileSync(path, 'utf8') : ''

const pkg = JSON.parse(read('package.json'))
const helper = read('lib/billing/entitlement-readiness.ts')
const adminPage = read('app/admin/entitlement-readiness/page.tsx')
const adminApi = read('app/api/admin/entitlement-readiness/route.ts')
const localScript = read('scripts/entitlement-readiness-local.mjs')
const adminShell = read('components/admin/admin-shell.tsx')
const env = read('.env.example')
const evidence = read('lib/qa/launch-evidence.ts')
// compatibility marker: 3.0.56 newer release
const previousAudit = read('scripts/phase84-onboarding-assistant-audit.mjs')

requireCheck(String(pkg.version || '').startsWith('3.0.'), 'package version must be a 3.0.x compatible release')
requireCheck(pkg.scripts['entitlement:readiness'] === 'node scripts/entitlement-readiness-local.mjs', 'entitlement:readiness script missing')
requireCheck(pkg.scripts['phase85:audit'] === 'node scripts/phase85-entitlement-readiness-audit.mjs', 'phase85:audit script missing')
requireCheck((pkg.scripts['quality:release'] || '').includes('phase85:audit'), 'quality:release must include phase85 audit')
requireCheck(exists('lib/billing/entitlement-readiness.ts'), 'entitlement readiness helper missing')
for (const token of ['getEntitlementReadinessReport', 'entitlementLanes', 'ENTITLEMENT_OWNER', 'ENTITLEMENT_ENFORCEMENT_MODE', 'ENTITLEMENT_QUOTA_RULES_REVIEWED', 'ENTITLEMENT_DOWNGRADE_FLOW_REVIEWED', 'ENTITLEMENT_WEBHOOK_SYNC_REVIEWED']) {
  requireCheck(helper.includes(token), `helper missing ${token}`)
}
for (const lane of ['free-ai-draft-limit', 'premium-unlimited-tools', 'family-shared-access', 'agent-business-access', 'admin-bypass-policy']) {
  requireCheck(helper.includes(lane), `entitlement lane missing ${lane}`)
}
requireCheck(exists('app/admin/entitlement-readiness/page.tsx'), 'admin entitlement readiness page missing')
requireCheck(adminPage.includes('Subscription entitlement readiness') && adminPage.includes('/api/admin/entitlement-readiness') && adminPage.includes('Phase 85'), 'admin page must show title, API and phase badge')
requireCheck(exists('app/api/admin/entitlement-readiness/route.ts'), 'entitlement readiness API route missing')
requireCheck(adminApi.includes('requireAdmin') && adminApi.includes('getEntitlementReadinessReport'), 'admin API must require admin and return report')
requireCheck(exists('scripts/entitlement-readiness-local.mjs'), 'entitlement readiness local evidence script missing')
for (const token of ['entitlement-readiness.json', 'entitlement-controls.csv', 'entitlement-lanes.csv', 'paywall-copy-review.md', 'downgrade-test-matrix.md', 'never-gate-routes.md']) {
  requireCheck(localScript.includes(token), `local script missing ${token}`)
}
requireCheck(adminShell.includes('/admin/entitlement-readiness'), 'admin shell must link entitlement readiness page')
for (const key of ['ENTITLEMENT_OWNER', 'ENTITLEMENT_ENFORCEMENT_MODE', 'ENTITLEMENT_QUOTA_RULES_REVIEWED', 'ENTITLEMENT_DOWNGRADE_FLOW_REVIEWED', 'ENTITLEMENT_WEBHOOK_SYNC_REVIEWED', 'ENTITLEMENT_PAYWALL_COPY_REVIEWED', 'ENTITLEMENT_ADMIN_BYPASS_REVIEWED', 'ENTITLEMENT_EVIDENCE_REVIEWED', 'ENTITLEMENT_EVIDENCE_DIR']) {
  requireCheck(env.includes(key), `.env.example missing ${key}`)
}
requireCheck(evidence.includes('Subscription Entitlement Readiness') && evidence.includes('npm run entitlement:readiness'), 'launch evidence gate missing subscription entitlement readiness')
requireCheck(previousAudit.includes('3.0.54') && previousAudit.includes('newer release'), 'phase84 audit must accept newer releases')

console.log('\nPhase 85 subscription entitlement readiness audit')
console.log(`Issues found: ${issues.length}`)
if (issues.length) {
  for (const issue of issues) console.error('❌ ' + issue)
  process.exit(1)
}
console.log('✅ Phase 85 subscription entitlement readiness checks passed.\n')
