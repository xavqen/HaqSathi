import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const exists = (p: string) => existsSync(join(root, p))
const read = (p: string) => readFileSync(join(root, p), 'utf8')
const pkg = JSON.parse(read('package.json'))

const requiredFiles = [
  'proxy.ts',
  'prisma/schema.prisma',
  'prisma.config.ts',
  'app/api/health/route.ts',
  'app/api/ready/route.ts',
  'app/release-stable/page.tsx',
  'app/admin/system-doctor/page.tsx',
  'docs/V2_STABLE_RELEASE.md',
  'docs/LAUNCH_DAY_CHECKLIST.md',
  'docs/POST_LAUNCH_OPERATIONS.md',
  'docs/PRODUCTION_HANDOFF.md'
]

let failed = false
function pass(msg: string) { console.log(`✅ ${msg}`) }
function fail(msg: string) { console.log(`❌ ${msg}`); failed = true }

for (const file of requiredFiles) exists(file) ? pass(file) : fail(`Missing ${file}`)

pkg.version === '2.0.0' ? pass('version 2.0.0 stable') : fail(`version expected 2.0.0, got ${pkg.version}`)

if (exists('middleware.ts')) fail('middleware.ts exists; Next 16 requires proxy.ts only')
else pass('no middleware.ts conflict')

pkg.dependencies?.next === '16.2.6' ? pass('Next pinned to 16.2.6') : fail('Next must be pinned to 16.2.6')
pkg.dependencies?.['@prisma/client'] === '6.19.3' ? pass('@prisma/client pinned to 6.19.3') : fail('@prisma/client must be 6.19.3')
pkg.devDependencies?.prisma === '6.19.3' ? pass('Prisma CLI pinned to 6.19.3') : fail('Prisma CLI must be 6.19.3')

const schema = read('prisma/schema.prisma')
if (schema.includes('url       = env("DATABASE_URL")') && schema.includes('directUrl = env("DIRECT_URL")')) pass('Prisma 6 datasource URLs present')
else fail('Prisma datasource URLs missing; this release expects Prisma 6.19.3')

const env = read('.env.example')
const envKeys = [
  'DATABASE_URL',
  'DIRECT_URL',
  'AUTH_SECRET',
  'NEXT_PUBLIC_APP_URL',
  'NEXT_PUBLIC_SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'SUPABASE_STORAGE_BUCKET',
  'RESEND_API_KEY',
  'RAZORPAY_KEY_ID',
  'RAZORPAY_KEY_SECRET'
]
for (const key of envKeys) env.includes(key) ? pass(`env ${key}`) : fail(`Missing .env.example key ${key}`)

const scripts = pkg.scripts || {}
for (const script of ['release:stable', 'ship:prod', 'phase21:audit', 'db:doctor', 'clean:next-conflict']) {
  scripts[script] ? pass(`npm script ${script}`) : fail(`Missing npm script ${script}`)
}

if (failed) {
  console.error('\nPhase 21 audit failed. Fix the failed items above.')
  process.exit(1)
}

console.log('\nPhase 21 stable release audit passed.')
