import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const issues = []
const read = (rel) => readFileSync(join(root, rel), 'utf8')
const exists = (rel) => existsSync(join(root, rel))
const requireCheck = (condition, message) => { if (!condition) issues.push(message) }

const pkg = JSON.parse(read('package.json'))
const helper = read('lib/productivity/courier-parcel-dispute-planner.ts')
const form = read('components/forms/courier-parcel-dispute-planner-form.tsx')
const page = read('app/tools/courier-parcel-dispute-planner/page.tsx')
const readiness = read('lib/productivity/courier-parcel-readiness.ts')
const adminPage = read('app/admin/courier-parcel-readiness/page.tsx')
const adminApi = read('app/api/admin/courier-parcel-readiness/route.ts')
const localScript = read('scripts/courier-parcel-readiness-local.mjs')
const catalog = read('lib/tools/catalog.ts')
const sitemap = read('app/sitemap.ts')
const adminShell = read('components/admin/admin-shell.tsx')
const env = read('.env.example')
const launchEvidence = read('lib/qa/launch-evidence.ts')
const phase104 = read('scripts/phase104-telecom-sim-audit.mjs')

requireCheck(['3.0.75-courier-parcel-dispute-planner', '3.0.76-bank-account-freeze-planner', '3.0.77-vehicle-challan-dispute-planner', '3.0.78-identity-document-correction-planner', '3.0.79-lost-document-report-planner', '3.0.80-smooth-motion-ui', '3.0.81-motion-reveal-polish', '3.0.81-motion-reveal-polish', '3.0.82-motion-loading-interactions', '3.0.83-premium-motion-spotlight', '3.0.84-final-stabilization'].includes(pkg.version), 'package version must be 3.0.75 or 3.0.76')
requireCheck(pkg.scripts['courier-parcel:readiness'] === 'node scripts/courier-parcel-readiness-local.mjs', 'courier-parcel:readiness script missing')
requireCheck(pkg.scripts['phase105:audit'] === 'node scripts/phase105-courier-parcel-audit.mjs', 'phase105:audit script missing')
requireCheck((pkg.scripts['quality:release'] || '').includes('phase105:audit'), 'quality:release must include phase105 audit')
for (const file of [
  'lib/productivity/courier-parcel-dispute-planner.ts',
  'components/forms/courier-parcel-dispute-planner-form.tsx',
  'app/tools/courier-parcel-dispute-planner/page.tsx',
  'lib/productivity/courier-parcel-readiness.ts',
  'app/admin/courier-parcel-readiness/page.tsx',
  'app/api/admin/courier-parcel-readiness/route.ts',
  'scripts/courier-parcel-readiness-local.mjs'
]) requireCheck(exists(file), `${file} missing`)
for (const token of ['courierIssueTypes', 'buildCourierParcelDisputePlan', 'proofChecklist', 'safetyWarnings', 'copyReadyMessage', 'urgencyScore']) {
  requireCheck(helper.includes(token), `courier helper missing ${token}`)
}
for (const token of ['CourierParcelDisputePlannerForm', 'Copy message', 'Safety warnings', 'buildCourierParcelDisputePlan']) {
  requireCheck(form.includes(token), `courier form missing ${token}`)
}
requireCheck(page.includes('Courier parcel dispute planner') && page.includes('CourierParcelDisputePlannerForm') && page.includes('Safety note'), 'tool page must include title, form and safety note')
for (const token of ['getCourierParcelReadinessReport', 'courierParcelReadinessLanes', 'COURIER_PARCEL_PLANNER_MODE', 'COURIER_PARCEL_COPY_REVIEWED', 'COURIER_PARCEL_SCAM_ROUTE_REVIEWED']) {
  requireCheck(readiness.includes(token), `courier readiness helper missing ${token}`)
}
requireCheck(adminPage.includes('Courier parcel planner readiness') && adminPage.includes('Phase 105') && adminPage.includes('/api/admin/courier-parcel-readiness'), 'admin page must show title, phase and API')
requireCheck(adminApi.includes('requireAdmin') && adminApi.includes('getCourierParcelReadinessReport'), 'admin API must require admin and return report')
for (const token of ['courier-parcel-readiness.json', 'courier-parcel-controls.csv', 'courier-parcel-lanes.csv', 'courier-parcel-proof-checklist.md', 'sample-courier-message.md']) {
  requireCheck(localScript.includes(token), `local script missing ${token}`)
}
requireCheck(catalog.includes('/tools/courier-parcel-dispute-planner') && catalog.includes('Courier Parcel Dispute Planner'), 'tools catalog missing courier parcel planner')
requireCheck(sitemap.includes('/tools/courier-parcel-dispute-planner'), 'sitemap missing courier parcel planner')
requireCheck(adminShell.includes('/admin/courier-parcel-readiness'), 'admin shell missing courier parcel readiness link')
for (const key of ['COURIER_PARCEL_PLANNER_MODE', 'COURIER_PARCEL_OWNER', 'COURIER_PARCEL_COPY_REVIEWED', 'COURIER_PARCEL_PRIVACY_REVIEWED', 'COURIER_PARCEL_SCAM_ROUTE_REVIEWED', 'COURIER_PARCEL_MOBILE_QA_REVIEWED', 'COURIER_PARCEL_EVIDENCE_DIR']) {
  requireCheck(env.includes(key), `.env.example missing ${key}`)
}
requireCheck(launchEvidence.includes('Courier Parcel Dispute Planner Readiness') && launchEvidence.includes('npm run courier-parcel:readiness'), 'launch evidence gate missing courier parcel readiness')
requireCheck(phase104.includes('3.0.75-courier-parcel-dispute-planner'), 'phase104 audit must accept v3.0.75')

console.log('\nPhase 105 courier parcel dispute planner audit')
console.log(`Issues found: ${issues.length}`)
if (issues.length) {
  for (const issue of issues) console.error('❌ ' + issue)
  process.exit(1)
}
console.log('✅ Phase 105 courier parcel dispute readiness checks passed.\n')
