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

const referrals = exists('lib/referrals.ts') ? read('lib/referrals.ts') : ''
const adminPage = exists('app/admin/referral-readiness/page.tsx') ? read('app/admin/referral-readiness/page.tsx') : ''
const adminApi = exists('app/api/admin/referral-readiness/route.ts') ? read('app/api/admin/referral-readiness/route.ts') : ''
const adminShell = exists('components/admin/admin-shell.tsx') ? read('components/admin/admin-shell.tsx') : ''
const env = read('.env.example')
const evidence = read('lib/qa/launch-evidence.ts')

require((/3\.0\.(2[4-9]|[3-9][0-9])/.test(pkg.version) || /^3\.0\.(?:[1-9]\d{2,})/.test(pkg.version)), 'package version must be v3.0.24+')
require(pkg.scripts['referral:readiness'] === 'node scripts/referral-readiness-local.mjs', 'referral:readiness script missing')
require(pkg.scripts['phase54:audit'] === 'node scripts/phase54-referral-growth-audit.mjs', 'phase54:audit script missing')
require((pkg.scripts['quality:release'] || '').includes('phase54:audit'), 'quality:release must include phase54 audit')
require(exists('lib/referrals.ts'), 'referral helper missing')
for (const token of ['getReferralGrowthReport', 'getReferralGrowthControls', 'maskReferralEmail', 'REFERRAL_FRAUD_REVIEW_REQUIRED', 'cash payout']) {
  require(referrals.includes(token), `referral helper missing ${token}`)
}
require(exists('app/admin/referral-readiness/page.tsx'), 'admin referral readiness page missing')
require(adminPage.includes('Referral growth readiness') && adminPage.includes('npm run referral:readiness') && adminPage.includes('/api/admin/referral-readiness'), 'admin referral page must show command and API')
require(exists('app/api/admin/referral-readiness/route.ts'), 'admin referral readiness API missing')
require(adminApi.includes('requireAdmin') && adminApi.includes('getReferralGrowthReport') && adminApi.includes('referralInvite'), 'admin referral API must require admin and include invite metrics')
require(adminShell.includes('/admin/referral-readiness'), 'admin shell must link referral readiness page')
for (const key of ['REFERRAL_PROGRAM_ENABLED', 'REFERRAL_PROGRAM_MODE', 'REFERRAL_PAYOUT_MODE', 'REFERRAL_MAX_INVITES_PER_DAY', 'REFERRAL_FRAUD_REVIEW_REQUIRED', 'REFERRAL_MIN_CONVERSION_AGE_DAYS', 'REFERRAL_REVIEW_OWNER', 'REFERRAL_EVIDENCE_DIR', 'NEXT_PUBLIC_REFERRAL_TERMS_URL']) {
  require(env.includes(`${key}=`), `.env.example missing ${key}`)
}
require(evidence.includes('Referral Growth Readiness'), 'launch evidence gate missing referral growth readiness')
require(exists('scripts/referral-readiness-local.mjs'), 'referral readiness local script missing')
require(exists('PHASE_54_REFERRAL_GROWTH.md'), 'Phase 54 notes missing')

console.log('\nHaqSathi Phase 54 referral growth audit')
console.log('Checks: 16')
console.log(`Issues found: ${issues.length}`)
if (issues.length) {
  for (const issue of issues) console.error('❌ ' + issue)
  process.exit(1)
}
console.log('✅ Phase 54 audit passed: referral growth readiness helper, admin page, API, evidence script, envs and launch gate are installed.\n')
