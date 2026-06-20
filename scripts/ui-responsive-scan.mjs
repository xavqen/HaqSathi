import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const root = process.cwd()
const issues = []

function walk(dir, out = []) {
  if (!existsSync(dir)) return out
  for (const name of readdirSync(dir)) {
    if (['node_modules', '.next', '.git'].includes(name)) continue
    const full = join(dir, name)
    const stat = statSync(full)
    if (stat.isDirectory()) walk(full, out)
    else out.push(full)
  }
  return out
}

function rel(file) { return relative(root, file).replaceAll('\\', '/') }

const files = walk(root).filter((f) => /\.(tsx|ts|css)$/.test(f))
const required = [
  'components/layout/navbar.tsx',
  'components/layout/mobile-bottom-actions.tsx',
  'components/layout/floating-feedback.tsx',
  'components/layout/user-account-menu.tsx',
  'components/dashboard/dashboard-shell.tsx',
  'components/admin/admin-shell.tsx',
  'app/tools/page.tsx',
  'components/tools/tool-grid.tsx',
  'lib/tools/catalog.ts'
]
for (const file of required) if (!existsSync(join(root, file))) issues.push(`Missing required UI file: ${file}`)

for (const file of files) {
  const text = readFileSync(file, 'utf8')
  const r = rel(file)
  if (/fixed bottom-4 right-4/.test(text)) issues.push(`Old floating feedback placement found: ${r}`)
  if (/href="\/complaint"[^>]*>Start Free/.test(text)) issues.push(`Start Free still bypasses login/tools flow: ${r}`)
  if (/Mobile app jaisa|Hinglish me|Aapka haq/.test(text) && ['app/page.tsx', 'components/layout/disclaimer-banner.tsx', 'components/layout/footer.tsx'].includes(r)) issues.push(`Core chrome still uses non-English default copy: ${r}`)
  if (/lg:hidden/.test(text) && r === 'components/layout/navbar.tsx') issues.push('Navbar mobile quick nav should not stay visible on compact desktop zoom; use md:hidden/mobile-only-nav')
}

const css = readFileSync(join(root, 'app/globals.css'), 'utf8')
for (const token of ['overflow-x: hidden', 'padding-bottom: calc(76px', '.no-scrollbar', '.hs-container', 'font-family: ui-sans-serif', '.hs-popover']) {
  if (!css.includes(token)) issues.push(`globals.css missing responsive rule: ${token}`)
}
if (!css.includes('@media (min-width: 768px)') || !css.includes('.mobile-only-nav')) issues.push('globals.css missing enforced desktop hide for mobile nav')

const bottom = readFileSync(join(root, 'components/layout/mobile-bottom-actions.tsx'), 'utf8')
if (!bottom.includes('env(safe-area-inset-bottom)')) issues.push('Mobile bottom nav missing safe-area support')
if (!bottom.includes('grid-cols-5')) issues.push('Mobile bottom nav should use fixed 5-column grid to avoid icon overlap')
if ((bottom.match(/href:/g) || []).length > 5) issues.push('Mobile bottom nav has too many items and may overlap')

const navbar = readFileSync(join(root, 'components/layout/navbar.tsx'), 'utf8')
const desktopNav = existsSync(join(root, 'components/layout/desktop-scroll-nav.tsx')) ? readFileSync(join(root, 'components/layout/desktop-scroll-nav.tsx'), 'utf8') : ''
if (!navbar.includes("user ? '/tools' : '/login?next=/tools'")) issues.push('Navbar Start action is not login/tools aware')
if (!navbar.includes('mobile-only-nav') || !navbar.includes('md:hidden')) issues.push('Navbar missing mobile-only scroll nav guard')
if (!navbar.includes('xl:flex') && !desktopNav.includes('xl:flex')) issues.push('Desktop primary nav should only show where there is enough width')

const account = readFileSync(join(root, 'components/layout/user-account-menu.tsx'), 'utf8')
if (!account.includes('z-[70]')) issues.push('User menu should be above header/content')
if (!account.includes('hs-account-popover')) issues.push('User menu should use stable viewport-safe popover class')

const dashboard = readFileSync(join(root, 'components/dashboard/dashboard-shell.tsx'), 'utf8')
if (!dashboard.includes('md:grid-cols-[240px_minmax(0,1fr)]') && !dashboard.includes('md:grid-cols-[220px_minmax(0,1fr)]')) issues.push('Dashboard should use sidebar from tablet/desktop to avoid desktop chip nav clutter')
if (!dashboard.includes('md:hidden')) issues.push('Dashboard horizontal chip nav should be mobile only')

const catalog = readFileSync(join(root, 'lib/tools/catalog.ts'), 'utf8')
const toolCount = (catalog.match(/href: '/g) || []).length
if (toolCount < 38) issues.push(`Tool catalog too small: ${toolCount}`)

console.log('\nHaqSathi AI UI responsive scan')
console.log(`Files scanned: ${files.length}`)
console.log(`Public tools in catalog: ${toolCount}`)
if (issues.length) {
  console.log(`Issues found: ${issues.length}`)
  for (const issue of issues) console.log(`❌ ${issue}`)
  process.exit(1)
}
console.log('✅ UI responsive scan passed: mobile header, desktop header, bottom nav, dashboard shell, account menu, core English copy and safe-area rules look OK.')
