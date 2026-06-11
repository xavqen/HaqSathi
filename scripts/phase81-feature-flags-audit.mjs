import { existsSync, readFileSync } from 'node:fs'

const issues = []
const requireCheck = (condition, message) => { if (!condition) issues.push(message) }
const exists = (path) => existsSync(path)
const read = (path) => exists(path) ? readFileSync(path, 'utf8') : ''

const pkg = JSON.parse(read('package.json'))
const helper = read('lib/operations/feature-flags-readiness.ts')
const adminPage = read('app/admin/feature-flags-readiness/page.tsx')
const adminApi = read('app/api/admin/feature-flags-readiness/route.ts')
const localScript = read('scripts/feature-flags-readiness-local.mjs')
const adminShell = read('components/admin/admin-shell.tsx')
const env = read('.env.example')
const evidence = read('lib/qa/launch-evidence.ts')
const previousAudit = read('scripts/phase80-secrets-readiness-audit.mjs')

requireCheck(pkg.version === '3.0.51-feature-flags-readiness' || /^3\.0\.(5[2-9]|[6-9][0-9])-/.test(pkg.version), 'package version must be 3.0.51-feature-flags-readiness or newer release')
requireCheck(pkg.scripts['feature-flags:readiness'] === 'node scripts/feature-flags-readiness-local.mjs', 'feature-flags:readiness script missing')
requireCheck(pkg.scripts['phase81:audit'] === 'node scripts/phase81-feature-flags-audit.mjs', 'phase81:audit script missing')
requireCheck((pkg.scripts['quality:release'] || '').includes('phase81:audit'), 'quality:release must include phase81 audit')
requireCheck(exists('lib/operations/feature-flags-readiness.ts'), 'feature flags readiness helper missing')
for (const token of ['getFeatureFlagsReadinessReport', 'FEATURE_FLAG_OWNER', 'FEATURE_FLAG_MODE', 'FEATURE_FLAG_P0_DEFAULT_OFF_REVIEWED', 'FEATURE_FLAG_ROLLBACK_DRILL_REVIEWED', 'FEATURE_FLAG_AUDIT_REVIEWED']) {
  requireCheck(helper.includes(token), `helper missing ${token}`)
}
for (const lane of ['ai-tools-kill-switch', 'payment-kill-switch', 'vault-upload-kill-switch', 'notification-kill-switch', 'growth-feature-kill-switch', 'cron-background-kill-switch', 'admin-write-kill-switch', 'mobile-pwa-kill-switch']) {
  requireCheck(helper.includes(lane), `feature flag lane missing ${lane}`)
}
requireCheck(exists('app/admin/feature-flags-readiness/page.tsx'), 'admin feature flags readiness page missing')
requireCheck(adminPage.includes('Feature flags &amp; kill switch readiness') && adminPage.includes('/api/admin/feature-flags-readiness') && adminPage.includes('Phase 81'), 'admin page must show title, API and phase badge')
requireCheck(exists('app/api/admin/feature-flags-readiness/route.ts'), 'feature flags readiness API route missing')
requireCheck(adminApi.includes('requireAdmin') && adminApi.includes('getFeatureFlagsReadinessReport'), 'admin API must require admin and return report')
requireCheck(exists('scripts/feature-flags-readiness-local.mjs'), 'feature flags readiness local evidence script missing')
for (const token of ['feature-flags-readiness.json', 'feature-flag-controls.csv', 'kill-switch-matrix.csv', 'feature-flags-checklist.md', 'feature-rollback-runbook.md']) {
  requireCheck(localScript.includes(token), `local script missing ${token}`)
}
requireCheck(adminShell.includes('/admin/feature-flags-readiness'), 'admin shell must link feature flags readiness page')
for (const key of ['FEATURE_FLAG_OWNER', 'FEATURE_FLAG_MODE', 'FEATURE_FLAG_P0_DEFAULT_OFF_REVIEWED', 'FEATURE_FLAG_ROLLBACK_DRILL_REVIEWED', 'FEATURE_FLAG_AUDIT_REVIEWED', 'FEATURE_FLAG_PAYMENT_KILL_SWITCH_REVIEWED', 'FEATURE_FLAG_AI_KILL_SWITCH_REVIEWED', 'FEATURE_FLAG_VAULT_KILL_SWITCH_REVIEWED', 'FEATURE_FLAG_NOTIFICATION_KILL_SWITCH_REVIEWED', 'FEATURE_FLAG_ADMIN_FREEZE_REVIEWED', 'FEATURE_FLAG_EVIDENCE_DIR']) {
  requireCheck(env.includes(key), `.env.example missing ${key}`)
}
requireCheck(evidence.includes('Feature Flags Kill Switch Readiness') && evidence.includes('npm run feature-flags:readiness'), 'launch evidence gate missing feature flags readiness')
requireCheck(previousAudit.includes('3.0.50') && previousAudit.includes('newer release'), 'phase80 audit must accept newer releases')

console.log('\nPhase 81 feature flags readiness audit')
console.log(`Issues found: ${issues.length}`)
if (issues.length) {
  for (const issue of issues) console.error('❌ ' + issue)
  process.exit(1)
}
console.log('✅ Phase 81 feature flags readiness checks passed.\n')
