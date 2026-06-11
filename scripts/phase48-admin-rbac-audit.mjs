import { existsSync, readFileSync } from 'node:fs'

const requiredFiles = [
  'lib/security/admin-rbac.ts',
  'app/admin/rbac/page.tsx',
  'app/api/admin/rbac-readiness/route.ts',
  'scripts/rbac-readiness-local.mjs',
  'PHASE_48_ADMIN_RBAC.md'
]

const issues = []
for (const file of requiredFiles) {
  if (!existsSync(file)) issues.push(`Missing ${file}`)
}

const pkg = JSON.parse(readFileSync('package.json', 'utf8'))
if (!/3\.0\.(18|19|[2-9][0-9])/.test(pkg.version)) issues.push('package.json version must include 3.0.18+')
if (!pkg.scripts['rbac:readiness']) issues.push('Missing rbac:readiness script')
if (!pkg.scripts['phase48:audit']) issues.push('Missing phase48:audit script')
if (!pkg.scripts['quality:release']?.includes('phase48:audit')) issues.push('quality:release must include phase48:audit')

const adminShell = readFileSync('components/admin/admin-shell.tsx', 'utf8')
if (!adminShell.includes('/admin/rbac')) issues.push('Admin shell must link to /admin/rbac')

const envExample = readFileSync('.env.example', 'utf8')
for (const key of ['ADMIN_RBAC_MODE', 'ADMIN_RBAC_OWNER', 'ADMIN_RBAC_EVIDENCE_DIR']) {
  if (!envExample.includes(`${key}=`)) issues.push(`.env.example missing ${key}`)
}

const rbacSource = readFileSync('lib/security/admin-rbac.ts', 'utf8')
for (const token of ['SUPER_ADMIN', 'SUPPORT_AGENT', 'FINANCE_MANAGER', 'READ_ONLY_AUDITOR', 'roleHasPermission', 'getRbacReadinessReport']) {
  if (!rbacSource.includes(token)) issues.push(`RBAC source missing ${token}`)
}

if (issues.length) {
  console.error('❌ Phase 48 admin RBAC audit failed')
  for (const issue of issues) console.error(`- ${issue}`)
  process.exit(1)
}

console.log('✅ Phase 48 admin RBAC audit passed')
