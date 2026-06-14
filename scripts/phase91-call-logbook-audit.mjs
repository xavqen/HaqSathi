// compatibility ladder: 3.0.60-document-expiry-planner 3.0.61-call-visit-logbook 3.0.62-proof-file-organizer 3.0.63-deadline-appeal-planner 3.0.64-warranty-claim-planner 3.0.65-return-pickup-planner 3.0.66-utility-bill-dispute-planner 3.0.67-rent-deposit-dispute-planner 3.0.68-insurance-claim-planner 3.0.69-loan-app-harassment-planner 3.0.70-job-salary-dispute-planner 3.0.71-education-form-correction-planner 3.0.72-travel-refund-cancellation-planner 3.0.73-medical-bill-dispute-planner 3.0.74-telecom-sim-complaint-planner 3.0.75-courier-parcel-dispute-planner 3.0.76-bank-account-freeze-planner 3.0.77-vehicle-challan-dispute-planner 3.0.78-identity-document-correction-planner 3.0.79-lost-document-report-planner 3.0.80-smooth-motion-ui 3.0.81-motion-reveal-polish 3.0.82-motion-loading-interactions 3.0.83-premium-motion-spotlight 3.0.84-final-stabilization 3.0.85-performance-production-pass newer compatible phase new performance release
import { existsSync, readFileSync } from 'node:fs'

const issues = []
const requireCheck = (condition, message) => { if (!condition) issues.push(message) }
const exists = (path) => existsSync(path)
const read = (path) => exists(path) ? readFileSync(path, 'utf8') : ''

const pkg = JSON.parse(read('package.json'))
const helper = read('lib/productivity/call-visit-logbook.ts')
const readiness = read('lib/productivity/call-visit-logbook-readiness.ts')
const form = read('components/forms/call-visit-logbook-form.tsx')
const page = read('app/tools/call-visit-logbook/page.tsx')
const adminPage = read('app/admin/call-logbook-readiness/page.tsx')
const adminApi = read('app/api/admin/call-logbook-readiness/route.ts')
const localScript = read('scripts/call-logbook-readiness-local.mjs')
const catalog = read('lib/tools/catalog.ts')
const sitemap = read('app/sitemap.ts')
const adminShell = read('components/admin/admin-shell.tsx')
const env = read('.env.example')
const launchEvidence = read('lib/qa/launch-evidence.ts')
const phase90 = read('scripts/phase90-document-expiry-audit.mjs')

requireCheck(String(pkg.version || '').startsWith('3.0.'), 'package version must be a 3.0.x compatible release')
requireCheck(pkg.scripts['call-logbook:readiness'] === 'node scripts/call-logbook-readiness-local.mjs', 'call-logbook:readiness script missing')
requireCheck(pkg.scripts['phase91:audit'] === 'node scripts/phase91-call-logbook-audit.mjs', 'phase91:audit script missing')
requireCheck((pkg.scripts['quality:release'] || '').includes('phase91:audit'), 'quality:release must include phase91 audit')
requireCheck(exists('lib/productivity/call-visit-logbook.ts'), 'call visit logbook helper missing')
for (const token of ['interactionChannels', 'buildCallVisitLogbookPlan', 'getFollowUpUrgency', 'phone-call', 'office-visit', 'bank-branch', 'courier-pickup']) {
  requireCheck(helper.includes(token), `logbook helper missing ${token}`)
}
requireCheck(exists('components/forms/call-visit-logbook-form.tsx'), 'call visit logbook form missing')
for (const token of ['CallVisitLogbookForm', 'Build logbook entry', 'Do not write OTP', 'buildCallVisitLogbookPlan', 'Copy follow-up message']) {
  requireCheck(form.includes(token), `logbook form missing ${token}`)
}
requireCheck(exists('app/tools/call-visit-logbook/page.tsx'), 'call visit logbook tool page missing')
requireCheck(page.includes('Call & visit logbook') && page.includes('CallVisitLogbookForm'), 'tool page must include title and form')
requireCheck(catalog.includes('/tools/call-visit-logbook') && catalog.includes('Call & Visit Logbook'), 'tools catalog missing call visit logbook')
requireCheck(sitemap.includes('/tools/call-visit-logbook'), 'sitemap missing call visit logbook')
requireCheck(exists('lib/productivity/call-visit-logbook-readiness.ts'), 'call logbook readiness helper missing')
for (const token of ['getCallVisitLogbookReadinessReport', 'callLogbookReadinessLanes', 'CALL_LOGBOOK_MODE', 'CALL_LOGBOOK_PRIVACY_COPY_REVIEWED', 'CALL_LOGBOOK_MOBILE_QA_REVIEWED', 'CALL_LOGBOOK_ESCALATION_COPY_REVIEWED']) {
  requireCheck(readiness.includes(token), `readiness helper missing ${token}`)
}
requireCheck(exists('app/admin/call-logbook-readiness/page.tsx'), 'admin call logbook page missing')
requireCheck(adminPage.includes('Call & visit logbook readiness') && adminPage.includes('Phase 91') && adminPage.includes('/api/admin/call-logbook-readiness'), 'admin page must show title, phase and API')
requireCheck(exists('app/api/admin/call-logbook-readiness/route.ts'), 'call logbook admin API missing')
requireCheck(adminApi.includes('requireAdmin') && adminApi.includes('getCallVisitLogbookReadinessReport'), 'admin API must require admin and return report')
requireCheck(exists('scripts/call-logbook-readiness-local.mjs'), 'call logbook local evidence script missing')
for (const token of ['call-logbook-readiness.json', 'call-logbook-controls.csv', 'call-logbook-lanes.csv', 'privacy-redaction-checklist.md', 'sample-follow-up-message.md']) {
  requireCheck(localScript.includes(token), `local script missing ${token}`)
}
requireCheck(adminShell.includes('/admin/call-logbook-readiness'), 'admin shell missing call logbook readiness link')
for (const key of ['CALL_LOGBOOK_MODE', 'CALL_LOGBOOK_OWNER', 'CALL_LOGBOOK_PRIVACY_COPY_REVIEWED', 'CALL_LOGBOOK_MOBILE_QA_REVIEWED', 'CALL_LOGBOOK_EXPORT_REVIEWED', 'CALL_LOGBOOK_TRANSLATION_REVIEWED', 'CALL_LOGBOOK_ESCALATION_COPY_REVIEWED', 'CALL_LOGBOOK_EVIDENCE_DIR']) {
  requireCheck(env.includes(key), `.env.example missing ${key}`)
}
requireCheck(launchEvidence.includes('Call Visit Logbook Readiness') && launchEvidence.includes('npm run call-logbook:readiness'), 'launch evidence gate missing call logbook readiness')
requireCheck(phase90.includes('3.0.61-call-visit-logbook') || phase90.includes('3.0.6'), 'phase90 audit must accept v3.0.61')

console.log('\nPhase 91 call & visit logbook audit')
console.log(`Issues found: ${issues.length}`)
if (issues.length) {
  for (const issue of issues) console.error('❌ ' + issue)
  process.exit(1)
}
console.log('✅ Phase 91 call & visit logbook readiness checks passed.\n')
