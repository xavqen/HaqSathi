// compatibility bridge: 3.0.54-onboarding-assistant-readiness newer release
import { existsSync, readFileSync } from 'node:fs'

const issues = []
const requireCheck = (condition, message) => { if (!condition) issues.push(message) }
const exists = (path) => existsSync(path)
const read = (path) => exists(path) ? readFileSync(path, 'utf8') : ''

const pkg = JSON.parse(read('package.json'))
const helper = read('lib/onboarding/assistant-readiness.ts')
const userPage = read('app/dashboard/onboarding/page.tsx')
const adminPage = read('app/admin/onboarding-assistant/page.tsx')
const adminApi = read('app/api/admin/onboarding-assistant-readiness/route.ts')
const localScript = read('scripts/onboarding-assistant-readiness-local.mjs')
const adminShell = read('components/admin/admin-shell.tsx')
const env = read('.env.example')
const evidence = read('lib/qa/launch-evidence.ts')
const previousAudit = read('scripts/phase83-feedback-readiness-audit.mjs')

requireCheck(String(pkg.version || '').startsWith('3.0.'), 'package version must be a 3.0.x compatible release')
requireCheck(pkg.scripts['onboarding:readiness'] === 'node scripts/onboarding-assistant-readiness-local.mjs', 'onboarding:readiness script missing')
requireCheck(pkg.scripts['phase84:audit'] === 'node scripts/phase84-onboarding-assistant-audit.mjs', 'phase84:audit script missing')
requireCheck((pkg.scripts['quality:release'] || '').includes('phase84:audit'), 'quality:release must include phase84 audit')
requireCheck(exists('lib/onboarding/assistant-readiness.ts'), 'onboarding assistant helper missing')
for (const token of ['getOnboardingAssistantReadinessReport', 'getRecommendedFirstRunGuide', 'ONBOARDING_ASSISTANT_OWNER', 'ONBOARDING_ASSISTANT_MODE', 'ONBOARDING_P0_ROUTES_REVIEWED', 'ONBOARDING_SENSITIVE_DATA_WARNING_REVIEWED']) {
  requireCheck(helper.includes(token), `helper missing ${token}`)
}
for (const step of ['goal-detection', 'tool-routing', 'language-state-context', 'first-success-path', 'privacy-safe-education']) {
  requireCheck(helper.includes(step), `guided assistant step missing ${step}`)
}
requireCheck(userPage.includes('getRecommendedFirstRunGuide') && userPage.includes('Safe first-run checklist') && userPage.includes('Never share OTP'), 'dashboard onboarding page must show guided safe first-run assistant')
requireCheck(exists('app/admin/onboarding-assistant/page.tsx'), 'admin onboarding assistant page missing')
requireCheck(adminPage.includes('AI onboarding assistant readiness') && adminPage.includes('/api/admin/onboarding-assistant-readiness') && adminPage.includes('Phase 84'), 'admin page must show title, API and phase badge')
requireCheck(exists('app/api/admin/onboarding-assistant-readiness/route.ts'), 'onboarding assistant readiness API missing')
requireCheck(adminApi.includes('requireAdmin') && adminApi.includes('getOnboardingAssistantReadinessReport'), 'admin API must require admin and return report')
requireCheck(exists('scripts/onboarding-assistant-readiness-local.mjs'), 'onboarding readiness local evidence script missing')
for (const token of ['onboarding-assistant-readiness.json', 'onboarding-controls.csv', 'onboarding-guided-steps.csv', 'first-run-checklist.md', 'unsafe-onboarding-prompt-rules.md', 'first-session-route-map.md']) {
  requireCheck(localScript.includes(token), `local script missing ${token}`)
}
requireCheck(adminShell.includes('/admin/onboarding-assistant'), 'admin shell must link onboarding assistant page')
for (const key of ['ONBOARDING_ASSISTANT_OWNER', 'ONBOARDING_ASSISTANT_MODE', 'ONBOARDING_P0_ROUTES_REVIEWED', 'ONBOARDING_SENSITIVE_DATA_WARNING_REVIEWED', 'ONBOARDING_LANGUAGE_ROUTING_REVIEWED', 'ONBOARDING_FIRST_ACTION_ANALYTICS_REVIEWED', 'ONBOARDING_ASSISTANT_EVIDENCE_DIR']) {
  requireCheck(env.includes(key), `.env.example missing ${key}`)
}
requireCheck(evidence.includes('AI Onboarding Assistant Readiness') && evidence.includes('npm run onboarding:readiness'), 'launch evidence gate missing onboarding assistant readiness')
requireCheck(previousAudit.includes('3.0.53') && previousAudit.includes('newer release'), 'phase83 audit must accept newer releases')

console.log('\nPhase 84 onboarding assistant readiness audit')
console.log(`Issues found: ${issues.length}`)
if (issues.length) {
  for (const issue of issues) console.error('❌ ' + issue)
  process.exit(1)
}
console.log('✅ Phase 84 onboarding assistant readiness checks passed.\n')
