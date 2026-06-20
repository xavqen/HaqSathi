import { readFileSync } from 'node:fs'

function read(path) {
  return readFileSync(path, 'utf8')
}

function pass(label, ok) {
  if (!ok) {
    console.error(`❌ ${label}`)
    process.exitCode = 1
    return
  }
  console.log(`✅ ${label}`)
}

const pkg = JSON.parse(read('package.json'))
const pricing = read('app/pricing/page.tsx')
const constants = read('lib/constants.ts')
const privacy = read('app/privacy/page.tsx')
const terms = read('app/terms/page.tsx')
const disclaimer = read('app/disclaimer/page.tsx')
const about = read('app/about/page.tsx')
const upi = read('app/upi-help/page.tsx')
const scam = read('app/tools/scam-radar/page.tsx')
const wizard = read('app/tools/smart-complaint-wizard/page.tsx')
const languagePage = read('app/language-hub/[code]/page.tsx')
const languageCopy = read('lib/content/language-hub-copy.ts')
const languageInstructions = read('lib/ai/language-instructions.ts')
const languages = read('lib/i18n/languages.ts')
const complaint = read('components/forms/complaint-generator.tsx')
const status = read('app/status/page.tsx')
const home = read('app/page.tsx')
const footer = read('components/layout/footer.tsx')
const sw = read('public/sw.js')
const env = read('.env.example')
const health = read('app/api/health/route.ts')

console.log('\nPhase 122 public content + SEO fixpack audit')
pass('version is a compatible 3.0 release', String(pkg.version || '').startsWith('3.0.'))
pass('phase122 audit script is registered', pkg.scripts['phase122:audit'] === 'node scripts/phase122-public-content-seo-fixpack-audit.mjs')
pass('quality release includes phase122', pkg.scripts['quality:release']?.includes('phase122:audit'))
pass('pricing hides raw Razorpay debug text in production', pricing.includes('showDevCheckoutNotice') && !pricing.includes('set RAZORPAY_KEY_ID') && constants.includes('Shared family document vault'))
pass('legal pages are long-form with real contact wiring', privacy.includes('Digital Personal Data Protection Act') && privacy.includes('Grievance Officer') && terms.includes('Terms of Service') && terms.includes('LEGAL_JURISDICTION') && disclaimer.includes('FraudEscalationAlert'))
pass('support email is visible in footer/legal contact module', footer.includes('Support:') && footer.includes('SUPPORT_EMAIL') && read('lib/content/site-contact.ts').includes('support@haqsathi.site'))
pass('language hub no longer renders AI instruction text', languagePage.includes('getLanguageHubCopy') && !languagePage.includes('buildLanguageInstruction') && languageCopy.includes('HINDI') && languageInstructions.includes('server-only') && !languages.includes('buildLanguageInstruction'))
pass('fraud escalation block surfaces official channels on UPI, Scam Radar and Smart Wizard', upi.includes('FraudEscalationAlert') && scam.includes('FraudEscalationAlert') && wizard.includes('FraudEscalationAlert') && read('components/content/fraud-escalation-alert.tsx').includes('1930') && read('components/content/fraud-escalation-alert.tsx').includes('cybercrime.gov.in'))
pass('about page has launch-ready story and contact copy', about.includes('Why we built this') && about.includes('Built for India') && about.includes('SUPPORT_EMAIL'))
pass('voice input is hidden from complaint page until enabled', complaint.includes('VOICE_INPUT_ENABLED = false') && complaint.includes('VOICE_INPUT_ENABLED ? <VoiceInputAssist'))
pass('status copy is user-facing and includes fraud escalation', status.includes('AI Assistant') && status.includes('Database') && status.includes('FraudEscalationAlert') && !status.includes('Fallback-ready') && !status.includes('Prisma-ready'))
pass('homepage tool count uses catalog length instead of stale hardcode', home.includes('publicTools') && home.includes('publicToolCount') && !home.includes('value={38}'))
pass('public route metadata no longer self-appends HaqSathi AI suffixes', !read('app/tools/page.tsx').includes('| HaqSathi AI') && !read('app/search/page.tsx').includes('- HaqSathi AI') && !read('app/language-hub/page.tsx').includes('| HaqSathi AI') && !languagePage.includes('| HaqSathi AI'))
pass('env, health and service worker are current', env.includes('NEXT_PUBLIC_APP_VERSION="3.0.') && health.includes('3.0.') && sw.includes('haqsathi-ai-v3-0-'))

if (process.exitCode) {
  console.error('\nPhase 122 failed: fix the public content/SEO checks above.')
} else {
  console.log('\n✅ Phase 122 passed: launch-facing content, SEO titles, fraud guidance and status polish are ready for this fixpack.')
}
