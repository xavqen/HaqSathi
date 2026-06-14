import { existsSync, readFileSync } from 'node:fs'

const issues = []
const requireCheck = (condition, message) => { if (!condition) issues.push(message) }
const exists = (path) => existsSync(path)
const read = (path) => exists(path) ? readFileSync(path, 'utf8') : ''

const pkg = JSON.parse(read('package.json'))
const helper = read('lib/operations/release-governance-readiness.ts')
const adminPage = read('app/admin/release-governance/page.tsx')
const adminApi = read('app/api/admin/release-governance-readiness/route.ts')
const localScript = read('scripts/release-governance-readiness-local.mjs')
const adminShell = read('components/admin/admin-shell.tsx')
const env = read('.env.example')
const evidence = read('lib/qa/launch-evidence.ts')
const previousAudit = read('scripts/phase81-feature-flags-audit.mjs')

requireCheck(String(pkg.version || '').startsWith('3.0.'), 'package version must be a 3.0.x compatible release')
requireCheck(pkg.scripts['release-governance:readiness'] === 'node scripts/release-governance-readiness-local.mjs', 'release-governance:readiness script missing')
requireCheck(pkg.scripts['phase82:audit'] === 'node scripts/phase82-release-governance-audit.mjs', 'phase82:audit script missing')
requireCheck((pkg.scripts['quality:release'] || '').includes('phase82:audit'), 'quality:release must include phase82 audit')
requireCheck(exists('lib/operations/release-governance-readiness.ts'), 'release governance readiness helper missing')
for (const token of ['getReleaseGovernanceReadinessReport', 'RELEASE_OWNER', 'RELEASE_GOVERNANCE_MODE', 'RELEASE_NOTES_REVIEWED', 'RELEASE_ROLLBACK_TARGET_REVIEWED', 'RELEASE_QUALITY_COMMAND_REVIEWED']) {
  requireCheck(helper.includes(token), `helper missing ${token}`)
}
for (const lane of ['version-source-of-truth', 'changelog-release-notes', 'deployment-tagging', 'rollback-evidence', 'release-signoff', 'post-release-watch']) {
  requireCheck(helper.includes(lane), `release governance lane missing ${lane}`)
}
requireCheck(exists('app/admin/release-governance/page.tsx'), 'admin release governance page missing')
requireCheck(adminPage.includes('Release governance &amp; rollback readiness') && adminPage.includes('/api/admin/release-governance-readiness') && adminPage.includes('Phase 82'), 'admin page must show title, API and phase badge')
requireCheck(exists('app/api/admin/release-governance-readiness/route.ts'), 'release governance readiness API route missing')
requireCheck(adminApi.includes('requireAdmin') && adminApi.includes('getReleaseGovernanceReadinessReport'), 'admin API must require admin and return report')
requireCheck(exists('scripts/release-governance-readiness-local.mjs'), 'release governance local evidence script missing')
for (const token of ['release-governance-readiness.json', 'release-controls.csv', 'release-lanes.csv', 'release-notes-template.md', 'rollback-checklist.md', 'post-release-watch.md']) {
  requireCheck(localScript.includes(token), `local script missing ${token}`)
}
requireCheck(adminShell.includes('/admin/release-governance'), 'admin shell must link release governance page')
for (const key of ['RELEASE_OWNER', 'RELEASE_GOVERNANCE_MODE', 'RELEASE_NOTES_REVIEWED', 'RELEASE_ROLLBACK_TARGET_REVIEWED', 'RELEASE_DEPLOYMENT_TAG', 'RELEASE_QUALITY_COMMAND_REVIEWED', 'RELEASE_POST_RELEASE_WATCH_REVIEWED', 'RELEASE_GOVERNANCE_EVIDENCE_DIR']) {
  requireCheck(env.includes(key), `.env.example missing ${key}`)
}
requireCheck(evidence.includes('Release Governance Readiness') && evidence.includes('npm run release-governance:readiness'), 'launch evidence gate missing release governance readiness')
requireCheck(previousAudit.includes('3.0.51') && previousAudit.includes('newer release'), 'phase81 audit must accept newer releases')

console.log('\nPhase 82 release governance readiness audit')
console.log(`Issues found: ${issues.length}`)
if (issues.length) {
  for (const issue of issues) console.error('❌ ' + issue)
  process.exit(1)
}
console.log('✅ Phase 82 release governance readiness checks passed.\n')
