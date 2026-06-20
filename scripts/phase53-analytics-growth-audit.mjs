import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const issues = []
const exists = (file) => existsSync(join(root, file))
const read = (file) => readFileSync(join(root, file), 'utf8')
const pkg = JSON.parse(read('package.json'))

function require(condition, message) {
  if (!condition) issues.push(message)
}

const helper = exists('lib/analytics/growth-readiness.ts') ? read('lib/analytics/growth-readiness.ts') : ''
const client = exists('components/layout/first-party-analytics.tsx') ? read('components/layout/first-party-analytics.tsx') : ''
const layout = exists('app/layout.tsx') ? read('app/layout.tsx') : ''
const eventRoute = exists('app/api/analytics/event/route.ts') ? read('app/api/analytics/event/route.ts') : ''
const adminApi = exists('app/api/admin/analytics-readiness/route.ts') ? read('app/api/admin/analytics-readiness/route.ts') : ''
const adminPage = exists('app/admin/analytics-readiness/page.tsx') ? read('app/admin/analytics-readiness/page.tsx') : ''
const adminShell = exists('components/admin/admin-shell.tsx') ? read('components/admin/admin-shell.tsx') : ''
const env = read('.env.example')
const evidence = read('lib/qa/launch-evidence.ts')

require((/3\.0\.(2[3-9]|[3-9][0-9])/.test(pkg.version) || /^3\.0\.(?:[1-9]\d{2,})/.test(pkg.version)), 'package version must be v3.0.23+')
require(pkg.scripts['analytics:readiness'] === 'node scripts/analytics-readiness-local.mjs', 'analytics:readiness script missing')
require(pkg.scripts['phase53:audit'] === 'node scripts/phase53-analytics-growth-audit.mjs', 'phase53:audit script missing')
require((pkg.scripts['quality:release'] || '').includes('phase53:audit'), 'quality:release must include phase53 audit')
require(exists('lib/analytics/growth-readiness.ts'), 'analytics readiness helper missing')
for (const token of ['getAnalyticsReadinessReport', 'analyticsEventAllowlist', 'redactAnalyticsValue', 'No PII in analytics policy']) {
  require(helper.includes(token), `analytics helper missing ${token}`)
}
require(exists('components/layout/first-party-analytics.tsx'), 'first party analytics client missing')
require(client.includes('haqsathi_cookie_consent_v1') && client.includes('/api/analytics/event'), 'client analytics must respect consent and call event API')
require(layout.includes('FirstPartyAnalytics'), 'root layout must mount FirstPartyAnalytics')
require(exists('app/api/analytics/event/route.ts'), 'analytics event API missing')
require(eventRoute.includes('csrfGuard') && eventRoute.includes('rateLimitAsync') && eventRoute.includes('isAllowedAnalyticsEvent') && eventRoute.includes('redactAnalyticsValue'), 'analytics event API must include CSRF, rate limit, allowlist and redaction')
require(exists('app/api/admin/analytics-readiness/route.ts'), 'admin analytics readiness API missing')
require(adminApi.includes('requireAdmin') && adminApi.includes('getAnalyticsReadinessReport'), 'admin analytics API must require admin and return report')
require(exists('app/admin/analytics-readiness/page.tsx'), 'admin analytics readiness page missing')
require(adminPage.includes('npm run analytics:readiness') && adminPage.includes('Minimum launch evidence') && adminPage.includes('/api/admin/analytics-readiness'), 'admin analytics page must show command, evidence and API')
require(adminShell.includes('/admin/analytics-readiness'), 'admin shell must link analytics readiness page')
for (const key of ['ANALYTICS_MODE', 'ANALYTICS_REQUIRE_CONSENT', 'NEXT_PUBLIC_FIRST_PARTY_ANALYTICS', 'ANALYTICS_EVENT_API_ENABLED', 'NEXT_PUBLIC_UTM_CAPTURE_ENABLED', 'NEXT_PUBLIC_POSTHOG_KEY', 'NEXT_PUBLIC_POSTHOG_HOST', 'ANALYTICS_RETENTION_DAYS', 'ANALYTICS_SAMPLE_RATE', 'ANALYTICS_EVIDENCE_DIR']) {
  require(env.includes(`${key}=`), `.env.example missing ${key}`)
}
require(evidence.includes('Analytics Growth Readiness'), 'launch evidence gate missing analytics growth readiness')
require(exists('scripts/analytics-readiness-local.mjs'), 'analytics readiness local script missing')
require(exists('PHASE_53_ANALYTICS_GROWTH.md'), 'Phase 53 notes missing')

console.log('\nHaqSathi Phase 53 analytics growth audit')
console.log('Checks: 17')
console.log(`Issues found: ${issues.length}`)
if (issues.length) {
  for (const issue of issues) console.error('❌ ' + issue)
  process.exit(1)
}
console.log('✅ Phase 53 audit passed: privacy-safe analytics client, event API, admin page, evidence script, envs and launch gate are installed.\n')
