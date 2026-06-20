import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const issues = []
const read = (file) => readFileSync(join(root, file), 'utf8')
const exists = (file) => existsSync(join(root, file))
const pkg = JSON.parse(read('package.json'))
const env = read('.env.example')
const forgotRoute = read('app/api/auth/forgot-password/route.ts')
const forgotPage = read('app/forgot-password/page.tsx')
const billingPage = read('app/dashboard/billing/page.tsx')
const seed = read('prisma/seed.ts')
const deepScan = read('scripts/deep-project-code-scan.mjs')
const finalMatrix = read('lib/launch/final-qa-matrix.ts')
const evidenceGate = read('scripts/launch-evidence-gate.mjs')
const artifactManifest = read('scripts/launch-artifact-manifest.mjs')
const health = read('app/api/health/route.ts')
const ready = read('app/api/ready/route.ts')
const sw = read('public/sw.js')

function pass(name, condition) {
  if (!condition) issues.push(name)
}

pass('version is v3.0.101 or newer', /^3\.0\.(10[1-9]|1[1-9]\d|[2-9]\d\d)(?:-|$)/.test(pkg.version))
pass('scan:deep script is registered', pkg.scripts['scan:deep'] === 'node scripts/deep-project-code-scan.mjs')
pass('scan:complete script runs full and deep scans', String(pkg.scripts['scan:complete'] || '').includes('scan:full') && String(pkg.scripts['scan:complete'] || '').includes('scan:deep'))
pass('phase131 audit script is registered', pkg.scripts['phase131:audit'] === 'node scripts/phase131-deep-code-scan-hardening-audit.mjs')
pass('quality release includes phase131', pkg.scripts['quality:release'].includes('phase131:audit'))
pass('password reset dev link is non-production and explicit opt-in only', forgotRoute.includes("process.env.NODE_ENV !== 'production'") && forgotRoute.includes("process.env.PASSWORD_RESET_DEV_LINKS === 'true'") && !forgotRoute.includes("PASSWORD_RESET_DEV_LINKS !== 'false'"))
pass('email verification dev links are non-production and explicit opt-in only', read('app/api/auth/register/route.ts').includes("process.env.NODE_ENV !== 'production'") && read('app/api/auth/register/route.ts').includes("process.env.EMAIL_VERIFICATION_DEV_LINKS === 'true'") && read('app/api/auth/email-verification/request/route.ts').includes("process.env.NODE_ENV !== 'production'") && read('app/api/auth/email-verification/request/route.ts').includes("process.env.EMAIL_VERIFICATION_DEV_LINKS === 'true'"))
pass('forgot password page hides local dev reset copy in production', forgotPage.includes('cardDescription') && forgotPage.includes("process.env.NODE_ENV !== 'production'") && !forgotPage.includes('the reset link appears on screen'))
pass('billing dry-run copy is production gated', billingPage.includes('showDevCheckoutNotice') && billingPage.includes("process.env.NODE_ENV !== 'production'") && billingPage.includes('Payments are processed securely through Razorpay'))
pass('seed script no longer prints admin/demo passwords', !/console\.log\([^\n]*(adminPassword|Demo@123456)/.test(seed) && !seed.includes("' + adminPassword"))
pass('env defaults password/email dev links to false', env.includes('PASSWORD_RESET_DEV_LINKS="false"') && env.includes('EMAIL_VERIFICATION_DEV_LINKS="false"'))
pass('deep scanner checks public debug leaks and reset safety', deepScan.includes('checkPasswordResetSafety') && deepScan.includes('checkProductionDebugCopy') && deepScan.includes('checkSeedSecretLogging') && deepScan.includes('checkClientEnvBoundaries') && deepScan.includes('checkMetadataTitleSuffix'))
pass('final QA matrix includes deep code scan evidence', finalMatrix.includes('deep-project-code-scan') && finalMatrix.includes('npm run scan:complete'))
pass('production gate starts with complete code scan', pkg.scripts['launch:production-gate'].startsWith('npm run scan:complete &&'))
pass('evidence gate requires full and deep scan artifacts', evidenceGate.includes('full-project-code-scan.json') && evidenceGate.includes('deep-project-code-scan.json') && evidenceGate.includes('full-code-scan-artifact') && evidenceGate.includes('deep-code-scan-artifact'))
pass('artifact manifest hashes full and deep scan artifacts', artifactManifest.includes('full-project-code-scan.json') && artifactManifest.includes('deep-project-code-scan.json') && artifactManifest.includes('codeScanDir'))
pass('env health ready and service worker current', env.includes('NEXT_PUBLIC_APP_VERSION="3.0.') && health.includes('3.0.') && ready.includes('3.0.') && sw.includes('haqsathi-ai-v3-0-'))
pass('phase notes exist', exists('PHASE_131_DEEP_CODE_SCAN_HARDENING.md'))

console.log('\nPhase 131 deep code scan hardening audit')
console.log('Checks: 18')
console.log(`Issues found: ${issues.length}`)
if (issues.length) {
  for (const issue of issues) console.error('❌ ' + issue)
  process.exit(1)
}
console.log('✅ Phase 131 audit passed: deep scan, production reset safety, user-facing dev-copy gating and seed-log redaction are enforced.\n')
