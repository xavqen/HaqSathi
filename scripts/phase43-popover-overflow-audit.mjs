import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const issues = []
const read = (file) => readFileSync(join(root, file), 'utf8')
const exists = (file) => existsSync(join(root, file))
const pkg = JSON.parse(read('package.json'))
const globals = read('app/globals.css')
const language = read('components/i18n/language-switcher.tsx')
const account = read('components/layout/user-account-menu.tsx')

function require(condition, message) {
  if (!condition) issues.push(message)
}

require((/3\.0\.(13|1[4-9]|[2-9][0-9])/.test(pkg.version) || /^3\.0\.(?:[1-9]\d{2,})/.test(pkg.version)), 'package version must be v3.0.13+ popover overflow fix')
require(pkg.scripts['phase43:audit'] === 'node scripts/phase43-popover-overflow-audit.mjs', 'phase43:audit script missing')
require((pkg.scripts['quality:release'] || '').includes('phase43:audit'), 'quality:release must include phase43 audit')
require(language.includes('hs-language-popover') && language.includes('hs-popover-root'), 'language switcher must use stable popover classes')
require(account.includes('hs-account-popover') && account.includes('hs-popover-root'), 'account menu must use stable popover classes')
require(!language.includes('w-[min(') && !account.includes('w-[min('), 'header popovers must not depend on Tailwind arbitrary min() width classes')
require(globals.includes('.hs-popover {') && globals.includes('width: min(22rem, calc(100vw - 1rem));'), 'global popover width rule missing')
require(globals.includes('.hs-language-popover') && globals.includes('.hs-account-popover'), 'language/account popover CSS missing')
require(globals.includes('position: fixed !important') && globals.includes('max-height: min(30rem, calc(100dvh - 12rem))'), 'mobile popovers must be fixed and height-limited')
require(globals.includes('overflow-wrap: break-word') && !globals.includes('overflow-wrap: anywhere'), 'global word wrapping must not force one-letter menu labels')
require(exists('PHASE_43_POPOVER_OVERFLOW_FIX.md'), 'Phase 43 notes missing')

console.log('\nHaqSathi Phase 43 popover overflow audit')
console.log('Checks: 11')
console.log(`Issues found: ${issues.length}`)
if (issues.length) {
  for (const issue of issues) console.error('❌ ' + issue)
  process.exit(1)
}
console.log('✅ Phase 43 audit passed: language and account dropdowns are viewport-safe on mobile, tablet and desktop.\n')
