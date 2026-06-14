// compatibility ladder: 3.0.60-document-expiry-planner 3.0.61-call-visit-logbook 3.0.62-proof-file-organizer 3.0.63-deadline-appeal-planner 3.0.64-warranty-claim-planner 3.0.65-return-pickup-planner 3.0.66-utility-bill-dispute-planner 3.0.67-rent-deposit-dispute-planner 3.0.68-insurance-claim-planner 3.0.69-loan-app-harassment-planner 3.0.70-job-salary-dispute-planner 3.0.71-education-form-correction-planner 3.0.72-travel-refund-cancellation-planner 3.0.73-medical-bill-dispute-planner 3.0.74-telecom-sim-complaint-planner 3.0.75-courier-parcel-dispute-planner 3.0.76-bank-account-freeze-planner 3.0.77-vehicle-challan-dispute-planner 3.0.78-identity-document-correction-planner 3.0.79-lost-document-report-planner 3.0.80-smooth-motion-ui 3.0.81-motion-reveal-polish 3.0.82-motion-loading-interactions 3.0.83-premium-motion-spotlight 3.0.84-final-stabilization 3.0.85-performance-production-pass newer compatible phase new performance release
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const issues = []
const read = (rel) => readFileSync(join(root, rel), 'utf8')
const exists = (rel) => existsSync(join(root, rel))
const requireCheck = (condition, message) => { if (!condition) issues.push(message) }

const pkg = JSON.parse(read('package.json'))
const primitives = read('components/ui/motion-primitives.tsx')
const home = read('app/page.tsx')
const globals = read('app/globals.css')
const phase110 = read('scripts/phase110-smooth-motion-ui-audit.mjs')

requireCheck(String(pkg.version || '').startsWith('3.0.'), 'package version must be a 3.0.x compatible release')
requireCheck(pkg.scripts?.['phase111:audit'] === 'node scripts/phase111-motion-reveal-polish-audit.mjs', 'phase111:audit script missing')
requireCheck((pkg.scripts?.['quality:release'] || '').includes('phase111:audit'), 'quality:release must include phase111 audit')
requireCheck(exists('components/ui/motion-primitives.tsx'), 'motion primitives component missing')

for (const token of ['premiumEase', '[0.16, 1, 0.3, 1]', 'MotionLink', 'FadeIn', 'MotionSurface', 'StaggerContainer', 'StaggerItem', 'whileTap', 'scale: 0.98', 'whileInView', 'viewport', 'useReducedMotion']) {
  requireCheck(primitives.includes(token), `motion primitives missing ${token}`)
}
for (const token of ['MotionLink', 'FadeIn', 'MotionSurface', 'StaggerContainer', 'StaggerItem', '@/components/ui/motion-primitives']) {
  requireCheck(home.includes(token), `home page missing motion token ${token}`)
}
for (const token of ['motion-safe-transform', 'motion-premium-fade', 'backface-visibility', 'cubic-bezier(0.16, 1, 0.3, 1)', 'prefers-reduced-motion']) {
  requireCheck(globals.includes(token), `globals missing motion polish token ${token}`)
}
requireCheck(phase110.includes('3.0.81-motion-reveal-polish') && phase110.includes('3.0.82-motion-loading-interactions', '3.0.83-premium-motion-spotlight'), 'phase110 audit must accept v3.0.81 and v3.0.82')

console.log('\nPhase 111 motion reveal polish audit')
console.log(`Issues found: ${issues.length}`)
if (issues.length) {
  for (const issue of issues) console.error('❌ ' + issue)
  process.exit(1)
}
console.log('✅ Phase 111 motion reveal polish checks passed.\n')
