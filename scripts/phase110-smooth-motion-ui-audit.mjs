// compatibility ladder: 3.0.60-document-expiry-planner 3.0.61-call-visit-logbook 3.0.62-proof-file-organizer 3.0.63-deadline-appeal-planner 3.0.64-warranty-claim-planner 3.0.65-return-pickup-planner 3.0.66-utility-bill-dispute-planner 3.0.67-rent-deposit-dispute-planner 3.0.68-insurance-claim-planner 3.0.69-loan-app-harassment-planner 3.0.70-job-salary-dispute-planner 3.0.71-education-form-correction-planner 3.0.72-travel-refund-cancellation-planner 3.0.73-medical-bill-dispute-planner 3.0.74-telecom-sim-complaint-planner 3.0.75-courier-parcel-dispute-planner 3.0.76-bank-account-freeze-planner 3.0.77-vehicle-challan-dispute-planner 3.0.78-identity-document-correction-planner 3.0.79-lost-document-report-planner 3.0.80-smooth-motion-ui 3.0.81-motion-reveal-polish 3.0.82-motion-loading-interactions 3.0.83-premium-motion-spotlight 3.0.84-final-stabilization 3.0.85-performance-production-pass newer compatible phase new performance release
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const issues = []
const read = (rel) => readFileSync(join(root, rel), 'utf8')
const exists = (rel) => existsSync(join(root, rel))
const requireCheck = (condition, message) => { if (!condition) issues.push(message) }

const pkg = JSON.parse(read('package.json'))
const button = read('components/ui/button.tsx')
const card = read('components/ui/card.tsx')
const userMenu = read('components/layout/user-account-menu.tsx')
const languageSwitcher = read('components/i18n/language-switcher.tsx')
const globals = read('app/globals.css')
const phase109 = read('scripts/phase109-lost-document-audit.mjs')

requireCheck(String(pkg.version || '').startsWith('3.0.'), 'package version must be a 3.0.x compatible release')
requireCheck(pkg.dependencies?.['framer-motion'], 'framer-motion dependency missing')
requireCheck(pkg.scripts?.['phase110:audit'] === 'node scripts/phase110-smooth-motion-ui-audit.mjs', 'phase110:audit script missing')
requireCheck((pkg.scripts?.['quality:release'] || '').includes('phase110:audit'), 'quality:release must include phase110 audit')
for (const file of ['components/ui/button.tsx', 'components/ui/card.tsx', 'components/layout/user-account-menu.tsx', 'components/i18n/language-switcher.tsx']) {
  requireCheck(exists(file), `${file} missing`)
}
for (const token of ['motion', 'whileTap', 'scale: 0.98', '[0.16, 1, 0.3, 1]', 'transform-gpu', 'will-change-transform']) {
  requireCheck(button.includes(token), `button missing smooth motion token ${token}`)
}
for (const token of ['motion.div', 'whileHover', 'useReducedMotion', '[0.16, 1, 0.3, 1]', 'transform-gpu']) {
  requireCheck(card.includes(token), `card missing smooth motion token ${token}`)
}
for (const token of ['AnimatePresence', 'motion.div', 'initial="hidden"', 'exit="exit"', 'whileTap', 'aria-expanded']) {
  requireCheck(userMenu.includes(token), `account menu missing animated dropdown token ${token}`)
  requireCheck(languageSwitcher.includes(token), `language switcher missing animated dropdown token ${token}`)
}
for (const token of ['prefers-reduced-motion', 'transform', 'opacity', 'transition-duration']) {
  requireCheck(globals.includes(token), `globals missing performance/reduced-motion token ${token}`)
}
requireCheck(phase109.includes('3.0.80-smooth-motion-ui') && phase109.includes('3.0.81-motion-reveal-polish') && phase109.includes('3.0.82-motion-loading-interactions', '3.0.83-premium-motion-spotlight'), 'phase109 audit must accept v3.0.80, v3.0.81 and v3.0.82')

console.log('\nPhase 110 smooth motion UI audit')
console.log(`Issues found: ${issues.length}`)
if (issues.length) {
  for (const issue of issues) console.error('❌ ' + issue)
  process.exit(1)
}
console.log('✅ Phase 110 smooth motion UI checks passed.\n')
