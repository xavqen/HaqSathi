import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const issues = []
const exists = (file) => existsSync(join(root, file))
const read = (file) => readFileSync(join(root, file), 'utf8')
const pkg = JSON.parse(read('package.json'))

function pass(name, condition) {
  if (!condition) issues.push(name)
}

const helpers = read('lib/ai/helpers.ts')
const providers = read('lib/ai/providers.ts')
const prompts = read('lib/ai/prompts.ts')
const complaintRoute = read('app/api/ai/complaint/route.ts')
const upiRoute = read('app/api/ai/upi-help/route.ts')
const schemeRoute = read('app/api/ai/scheme-finder/route.ts')
const contactRoute = read('app/api/contact/route.ts')
const translatorRoute = read('app/api/tools/language-draft-translator/route.ts')
const documentChecklistRoute = read('app/api/ai/document-checklist/route.ts')
const advancedToolRoutes = [
  read('app/api/tools/consumer-forum-pack/route.ts'),
  read('app/api/tools/ombudsman-planner/route.ts'),
  read('app/api/tools/bank-escalation/route.ts'),
  read('app/api/tools/rti-helper/route.ts'),
  read('app/api/tools/legal-notice/route.ts')
]
const searchRoute = read('app/api/search/route.ts')
const clientErrorRoute = read('app/api/system/client-error/route.ts')
const ocr = read('lib/tools/phase26-ocr-autofill.ts')
const envHealth = read('lib/launch/env-health.ts')
const launchPage = read('app/launch-readiness/page.tsx')
const e2e = read('tests/e2e/public-smoke.spec.ts')
const sw = read('public/sw.js')
const env = read('.env.example')
const health = read('app/api/health/route.ts')

pass('version is a compatible 3.0 release', String(pkg.version || '').startsWith('3.0.'))
pass('phase123 audit script is registered', pkg.scripts['phase123:audit'] === 'node scripts/phase123-enterprise-readiness-foundation-audit.mjs')
pass('quality release includes phase123', pkg.scripts['quality:release'].includes('phase123:audit'))
pass('AI safety helper installed', exists('lib/ai/safety.ts') && read('lib/ai/safety.ts').includes('reviewAiOutput') && read('lib/ai/safety.ts').includes('hardenComplaintOutput') && read('lib/ai/safety.ts').includes('redactSensitiveText'))
pass('fraud escalation constants installed', exists('lib/safety/fraud-escalation.ts') && read('lib/safety/fraud-escalation.ts').includes('CYBER_FRAUD_HELPLINE') && read('lib/safety/fraud-escalation.ts').includes('cybercrime.gov.in'))
pass('official scheme catalog installed', exists('lib/official-schemes/catalog.ts') && read('lib/official-schemes/catalog.ts').includes('officialSchemeCatalog') && read('lib/official-schemes/catalog.ts').includes('pmkisan.gov.in') && read('lib/official-schemes/catalog.ts').includes('scholarships.gov.in'))
pass('scheme helper uses official catalog', helpers.includes('matchOfficialSchemes') && helpers.includes('Matched official sources'))
pass('UPI helper uses official fraud actions', helpers.includes('upiFraudEscalationActions') && helpers.includes('Call 1930') && helpers.includes('cybercrime.gov.in'))
pass('AI prompts include official fraud channel rule', prompts.includes('National Cyber Crime Helpline 1930') && prompts.includes('cybercrime.gov.in'))
pass('complaint provider is language-aware and safety reviewed', providers.includes('buildLanguageInstruction') && providers.includes('hardenComplaintOutput') && providers.includes('safetyReview'))
pass('complaint API blocks secrets, uses async rate limit and saves safety metadata', complaintRoute.includes('detectSensitiveText') && complaintRoute.includes('rateLimitAsync') && complaintRoute.includes('safetyReview.riskLevel'))
pass('public mutation APIs use CSRF and async rate limit', [upiRoute, schemeRoute, contactRoute, translatorRoute, documentChecklistRoute, ...advancedToolRoutes].every((text) => text.includes('csrfGuard') && text.includes('rateLimitAsync')))
pass('search and client error APIs use async distributed rate limit path', [searchRoute, clientErrorRoute].every((text) => text.includes('rateLimitAsync') && text.includes('getClientIp')))
pass('OCR provider prompts redact notes and force fraud escalation', ocr.includes('redactSensitiveText(input.rawNotes') && ocr.includes('1930') && ocr.includes('cybercrime.gov.in') && ocr.includes('upiFraudEscalationNote'))
pass('production env health checks Upstash rate-limit keys', envHealth.includes('UPSTASH_REDIS_REST_URL') && envHealth.includes('UPSTASH_REDIS_REST_TOKEN'))
pass('launch readiness page shows MVP enterprise pillars', exists('lib/launch/mvp-enterprise-readiness.ts') && launchPage.includes('getMvpEnterpriseReadiness') && launchPage.includes('MVP enterprise readiness pillars'))
pass('Playwright smoke covers legal, language, UPI and SEO', e2e.includes('/privacy') && e2e.includes('/language-hub/hindi') && e2e.includes('1930') && e2e.includes('SEO title suffix appears once'))
pass('env, health and service worker are current', env.includes('NEXT_PUBLIC_APP_VERSION="3.0.') && health.includes('3.0.') && sw.includes('haqsathi-ai-v3-0-'))
pass('phase notes exist', exists('PHASE_123_ENTERPRISE_READINESS_FOUNDATION.md'))

console.log('\nPhase 123 enterprise readiness foundation audit')
console.log('Checks: 19')
console.log(`Issues found: ${issues.length}`)
if (issues.length) {
  for (const issue of issues) console.error('❌ ' + issue)
  process.exit(1)
}
console.log('✅ Phase 123 audit passed: enterprise MVP foundations are installed across AI safety, fraud guidance, official schemes, rate limits, OCR, launch readiness and QA tests.\n')
