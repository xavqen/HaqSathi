import { existsSync, readdirSync, statSync } from 'fs'
import { join } from 'path'

const root = process.cwd()
const required = [
  'app/api/health/route.ts',
  'app/api/ready/route.ts',
  'app/error.tsx',
  'app/global-error.tsx',
  'app/not-found.tsx',
  'app/loading.tsx',
  'app/admin/env-health/page.tsx',
  'app/admin/build-center/page.tsx',
  'app/admin/seo-audit/page.tsx',
  'app/admin/security-hardening/page.tsx',
  'app/admin/backup-restore/page.tsx',
  'app/launch-readiness/page.tsx',
  'app/deploy-guide/page.tsx',
  'components/layout/cookie-consent.tsx',
  'components/layout/analytics-scripts.tsx',
  'lib/launch/env-health.ts',
  'lib/launch/seo-audit.ts',
  'lib/launch/security-hardening.ts',
  'scripts/build-guard.ts',
  'scripts/env-audit.ts',
  'scripts/smoke-local.ts'
]

function walk(dir: string): string[] {
  if (!existsSync(dir)) return []
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name)
    const stat = statSync(full)
    return stat.isDirectory() ? walk(full) : [full]
  })
}

const missing = required.filter((rel) => !existsSync(join(root, rel)))
const routeCount = walk(join(root, 'app')).filter((file) => file.endsWith('page.tsx') || file.endsWith('route.ts')).length

console.log('HaqSathi AI Phase 17 Audit')
console.log(`Routes/pages/API files: ${routeCount}`)
if (existsSync(join(root, 'middleware.ts')) && existsSync(join(root, 'proxy.ts'))) missing.push('Delete middleware.ts because proxy.ts already exists')

if (missing.length) {
  console.log('\nMissing/failing items:')
  for (const item of missing) console.log(`  ✗ ${item}`)
  process.exit(1)
}

console.log('✅ Phase 17 launch-hardening audit passed')
