// compatibility ladder: 3.0.60-document-expiry-planner 3.0.61-call-visit-logbook 3.0.62-proof-file-organizer 3.0.63-deadline-appeal-planner 3.0.64-warranty-claim-planner 3.0.65-return-pickup-planner 3.0.66-utility-bill-dispute-planner 3.0.67-rent-deposit-dispute-planner 3.0.68-insurance-claim-planner 3.0.69-loan-app-harassment-planner 3.0.70-job-salary-dispute-planner 3.0.71-education-form-correction-planner 3.0.72-travel-refund-cancellation-planner 3.0.73-medical-bill-dispute-planner 3.0.74-telecom-sim-complaint-planner 3.0.75-courier-parcel-dispute-planner 3.0.76-bank-account-freeze-planner 3.0.77-vehicle-challan-dispute-planner 3.0.78-identity-document-correction-planner 3.0.79-lost-document-report-planner 3.0.80-smooth-motion-ui 3.0.81-motion-reveal-polish 3.0.82-motion-loading-interactions 3.0.83-premium-motion-spotlight 3.0.84-final-stabilization 3.0.85-performance-production-pass newer compatible phase new performance release
import { existsSync, readFileSync } from 'node:fs'

const checks = []
const mustInclude = (file, text, label) => {
  const content = readFileSync(file, 'utf8')
  checks.push({ label, ok: content.includes(text) })
}
const mustNotInclude = (file, text, label) => {
  const content = readFileSync(file, 'utf8')
  checks.push({ label, ok: !content.includes(text) })
}

mustInclude('app/layout.tsx', 'DeferredClientRuntime', 'non-critical runtime is deferred')
mustInclude('app/layout.tsx', "next/font/google", 'next/font is used for layout-stable fonts')
mustNotInclude('app/layout.tsx', "cookies", 'root layout does not read cookies')
mustNotInclude('app/layout.tsx', "getCurrentUser", 'root layout does not query user/session')
mustInclude('components/layout/navbar.tsx', 'AuthNavClient', 'auth nav is client-fetched outside SSR shell')
mustInclude('app/api/auth/me/route.ts', 'Cache-Control', 'session API is no-store')
mustNotInclude('components/ui/card.tsx', "from 'framer-motion'", 'Card does not import framer-motion with single quotes')
mustNotInclude('components/ui/card.tsx', 'from "framer-motion"', 'Card does not import framer-motion with double quotes')
mustNotInclude('components/ui/button.tsx', "from 'framer-motion'", 'Button does not import framer-motion with single quotes')
mustNotInclude('components/ui/button.tsx', 'from "framer-motion"', 'Button does not import framer-motion with double quotes')
mustInclude('app/page.tsx', 'force-static', 'homepage is static')
mustInclude('app/page.tsx', 'revalidate = 86400', 'homepage has ISR safety')
mustInclude('app/pricing/page.tsx', 'force-static', 'pricing page is static')
mustInclude('app/blog/page.tsx', 'select:', 'blog query selects only needed fields')
mustInclude('next.config.ts', 'optimizePackageImports', 'package import optimization is enabled')
mustInclude('app/globals.css', 'content-visibility: auto', 'below-fold sections use content-visibility')

for (const file of [
  'components/layout/deferred-client-runtime.tsx',
  'components/layout/auth-nav-client.tsx',
  'app/api/auth/me/route.ts'
]) {
  checks.push({ label: `${file} exists`, ok: existsSync(file) })
}

const failed = checks.filter((check) => !check.ok)
console.log('\nPhase 115 performance production audit')
for (const check of checks) console.log(`${check.ok ? '✅' : '❌'} ${check.label}`)
if (failed.length) {
  console.error(`\n${failed.length} Phase 115 checks failed.`)
  process.exit(1)
}
console.log('\n✅ Phase 115 passed: static shell, deferred runtime, lighter base UI components and production performance guards are in place.\n')
