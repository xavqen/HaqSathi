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

requireCheck(['3.0.80-smooth-motion-ui', '3.0.81-motion-reveal-polish', '3.0.82-motion-loading-interactions', '3.0.83-premium-motion-spotlight', '3.0.84-final-stabilization'].includes(pkg.version), 'package version must be 3.0.80-smooth-motion-ui or 3.0.81-motion-reveal-polish')
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
