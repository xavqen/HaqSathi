import { existsSync, readFileSync } from 'fs'
import { join } from 'path'

const root = process.cwd()
const fail: string[] = []
const warn: string[] = []
const exists = (rel: string) => existsSync(join(root, rel))

if (exists('middleware.ts') && exists('proxy.ts')) fail.push('Both middleware.ts and proxy.ts exist. Delete middleware.ts for Next 16.')
if (!exists('proxy.ts')) fail.push('proxy.ts missing. Security headers/proxy route expected.')
if (!exists('app/error.tsx')) warn.push('app/error.tsx missing. Friendly runtime errors unavailable.')
if (!exists('app/not-found.tsx')) warn.push('app/not-found.tsx missing. Friendly 404 unavailable.')
if (!exists('app/api/health/route.ts')) fail.push('Health endpoint missing.')
if (!exists('app/api/ready/route.ts')) fail.push('Ready endpoint missing.')

const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
if (pkg.dependencies?.prisma === 'latest' || pkg.devDependencies?.prisma === 'latest') fail.push('Prisma must not be latest. Keep pinned to 6.19.3 until Prisma 7 migration is implemented.')
if (pkg.dependencies?.['@prisma/client'] === 'latest') fail.push('@prisma/client must not be latest. Keep pinned to 6.19.3.')

const envExample = exists('.env.example') ? readFileSync(join(root, '.env.example'), 'utf8') : ''
for (const key of ['DATABASE_URL','DIRECT_URL','AUTH_SECRET','NEXT_PUBLIC_APP_URL']) {
  if (!envExample.includes(key)) fail.push(`.env.example missing ${key}`)
}

console.log('HaqSathi AI Build Guard')
if (warn.length) {
  console.log('\nWarnings:')
  for (const item of warn) console.log(`  ⚠ ${item}`)
}
if (fail.length) {
  console.log('\nFailures:')
  for (const item of fail) console.log(`  ✗ ${item}`)
  process.exit(1)
}
console.log('✅ Build guard passed')
