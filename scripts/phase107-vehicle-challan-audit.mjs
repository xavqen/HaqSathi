import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const issues = []
const read = (rel) => readFileSync(join(root, rel), 'utf8')
const exists = (rel) => existsSync(join(root, rel))
const requireCheck = (condition, message) => { if (!condition) issues.push(message) }

const pkg = JSON.parse(read('package.json'))
const helper = read('lib/productivity/vehicle-challan-dispute-planner.ts')
const form = read('components/forms/vehicle-challan-dispute-planner-form.tsx')
const page = read('app/tools/vehicle-challan-dispute-planner/page.tsx')
const readiness = read('lib/productivity/vehicle-challan-readiness.ts')
const adminPage = read('app/admin/vehicle-challan-readiness/page.tsx')
const adminApi = read('app/api/admin/vehicle-challan-readiness/route.ts')
const localScript = read('scripts/vehicle-challan-readiness-local.mjs')
const catalog = read('lib/tools/catalog.ts')
const sitemap = read('app/sitemap.ts')
const adminShell = read('components/admin/admin-shell.tsx')
const env = read('.env.example')
const launchEvidence = read('lib/qa/launch-evidence.ts')
const phase106 = read('scripts/phase106-bank-freeze-audit.mjs')

requireCheck(['3.0.77-vehicle-challan-dispute-planner', '3.0.78-identity-document-correction-planner', '3.0.79-lost-document-report-planner', '3.0.80-smooth-motion-ui', '3.0.81-motion-reveal-polish', '3.0.82-motion-loading-interactions', '3.0.83-premium-motion-spotlight', '3.0.84-final-stabilization'].includes(pkg.version), 'package version must be 3.0.77-vehicle-challan-dispute-planner or newer compatible phase')
requireCheck(pkg.scripts['vehicle-challan:readiness'] === 'node scripts/vehicle-challan-readiness-local.mjs', 'vehicle-challan:readiness script missing')
requireCheck(pkg.scripts['phase107:audit'] === 'node scripts/phase107-vehicle-challan-audit.mjs', 'phase107:audit script missing')
requireCheck((pkg.scripts['quality:release'] || '').includes('phase107:audit'), 'quality:release must include phase107 audit')
for (const file of [
  'lib/productivity/vehicle-challan-dispute-planner.ts',
  'components/forms/vehicle-challan-dispute-planner-form.tsx',
  'app/tools/vehicle-challan-dispute-planner/page.tsx',
  'lib/productivity/vehicle-challan-readiness.ts',
  'app/admin/vehicle-challan-readiness/page.tsx',
  'app/api/admin/vehicle-challan-readiness/route.ts',
  'scripts/vehicle-challan-readiness-local.mjs'
]) requireCheck(exists(file), `${file} missing`)
for (const token of ['vehicleChallanIssueTypes', 'buildVehicleChallanPlan', 'proofChecklist', 'safetyWarnings', 'copyReadyMessage', 'urgencyScore']) {
  requireCheck(helper.includes(token), `vehicle challan helper missing ${token}`)
}
for (const token of ['VehicleChallanDisputePlannerForm', 'Copy message', 'Safety warnings', 'buildVehicleChallanPlan']) {
  requireCheck(form.includes(token), `vehicle challan form missing ${token}`)
}
requireCheck(page.includes('Vehicle challan dispute planner') && page.includes('VehicleChallanDisputePlannerForm') && page.includes('Safety note'), 'tool page must include title, form and safety note')
for (const token of ['getVehicleChallanReadinessReport', 'vehicleChallanReadinessLanes', 'VEHICLE_CHALLAN_PLANNER_MODE', 'VEHICLE_CHALLAN_COPY_REVIEWED', 'VEHICLE_CHALLAN_OFFICIAL_ROUTE_REVIEWED']) {
  requireCheck(readiness.includes(token), `vehicle challan readiness helper missing ${token}`)
}
requireCheck(adminPage.includes('Vehicle challan dispute readiness') && adminPage.includes('Phase 107') && adminPage.includes('/api/admin/vehicle-challan-readiness'), 'admin page must show title, phase and API')
requireCheck(adminApi.includes('requireAdmin') && adminApi.includes('getVehicleChallanReadinessReport'), 'admin API must require admin and return report')
for (const token of ['vehicle-challan-readiness.json', 'vehicle-challan-controls.csv', 'vehicle-challan-lanes.csv', 'vehicle-challan-proof-checklist.md', 'sample-vehicle-challan-message.md']) {
  requireCheck(localScript.includes(token), `local script missing ${token}`)
}
requireCheck(catalog.includes('/tools/vehicle-challan-dispute-planner') && catalog.includes('Vehicle Challan Dispute Planner'), 'tools catalog missing vehicle challan planner')
requireCheck(sitemap.includes('/tools/vehicle-challan-dispute-planner'), 'sitemap missing vehicle challan planner')
requireCheck(adminShell.includes('/admin/vehicle-challan-readiness'), 'admin shell missing vehicle challan readiness link')
for (const key of ['VEHICLE_CHALLAN_PLANNER_MODE', 'VEHICLE_CHALLAN_OWNER', 'VEHICLE_CHALLAN_COPY_REVIEWED', 'VEHICLE_CHALLAN_OFFICIAL_ROUTE_REVIEWED', 'VEHICLE_CHALLAN_PAYMENT_SAFETY_REVIEWED', 'VEHICLE_CHALLAN_MOBILE_QA_REVIEWED', 'VEHICLE_CHALLAN_EVIDENCE_DIR']) {
  requireCheck(env.includes(key), `.env.example missing ${key}`)
}
requireCheck(launchEvidence.includes('Vehicle Challan Dispute Planner Readiness') && launchEvidence.includes('npm run vehicle-challan:readiness'), 'launch evidence gate missing vehicle challan readiness')
requireCheck(phase106.includes('3.0.77-vehicle-challan-dispute-planner') && phase106.includes('3.0.78-identity-document-correction-planner', '3.0.79-lost-document-report-planner', '3.0.80-smooth-motion-ui', '3.0.81-motion-reveal-polish'), 'phase106 audit must accept v3.0.77 and v3.0.78')

console.log('\nPhase 107 vehicle challan dispute planner audit')
console.log(`Issues found: ${issues.length}`)
if (issues.length) {
  for (const issue of issues) console.error('❌ ' + issue)
  process.exit(1)
}
console.log('✅ Phase 107 vehicle challan dispute readiness checks passed.\n')
