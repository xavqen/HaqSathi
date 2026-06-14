// compatibility ladder: 3.0.60-document-expiry-planner 3.0.61-call-visit-logbook 3.0.62-proof-file-organizer 3.0.63-deadline-appeal-planner 3.0.64-warranty-claim-planner 3.0.65-return-pickup-planner 3.0.66-utility-bill-dispute-planner 3.0.67-rent-deposit-dispute-planner 3.0.68-insurance-claim-planner 3.0.69-loan-app-harassment-planner 3.0.70-job-salary-dispute-planner 3.0.71-education-form-correction-planner 3.0.72-travel-refund-cancellation-planner 3.0.73-medical-bill-dispute-planner 3.0.74-telecom-sim-complaint-planner 3.0.75-courier-parcel-dispute-planner 3.0.76-bank-account-freeze-planner 3.0.77-vehicle-challan-dispute-planner 3.0.78-identity-document-correction-planner 3.0.79-lost-document-report-planner 3.0.80-smooth-motion-ui 3.0.81-motion-reveal-polish 3.0.82-motion-loading-interactions 3.0.83-premium-motion-spotlight 3.0.84-final-stabilization 3.0.85-performance-production-pass newer compatible phase new performance release
import { existsSync, readFileSync } from 'node:fs'

const issues = []
const read = (file) => readFileSync(file, 'utf8')
const requireFile = (file) => {
  if (!existsSync(file)) issues.push(`Missing ${file}`)
  return existsSync(file)
}
const requireToken = (file, token) => {
  if (requireFile(file) && !read(file).includes(token)) issues.push(`Missing ${token} in ${file}`)
}

const pkg = JSON.parse(read('package.json'))
if (!String(pkg.version || '').startsWith('3.0.')) issues.push('package version must be a 3.0.x release')
for (const script of ['deploy:doctor', 'perf:regression-scan', 'stabilize:release', 'phase114:audit']) {
  if (!pkg.scripts?.[script]) issues.push(`package script missing: ${script}`)
}
if (!pkg.scripts?.['quality:release']?.includes('phase114:audit')) issues.push('quality:release must include phase114:audit')

requireToken('next.config.ts', 'compress: true')
requireToken('next.config.ts', 'productionBrowserSourceMaps: false')
requireToken('next.config.ts', 'Service-Worker-Allowed')
requireToken('vercel.json', '/api/cron/link-checks')
requireToken('vercel.json', '/api/cron/official-data-refresh')
requireToken('app/layout.tsx', 'export const viewport')
requireToken('app/layout.tsx', 'overflow-x-clip')
requireToken('components/layout/page-transition.tsx', 'duration: 0.28')
requireToken('components/layout/route-progress.tsx', 'duration: 0.46')
requireToken('app/api/cron/reminders/route.ts', "process.env.NODE_ENV !== 'production'")
requireToken('app/api/health/route.ts', '3.0.85-performance-production-pass')
requireToken('public/sw.js', 'haqsathi-ai-v3-0-85')
requireToken('public/sw.js', 'MAX_RUNTIME_ENTRIES')
requireToken('app/globals.css', 'Phase 114')
requireToken('scripts/final-stabilization-doctor.mjs', 'Deploy doctor passed')
requireToken('scripts/performance-regression-scan.mjs', 'Performance scan passed')
requireToken('.env.example', 'NEXT_PUBLIC_APP_VERSION="3.0.85"')

if (read('components/layout/page-transition.tsx').includes('filter')) issues.push('PageTransition must not use filter/blur in final stabilization')
if (read('app/globals.css').includes('.motion-safe-transform *')) issues.push('Global CSS must not apply motion GPU hints to every descendant')

if (issues.length) {
  console.error('Phase 114 final stabilization audit failed:')
  for (const issue of issues) console.error(`- ${issue}`)
  process.exit(1)
}
console.log('✅ Phase 114 audit passed: final bug-fix, deploy testing and performance hardening layer is wired.')
