import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const read = (file: string) => readFileSync(join(root, file), 'utf8')
const exists = (file: string) => existsSync(join(root, file))
const ok = (msg: string) => console.log(`✅ ${msg}`)
const warn = (msg: string) => console.log(`⚠️ ${msg}`)
const fail = (msg: string) => console.log(`❌ ${msg}`)

function walk(dir: string, out: string[] = []) {
  if (!exists(dir)) return out
  for (const name of readdirSync(join(root, dir))) {
    const rel = join(dir, name).replaceAll('\\\\', '/')
    const abs = join(root, rel)
    if (name === 'node_modules' || name === '.next' || name === '.git') continue
    if (statSync(abs).isDirectory()) walk(rel, out)
    else out.push(rel)
  }
  return out
}

console.log('\nHaqSathi AI Final Fixpack Doctor\n')

const pkg = JSON.parse(read('package.json'))
if (pkg.dependencies?.['@prisma/client'] === '6.19.3' && pkg.devDependencies?.prisma === '6.19.3') ok('Prisma pinned to 6.19.3')
else fail('Prisma must stay pinned to 6.19.3 until Prisma 7 migration is intentionally done')

if (exists('proxy.ts') && !exists('middleware.ts')) ok('Next proxy setup clean')
else fail('Keep proxy.ts only. Delete middleware.ts and .next cache')

if (exists('prisma.config.ts')) ok('Prisma config file exists')
else warn('prisma.config.ts missing')

const schema = read('prisma/schema.prisma')
if (schema.includes('url       = env("DATABASE_URL")')) ok('Prisma 6 datasource URL present')
else warn('Datasource URL missing; only change this during Prisma 7 migration')

const envExample = read('.env.example')
for (const key of ['DATABASE_URL','DIRECT_URL','NEXT_PUBLIC_APP_URL','AUTH_SECRET','SUPABASE_SERVICE_ROLE_KEY','RAZORPAY_KEY_SECRET','RESEND_API_KEY']) {
  if (envExample.includes(key)) ok(`.env.example contains ${key}`)
  else warn(`.env.example missing ${key}`)
}

const pages = walk('app').filter(f => f.endsWith('/page.tsx') || f === 'app/page.tsx')
ok(`Route pages found: ${pages.length}`)

const apiRoutes = walk('app/api').filter(f => f.endsWith('/route.ts'))
ok(`API routes found: ${apiRoutes.length}`)

const missingDynamic = pages.filter((file) => {
  const text = read(file)
  const dbHeavy = text.includes('@/lib/db') || text.includes('getCurrentUser') || text.includes('cookies()') || text.includes('headers()')
  return dbHeavy && !text.includes("export const dynamic = 'force-dynamic'")
})
if (missingDynamic.length) {
  warn('Some DB/auth pages may need force-dynamic:')
  missingDynamic.slice(0, 25).forEach(f => console.log(`  - ${f}`))
} else ok('DB/auth pages include force-dynamic guard')

console.log('\nNext local recovery command:')
console.log('npm run clean:next-conflict && npm run doctor:all && npm run build')
