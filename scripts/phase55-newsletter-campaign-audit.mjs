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

const newsletterLib = exists('lib/newsletter/readiness.ts') ? read('lib/newsletter/readiness.ts') : ''
const adminPage = exists('app/admin/newsletter-readiness/page.tsx') ? read('app/admin/newsletter-readiness/page.tsx') : ''
const adminApi = exists('app/api/admin/newsletter-readiness/route.ts') ? read('app/api/admin/newsletter-readiness/route.ts') : ''
const publicApi = exists('app/api/newsletter/subscribe/route.ts') ? read('app/api/newsletter/subscribe/route.ts') : ''
const publicPage = exists('app/newsletter/page.tsx') ? read('app/newsletter/page.tsx') : ''
const form = exists('components/forms/newsletter-subscribe-form.tsx') ? read('components/forms/newsletter-subscribe-form.tsx') : ''
const adminShell = exists('components/admin/admin-shell.tsx') ? read('components/admin/admin-shell.tsx') : ''
const env = read('.env.example')
const evidence = read('lib/qa/launch-evidence.ts')

require((/3\.0\.(2[5-9]|[3-9][0-9])/.test(pkg.version) || /^3\.0\.(?:[1-9]\d{2,})/.test(pkg.version)), 'package version must be v3.0.25+')
require(pkg.scripts['newsletter:readiness'] === 'node scripts/newsletter-readiness-local.mjs', 'newsletter:readiness script missing')
require(pkg.scripts['phase55:audit'] === 'node scripts/phase55-newsletter-campaign-audit.mjs', 'phase55:audit script missing')
require((pkg.scripts['quality:release'] || '').includes('phase55:audit'), 'quality:release must include phase55 audit')
require(exists('lib/newsletter/readiness.ts'), 'newsletter readiness helper missing')
for (const token of ['getNewsletterCampaignReport', 'getNewsletterControls', 'maskNewsletterEmail', 'NEWSLETTER_REQUIRE_DOUBLE_OPT_IN', 'unsubscribe']) {
  require(newsletterLib.includes(token), `newsletter helper missing ${token}`)
}
require(exists('app/admin/newsletter-readiness/page.tsx'), 'admin newsletter readiness page missing')
require(adminPage.includes('Newsletter campaign readiness') && adminPage.includes('npm run newsletter:readiness') && adminPage.includes('/api/admin/newsletter-readiness'), 'admin newsletter page must show command and API')
require(exists('app/api/admin/newsletter-readiness/route.ts'), 'admin newsletter API missing')
require(adminApi.includes('requireAdmin') && adminApi.includes('getNewsletterCampaignReport') && adminApi.includes('emailLog'), 'admin newsletter API must require admin and include EmailLog metrics')
require(exists('app/api/newsletter/subscribe/route.ts'), 'public newsletter subscribe API missing')
require(publicApi.includes('csrfGuard') && publicApi.includes('rateLimitAsync') && publicApi.includes('NEWSLETTER_DRY_RUN') && publicApi.includes('emailLog.create'), 'public newsletter API must include CSRF, rate limit, dry-run and logging')
require(exists('app/newsletter/page.tsx') && publicPage.includes('NewsletterSubscribeForm'), 'newsletter public page missing subscribe form')
require(exists('components/forms/newsletter-subscribe-form.tsx') && form.includes('/api/newsletter/subscribe') && form.includes('consent'), 'newsletter subscribe form must post with consent')
require(adminShell.includes('/admin/newsletter-readiness'), 'admin shell must link newsletter readiness page')
for (const key of ['NEWSLETTER_MODE', 'NEWSLETTER_PROVIDER', 'NEWSLETTER_DRY_RUN', 'NEWSLETTER_REQUIRE_DOUBLE_OPT_IN', 'NEWSLETTER_SEGMENT_REVIEW_REQUIRED', 'NEWSLETTER_MAX_SENDS_PER_DAY', 'NEWSLETTER_REVIEW_OWNER', 'NEWSLETTER_EVIDENCE_DIR', 'NEXT_PUBLIC_UNSUBSCRIBE_URL']) {
  require(env.includes(`${key}=`), `.env.example missing ${key}`)
}
require(evidence.includes('Newsletter Campaign Readiness'), 'launch evidence gate missing newsletter campaign readiness')
require(exists('scripts/newsletter-readiness-local.mjs'), 'newsletter readiness local script missing')
require(exists('PHASE_55_NEWSLETTER_CAMPAIGNS.md'), 'Phase 55 notes missing')

console.log('\nHaqSathi Phase 55 newsletter campaign audit')
console.log('Checks: 19')
console.log(`Issues found: ${issues.length}`)
if (issues.length) {
  for (const issue of issues) console.error('❌ ' + issue)
  process.exit(1)
}
console.log('✅ Phase 55 audit passed: newsletter readiness helper, public subscribe flow, admin page, API, evidence script, envs and launch gate are installed.\n')
