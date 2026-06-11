import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const issues = []
const warnings = []
const mustExist = [
  'next.config.ts',
  'vercel.json',
  'app/layout.tsx',
  'app/template.tsx',
  'app/loading.tsx',
  'app/error.tsx',
  'app/global-error.tsx',
  'app/not-found.tsx',
  'app/api/health/route.ts',
  'app/api/ready/route.ts',
  'app/sitemap.ts',
  'app/robots.ts',
  'app/manifest.ts',
  'public/sw.js',
  'public/offline.html',
  '.env.example'
]

function exists(path) {
  return existsSync(join(root, path))
}
function read(path) {
  return readFileSync(join(root, path), 'utf8')
}
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

for (const file of mustExist) {
  if (!exists(file)) issues.push(`Missing required deploy file: ${file}`)
}

const pkg = JSON.parse(read('package.json'))
if (pkg.version !== '3.0.84-final-stabilization') issues.push('package.json version must be 3.0.84-final-stabilization')
for (const script of ['stabilize:release', 'deploy:doctor', 'perf:regression-scan', 'phase114:audit']) {
  if (!pkg.scripts?.[script]) issues.push(`package.json missing ${script}`)
}

const envExample = exists('.env.example') ? read('.env.example') : ''
for (const key of ['NEXT_PUBLIC_APP_URL', 'NEXT_PUBLIC_APP_VERSION', 'AUTH_SECRET', 'DATABASE_URL', 'DIRECT_URL', 'CRON_SECRET']) {
  if (!envExample.includes(`${key}=`)) issues.push(`.env.example missing ${key}`)
}
if (!envExample.includes('NEXT_PUBLIC_APP_VERSION="3.0.84"')) issues.push('.env.example NEXT_PUBLIC_APP_VERSION is stale')

const nextConfig = exists('next.config.ts') ? read('next.config.ts') : ''
for (const token of ['compress: true', 'productionBrowserSourceMaps: false', 'Cache-Control', 'Service-Worker-Allowed', 'image/avif', 'image/webp']) {
  if (!nextConfig.includes(token)) issues.push(`next.config.ts missing ${token}`)
}
if (nextConfig.includes("value: 'SAMEORIGIN'")) warnings.push('X-Frame-Options is SAMEORIGIN; DENY is safer for this app unless embedding is required.')

const layout = exists('app/layout.tsx') ? read('app/layout.tsx') : ''
for (const token of ['export const viewport', 'viewportFit', 'themeColor', 'overflow-x-clip', 'Skip to main content']) {
  if (!layout.includes(token)) issues.push(`app/layout.tsx missing ${token}`)
}

const vercel = exists('vercel.json') ? JSON.parse(read('vercel.json')) : { crons: [] }
const cronPaths = new Set((vercel.crons || []).map((cron) => String(cron.path).split('?')[0]))
for (const route of walk('app/api/cron').filter((file) => file.endsWith('/route.ts'))) {
  const path = '/' + route.replace(/^app\//, '').replace(/\/route\.ts$/, '')
  if (!cronPaths.has(path)) issues.push(`vercel.json cron missing ${path}`)
}

const reminderCron = exists('app/api/cron/reminders/route.ts') ? read('app/api/cron/reminders/route.ts') : ''
if (!reminderCron.includes("process.env.NODE_ENV !== 'production'")) issues.push('reminder cron must block production when CRON_SECRET is missing')
if (!reminderCron.includes('Cache-Control')) issues.push('reminder cron response must be no-store')

const sw = exists('public/sw.js') ? read('public/sw.js') : ''
for (const token of ['haqsathi-ai-v3-0-84', 'MAX_RUNTIME_ENTRIES', 'trimRuntimeCache', "url.pathname.includes('/admin')", "url.pathname.startsWith('/api/')"]) {
  if (!sw.includes(token)) issues.push(`public/sw.js missing ${token}`)
}

const robots = exists('app/robots.ts') ? read('app/robots.ts') : ''
if (!robots.includes("disallow: ['/admin']")) warnings.push('robots.ts should disallow admin routes.')

console.log('HaqSathi final stabilization doctor')
console.log(`Version: ${pkg.version}`)
console.log(`Cron jobs configured: ${(vercel.crons || []).length}`)
if (warnings.length) {
  console.log('\nWarnings:')
  for (const warning of warnings) console.log(`  ⚠ ${warning}`)
}
if (issues.length) {
  console.error('\nFailures:')
  for (const issue of issues) console.error(`  ✗ ${issue}`)
  process.exit(1)
}
console.log('✅ Deploy doctor passed: production files, cron routes, cache policy, viewport and env template are ready.')
