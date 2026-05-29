import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const issues = []
const mustUsePageCopy = [
  'app/complaint/page.tsx',
  'app/upi-help/page.tsx',
  'app/scheme-finder/page.tsx',
  'app/documents/page.tsx',
  'app/refund/page.tsx',
  'app/pricing/page.tsx',
  'app/login/page.tsx',
  'app/register/page.tsx'
]

function read(rel) {
  const file = path.join(root, rel)
  if (!fs.existsSync(file)) {
    issues.push(`Missing file: ${rel}`)
    return ''
  }
  return fs.readFileSync(file, 'utf8')
}

for (const rel of mustUsePageCopy) {
  const text = read(rel)
  if (!text.includes('getCurrentPageCopy')) issues.push(`${rel} is not connected to page-level language copy`)
  if (!text.includes("export const dynamic = 'force-dynamic'")) issues.push(`${rel} should be force-dynamic because it reads language cookie`)
}

const mobileBottom = read('components/layout/mobile-bottom-actions.tsx')
if (!mobileBottom.startsWith("'use client'")) issues.push('Mobile bottom nav should be a client component for active state')
if (!mobileBottom.includes('usePathname')) issues.push('Mobile bottom nav missing active route detection')
if (!mobileBottom.includes('hiddenPrefixes')) issues.push('Mobile bottom nav should hide on auth/admin screens')
if (!mobileBottom.includes('aria-current')) issues.push('Mobile bottom nav missing accessibility active state')

const css = read('app/globals.css')
for (const token of ['Phase 37 final UX pass', 'resize: vertical', 'scroll-margin-top', 'overflow-wrap: break-word']) {
  if (!css.includes(token)) issues.push(`globals.css missing Phase 37 responsive token: ${token}`)
}

const packageJson = JSON.parse(read('package.json'))
if (!packageJson.scripts['phase37:audit']) issues.push('package.json missing phase37:audit script')
if (!String(packageJson.version || '').startsWith('3.0.')) issues.push(`package version should be 3.0.x, found ${packageJson.version}`)

console.log('\nHaqSathi Phase 37 UX + i18n audit')
console.log(`Pages checked: ${mustUsePageCopy.length}`)
console.log(`Issues found: ${issues.length}`)
if (issues.length) {
  console.log(issues.map((issue) => `❌ ${issue}`).join('\n'))
  process.exit(1)
}
console.log('✅ Phase 37 audit passed: page-level language copy, active mobile navigation and responsive form polish are installed.')
