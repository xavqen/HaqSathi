import { existsSync, readFileSync } from 'node:fs'

const issues = []
const read = (file) => readFileSync(file, 'utf8')
const requireFile = (file) => {
  if (!existsSync(file)) issues.push(`Missing ${file}`)
  return existsSync(file)
}
const requireToken = (file, token) => {
  if (requireFile(file) && !read(file).includes(token)) issues.push(`Missing ${token} in ${file}`)
}

const pkg = JSON.parse(read('package.json'))
if (pkg.version !== '3.0.84-final-stabilization') issues.push('package version must be v3.0.84-final-stabilization')
for (const script of ['deploy:doctor', 'perf:regression-scan', 'stabilize:release', 'phase114:audit']) {
  if (!pkg.scripts?.[script]) issues.push(`package script missing: ${script}`)
}
if (!pkg.scripts?.['quality:release']?.includes('phase114:audit')) issues.push('quality:release must include phase114:audit')

requireToken('next.config.ts', 'compress: true')
requireToken('next.config.ts', 'productionBrowserSourceMaps: false')
requireToken('next.config.ts', 'Service-Worker-Allowed')
requireToken('vercel.json', '/api/cron/link-checks')
requireToken('vercel.json', '/api/cron/official-data-refresh')
requireToken('app/layout.tsx', 'export const viewport')
requireToken('app/layout.tsx', 'overflow-x-clip')
requireToken('components/layout/page-transition.tsx', 'duration: 0.28')
requireToken('components/layout/route-progress.tsx', 'duration: 0.46')
requireToken('app/api/cron/reminders/route.ts', "process.env.NODE_ENV !== 'production'")
requireToken('app/api/health/route.ts', '3.0.84-final-stabilization')
requireToken('public/sw.js', 'haqsathi-ai-v3-0-84')
requireToken('public/sw.js', 'MAX_RUNTIME_ENTRIES')
requireToken('app/globals.css', 'Phase 114')
requireToken('scripts/final-stabilization-doctor.mjs', 'Deploy doctor passed')
requireToken('scripts/performance-regression-scan.mjs', 'Performance scan passed')
requireToken('.env.example', 'NEXT_PUBLIC_APP_VERSION="3.0.84"')

if (read('components/layout/page-transition.tsx').includes('filter')) issues.push('PageTransition must not use filter/blur in final stabilization')
if (read('app/globals.css').includes('.motion-safe-transform *')) issues.push('Global CSS must not apply motion GPU hints to every descendant')

if (issues.length) {
  console.error('Phase 114 final stabilization audit failed:')
  for (const issue of issues) console.error(`- ${issue}`)
  process.exit(1)
}
console.log('✅ Phase 114 audit passed: final bug-fix, deploy testing and performance hardening layer is wired.')
