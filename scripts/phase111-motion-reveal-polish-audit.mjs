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

requireCheck(['3.0.81-motion-reveal-polish', '3.0.82-motion-loading-interactions', '3.0.83-premium-motion-spotlight', '3.0.84-final-stabilization'].includes(pkg.version), 'package version must be 3.0.81-motion-reveal-polish or newer motion-loading release')
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
