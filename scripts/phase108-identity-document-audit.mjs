import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const issues = []
const read = (rel) => readFileSync(join(root, rel), 'utf8')
const exists = (rel) => existsSync(join(root, rel))
const requireCheck = (condition, message) => { if (!condition) issues.push(message) }

const pkg = JSON.parse(read('package.json'))
const helper = read('lib/productivity/identity-document-correction-planner.ts')
const form = read('components/forms/identity-document-correction-planner-form.tsx')
const page = read('app/tools/identity-document-correction-planner/page.tsx')
const readiness = read('lib/productivity/identity-document-readiness.ts')
const adminPage = read('app/admin/identity-document-readiness/page.tsx')
const adminApi = read('app/api/admin/identity-document-readiness/route.ts')
const localScript = read('scripts/identity-document-readiness-local.mjs')
const catalog = read('lib/tools/catalog.ts')
const sitemap = read('app/sitemap.ts')
const adminShell = read('components/admin/admin-shell.tsx')
const env = read('.env.example')
const launchEvidence = read('lib/qa/launch-evidence.ts')
const phase107 = read('scripts/phase107-vehicle-challan-audit.mjs')

requireCheck(['3.0.78-identity-document-correction-planner', '3.0.79-lost-document-report-planner', '3.0.80-smooth-motion-ui', '3.0.81-motion-reveal-polish', '3.0.82-motion-loading-interactions', '3.0.83-premium-motion-spotlight', '3.0.84-final-stabilization'].includes(pkg.version), 'package version must be 3.0.78 or 3.0.79')
requireCheck(pkg.scripts['identity-document:readiness'] === 'node scripts/identity-document-readiness-local.mjs', 'identity-document:readiness script missing')
requireCheck(pkg.scripts['phase108:audit'] === 'node scripts/phase108-identity-document-audit.mjs', 'phase108:audit script missing')
requireCheck((pkg.scripts['quality:release'] || '').includes('phase108:audit'), 'quality:release must include phase108 audit')
for (const file of [
  'lib/productivity/identity-document-correction-planner.ts',
  'components/forms/identity-document-correction-planner-form.tsx',
  'app/tools/identity-document-correction-planner/page.tsx',
  'lib/productivity/identity-document-readiness.ts',
  'app/admin/identity-document-readiness/page.tsx',
  'app/api/admin/identity-document-readiness/route.ts',
  'scripts/identity-document-readiness-local.mjs'
]) requireCheck(exists(file), `${file} missing`)
for (const token of ['identityDocumentTypes', 'identityCorrectionTypes', 'buildIdentityDocumentCorrectionPlan', 'proofChecklist', 'safetyWarnings', 'copyReadyMessage', 'urgencyScore']) {
  requireCheck(helper.includes(token), `identity document helper missing ${token}`)
}
for (const token of ['IdentityDocumentCorrectionPlannerForm', 'Copy message', 'Safety warnings', 'buildIdentityDocumentCorrectionPlan']) {
  requireCheck(form.includes(token), `identity document form missing ${token}`)
}
requireCheck(page.includes('Identity document correction planner') && page.includes('IdentityDocumentCorrectionPlannerForm') && page.includes('Safety note'), 'tool page must include title, form and safety note')
for (const token of ['getIdentityDocumentReadinessReport', 'identityDocumentReadinessLanes', 'IDENTITY_DOCUMENT_PLANNER_MODE', 'IDENTITY_DOCUMENT_COPY_REVIEWED', 'IDENTITY_DOCUMENT_OFFICIAL_ROUTE_REVIEWED']) {
  requireCheck(readiness.includes(token), `identity document readiness helper missing ${token}`)
}
requireCheck(adminPage.includes('Identity document correction readiness') && adminPage.includes('Phase 108') && adminPage.includes('/api/admin/identity-document-readiness'), 'admin page must show title, phase and API')
requireCheck(adminApi.includes('requireAdmin') && adminApi.includes('getIdentityDocumentReadinessReport'), 'admin API must require admin and return report')
for (const token of ['identity-document-readiness.json', 'identity-document-controls.csv', 'identity-document-lanes.csv', 'identity-document-proof-checklist.md', 'sample-identity-correction-message.md']) {
  requireCheck(localScript.includes(token), `local script missing ${token}`)
}
requireCheck(catalog.includes('/tools/identity-document-correction-planner') && catalog.includes('Identity Document Correction Planner'), 'tools catalog missing identity document planner')
requireCheck(catalog.includes('Daily Life'), 'tools catalog must include Daily Life category used by transport tools')
requireCheck(sitemap.includes('/tools/identity-document-correction-planner'), 'sitemap missing identity document planner')
requireCheck(adminShell.includes('/admin/identity-document-readiness'), 'admin shell missing identity document readiness link')
for (const key of ['IDENTITY_DOCUMENT_PLANNER_MODE', 'IDENTITY_DOCUMENT_OWNER', 'IDENTITY_DOCUMENT_COPY_REVIEWED', 'IDENTITY_DOCUMENT_OFFICIAL_ROUTE_REVIEWED', 'IDENTITY_DOCUMENT_SAFETY_REVIEWED', 'IDENTITY_DOCUMENT_MOBILE_QA_REVIEWED', 'IDENTITY_DOCUMENT_EVIDENCE_DIR']) {
  requireCheck(env.includes(key), `.env.example missing ${key}`)
}
requireCheck(launchEvidence.includes('Identity Document Correction Planner Readiness') && launchEvidence.includes('npm run identity-document:readiness'), 'launch evidence gate missing identity document readiness')
requireCheck(phase107.includes('3.0.78-identity-document-correction-planner'), 'phase107 audit must accept v3.0.78')

console.log('\nPhase 108 identity document correction planner audit')
console.log(`Issues found: ${issues.length}`)
if (issues.length) {
  for (const issue of issues) console.error('❌ ' + issue)
  process.exit(1)
}
console.log('✅ Phase 108 identity document correction readiness checks passed.\n')
