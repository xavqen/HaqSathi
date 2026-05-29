import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const issues = []
const read = (file) => readFileSync(join(root, file), 'utf8')
const exists = (file) => existsSync(join(root, file))
const pkg = JSON.parse(read('package.json'))
const globals = read('app/globals.css')
const navbar = read('components/layout/navbar.tsx')
const switcher = read('components/i18n/language-switcher.tsx')
const bottom = read('components/layout/mobile-bottom-actions.tsx')
const button = read('components/ui/button.tsx')
const card = read('components/ui/card.tsx')

function require(condition, message) {
  if (!condition) issues.push(message)
}

require(/3\.0\.(12|1[3-9]|[2-9][0-9])/.test(pkg.version), 'package version must be v3.0.12+ responsive architecture')
require(pkg.scripts['phase42:audit'] === 'node scripts/phase42-responsive-architecture-audit.mjs', 'phase42:audit script missing')
require((pkg.scripts['quality:release'] || '').includes('phase42:audit'), 'quality:release must include phase42 audit')
require(globals.includes('overflow-x: clip') && globals.includes('overflow-x: hidden'), 'global CSS must harden horizontal overflow on html/body')
require(globals.includes('min-height: 100dvh'), 'body must use dynamic viewport height for mobile browser chrome')
require(globals.includes('--bottom-nav-height') && globals.includes('env(safe-area-inset-bottom)'), 'mobile bottom spacing must be safe-area aware')
require(globals.includes('@media (max-width: 380px)') && globals.includes('.nav-cta-text'), 'extra-small devices must get compact navbar rules')
require(globals.includes('responsive-grid-auto') && globals.includes('repeat(auto-fit'), 'responsive auto-fit grid helper missing')
require(globals.includes('responsive-action-row') && globals.includes('flex-wrap'), 'responsive action row helper missing')
require(globals.includes(':where(table)') && globals.includes('white-space: nowrap'), 'wide tables must be scroll-safe')
require(navbar.includes('nav-brand-wordmark') && navbar.includes('compact-mobile-action') && navbar.includes('nav-cta-text'), 'navbar must use compact extra-small responsive classes')
require(navbar.includes('w-full max-w-full') && navbar.includes('shrink-0') && navbar.includes('min-w-0'), 'navbar must protect against flex overflow')
require(switcher.includes('min-w-10') && switcher.includes('hs-language-popover'), 'language switcher must be touch-safe and viewport-safe')
require(bottom.includes('w-full') && bottom.includes('fixed inset-x-0 bottom-0') && bottom.includes('grid-cols-5'), 'mobile bottom nav must stay viewport-contained')
require(button.includes('min-h-11') && button.includes('whitespace-normal') && button.includes('sm:whitespace-nowrap'), 'buttons must remain touch-friendly and wrap on mobile')
require(card.includes('max-w-full') && card.includes('rounded-[1.35rem]') && card.includes('sm:rounded-2xl'), 'cards must use mobile-first rounded responsive layout')
require(exists('PHASE_42_RESPONSIVE_ARCHITECTURE.md'), 'Phase 42 responsive architecture notes missing')

console.log('\nHaqSathi Phase 42 responsive architecture audit')
console.log('Checks: 17')
console.log(`Issues found: ${issues.length}`)
if (issues.length) {
  for (const issue of issues) console.error('❌ ' + issue)
  process.exit(1)
}
console.log('✅ Phase 42 audit passed: mobile/tablet/desktop overflow, navbar, touch targets, grids and safe-area layout are hardened.\n')
