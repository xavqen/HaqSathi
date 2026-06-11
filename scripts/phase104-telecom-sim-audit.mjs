import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const issues = []
const read = (rel) => readFileSync(join(root, rel), 'utf8')
const exists = (rel) => existsSync(join(root, rel))
const requireCheck = (condition, message) => { if (!condition) issues.push(message) }

const pkg = JSON.parse(read('package.json'))
const helper = read('lib/productivity/telecom-sim-complaint-planner.ts')
const form = read('components/forms/telecom-sim-complaint-planner-form.tsx')
const page = read('app/tools/telecom-sim-complaint-planner/page.tsx')
const readiness = read('lib/productivity/telecom-sim-readiness.ts')
const adminPage = read('app/admin/telecom-sim-readiness/page.tsx')
const adminApi = read('app/api/admin/telecom-sim-readiness/route.ts')
const localScript = read('scripts/telecom-sim-readiness-local.mjs')
const catalog = read('lib/tools/catalog.ts')
const sitemap = read('app/sitemap.ts')
const adminShell = read('components/admin/admin-shell.tsx')
const env = read('.env.example')
const launchEvidence = read('lib/qa/launch-evidence.ts')
const phase103 = read('scripts/phase103-medical-bill-audit.mjs')

requireCheck(['3.0.74-telecom-sim-complaint-planner', '3.0.75-courier-parcel-dispute-planner', '3.0.76-bank-account-freeze-planner', '3.0.77-vehicle-challan-dispute-planner', '3.0.78-identity-document-correction-planner', '3.0.79-lost-document-report-planner', '3.0.80-smooth-motion-ui', '3.0.81-motion-reveal-polish', '3.0.81-motion-reveal-polish', '3.0.82-motion-loading-interactions', '3.0.83-premium-motion-spotlight', '3.0.84-final-stabilization'].includes(pkg.version), 'package version must be 3.0.74-telecom-sim-complaint-planner or newer compatible phase')
requireCheck(pkg.scripts['telecom-sim:readiness'] === 'node scripts/telecom-sim-readiness-local.mjs', 'telecom-sim:readiness script missing')
requireCheck(pkg.scripts['phase104:audit'] === 'node scripts/phase104-telecom-sim-audit.mjs', 'phase104:audit script missing')
requireCheck((pkg.scripts['quality:release'] || '').includes('phase104:audit'), 'quality:release must include phase104 audit')
for (const file of [
  'lib/productivity/telecom-sim-complaint-planner.ts',
  'components/forms/telecom-sim-complaint-planner-form.tsx',
  'app/tools/telecom-sim-complaint-planner/page.tsx',
  'lib/productivity/telecom-sim-readiness.ts',
  'app/admin/telecom-sim-readiness/page.tsx',
  'app/api/admin/telecom-sim-readiness/route.ts',
  'scripts/telecom-sim-readiness-local.mjs'
]) requireCheck(exists(file), `${file} missing`)
for (const token of ['telecomIssueTypes', 'buildTelecomSimComplaintPlan', 'proofChecklist', 'safetyWarnings', 'copyReadyMessage', 'urgencyScore']) {
  requireCheck(helper.includes(token), `telecom helper missing ${token}`)
}
for (const token of ['TelecomSimComplaintPlannerForm', 'Copy message', 'Telecom safety', 'buildTelecomSimComplaintPlan']) {
  requireCheck(form.includes(token), `telecom form missing ${token}`)
}
requireCheck(page.includes('Telecom SIM complaint planner') && page.includes('TelecomSimComplaintPlannerForm') && page.includes('Safety note'), 'tool page must include title, form and safety note')
for (const token of ['getTelecomSimReadinessReport', 'telecomSimReadinessLanes', 'TELECOM_SIM_PLANNER_MODE', 'TELECOM_SIM_COPY_REVIEWED', 'TELECOM_SIM_KYC_ROUTE_REVIEWED']) {
  requireCheck(readiness.includes(token), `telecom readiness helper missing ${token}`)
}
requireCheck(adminPage.includes('Telecom SIM planner readiness') && adminPage.includes('Phase 104') && adminPage.includes('/api/admin/telecom-sim-readiness'), 'admin page must show title, phase and API')
requireCheck(adminApi.includes('requireAdmin') && adminApi.includes('getTelecomSimReadinessReport'), 'admin API must require admin and return report')
for (const token of ['telecom-sim-readiness.json', 'telecom-sim-controls.csv', 'telecom-sim-lanes.csv', 'telecom-sim-proof-checklist.md', 'sample-telecom-message.md']) {
  requireCheck(localScript.includes(token), `local script missing ${token}`)
}
requireCheck(catalog.includes('/tools/telecom-sim-complaint-planner') && catalog.includes('Telecom SIM Complaint Planner'), 'tools catalog missing telecom SIM planner')
requireCheck(sitemap.includes('/tools/telecom-sim-complaint-planner'), 'sitemap missing telecom SIM planner')
requireCheck(adminShell.includes('/admin/telecom-sim-readiness'), 'admin shell missing telecom SIM readiness link')
for (const key of ['TELECOM_SIM_PLANNER_MODE', 'TELECOM_SIM_OWNER', 'TELECOM_SIM_COPY_REVIEWED', 'TELECOM_SIM_SECRET_SAFETY_REVIEWED', 'TELECOM_SIM_KYC_ROUTE_REVIEWED', 'TELECOM_SIM_MOBILE_QA_REVIEWED', 'TELECOM_SIM_EVIDENCE_DIR']) {
  requireCheck(env.includes(key), `.env.example missing ${key}`)
}
requireCheck(launchEvidence.includes('Telecom SIM Complaint Planner Readiness') && launchEvidence.includes('npm run telecom-sim:readiness'), 'launch evidence gate missing telecom SIM readiness')
requireCheck(phase103.includes('3.0.74-telecom-sim-complaint-planner'), 'phase103 audit must accept v3.0.74')

console.log('\nPhase 104 telecom SIM complaint planner audit')
console.log(`Issues found: ${issues.length}`)
if (issues.length) {
  for (const issue of issues) console.error('❌ ' + issue)
  process.exit(1)
}
console.log('✅ Phase 104 telecom SIM complaint readiness checks passed.\n')
