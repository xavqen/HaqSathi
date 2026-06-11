import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const issues = []
const read = (rel) => readFileSync(join(root, rel), 'utf8')
const exists = (rel) => existsSync(join(root, rel))
const requireCheck = (condition, message) => { if (!condition) issues.push(message) }

const pkg = JSON.parse(read('package.json'))
const helper = read('lib/productivity/lost-document-report-planner.ts')
const form = read('components/forms/lost-document-report-planner-form.tsx')
const page = read('app/tools/lost-document-report-planner/page.tsx')
const readiness = read('lib/productivity/lost-document-readiness.ts')
const adminPage = read('app/admin/lost-document-readiness/page.tsx')
const adminApi = read('app/api/admin/lost-document-readiness/route.ts')
const localScript = read('scripts/lost-document-readiness-local.mjs')
const catalog = read('lib/tools/catalog.ts')
const sitemap = read('app/sitemap.ts')
const adminShell = read('components/admin/admin-shell.tsx')
const env = read('.env.example')
const launchEvidence = read('lib/qa/launch-evidence.ts')
const phase108 = read('scripts/phase108-identity-document-audit.mjs')

requireCheck(['3.0.79-lost-document-report-planner', '3.0.80-smooth-motion-ui', '3.0.81-motion-reveal-polish', '3.0.82-motion-loading-interactions', '3.0.83-premium-motion-spotlight', '3.0.84-final-stabilization'].includes(pkg.version), 'package version must be 3.0.79-lost-document-report-planner')
requireCheck(pkg.scripts['lost-document:readiness'] === 'node scripts/lost-document-readiness-local.mjs', 'lost-document:readiness script missing')
requireCheck(pkg.scripts['phase109:audit'] === 'node scripts/phase109-lost-document-audit.mjs', 'phase109:audit script missing')
requireCheck((pkg.scripts['quality:release'] || '').includes('phase109:audit'), 'quality:release must include phase109 audit')
for (const file of [
  'lib/productivity/lost-document-report-planner.ts',
  'components/forms/lost-document-report-planner-form.tsx',
  'app/tools/lost-document-report-planner/page.tsx',
  'lib/productivity/lost-document-readiness.ts',
  'app/admin/lost-document-readiness/page.tsx',
  'app/api/admin/lost-document-readiness/route.ts',
  'scripts/lost-document-readiness-local.mjs'
]) requireCheck(exists(file), `${file} missing`)
for (const token of ['lostDocumentTypes', 'lostDocumentIssueTypes', 'buildLostDocumentReportPlan', 'proofChecklist', 'safetyWarnings', 'copyReadyMessage', 'urgencyScore']) {
  requireCheck(helper.includes(token), `lost document helper missing ${token}`)
}
for (const token of ['LostDocumentReportPlannerForm', 'Copy message', 'Safety warnings', 'buildLostDocumentReportPlan']) {
  requireCheck(form.includes(token), `lost document form missing ${token}`)
}
requireCheck(page.includes('Lost document report planner') && page.includes('LostDocumentReportPlannerForm') && page.includes('Safety note'), 'tool page must include title, form and safety note')
for (const token of ['getLostDocumentReadinessReport', 'lostDocumentReadinessLanes', 'LOST_DOCUMENT_PLANNER_MODE', 'LOST_DOCUMENT_COPY_REVIEWED', 'LOST_DOCUMENT_OFFICIAL_ROUTE_REVIEWED']) {
  requireCheck(readiness.includes(token), `lost document readiness helper missing ${token}`)
}
requireCheck(adminPage.includes('Lost document report readiness') && adminPage.includes('Phase 109') && adminPage.includes('/api/admin/lost-document-readiness'), 'admin page must show title, phase and API')
requireCheck(adminApi.includes('requireAdmin') && adminApi.includes('getLostDocumentReadinessReport'), 'admin API must require admin and return report')
for (const token of ['lost-document-readiness.json', 'lost-document-controls.csv', 'lost-document-lanes.csv', 'lost-document-proof-checklist.md', 'sample-lost-document-message.md']) {
  requireCheck(localScript.includes(token), `local script missing ${token}`)
}
requireCheck(catalog.includes('/tools/lost-document-report-planner') && catalog.includes('Lost Document Report Planner'), 'tools catalog missing lost document planner')
requireCheck(sitemap.includes('/tools/lost-document-report-planner'), 'sitemap missing lost document planner')
requireCheck(adminShell.includes('/admin/lost-document-readiness'), 'admin shell missing lost document readiness link')
for (const key of ['LOST_DOCUMENT_PLANNER_MODE', 'LOST_DOCUMENT_OWNER', 'LOST_DOCUMENT_COPY_REVIEWED', 'LOST_DOCUMENT_OFFICIAL_ROUTE_REVIEWED', 'LOST_DOCUMENT_IDENTITY_SAFETY_REVIEWED', 'LOST_DOCUMENT_MOBILE_QA_REVIEWED', 'LOST_DOCUMENT_EVIDENCE_DIR']) {
  requireCheck(env.includes(key), `.env.example missing ${key}`)
}
requireCheck(launchEvidence.includes('Lost Document Report Planner Readiness') && launchEvidence.includes('npm run lost-document:readiness'), 'launch evidence gate missing lost document readiness')
requireCheck(phase108.includes('3.0.79-lost-document-report-planner') && phase108.includes('3.0.80-smooth-motion-ui') && phase108.includes('3.0.81-motion-reveal-polish'), 'phase108 audit must accept v3.0.79, v3.0.80 and v3.0.81')

console.log('\nPhase 109 lost document report planner audit')
console.log(`Issues found: ${issues.length}`)
if (issues.length) {
  for (const issue of issues) console.error('❌ ' + issue)
  process.exit(1)
}
console.log('✅ Phase 109 lost document report readiness checks passed.\n')
