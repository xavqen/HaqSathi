import { existsSync, readFileSync } from 'node:fs'

const issues = []
const requireCheck = (condition, message) => { if (!condition) issues.push(message) }
const exists = (path) => existsSync(path)
const read = (path) => exists(path) ? readFileSync(path, 'utf8') : ''

const pkg = JSON.parse(read('package.json'))
const helper = read('lib/growth/feedback-readiness.ts')
const adminPage = read('app/admin/feedback-readiness/page.tsx')
const adminApi = read('app/api/admin/feedback-readiness/route.ts')
const localScript = read('scripts/feedback-readiness-local.mjs')
const adminShell = read('components/admin/admin-shell.tsx')
const env = read('.env.example')
const evidence = read('lib/qa/launch-evidence.ts')
const previousAudit = read('scripts/phase82-release-governance-audit.mjs')

requireCheck(String(pkg.version || '').startsWith('3.0.'), 'package version must be a 3.0.x compatible release')
requireCheck(pkg.scripts['feedback:readiness'] === 'node scripts/feedback-readiness-local.mjs', 'feedback:readiness script missing')
requireCheck(pkg.scripts['phase83:audit'] === 'node scripts/phase83-feedback-readiness-audit.mjs', 'phase83:audit script missing')
requireCheck((pkg.scripts['quality:release'] || '').includes('phase83:audit'), 'quality:release must include phase83 audit')
requireCheck(exists('lib/growth/feedback-readiness.ts'), 'feedback readiness helper missing')
for (const token of ['getFeedbackReadinessReport', 'FEEDBACK_OWNER', 'FEEDBACK_MODERATION_MODE', 'FEEDBACK_TESTIMONIAL_CONSENT_REVIEWED', 'FEEDBACK_PII_REDACTION_REVIEWED', 'FEEDBACK_DEFAMATION_REVIEWED']) {
  requireCheck(helper.includes(token), `helper missing ${token}`)
}
for (const lane of ['raw-feedback-intake', 'testimonial-consent', 'pii-redaction', 'defamation-unsafe-claims', 'spam-fraud-review', 'rating-quality-insights']) {
  requireCheck(helper.includes(lane), `moderation lane missing ${lane}`)
}
requireCheck(exists('app/admin/feedback-readiness/page.tsx'), 'admin feedback readiness page missing')
requireCheck(adminPage.includes('Feedback, reviews &amp; testimonial moderation readiness') && adminPage.includes('/api/admin/feedback-readiness') && adminPage.includes('Phase 83'), 'admin page must show title, API and phase badge')
requireCheck(exists('app/api/admin/feedback-readiness/route.ts'), 'feedback readiness API route missing')
requireCheck(adminApi.includes('requireAdmin') && adminApi.includes('getFeedbackReadinessReport'), 'admin API must require admin and return report')
requireCheck(exists('scripts/feedback-readiness-local.mjs'), 'feedback readiness local evidence script missing')
for (const token of ['feedback-readiness.json', 'feedback-controls.csv', 'feedback-moderation-lanes.csv', 'testimonial-consent-checklist.md', 'feedback-redaction-checklist.md', 'public-review-publish-rules.md']) {
  requireCheck(localScript.includes(token), `local script missing ${token}`)
}
requireCheck(adminShell.includes('/admin/feedback-readiness'), 'admin shell must link feedback readiness page')
for (const key of ['FEEDBACK_OWNER', 'FEEDBACK_MODERATION_MODE', 'FEEDBACK_TESTIMONIAL_CONSENT_REVIEWED', 'FEEDBACK_PII_REDACTION_REVIEWED', 'FEEDBACK_DEFAMATION_REVIEWED', 'FEEDBACK_SPAM_FRAUD_REVIEWED', 'FEEDBACK_TAKEDOWN_PROCESS_REVIEWED', 'FEEDBACK_EVIDENCE_DIR']) {
  requireCheck(env.includes(key), `.env.example missing ${key}`)
}
requireCheck(evidence.includes('Feedback Reviews Readiness') && evidence.includes('npm run feedback:readiness'), 'launch evidence gate missing feedback reviews readiness')
requireCheck(previousAudit.includes('3.0.52') && previousAudit.includes('newer release'), 'phase82 audit must accept newer releases')

console.log('\nPhase 83 feedback reviews readiness audit')
console.log(`Issues found: ${issues.length}`)
if (issues.length) {
  for (const issue of issues) console.error('❌ ' + issue)
  process.exit(1)
}
console.log('✅ Phase 83 feedback reviews readiness checks passed.\n')
