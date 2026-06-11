import { existsSync, readFileSync } from 'node:fs'

const issues = []
const requireCheck = (condition, message) => { if (!condition) issues.push(message) }
const exists = (path) => existsSync(path)
const read = (path) => exists(path) ? readFileSync(path, 'utf8') : ''

const pkg = JSON.parse(read('package.json'))
const helper = read('lib/productivity/proof-file-organizer.ts')
const readiness = read('lib/productivity/proof-file-organizer-readiness.ts')
const form = read('components/forms/proof-file-organizer-form.tsx')
const page = read('app/tools/proof-file-organizer/page.tsx')
const adminPage = read('app/admin/proof-file-organizer-readiness/page.tsx')
const adminApi = read('app/api/admin/proof-file-organizer-readiness/route.ts')
const localScript = read('scripts/proof-file-organizer-readiness-local.mjs')
const catalog = read('lib/tools/catalog.ts')
const sitemap = read('app/sitemap.ts')
const adminShell = read('components/admin/admin-shell.tsx')
const env = read('.env.example')
const launchEvidence = read('lib/qa/launch-evidence.ts')
const phase90 = read('scripts/phase90-document-expiry-audit.mjs')
const phase91 = read('scripts/phase91-call-logbook-audit.mjs')

requireCheck(pkg.version === '3.0.60-document-expiry-planner' || pkg.version === '3.0.61-call-visit-logbook' || pkg.version === '3.0.62-proof-file-organizer' || pkg.version === '3.0.63-deadline-appeal-planner' || pkg.version === '3.0.64-warranty-claim-planner' || pkg.version === '3.0.65-return-pickup-planner' || pkg.version === '3.0.66-utility-bill-dispute-planner' || pkg.version === '3.0.67-rent-deposit-dispute-planner' || ['3.0.68-insurance-claim-planner', '3.0.69-loan-app-harassment-planner', '3.0.70-job-salary-dispute-planner', '3.0.71-education-form-correction-planner', '3.0.72-travel-refund-cancellation-planner', '3.0.73-medical-bill-dispute-planner', '3.0.74-telecom-sim-complaint-planner', '3.0.75-courier-parcel-dispute-planner', '3.0.76-bank-account-freeze-planner', '3.0.77-vehicle-challan-dispute-planner', '3.0.78-identity-document-correction-planner', '3.0.79-lost-document-report-planner', '3.0.80-smooth-motion-ui', '3.0.81-motion-reveal-polish', '3.0.81-motion-reveal-polish', '3.0.82-motion-loading-interactions', '3.0.83-premium-motion-spotlight', '3.0.84-final-stabilization'].includes(pkg.version) || pkg.version === '3.0.69-loan-app-harassment-planner' || ['3.0.70-job-salary-dispute-planner', '3.0.71-education-form-correction-planner', '3.0.72-travel-refund-cancellation-planner', '3.0.82-motion-loading-interactions', '3.0.83-premium-motion-spotlight', '3.0.84-final-stabilization'].includes(pkg.version), 'package version must be current product tool release')
requireCheck(pkg.scripts['proof-file-organizer:readiness'] === 'node scripts/proof-file-organizer-readiness-local.mjs', 'proof-file-organizer:readiness script missing')
requireCheck(pkg.scripts['phase92:audit'] === 'node scripts/phase92-proof-file-organizer-audit.mjs', 'phase92:audit script missing')
requireCheck((pkg.scripts['quality:release'] || '').includes('phase92:audit'), 'quality:release must include phase92 audit')
requireCheck(exists('lib/productivity/proof-file-organizer.ts'), 'proof file organizer helper missing')
for (const token of ['proofIssueTypes', 'buildProofFileOrganizerPlan', 'folderStructure', 'fileNameExamples', 'redactionWarnings']) {
  requireCheck(helper.includes(token), `proof helper missing ${token}`)
}
requireCheck(exists('components/forms/proof-file-organizer-form.tsx'), 'proof organizer form missing')
for (const token of ['ProofFileOrganizerForm', 'Create proof organizer', 'Do not paste OTP', 'buildProofFileOrganizerPlan', 'Copy proof index']) {
  requireCheck(form.includes(token), `proof organizer form missing ${token}`)
}
requireCheck(exists('app/tools/proof-file-organizer/page.tsx'), 'proof file organizer tool page missing')
requireCheck(page.includes('Proof file organizer') && page.includes('ProofFileOrganizerForm'), 'tool page must include title and form')
requireCheck(catalog.includes('/tools/proof-file-organizer') && catalog.includes('Proof File Organizer'), 'tools catalog missing proof file organizer')
requireCheck(sitemap.includes('/tools/proof-file-organizer'), 'sitemap missing proof file organizer')
requireCheck(exists('lib/productivity/proof-file-organizer-readiness.ts'), 'proof organizer readiness helper missing')
for (const token of ['getProofFileOrganizerReadinessReport', 'proofFileOrganizerReadinessLanes', 'PROOF_FILE_ORGANIZER_MODE', 'PROOF_FILE_NAMING_REVIEWED', 'PROOF_FILE_REDACTION_REVIEWED', 'PROOF_FILE_MOBILE_QA_REVIEWED']) {
  requireCheck(readiness.includes(token), `readiness helper missing ${token}`)
}
requireCheck(exists('app/admin/proof-file-organizer-readiness/page.tsx'), 'admin proof organizer page missing')
requireCheck(adminPage.includes('Proof file organizer readiness') && adminPage.includes('Phase 92') && adminPage.includes('/api/admin/proof-file-organizer-readiness'), 'admin page must show title, phase and API')
requireCheck(exists('app/api/admin/proof-file-organizer-readiness/route.ts'), 'proof organizer admin API missing')
requireCheck(adminApi.includes('requireAdmin') && adminApi.includes('getProofFileOrganizerReadinessReport'), 'admin API must require admin and return report')
requireCheck(exists('scripts/proof-file-organizer-readiness-local.mjs'), 'proof organizer local evidence script missing')
for (const token of ['proof-file-organizer-readiness.json', 'proof-file-organizer-controls.csv', 'proof-file-organizer-lanes.csv', 'safe-file-naming-guide.md', 'sample-proof-index.md']) {
  requireCheck(localScript.includes(token), `local script missing ${token}`)
}
requireCheck(adminShell.includes('/admin/proof-file-organizer-readiness'), 'admin shell missing proof organizer readiness link')
for (const key of ['PROOF_FILE_ORGANIZER_MODE', 'PROOF_FILE_ORGANIZER_OWNER', 'PROOF_FILE_NAMING_REVIEWED', 'PROOF_FILE_REDACTION_REVIEWED', 'PROOF_FILE_MOBILE_QA_REVIEWED', 'PROOF_FILE_TRANSLATION_REVIEWED', 'PROOF_FILE_EXPORT_COPY_REVIEWED', 'PROOF_FILE_ORGANIZER_EVIDENCE_DIR']) {
  requireCheck(env.includes(key), `.env.example missing ${key}`)
}
requireCheck(launchEvidence.includes('Proof File Organizer Readiness') && launchEvidence.includes('npm run proof-file-organizer:readiness'), 'launch evidence gate missing proof organizer readiness')
requireCheck(phase90.includes('3.0.62-proof-file-organizer'), 'phase90 audit must accept v3.0.62')
requireCheck(phase91.includes('3.0.62-proof-file-organizer'), 'phase91 audit must accept v3.0.62')

console.log('\nPhase 92 proof file organizer audit')
console.log(`Issues found: ${issues.length}`)
if (issues.length) {
  for (const issue of issues) console.error('❌ ' + issue)
  process.exit(1)
}
console.log('✅ Phase 92 proof file organizer readiness checks passed.\n')
