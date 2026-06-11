import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const issues = []
const read = (rel) => readFileSync(join(root, rel), 'utf8')
const exists = (rel) => existsSync(join(root, rel))
const requireCheck = (condition, message) => { if (!condition) issues.push(message) }

const pkg = JSON.parse(read('package.json'))
const helper = read('lib/productivity/bank-account-freeze-planner.ts')
const form = read('components/forms/bank-account-freeze-planner-form.tsx')
const page = read('app/tools/bank-account-freeze-planner/page.tsx')
const readiness = read('lib/productivity/bank-freeze-readiness.ts')
const adminPage = read('app/admin/bank-freeze-readiness/page.tsx')
const adminApi = read('app/api/admin/bank-freeze-readiness/route.ts')
const localScript = read('scripts/bank-freeze-readiness-local.mjs')
const catalog = read('lib/tools/catalog.ts')
const sitemap = read('app/sitemap.ts')
const adminShell = read('components/admin/admin-shell.tsx')
const env = read('.env.example')
const launchEvidence = read('lib/qa/launch-evidence.ts')
const phase105 = read('scripts/phase105-courier-parcel-audit.mjs')

requireCheck(['3.0.76-bank-account-freeze-planner', '3.0.77-vehicle-challan-dispute-planner', '3.0.78-identity-document-correction-planner', '3.0.79-lost-document-report-planner', '3.0.80-smooth-motion-ui', '3.0.81-motion-reveal-polish', '3.0.81-motion-reveal-polish', '3.0.82-motion-loading-interactions', '3.0.83-premium-motion-spotlight', '3.0.84-final-stabilization'].includes(pkg.version), 'package version must be 3.0.76 or 3.0.77')
requireCheck(pkg.scripts['bank-freeze:readiness'] === 'node scripts/bank-freeze-readiness-local.mjs', 'bank-freeze:readiness script missing')
requireCheck(pkg.scripts['phase106:audit'] === 'node scripts/phase106-bank-freeze-audit.mjs', 'phase106:audit script missing')
requireCheck((pkg.scripts['quality:release'] || '').includes('phase106:audit'), 'quality:release must include phase106 audit')
for (const file of [
  'lib/productivity/bank-account-freeze-planner.ts',
  'components/forms/bank-account-freeze-planner-form.tsx',
  'app/tools/bank-account-freeze-planner/page.tsx',
  'lib/productivity/bank-freeze-readiness.ts',
  'app/admin/bank-freeze-readiness/page.tsx',
  'app/api/admin/bank-freeze-readiness/route.ts',
  'scripts/bank-freeze-readiness-local.mjs'
]) requireCheck(exists(file), `${file} missing`)
for (const token of ['bankFreezeIssueTypes', 'buildBankAccountFreezePlan', 'proofChecklist', 'safetyWarnings', 'copyReadyMessage', 'urgencyScore']) {
  requireCheck(helper.includes(token), `bank freeze helper missing ${token}`)
}
for (const token of ['BankAccountFreezePlannerForm', 'Copy message', 'Safety warnings', 'buildBankAccountFreezePlan']) {
  requireCheck(form.includes(token), `bank freeze form missing ${token}`)
}
requireCheck(page.includes('Bank account freeze planner') && page.includes('BankAccountFreezePlannerForm') && page.includes('Safety note'), 'tool page must include title, form and safety note')
for (const token of ['getBankFreezeReadinessReport', 'bankFreezeReadinessLanes', 'BANK_FREEZE_PLANNER_MODE', 'BANK_FREEZE_COPY_REVIEWED', 'BANK_FREEZE_OFFICIAL_ROUTE_REVIEWED']) {
  requireCheck(readiness.includes(token), `bank freeze readiness helper missing ${token}`)
}
requireCheck(adminPage.includes('Bank account freeze planner readiness') && adminPage.includes('Phase 106') && adminPage.includes('/api/admin/bank-freeze-readiness'), 'admin page must show title, phase and API')
requireCheck(adminApi.includes('requireAdmin') && adminApi.includes('getBankFreezeReadinessReport'), 'admin API must require admin and return report')
for (const token of ['bank-freeze-readiness.json', 'bank-freeze-controls.csv', 'bank-freeze-lanes.csv', 'bank-freeze-proof-checklist.md', 'sample-bank-freeze-message.md']) {
  requireCheck(localScript.includes(token), `local script missing ${token}`)
}
requireCheck(catalog.includes('/tools/bank-account-freeze-planner') && catalog.includes('Bank Account Freeze Planner'), 'tools catalog missing bank freeze planner')
requireCheck(sitemap.includes('/tools/bank-account-freeze-planner'), 'sitemap missing bank freeze planner')
requireCheck(adminShell.includes('/admin/bank-freeze-readiness'), 'admin shell missing bank freeze readiness link')
for (const key of ['BANK_FREEZE_PLANNER_MODE', 'BANK_FREEZE_OWNER', 'BANK_FREEZE_COPY_REVIEWED', 'BANK_FREEZE_SECRET_SAFETY_REVIEWED', 'BANK_FREEZE_OFFICIAL_ROUTE_REVIEWED', 'BANK_FREEZE_MOBILE_QA_REVIEWED', 'BANK_FREEZE_EVIDENCE_DIR']) {
  requireCheck(env.includes(key), `.env.example missing ${key}`)
}
requireCheck(launchEvidence.includes('Bank Account Freeze Planner Readiness') && launchEvidence.includes('npm run bank-freeze:readiness'), 'launch evidence gate missing bank freeze readiness')
requireCheck(phase105.includes('3.0.76-bank-account-freeze-planner'), 'phase105 audit must accept v3.0.76')

console.log('\nPhase 106 bank account freeze planner audit')
console.log(`Issues found: ${issues.length}`)
if (issues.length) {
  for (const issue of issues) console.error('❌ ' + issue)
  process.exit(1)
}
console.log('✅ Phase 106 bank account freeze readiness checks passed.\n')
