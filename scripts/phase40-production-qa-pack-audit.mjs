import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const issues = []
const read = (file) => readFileSync(join(root, file), 'utf8')
const exists = (file) => existsSync(join(root, file))
const pkg = JSON.parse(read('package.json'))
const env = read('.env.example')
const finalQa = read('app/admin/final-qa/page.tsx')
const productionQa = read('app/admin/production-qa/page.tsx')
const readiness = read('lib/qa/production-readiness.ts')

function require(condition, message) {
  if (!condition) issues.push(message)
}

require(/3\.0\.(10|11|12|1[3-9]|[2-9][0-9])/.test(pkg.version), 'package version should be v3.0.10+ production QA pack')
require(pkg.scripts['phase40:audit'] === 'node scripts/phase40-production-qa-pack-audit.mjs', 'phase40:audit script missing')
require(pkg.scripts['qa:production-pack'] === 'node scripts/production-qa-pack.mjs', 'qa:production-pack script missing')
require((pkg.scripts['quality:release'] || '').includes('phase40:audit'), 'quality:release must include phase40 audit')
require((pkg.scripts['release:deploy-check'] || '').includes('qa:production-pack'), 'release:deploy-check must generate production QA pack')
require(exists('lib/qa/production-readiness.ts'), 'production readiness library missing')
require(readiness.includes('productionQaChecklist') && readiness.includes('priorityTranslationPages'), 'readiness library must include QA checklist and translation priority pages')
require(readiness.includes('Razorpay') && readiness.includes('Resend') && readiness.includes('Supabase'), 'readiness checklist must cover payment, email and storage')
require(readiness.includes('official-link-review') && readiness.includes('translation-review'), 'readiness checklist must cover official links and translation review')
require(exists('scripts/production-qa-pack.mjs'), 'production QA pack generator missing')
require(read('scripts/production-qa-pack.mjs').includes('launch-evidence-checklist.md'), 'production QA generator must write launch evidence checklist')
require(finalQa.includes('qa:production-pack') && finalQa.includes('release:deploy-check'), 'final QA page must show production QA pack/deploy commands')
require(productionQa.includes('getProductionQaSummary'), 'production QA admin page must render production readiness summary')
require(/NEXT_PUBLIC_APP_VERSION="3\.0\.(1[2-9]|[2-9][0-9])"/.test(env), '.env.example app version must be v3.0.12 or newer')
for (const key of ['VERCEL_PRODUCTION_URL','QA_EVIDENCE_DIR','OFFICIAL_LINK_REVIEWER','TRANSLATION_REVIEWER','RAZORPAY_WEBHOOK_URL','RESEND_TEST_TO_EMAIL']) {
  require(env.includes(key), `.env.example missing ${key}`)
}

console.log('\nHaqSathi Phase 40 production QA pack audit')
console.log('Checks: 16')
console.log(`Issues found: ${issues.length}`)
if (issues.length) {
  for (const issue of issues) console.error('❌ ' + issue)
  process.exit(1)
}
console.log('✅ Phase 40 audit passed: production QA evidence pack, go/no-go checklist, env gates, translation review matrix and deploy check commands are installed.\n')
