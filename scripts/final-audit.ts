import { existsSync, readFileSync } from 'fs'
import { join } from 'path'

const root = process.cwd()
const required = [
  'package.json',
  'proxy.ts',
  'prisma.config.ts',
  'prisma/schema.prisma',
  'app/api/health/route.ts',
  'app/api/ready/route.ts',
  'app/launch-readiness/page.tsx',
  'app/deploy-guide/page.tsx',
  'app/admin/final-qa/page.tsx',
  'app/admin/release-notes/page.tsx',
  'README.md',
  '.env.example'
]

const optionalCritical = [
  'vercel.json',
  'app/error.tsx',
  'app/global-error.tsx',
  'app/not-found.tsx',
  'app/loading.tsx'
]

function ok(label: string) { console.log(`✅ ${label}`) }
function warn(label: string) { console.warn(`⚠️  ${label}`) }
function fail(label: string) { console.error(`❌ ${label}`) }

let failures = 0
console.log('\nHaqSathi AI Final Audit\n')

for (const file of required) {
  if (existsSync(join(root, file))) ok(file)
  else { fail(`${file} missing`); failures++ }
}

for (const file of optionalCritical) {
  if (existsSync(join(root, file))) ok(file)
  else warn(`${file} missing`)
}

if (existsSync(join(root, 'middleware.ts'))) {
  fail('middleware.ts found. Next 16 uses proxy.ts only in this project.')
  failures++
} else ok('No middleware.ts conflict')

const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
const prisma = pkg.devDependencies?.prisma
const client = pkg.dependencies?.['@prisma/client']
if (prisma === '6.19.3' && client === '6.19.3') ok('Prisma pinned to 6.19.3')
else { fail(`Prisma pin mismatch. prisma=${prisma}, @prisma/client=${client}`); failures++ }

const env = readFileSync(join(root, '.env.example'), 'utf8')
for (const key of ['DATABASE_URL', 'DIRECT_URL', 'AUTH_SECRET', 'NEXT_PUBLIC_APP_URL', 'NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'RAZORPAY_KEY_ID', 'RESEND_API_KEY']) {
  if (env.includes(key)) ok(`env example has ${key}`)
  else { fail(`env example missing ${key}`); failures++ }
}

const schema = readFileSync(join(root, 'prisma/schema.prisma'), 'utf8')
for (const model of ['User', 'Complaint', 'Reminder', 'SeoPage', 'Subscription', 'OfficialSource', 'CasePackage']) {
  if (schema.includes(`model ${model}`)) ok(`schema has model ${model}`)
  else { warn(`schema model ${model} not found`) }
}

if (failures > 0) {
  console.error(`\nFinal audit failed with ${failures} blocking issue(s).\n`)
  process.exit(1)
}

console.log('\n✅ Final audit passed. Run npm run build next.\n')
