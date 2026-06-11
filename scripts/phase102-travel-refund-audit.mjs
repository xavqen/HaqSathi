import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const issues = []
const read = (rel) => readFileSync(join(root, rel), 'utf8')
const exists = (rel) => existsSync(join(root, rel))
const requireCheck = (condition, message) => { if (!condition) issues.push(message) }

const pkg = JSON.parse(read('package.json'))
const helper = read('lib/productivity/travel-refund-cancellation-planner.ts')
const form = read('components/forms/travel-refund-cancellation-planner-form.tsx')
const page = read('app/tools/travel-refund-cancellation-planner/page.tsx')
const readiness = read('lib/productivity/travel-refund-readiness.ts')
const adminPage = read('app/admin/travel-refund-readiness/page.tsx')
const adminApi = read('app/api/admin/travel-refund-readiness/route.ts')
const localScript = read('scripts/travel-refund-readiness-local.mjs')
const catalog = read('lib/tools/catalog.ts')
const sitemap = read('app/sitemap.ts')
const adminShell = read('components/admin/admin-shell.tsx')
const env = read('.env.example')
const launchEvidence = read('lib/qa/launch-evidence.ts')
const phase101 = read('scripts/phase101-education-form-audit.mjs')

requireCheck(['3.0.72-travel-refund-cancellation-planner', '3.0.73-medical-bill-dispute-planner', '3.0.74-telecom-sim-complaint-planner', '3.0.75-courier-parcel-dispute-planner', '3.0.76-bank-account-freeze-planner', '3.0.77-vehicle-challan-dispute-planner', '3.0.78-identity-document-correction-planner', '3.0.79-lost-document-report-planner', '3.0.80-smooth-motion-ui', '3.0.81-motion-reveal-polish', '3.0.81-motion-reveal-polish', '3.0.82-motion-loading-interactions', '3.0.83-premium-motion-spotlight', '3.0.84-final-stabilization'].includes(pkg.version), 'package version must be 3.0.72-travel-refund-cancellation-planner or newer compatible phase')
requireCheck(pkg.scripts['travel-refund:readiness'] === 'node scripts/travel-refund-readiness-local.mjs', 'travel-refund:readiness script missing')
requireCheck(pkg.scripts['phase102:audit'] === 'node scripts/phase102-travel-refund-audit.mjs', 'phase102:audit script missing')
requireCheck((pkg.scripts['quality:release'] || '').includes('phase102:audit'), 'quality:release must include phase102 audit')
for (const file of [
  'lib/productivity/travel-refund-cancellation-planner.ts',
  'components/forms/travel-refund-cancellation-planner-form.tsx',
  'app/tools/travel-refund-cancellation-planner/page.tsx',
  'lib/productivity/travel-refund-readiness.ts',
  'app/admin/travel-refund-readiness/page.tsx',
  'app/api/admin/travel-refund-readiness/route.ts',
  'scripts/travel-refund-readiness-local.mjs'
]) requireCheck(exists(file), `${file} missing`)
for (const token of ['travelBookingTypes', 'travelIssueTypes', 'buildTravelRefundCancellationPlan', 'pendingAmount', 'proofChecklist', 'safetyWarnings', 'copyReadyMessage']) {
  requireCheck(helper.includes(token), `travel refund helper missing ${token}`)
}
for (const token of ['TravelRefundCancellationPlannerForm', 'Copy refund message', 'Refund safety', 'buildTravelRefundCancellationPlan']) {
  requireCheck(form.includes(token), `travel refund form missing ${token}`)
}
requireCheck(page.includes('Travel refund & cancellation planner') && page.includes('TravelRefundCancellationPlannerForm') && page.includes('Safety note'), 'tool page must include title, form and safety note')
for (const token of ['getTravelRefundReadinessReport', 'travelRefundReadinessLanes', 'TRAVEL_REFUND_PLANNER_MODE', 'TRAVEL_REFUND_COPY_REVIEWED', 'TRAVEL_REFUND_SECRET_SAFETY_REVIEWED']) {
  requireCheck(readiness.includes(token), `travel refund readiness helper missing ${token}`)
}
requireCheck(adminPage.includes('Travel refund planner readiness') && adminPage.includes('Phase 102') && adminPage.includes('/api/admin/travel-refund-readiness'), 'admin page must show title, phase and API')
requireCheck(adminApi.includes('requireAdmin') && adminApi.includes('getTravelRefundReadinessReport'), 'admin API must require admin and return report')
for (const token of ['travel-refund-readiness.json', 'travel-refund-controls.csv', 'travel-refund-lanes.csv', 'travel-refund-proof-checklist.md', 'sample-travel-refund-message.md']) {
  requireCheck(localScript.includes(token), `local script missing ${token}`)
}
requireCheck(catalog.includes('/tools/travel-refund-cancellation-planner') && catalog.includes('Travel Refund Planner'), 'tools catalog missing travel refund planner')
requireCheck(sitemap.includes('/tools/travel-refund-cancellation-planner'), 'sitemap missing travel refund planner')
requireCheck(adminShell.includes('/admin/travel-refund-readiness'), 'admin shell missing travel refund readiness link')
for (const key of ['TRAVEL_REFUND_PLANNER_MODE', 'TRAVEL_REFUND_OWNER', 'TRAVEL_REFUND_COPY_REVIEWED', 'TRAVEL_REFUND_SECRET_SAFETY_REVIEWED', 'TRAVEL_REFUND_POLICY_REVIEWED', 'TRAVEL_REFUND_MOBILE_QA_REVIEWED', 'TRAVEL_REFUND_EVIDENCE_DIR']) {
  requireCheck(env.includes(key), `.env.example missing ${key}`)
}
requireCheck(launchEvidence.includes('Travel Refund Cancellation Planner Readiness') && launchEvidence.includes('npm run travel-refund:readiness'), 'launch evidence gate missing travel refund readiness')
requireCheck(phase101.includes('3.0.72-travel-refund-cancellation-planner'), 'phase101 audit must accept v3.0.72')

console.log('\nPhase 102 travel refund cancellation planner audit')
console.log(`Issues found: ${issues.length}`)
if (issues.length) {
  for (const issue of issues) console.error('❌ ' + issue)
  process.exit(1)
}
console.log('✅ Phase 102 travel refund cancellation readiness checks passed.\n')
