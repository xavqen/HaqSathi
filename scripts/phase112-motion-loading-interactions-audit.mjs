import { existsSync, readFileSync } from 'node:fs'

const checks = [
  ['components/layout/page-transition.tsx', 'PageTransition'],
  ['components/layout/route-progress.tsx', 'RouteProgress'],
  ['app/template.tsx', 'PageTransition'],
  ['app/loading.tsx', 'LoadingCardSkeleton'],
  ['components/ui/skeleton.tsx', 'skeleton-shimmer'],
  ['components/tools/tool-grid.tsx', 'AnimatePresence'],
  ['components/ui/input.tsx', 'premium-form-control'],
  ['components/ui/select.tsx', 'premium-form-control'],
  ['components/ui/textarea.tsx', 'premium-form-control'],
  ['app/globals.css', 'Phase 112']
]

const issues = []
for (const [file, token] of checks) {
  if (!existsSync(file)) issues.push(`Missing file: ${file}`)
  else if (!readFileSync(file, 'utf8').includes(token)) issues.push(`Missing ${token} in ${file}`)
}

const pkg = JSON.parse(readFileSync('package.json', 'utf8'))
if (!['3.0.82-motion-loading-interactions', '3.0.83-premium-motion-spotlight', '3.0.84-final-stabilization'].includes(pkg.version)) issues.push('package version is not v3.0.82 or newer premium motion spotlight release')
if (!pkg.scripts?.['phase112:audit']) issues.push('phase112:audit script missing')
if (!pkg.scripts?.['quality:release']?.includes('phase112:audit')) issues.push('quality:release does not include phase112:audit')
if (!pkg.dependencies?.['framer-motion']) issues.push('framer-motion dependency missing')

if (issues.length) {
  console.error('Phase 112 motion/loading/interactions audit failed:')
  for (const issue of issues) console.error(`- ${issue}`)
  process.exit(1)
}

console.log('✅ Phase 112 audit passed: route transitions, progress bar, skeleton loading, animated tool grid and premium form controls are wired.')
