import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const issues = []

function read(rel) {
  const file = path.join(root, rel)
  if (!fs.existsSync(file)) {
    issues.push(`Missing ${rel}`)
    return ''
  }
  return fs.readFileSync(file, 'utf8')
}

const checks = [
  ['package.json', 'phase38:audit'],
  ['lib/rate-limit.ts', 'UPSTASH_REDIS_REST_URL'],
  ['lib/rate-limit.ts', 'rateLimitAsync'],
  ['lib/security/csrf.ts', 'verifySameOrigin'],
  ['next.config.ts', 'Strict-Transport-Security'],
  ['prisma/schema.prisma', 'model EmailVerificationToken'],
  ['app/api/auth/email-verification/request/route.ts', 'createEmailVerificationToken'],
  ['app/api/auth/email-verification/confirm/route.ts', 'consumeEmailVerificationToken'],
  ['lib/email/service.ts', 'verificationEmailHtml'],
  ['app/api/billing/webhook/route.ts', 'payment.failed'],
  ['app/api/billing/webhook/route.ts', 'activateSubscriptionForOrder'],
  ['lib/storage/supabase-storage.ts', 'checkVaultStorageHealth'],
  ['app/api/document-vault/self-test/route.ts', 'requireAdmin'],
  ['lib/tools/phase26-ocr-autofill.ts', 'qualityHints'],
  ['lib/tools/phase26-ocr-autofill.ts', 'maskSensitive'],
  ['lib/authority/seed-authorities.ts', 'National Scholarship Portal'],
  ['lib/official-sources/seed-official-sources.ts', 'npci-upi-complaint'],
  ['playwright.config.ts', 'mobile-chromium'],
  ['tests/e2e/public-smoke.spec.ts', 'horizontal overflow'],
  ['scripts/lighthouse-local-audit.mjs', 'LIGHTHOUSE_BASE_URL'],
  ['.env.example', 'UPSTASH_REDIS_REST_URL'],
  ['.env.example', 'EMAIL_VERIFICATION_DEV_LINKS']
]

for (const [rel, marker] of checks) {
  const text = read(rel)
  if (text && !text.includes(marker)) issues.push(`${rel} missing marker: ${marker}`)
}

const schema = read('prisma/schema.prisma')
if (!schema.includes('emailVerificationTokens EmailVerificationToken[]')) issues.push('User model missing emailVerificationTokens relation')

const pkg = JSON.parse(read('package.json') || '{}')
for (const scriptName of ['phase38:audit', 'quality:release', 'test:e2e', 'lighthouse:local']) {
  if (!pkg.scripts?.[scriptName]) issues.push(`package.json missing script ${scriptName}`)
}

console.log('\nHaqSathi Phase 38 launch-gap hardening audit')
console.log(`Checks: ${checks.length}`)
console.log(`Issues found: ${issues.length}`)
if (issues.length) {
  console.log(issues.map((issue) => `❌ ${issue}`).join('\n'))
  process.exit(1)
}
console.log('✅ Phase 38 audit passed: email verification, Upstash-ready rate limits, CSRF origin checks, storage self-test, payment lifecycle webhook, OCR hardening, official data seeds, Playwright smoke tests and Lighthouse runner are installed.')
