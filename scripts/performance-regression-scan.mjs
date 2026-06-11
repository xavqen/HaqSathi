import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const issues = []
const warnings = []

function walk(dir, out = []) {
  const full = join(root, dir)
  if (!existsSync(full)) return out
  for (const name of readdirSync(full)) {
    if (['node_modules', '.next', '.git'].includes(name)) continue
    const path = join(full, name)
    const stat = statSync(path)
    if (stat.isDirectory()) walk(path.slice(root.length + 1), out)
    else out.push(path.slice(root.length + 1))
  }
  return out
}
function read(path) {
  return readFileSync(join(root, path), 'utf8')
}

const sourceFiles = walk('app').concat(walk('components')).concat(walk('lib')).filter((file) => /\.(tsx?|css|mjs|js)$/.test(file))
for (const file of sourceFiles) {
  const stat = statSync(join(root, file))
  if (stat.size > 240_000) warnings.push(`${file} is large (${Math.round(stat.size / 1024)} KB); consider splitting if it becomes client-side.`)
  const text = read(file)
  if (/filter\s*:\s*['"]blur/.test(text) || /filter:\s*blur/.test(text)) issues.push(`${file} uses blur filter animation; use opacity/transform for smooth low-end mobile performance.`)
  if (/transition-(all|\[all\])/.test(text)) warnings.push(`${file} has transition-all; prefer transform/opacity/border/color.`)
  if (/whileHover=\{\{[^}]*width|whileHover=\{\{[^}]*height|whileHover=\{\{[^}]*top|whileHover=\{\{[^}]*left/.test(text)) {
    issues.push(`${file} animates layout-affecting properties in whileHover.`)
  }
}

const globals = existsSync(join(root, 'app/globals.css')) ? read('app/globals.css') : ''
if (!globals.includes('Phase 114')) issues.push('app/globals.css missing Phase 114 performance hardening')
if (globals.includes('.motion-safe-transform *')) issues.push('app/globals.css still applies motion backface/will-change to every descendant')
if (!globals.includes('content-visibility: auto')) warnings.push('content-visibility:auto helper missing; long landing pages may render more work than needed.')

const pageTransition = existsSync(join(root, 'components/layout/page-transition.tsx')) ? read('components/layout/page-transition.tsx') : ''
if (pageTransition.includes('filter')) issues.push('PageTransition still uses filter/blur; this can jank on mobile.')
if (!pageTransition.includes('duration: 0.28')) warnings.push('PageTransition duration is not tuned for final stabilization.')

const sw = existsSync(join(root, 'public/sw.js')) ? read('public/sw.js') : ''
if (!sw.includes('MAX_RUNTIME_ENTRIES')) issues.push('Service worker runtime cache is unbounded.')
if (!sw.includes("url.pathname.includes('/admin')")) issues.push('Service worker should never cache admin routes.')

const nextConfig = existsSync(join(root, 'next.config.ts')) ? read('next.config.ts') : ''
if (!nextConfig.includes('productionBrowserSourceMaps: false')) issues.push('Production browser source maps should be off for smaller deployments.')
if (!nextConfig.includes("formats: ['image/avif', 'image/webp']")) warnings.push('Next image AVIF/WebP formats not configured.')

console.log('HaqSathi performance regression scan')
console.log(`Files scanned: ${sourceFiles.length}`)
if (warnings.length) {
  console.log('\nWarnings:')
  for (const warning of warnings.slice(0, 25)) console.log(`  ⚠ ${warning}`)
  if (warnings.length > 25) console.log(`  … ${warnings.length - 25} more warnings`)
}
if (issues.length) {
  console.error('\nFailures:')
  for (const issue of issues) console.error(`  ✗ ${issue}`)
  process.exit(1)
}
console.log('✅ Performance scan passed: no blur/filter route transitions, no unbounded SW cache, no admin/API caching and motion stays transform/opacity-first.')
