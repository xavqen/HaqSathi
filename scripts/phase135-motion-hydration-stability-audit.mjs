import fs from 'node:fs'
import path from 'node:path'

function read(file) {
  return fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : ''
}

function walk(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full, acc)
    else if (/\.(ts|tsx)$/.test(entry.name)) acc.push(full.replaceAll('\\\\', '/'))
  }
  return acc
}

function stripComments(source) {
  return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
}

let failed = false
function pass(name, ok, detail = '') {
  if (ok) console.log(`✅ ${name}`)
  else {
    failed = true
    console.error(`❌ ${name}${detail ? ` — ${detail}` : ''}`)
  }
}

const pkg = JSON.parse(read('package.json'))
const sourceFiles = [...walk('app'), ...walk('components'), ...walk('lib')]
const sourceBodies = sourceFiles.map((file) => [file, stripComments(read(file))])
const motionPrimitive = read('components/ui/motion-primitives.tsx')
const pageTransition = read('components/layout/page-transition.tsx')
const languageSwitcher = read('components/i18n/language-switcher.tsx')
const accountMenu = read('components/layout/user-account-menu.tsx')
const routeProgress = read('components/layout/route-progress.tsx')
const hook = read('lib/motion/use-prefers-reduced-motion.ts')
const sw = read('public/sw.js')
const health = read('app/api/health/route.ts')
const ready = read('app/api/ready/route.ts')
const env = read('.env.example')
const quality = String(pkg.scripts?.['quality:release'] || '')

const deprecatedMotionCreate = sourceBodies.filter(([file, body]) => /\bmotion\s*\(/.test(body) && !file.endsWith('motion-primitives.tsx'))
const framerReducedHook = sourceBodies.filter(([, body]) => /useReducedMotion\s*\(/.test(body))
const directWindowTimers = sourceBodies.filter(([, body]) => /window\.(setTimeout|clearTimeout|setInterval|clearInterval)\s*\(/.test(body))

pass('version bumped to v3.0.105 motion hydration stability', pkg.version === '3.0.105-motion-hydration-stability')
pass('quality release includes phase135', quality.includes('phase135:audit') && pkg.scripts?.['phase135:audit'] === 'node scripts/phase135-motion-hydration-stability-audit.mjs')
pass('Framer Link wrapper uses motion.create instead of deprecated motion()', motionPrimitive.includes('motion.create(Link as unknown as React.ComponentType<any>)') && !/const\s+AnimatedLink\s*=\s*motion\s*\(/.test(motionPrimitive))
pass('MotionNumber keeps real SSR value before hydration', motionPrimitive.includes('React.useState(value)') && motionPrimitive.includes('setDisplayValue(0)'))
pass('no deprecated motion(Component) calls remain in app/components/lib', deprecatedMotionCreate.length === 0, deprecatedMotionCreate.map(([file]) => file).join(', '))
pass('custom reduced-motion hook is hydration-safe', hook.includes('useState<boolean>(false)') && hook.includes('globalThis.matchMedia') && hook.includes('addEventListener') && hook.includes('removeEventListener'))
pass('Framer useReducedMotion hook removed from runtime components', framerReducedHook.length === 0, framerReducedHook.map(([file]) => file).join(', '))
pass('PageTransition always renders the same motion.div wrapper', pageTransition.includes('suppressHydrationWarning') && pageTransition.includes('className="motion-page min-w-0"') && !pageTransition.includes('return <>{children}</>'))
pass('reduced-motion does not remove ToolGrid active-pill DOM element', read('components/tools/tool-grid.tsx').includes('layoutId={reduceMotion ? undefined : "tool-category-active-pill"}') && !read('components/tools/tool-grid.tsx').includes('active && !reduceMotion'))
pass('Language switcher buttons use stable tabIndex and hydration suppression', languageSwitcher.includes('tabIndex={0}') && languageSwitcher.includes('suppressHydrationWarning') && languageSwitcher.includes('usePrefersReducedMotion'))
pass('Account menu button uses stable tabIndex and hydration suppression', accountMenu.includes('tabIndex={0}') && accountMenu.includes('suppressHydrationWarning') && accountMenu.includes('usePrefersReducedMotion'))
pass('Route progress uses standard timers instead of window timers', routeProgress.includes('const hide = setTimeout') && routeProgress.includes('clearTimeout(hide)'))
pass('no window timer helpers remain in app/components/lib', directWindowTimers.length === 0, directWindowTimers.map(([file]) => file).join(', '))
pass('env health ready and service worker are current', env.includes('NEXT_PUBLIC_APP_VERSION="3.0.105"') && health.includes(pkg.version) && ready.includes(pkg.version) && sw.includes('haqsathi-ai-v3-0-105-motion-hydration-stability'))

if (failed) process.exit(1)
