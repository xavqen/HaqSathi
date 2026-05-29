import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const issues = []
const read = (file) => readFileSync(join(root, file), 'utf8')
const exists = (file) => existsSync(join(root, file))
const pkg = JSON.parse(read('package.json'))

function require(condition, message) {
  if (!condition) issues.push(message)
}

const globals = read('app/globals.css')
const layout = read('app/layout.tsx')
const button = read('components/ui/button.tsx')
const card = read('components/ui/card.tsx')
const cookie = read('components/layout/cookie-consent.tsx')
const navbar = read('components/layout/navbar.tsx')
const bottom = read('components/layout/mobile-bottom-actions.tsx')
const dashboard = read('components/dashboard/dashboard-shell.tsx')
const admin = read('components/admin/admin-shell.tsx')

require(/3\.0\.(11|1[2-9])/.test(pkg.version), 'package version should be v3.0.11+ device UI hardening')
require(pkg.scripts['phase41:audit'] === 'node scripts/phase41-device-ui-audit.mjs', 'phase41:audit script missing')
require((pkg.scripts['quality:release'] || '').includes('phase41:audit'), 'quality:release must include phase41 audit')
require(layout.includes('skip-link') && layout.includes('id="main-content"') && layout.includes('tabIndex={-1}'), 'layout must include keyboard skip link and main content anchor')
require(globals.includes('.skip-link') && globals.includes('transform: translateY(-160%)'), 'globals must include hidden/focusable skip-link styles')
require(globals.includes(':where(table)') && globals.includes('overflow-x: auto') && globals.includes('-webkit-overflow-scrolling: touch'), 'globals must make wide tables horizontally scrollable on phones')
require(globals.includes(':where(main a.inline-flex, main button.inline-flex) { width: 100%; }'), 'globals must make main CTA buttons full-width on small screens')
require(globals.includes(':where(.grid, .flex) > * { min-width: 0; }'), 'globals must prevent grid/flex child overflow')
require(button.includes('whitespace-normal') && button.includes('sm:whitespace-nowrap') && button.includes('min-h-11'), 'Button must wrap long labels on mobile and keep touch-safe height')
require(card.includes('p-4 sm:p-6') && card.includes('min-w-0'), 'Card padding/min-width must be responsive')
require(cookie.includes('bottom-[calc(86px+env(safe-area-inset-bottom))]') && cookie.includes('md:bottom-4'), 'Cookie consent must not cover mobile bottom nav')
require(navbar.includes('max-w-[52vw]') && navbar.includes('xl:flex') && navbar.includes('mobile-header-scroll'), 'Navbar must keep desktop links compact and mobile links scrollable')
require(bottom.includes('fixed inset-x-0 bottom-0') && bottom.includes('grid-cols-5') && bottom.includes('env(safe-area-inset-bottom)'), 'Mobile bottom nav must be fixed, 5-column and safe-area aware')
require(dashboard.includes('md:grid-cols-[240px_minmax(0,1fr)]') && dashboard.includes('md:hidden') && dashboard.includes('no-scrollbar'), 'Dashboard shell must use desktop sidebar and mobile scroll chips')
require(admin.includes('lg:grid-cols-[280px_minmax(0,1fr)]') && admin.includes('lg:hidden') && admin.includes('no-scrollbar'), 'Admin shell must use desktop sidebar and mobile scroll chips')
require(exists('PHASE_41_DEVICE_UI_HARDENING.md'), 'Phase 41 device UI notes missing')

console.log('\nHaqSathi Phase 41 device UI hardening audit')
console.log('Checks: 16')
console.log(`Issues found: ${issues.length}`)
if (issues.length) {
  for (const issue of issues) console.error('❌ ' + issue)
  process.exit(1)
}
console.log('✅ Phase 41 audit passed: responsive buttons/cards, skip link, safe cookie banner, overflow-safe content, mobile bottom nav and desktop shells are hardened.\n')
