// compatibility ladder: 3.0.60-document-expiry-planner 3.0.61-call-visit-logbook 3.0.62-proof-file-organizer 3.0.63-deadline-appeal-planner 3.0.64-warranty-claim-planner 3.0.65-return-pickup-planner 3.0.66-utility-bill-dispute-planner 3.0.67-rent-deposit-dispute-planner 3.0.68-insurance-claim-planner 3.0.69-loan-app-harassment-planner 3.0.70-job-salary-dispute-planner 3.0.71-education-form-correction-planner 3.0.72-travel-refund-cancellation-planner 3.0.73-medical-bill-dispute-planner 3.0.74-telecom-sim-complaint-planner 3.0.75-courier-parcel-dispute-planner 3.0.76-bank-account-freeze-planner 3.0.77-vehicle-challan-dispute-planner 3.0.78-identity-document-correction-planner 3.0.79-lost-document-report-planner 3.0.80-smooth-motion-ui 3.0.81-motion-reveal-polish 3.0.82-motion-loading-interactions 3.0.83-premium-motion-spotlight 3.0.84-final-stabilization 3.0.85-performance-production-pass newer compatible phase new performance release
import { existsSync, readFileSync } from 'node:fs'

const issues = []
const requireCheck = (condition, message) => { if (!condition) issues.push(message) }
const exists = (path) => existsSync(path)
const read = (path) => exists(path) ? readFileSync(path, 'utf8') : ''

const pkg = JSON.parse(read('package.json'))
const helper = read('lib/documents/document-expiry-planner.ts')
const readiness = read('lib/documents/document-expiry-readiness.ts')
const form = read('components/forms/document-expiry-planner-form.tsx')
const page = read('app/tools/document-expiry-planner/page.tsx')
const adminPage = read('app/admin/document-expiry-readiness/page.tsx')
const adminApi = read('app/api/admin/document-expiry-readiness/route.ts')
const localScript = read('scripts/document-expiry-readiness-local.mjs')
const catalog = read('lib/tools/catalog.ts')
const sitemap = read('app/sitemap.ts')
const adminShell = read('components/admin/admin-shell.tsx')
const env = read('.env.example')
const launchEvidence = read('lib/qa/launch-evidence.ts')
const phase88 = read('scripts/phase88-payment-reconciliation-audit.mjs')
const phase89 = read('scripts/phase89-community-safety-audit.mjs')

requireCheck(String(pkg.version || '').startsWith('3.0.'), 'package version must be a 3.0.x compatible release')
requireCheck(pkg.scripts['document-expiry:readiness'] === 'node scripts/document-expiry-readiness-local.mjs', 'document-expiry:readiness script missing')
requireCheck(pkg.scripts['phase90:audit'] === 'node scripts/phase90-document-expiry-audit.mjs', 'phase90:audit script missing')
requireCheck((pkg.scripts['quality:release'] || '').includes('phase90:audit'), 'quality:release must include phase90 audit')
requireCheck(exists('lib/documents/document-expiry-planner.ts'), 'document expiry planner helper missing')
for (const token of ['documentExpiryTypes', 'buildDocumentRenewalPlan', 'getDocumentUrgency', 'formatPlannerDate', 'passport', 'driving-license', 'income-certificate', 'scholarship-docs']) {
  requireCheck(helper.includes(token), `planner helper missing ${token}`)
}
requireCheck(exists('components/forms/document-expiry-planner-form.tsx'), 'document expiry form missing')
for (const token of ['DocumentExpiryPlannerForm', 'Create renewal plan', 'Do not paste Aadhaar', 'buildDocumentRenewalPlan', 'Privacy + fraud warnings']) {
  requireCheck(form.includes(token), `planner form missing ${token}`)
}
requireCheck(exists('app/tools/document-expiry-planner/page.tsx'), 'document expiry tool page missing')
requireCheck(page.includes('Document expiry & renewal planner') && page.includes('DocumentExpiryPlannerForm'), 'tool page must include title and form')
requireCheck(catalog.includes('/tools/document-expiry-planner') && catalog.includes('Document Expiry Planner'), 'tools catalog missing document expiry planner')
requireCheck(sitemap.includes('/tools/document-expiry-planner'), 'sitemap missing document expiry planner')
requireCheck(exists('lib/documents/document-expiry-readiness.ts'), 'document expiry readiness helper missing')
for (const token of ['getDocumentExpiryReadinessReport', 'documentExpiryReadinessLanes', 'DOCUMENT_EXPIRY_PLANNER_MODE', 'DOCUMENT_EXPIRY_OFFICIAL_LINKS_REVIEWED', 'DOCUMENT_EXPIRY_PRIVACY_COPY_REVIEWED', 'DOCUMENT_EXPIRY_MOBILE_QA_REVIEWED']) {
  requireCheck(readiness.includes(token), `readiness helper missing ${token}`)
}
requireCheck(exists('app/admin/document-expiry-readiness/page.tsx'), 'admin document expiry page missing')
requireCheck(adminPage.includes('Document expiry planner readiness') && adminPage.includes('Phase 90') && adminPage.includes('/api/admin/document-expiry-readiness'), 'admin page must show title, phase and API')
requireCheck(exists('app/api/admin/document-expiry-readiness/route.ts'), 'document expiry admin API missing')
requireCheck(adminApi.includes('requireAdmin') && adminApi.includes('getDocumentExpiryReadinessReport'), 'admin API must require admin and return report')
requireCheck(exists('scripts/document-expiry-readiness-local.mjs'), 'document expiry local evidence script missing')
for (const token of ['document-expiry-readiness.json', 'document-expiry-controls.csv', 'document-expiry-lanes.csv', 'privacy-warning-review.md', 'official-route-checklist.md', 'mobile-qa-checklist.md']) {
  requireCheck(localScript.includes(token), `local script missing ${token}`)
}
requireCheck(adminShell.includes('/admin/document-expiry-readiness'), 'admin shell missing document expiry readiness link')
for (const key of ['DOCUMENT_EXPIRY_PLANNER_MODE', 'DOCUMENT_EXPIRY_OWNER', 'DOCUMENT_EXPIRY_OFFICIAL_LINKS_REVIEWED', 'DOCUMENT_EXPIRY_PRIVACY_COPY_REVIEWED', 'DOCUMENT_EXPIRY_TRANSLATION_REVIEWED', 'DOCUMENT_EXPIRY_REMINDER_DELIVERY_REVIEWED', 'DOCUMENT_EXPIRY_MOBILE_QA_REVIEWED', 'DOCUMENT_EXPIRY_EVIDENCE_DIR']) {
  requireCheck(env.includes(key), `.env.example missing ${key}`)
}
requireCheck(launchEvidence.includes('Document Expiry Planner Readiness') && launchEvidence.includes('npm run document-expiry:readiness'), 'launch evidence gate missing document expiry readiness')
requireCheck(phase88.includes('3.0.60-document-expiry-planner') || phase88.includes('[6-9][0-9]'), 'phase88 audit must accept v3.0.60')
requireCheck(phase89.includes('3.0.60-document-expiry-planner') || phase89.includes('[6-9][0-9]'), 'phase89 audit must accept v3.0.60')

console.log('\nPhase 90 document expiry planner audit')
console.log(`Issues found: ${issues.length}`)
if (issues.length) {
  for (const issue of issues) console.error('❌ ' + issue)
  process.exit(1)
}
console.log('✅ Phase 90 document expiry planner readiness checks passed.\n')
