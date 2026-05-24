import { existsSync, readFileSync } from 'fs'
import { join } from 'path'

const root = process.cwd()
const mustExist = [
  'proxy.ts',
  'app/api/health/route.ts',
  'app/api/ready/route.ts',
  'app/api/diagnostics/build/route.ts',
  'app/release-candidate/page.tsx',
  'docs/RELEASE_CANDIDATE_CHECKLIST.md',
  'docs/PRODUCTION_ENV_MATRIX.md'
]
const errors: string[] = []

for (const file of mustExist) {
  if (!existsSync(join(root, file))) errors.push(`Missing: ${file}`)
}

if (existsSync(join(root, 'middleware.ts'))) {
  errors.push('middleware.ts still exists. Next 16 requires proxy.ts only.')
}

const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
if (pkg.dependencies?.['@prisma/client'] !== '6.19.3') errors.push('@prisma/client must stay pinned at 6.19.3')
if (pkg.devDependencies?.prisma !== '6.19.3') errors.push('prisma CLI must stay pinned at 6.19.3')
if (!pkg.scripts?.['release:candidate']) errors.push('release:candidate script missing')

const schema = readFileSync(join(root, 'prisma/schema.prisma'), 'utf8')
if (!schema.includes('model User')) errors.push('Prisma schema missing User model')
if (!schema.includes('model Complaint')) errors.push('Prisma schema missing Complaint model')

const dbPages = [
  'app/blog/page.tsx',
  'app/dashboard/page.tsx',
  'app/admin/page.tsx',
  'app/admin/users/page.tsx',
  'app/dashboard/complaints/page.tsx'
]
for (const file of dbPages) {
  const txt = readFileSync(join(root, file), 'utf8')
  if (!txt.includes("export const dynamic = 'force-dynamic'")) {
    errors.push(`${file} should be force-dynamic to avoid build-time DB execution`)
  }
}

if (errors.length) {
  console.error('Phase 19 audit failed:')
  for (const error of errors) console.error(' - ' + error)
  process.exit(1)
}

console.log('✅ Phase 19 audit passed: release candidate guard files, Prisma pin, proxy cleanup and dynamic DB pages OK.')
