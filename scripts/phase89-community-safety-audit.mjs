import { existsSync, readFileSync } from 'node:fs'

const issues = []
const requireCheck = (condition, message) => { if (!condition) issues.push(message) }
const exists = (path) => existsSync(path)
const read = (path) => exists(path) ? readFileSync(path, 'utf8') : ''

const pkg = JSON.parse(read('package.json'))
const helper = read('lib/safety/community-safety-readiness.ts')
const publicPage = read('app/safety-alerts/page.tsx')
const form = read('components/forms/safety-alert-report-form.tsx')
const reportApi = read('app/api/safety-alerts/report/route.ts')
const adminPage = read('app/admin/community-safety/page.tsx')
const adminApi = read('app/api/admin/community-safety-readiness/route.ts')
const localScript = read('scripts/community-safety-readiness-local.mjs')
const adminShell = read('components/admin/admin-shell.tsx')
const env = read('.env.example')
const evidence = read('lib/qa/launch-evidence.ts')
const previousAudit = read('scripts/phase88-payment-reconciliation-audit.mjs')

requireCheck(pkg.version === '3.0.59-community-safety-alerts' || pkg.version === '3.0.60-document-expiry-planner' || /^3\.0\.([6-9][0-9])-/.test(pkg.version), 'package version must be 3.0.59 community safety or newer release')
requireCheck(pkg.scripts['community-safety:readiness'] === 'node scripts/community-safety-readiness-local.mjs', 'community-safety:readiness script missing')
requireCheck(pkg.scripts['phase89:audit'] === 'node scripts/phase89-community-safety-audit.mjs', 'phase89:audit script missing')
requireCheck((pkg.scripts['quality:release'] || '').includes('phase89:audit'), 'quality:release must include phase89 audit')
requireCheck(exists('lib/safety/community-safety-readiness.ts'), 'community safety helper missing')
for (const token of ['getCommunitySafetyReadinessReport', 'communitySafetyLanes', 'normalizeSafetyCategory', 'redactSafetyText', 'COMMUNITY_SAFETY_ALERTS_MODE', 'COMMUNITY_SAFETY_OWNER', 'COMMUNITY_SAFETY_REPORT_DRY_RUN', 'COMMUNITY_SAFETY_MODERATION_REVIEWED', 'COMMUNITY_SAFETY_REDACTION_REVIEWED']) {
  requireCheck(helper.includes(token), `helper missing ${token}`)
}
for (const lane of ['upi-fraud-warning', 'loan-app-harassment', 'job-offer-scam', 'shopping-refund-scam', 'govt-form-agent-fraud', 'call-sms-link-alert']) {
  requireCheck(helper.includes(lane), `community safety lane missing ${lane}`)
}
requireCheck(exists('app/safety-alerts/page.tsx'), 'public safety alerts page missing')
requireCheck(publicPage.includes('SafetyAlertReportForm') && publicPage.includes('communitySafetyLanes') && publicPage.includes('Community safety alerts'), 'public page must include report form, lanes and title')
requireCheck(exists('components/forms/safety-alert-report-form.tsx'), 'safety report form missing')
requireCheck(form.includes('/api/safety-alerts/report') && form.includes('Do not share OTP') && form.includes('consent'), 'report form must post to API and show sensitive-data warning')
requireCheck(exists('app/api/safety-alerts/report/route.ts'), 'public report API missing')
requireCheck(reportApi.includes('csrfGuard') && reportApi.includes('rateLimitAsync') && reportApi.includes('redactSafetyText') && reportApi.includes('COMMUNITY_SAFETY_REPORT_DRY_RUN'), 'report API must use CSRF, rate-limit, redaction and dry-run mode')
requireCheck(exists('app/admin/community-safety/page.tsx'), 'admin community safety page missing')
requireCheck(adminPage.includes('Community safety alerts readiness') && adminPage.includes('/api/admin/community-safety-readiness') && adminPage.includes('Phase 89'), 'admin page must show title, API and phase badge')
requireCheck(exists('app/api/admin/community-safety-readiness/route.ts'), 'community safety admin API route missing')
requireCheck(adminApi.includes('requireAdmin') && adminApi.includes('getCommunitySafetyReadinessReport'), 'admin API must require admin and return report')
requireCheck(exists('scripts/community-safety-readiness-local.mjs'), 'community safety local evidence script missing')
for (const token of ['community-safety-readiness.json', 'community-safety-controls.csv', 'community-safety-lanes.csv', 'moderation-checklist.md', 'redaction-sample.md', 'public-alert-template.md']) {
  requireCheck(localScript.includes(token), `local script missing ${token}`)
}
requireCheck(adminShell.includes('/admin/community-safety'), 'admin shell must link community safety page')
for (const key of ['COMMUNITY_SAFETY_ALERTS_MODE', 'COMMUNITY_SAFETY_OWNER', 'COMMUNITY_SAFETY_REPORT_DRY_RUN', 'COMMUNITY_SAFETY_INTAKE_REVIEWED', 'COMMUNITY_SAFETY_MODERATION_REVIEWED', 'COMMUNITY_SAFETY_REDACTION_REVIEWED', 'COMMUNITY_SAFETY_OFFICIAL_SOURCE_REVIEWED', 'COMMUNITY_SAFETY_ESCALATION_REVIEWED', 'COMMUNITY_SAFETY_PUBLIC_ALERT_REVIEWED', 'COMMUNITY_SAFETY_EVIDENCE_DIR']) {
  requireCheck(env.includes(key), `.env.example missing ${key}`)
}
requireCheck(evidence.includes('Community Safety Alerts Readiness') && evidence.includes('npm run community-safety:readiness'), 'launch evidence gate missing community safety readiness')
requireCheck(previousAudit.includes('3.0.59'), 'phase88 audit must accept newer release')

console.log('\nPhase 89 community safety alerts audit')
console.log(`Issues found: ${issues.length}`)
if (issues.length) {
  for (const issue of issues) console.error('❌ ' + issue)
  process.exit(1)
}
console.log('✅ Phase 89 community safety alerts readiness checks passed.\n')
