import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const issues = []
const exists = (file) => existsSync(join(root, file))
const read = (file) => readFileSync(join(root, file), 'utf8')
const pkg = JSON.parse(read('package.json'))

function require(condition, message) {
  if (!condition) issues.push(message)
}

const helper = exists('lib/security/document-vault-safety.ts') ? read('lib/security/document-vault-safety.ts') : ''
const uploadRoute = exists('app/api/document-vault/upload/route.ts') ? read('app/api/document-vault/upload/route.ts') : ''
const adminPage = exists('app/admin/document-vault-safety/page.tsx') ? read('app/admin/document-vault-safety/page.tsx') : ''
const apiRoute = exists('app/api/admin/document-vault-safety-readiness/route.ts') ? read('app/api/admin/document-vault-safety-readiness/route.ts') : ''
const dashboardVault = exists('app/dashboard/document-vault/page.tsx') ? read('app/dashboard/document-vault/page.tsx') : ''
const adminShell = exists('components/admin/admin-shell.tsx') ? read('components/admin/admin-shell.tsx') : ''
const env = read('.env.example')
const evidence = read('lib/qa/launch-evidence.ts')

require((/3\.0\.(20|[2-9][0-9])/.test(pkg.version) || /^3\.0\.(?:[1-9]\d{2,})/.test(pkg.version)), 'package version must be v3.0.20+')
require(pkg.scripts['vault-safety:readiness'] === 'node scripts/document-vault-safety-readiness-local.mjs', 'vault-safety:readiness script missing')
require(pkg.scripts['phase50:audit'] === 'node scripts/phase50-document-vault-safety-audit.mjs', 'phase50:audit script missing')
require((pkg.scripts['quality:release'] || '').includes('phase50:audit'), 'quality:release must include phase50 audit')
require(exists('lib/security/document-vault-safety.ts'), 'document vault safety helper missing')
for (const token of ['scanVaultFileSafety', 'getDocumentVaultSafetyReadinessReport', 'ALLOWED_MIME_TYPES', 'RISKY_EXTENSIONS', 'pdf-active-content', 'magic-unknown']) {
  require(helper.includes(token), `document vault safety helper missing ${token}`)
}
require(uploadRoute.includes('scanVaultFileSafety') && uploadRoute.includes('safetyScan.allowed'), 'upload route must run vault safety scan before upload')
require(exists('app/admin/document-vault-safety/page.tsx'), 'admin document vault safety page missing')
require(adminPage.includes('npm run vault-safety:readiness') && adminPage.includes('/api/admin/document-vault-safety-readiness') && adminPage.includes('Minimum launch evidence'), 'admin vault safety page must show command, API path and evidence')
require(exists('app/api/admin/document-vault-safety-readiness/route.ts'), 'document vault safety admin API missing')
require(apiRoute.includes('requireAdmin') && apiRoute.includes('getDocumentVaultSafetyReadinessReport'), 'document vault safety API must require admin and return report')
require(dashboardVault.includes('Upload safety scan') && dashboardVault.includes('ShieldCheck'), 'dashboard document vault must show upload safety notice')
require(adminShell.includes('/admin/document-vault-safety'), 'admin shell must link document vault safety page')
for (const key of ['DOCUMENT_VAULT_SAFETY_MODE', 'DOCUMENT_VAULT_SAFETY_EVIDENCE_DIR', 'DOCUMENT_VAULT_QUARANTINE_ENABLED', 'DOCUMENT_VAULT_AUDIT_ENABLED', 'FILE_SCAN_PROVIDER', 'CLAMAV_SCAN_URL', 'DOCUMENT_VAULT_ENCRYPTION_KEY_ID']) {
  require(env.includes(`${key}=`), `.env.example missing ${key}`)
}
require(evidence.includes('Document Vault Safety'), 'launch evidence gate missing document vault safety')
require(exists('scripts/document-vault-safety-readiness-local.mjs'), 'document vault safety local evidence script missing')
require(exists('PHASE_50_DOCUMENT_VAULT_SAFETY.md'), 'Phase 50 notes missing')

console.log('\nHaqSathi Phase 50 document vault safety audit')
console.log('Checks: 18')
console.log(`Issues found: ${issues.length}`)
if (issues.length) {
  for (const issue of issues) console.error('❌ ' + issue)
  process.exit(1)
}
console.log('✅ Phase 50 audit passed: vault safety helper, upload scan, admin page, API, dashboard notice, envs, evidence script and launch gate are installed.\n')
