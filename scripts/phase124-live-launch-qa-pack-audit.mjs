import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const issues = []
const exists = (file) => existsSync(join(root, file))
const read = (file) => readFileSync(join(root, file), 'utf8')
const pkg = JSON.parse(read('package.json'))
const env = read('.env.example')
const health = read('app/api/health/route.ts')
const sw = read('public/sw.js')
const launchPage = read('app/launch-readiness/page.tsx')
const finalMatrix = read('lib/launch/final-qa-matrix.ts')
const liveQa = read('scripts/live-launch-qa.mjs')
const paymentStorage = read('scripts/payment-storage-live-check.mjs')
const lighthouseBatch = read('scripts/lighthouse-batch.mjs')
const e2e = read('tests/e2e/public-smoke.spec.ts')

function pass(name, condition) {
  if (!condition) issues.push(name)
}

pass('version is a compatible 3.0 release', String(pkg.version || '').startsWith('3.0.'))
pass('phase124 audit script is registered', pkg.scripts['phase124:audit'] === 'node scripts/phase124-live-launch-qa-pack-audit.mjs')
pass('quality release includes phase124', pkg.scripts['quality:release'].includes('phase124:audit'))
pass('launch QA scripts are registered', pkg.scripts['launch:qa'] === 'node scripts/live-launch-qa.mjs' && pkg.scripts['launch:payment-storage-check'] === 'node scripts/payment-storage-live-check.mjs' && pkg.scripts['lighthouse:batch'] === 'node scripts/lighthouse-batch.mjs')
pass('final QA matrix installed', exists('lib/launch/final-qa-matrix.ts') && finalMatrix.includes('LAUNCH_QA_BASE_URL=https://haqsathi.site npm run launch:qa') && finalMatrix.includes('npm run launch:payment-storage-check') && finalMatrix.includes('npm run lighthouse:batch'))
pass('launch readiness page renders final QA proof checklist', launchPage.includes('getFinalQaMatrix') && launchPage.includes('Production proof checklist') && launchPage.includes('failureRisk'))
pass('live launch QA checks public routes, title duplication, fraud blocks and prompt leaks', liveQa.includes('/tools/scam-radar') && liveQa.includes('HaqSathi AI exactly once') && liveQa.includes('Respond primarily') && liveQa.includes('1930') && liveQa.includes('cybercrime.gov.in') && liveQa.includes('live-launch-qa-report.json'))
pass('payment and storage live check validates Razorpay, Supabase, DB and Upstash env', paymentStorage.includes('RAZORPAY_KEY_ID') && paymentStorage.includes('NEXT_PUBLIC_RAZORPAY_KEY_ID') && paymentStorage.includes('SUPABASE_SERVICE_ROLE_KEY') && paymentStorage.includes('DATABASE_URL') && paymentStorage.includes('UPSTASH_REDIS_REST_TOKEN') && paymentStorage.includes('payment-storage-readiness.json'))
pass('lighthouse batch supports multiple routes and desktop/mobile modes', lighthouseBatch.includes('LIGHTHOUSE_ROUTES') && lighthouseBatch.includes('mobile,desktop') && lighthouseBatch.includes('/,/tools,/complaint,/upi-help,/pricing'))
pass('Playwright smoke includes public polish regressions', e2e.includes('Pricing page does not leak dev billing copy') && e2e.includes('homepage does not SSR 0+ Tools') && e2e.includes('/tools/scam-radar') && e2e.includes('/tools/smart-complaint-wizard'))
pass('env exposes launch QA knobs', env.includes('LAUNCH_QA_BASE_URL') && env.includes('LIGHTHOUSE_ROUTES') && env.includes('RUN_LIVE_STORAGE_CHECK') && env.includes('RUN_RAZORPAY_ACCOUNT_CHECK'))
pass('env, health and service worker are current', env.includes('NEXT_PUBLIC_APP_VERSION="3.0.') && health.includes('3.0.') && sw.includes('haqsathi-ai-v3-0-'))
pass('phase notes exist', exists('PHASE_124_LIVE_LAUNCH_QA_PACK.md'))

console.log('\nPhase 124 live launch QA pack audit')
console.log('Checks: 13')
console.log(`Issues found: ${issues.length}`)
if (issues.length) {
  for (const issue of issues) console.error('❌ ' + issue)
  process.exit(1)
}
console.log('✅ Phase 124 audit passed: live launch QA scripts, payment/storage checks, Lighthouse batch, Playwright regressions and proof checklist are wired.\n')
