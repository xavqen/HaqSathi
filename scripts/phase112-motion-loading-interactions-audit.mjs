// compatibility ladder: 3.0.60-document-expiry-planner 3.0.61-call-visit-logbook 3.0.62-proof-file-organizer 3.0.63-deadline-appeal-planner 3.0.64-warranty-claim-planner 3.0.65-return-pickup-planner 3.0.66-utility-bill-dispute-planner 3.0.67-rent-deposit-dispute-planner 3.0.68-insurance-claim-planner 3.0.69-loan-app-harassment-planner 3.0.70-job-salary-dispute-planner 3.0.71-education-form-correction-planner 3.0.72-travel-refund-cancellation-planner 3.0.73-medical-bill-dispute-planner 3.0.74-telecom-sim-complaint-planner 3.0.75-courier-parcel-dispute-planner 3.0.76-bank-account-freeze-planner 3.0.77-vehicle-challan-dispute-planner 3.0.78-identity-document-correction-planner 3.0.79-lost-document-report-planner 3.0.80-smooth-motion-ui 3.0.81-motion-reveal-polish 3.0.82-motion-loading-interactions 3.0.83-premium-motion-spotlight 3.0.84-final-stabilization 3.0.85-performance-production-pass newer compatible phase new performance release
import { existsSync, readFileSync } from 'node:fs'

const checks = [
  ['components/layout/page-transition.tsx', 'PageTransition'],
  ['components/layout/route-progress.tsx', 'RouteProgress'],
  ['app/template.tsx', 'PageTransition'],
  ['app/loading.tsx', 'LoadingCardSkeleton'],
  ['components/ui/skeleton.tsx', 'skeleton-shimmer'],
  ['components/tools/tool-grid.tsx', 'AnimatePresence'],
  ['components/ui/input.tsx', 'premium-form-control'],
  ['components/ui/select.tsx', 'premium-form-control'],
  ['components/ui/textarea.tsx', 'premium-form-control'],
  ['app/globals.css', 'Phase 112']
]

const issues = []
for (const [file, token] of checks) {
  if (!existsSync(file)) issues.push(`Missing file: ${file}`)
  else if (!readFileSync(file, 'utf8').includes(token)) issues.push(`Missing ${token} in ${file}`)
}

const pkg = JSON.parse(readFileSync('package.json', 'utf8'))
if (!String(pkg.version || '').startsWith('3.0.')) issues.push('package version must be a 3.0.x compatible release')
if (!pkg.scripts?.['phase112:audit']) issues.push('phase112:audit script missing')
if (!pkg.scripts?.['quality:release']?.includes('phase112:audit')) issues.push('quality:release does not include phase112:audit')
if (!pkg.dependencies?.['framer-motion']) issues.push('framer-motion dependency missing')

if (issues.length) {
  console.error('Phase 112 motion/loading/interactions audit failed:')
  for (const issue of issues) console.error(`- ${issue}`)
  process.exit(1)
}

console.log('✅ Phase 112 audit passed: route transitions, progress bar, skeleton loading, animated tool grid and premium form controls are wired.')
