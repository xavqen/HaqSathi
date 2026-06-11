import { existsSync, readFileSync } from 'node:fs'

const checks = [
  ['components/ui/motion-primitives.tsx', 'SpotlightLink'],
  ['components/ui/motion-primitives.tsx', 'SpotlightSurface'],
  ['components/ui/motion-primitives.tsx', 'MotionPresencePanel'],
  ['components/ui/motion-primitives.tsx', 'MotionNumber'],
  ['components/ui/motion-primitives.tsx', 'AnimatePresence'],
  ['components/ui/motion-primitives.tsx', 'scale: 0.98'],
  ['app/globals.css', 'Phase 113'],
  ['app/globals.css', 'motion-spotlight'],
  ['app/globals.css', 'radial-gradient(42rem circle'],
  ['app/page.tsx', 'SpotlightSurface'],
  ['app/page.tsx', 'SpotlightLink'],
  ['app/page.tsx', 'MotionNumber'],
  ['components/tools/tool-grid.tsx', 'SpotlightLink']
]

const issues = []
for (const [file, token] of checks) {
  if (!existsSync(file)) issues.push(`Missing file: ${file}`)
  else if (!readFileSync(file, 'utf8').includes(token)) issues.push(`Missing ${token} in ${file}`)
}

const pkg = JSON.parse(readFileSync('package.json', 'utf8'))
if (!['3.0.83-premium-motion-spotlight', '3.0.84-final-stabilization'].includes(pkg.version)) issues.push('package version is not v3.0.83')
if (!pkg.scripts?.['phase113:audit']) issues.push('phase113:audit script missing')
if (!pkg.scripts?.['quality:release']?.includes('phase113:audit')) issues.push('quality:release does not include phase113:audit')
if (!pkg.dependencies?.['framer-motion']) issues.push('framer-motion dependency missing')

if (issues.length) {
  console.error('Phase 113 premium motion spotlight audit failed:')
  for (const issue of issues) console.error(`- ${issue}`)
  process.exit(1)
}

console.log('✅ Phase 113 audit passed: premium spotlight cards, animated numbers, shared presence panel and motion-safe micro-interactions are wired.')
