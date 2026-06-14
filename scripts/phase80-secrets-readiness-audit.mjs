import { existsSync, readFileSync } from 'node:fs'

const issues = []
const requireCheck = (condition, message) => { if (!condition) issues.push(message) }
const exists = (path) => existsSync(path)
const read = (path) => exists(path) ? readFileSync(path, 'utf8') : ''

const pkg = JSON.parse(read('package.json'))
const helper = read('lib/security/secrets-readiness.ts')
const adminPage = read('app/admin/secrets-readiness/page.tsx')
const adminApi = read('app/api/admin/secrets-readiness/route.ts')
const localScript = read('scripts/secrets-readiness-local.mjs')
const adminShell = read('components/admin/admin-shell.tsx')
const env = read('.env.example')
const evidence = read('lib/qa/launch-evidence.ts')
const previousAudit = read('scripts/phase79-observability-slo-audit.mjs')

requireCheck(String(pkg.version || '').startsWith('3.0.'), 'package version must be a 3.0.x compatible release')
requireCheck(pkg.scripts['secrets:readiness'] === 'node scripts/secrets-readiness-local.mjs', 'secrets:readiness script missing')
requireCheck(pkg.scripts['phase80:audit'] === 'node scripts/phase80-secrets-readiness-audit.mjs', 'phase80:audit script missing')
requireCheck((pkg.scripts['quality:release'] || '').includes('phase80:audit'), 'quality:release must include phase80 audit')
requireCheck(exists('lib/security/secrets-readiness.ts'), 'secrets readiness helper missing')
for (const token of ['getSecretsReadinessReport', 'SECRETS_OWNER', 'SECRETS_ROTATION_MODE', 'SECRETS_PUBLIC_ENV_REVIEWED', 'SECRETS_ROTATION_RUNBOOK_REVIEWED', 'SECRETS_LEAST_PRIVILEGE_REVIEWED', 'SECRETS_LEAK_RESPONSE_REVIEWED']) {
  requireCheck(helper.includes(token), `helper missing ${token}`)
}
for (const lane of ['auth-session-secrets', 'database-secrets', 'payment-webhook-secrets', 'email-notification-secrets', 'cron-admin-secrets', 'public-env-boundary']) {
  requireCheck(helper.includes(lane), `secret lane missing ${lane}`)
}
requireCheck(exists('app/admin/secrets-readiness/page.tsx'), 'admin secrets readiness page missing')
requireCheck(adminPage.includes('Secrets rotation readiness') && adminPage.includes('/api/admin/secrets-readiness') && adminPage.includes('Phase 80'), 'admin page must show title, API and phase badge')
requireCheck(exists('app/api/admin/secrets-readiness/route.ts'), 'secrets readiness API route missing')
requireCheck(adminApi.includes('requireAdmin') && adminApi.includes('getSecretsReadinessReport'), 'admin API must require admin and return report')
requireCheck(exists('scripts/secrets-readiness-local.mjs'), 'secrets readiness local evidence script missing')
for (const token of ['secrets-readiness.json', 'secrets-controls.csv', 'secret-lanes.csv', 'secrets-rotation-runbook.md', 'public-env-boundary-checklist.md']) {
  requireCheck(localScript.includes(token), `local script missing ${token}`)
}
requireCheck(adminShell.includes('/admin/secrets-readiness'), 'admin shell must link secrets readiness page')
for (const key of ['SECRETS_OWNER', 'SECRETS_ROTATION_MODE', 'SECRETS_PUBLIC_ENV_REVIEWED', 'SECRETS_ROTATION_RUNBOOK_REVIEWED', 'SECRETS_LEAST_PRIVILEGE_REVIEWED', 'SECRETS_LEAK_RESPONSE_REVIEWED', 'SECRETS_EVIDENCE_DIR']) {
  requireCheck(env.includes(key), `.env.example missing ${key}`)
}
requireCheck(evidence.includes('Secrets Rotation Readiness') && evidence.includes('npm run secrets:readiness'), 'launch evidence gate missing secrets readiness')
requireCheck(previousAudit.includes('3.0.49') && previousAudit.includes('newer release'), 'phase79 audit must accept newer releases')

console.log('\nPhase 80 secrets rotation readiness audit')
console.log(`Issues found: ${issues.length}`)
if (issues.length) {
  for (const issue of issues) console.error('❌ ' + issue)
  process.exit(1)
}
console.log('✅ Phase 80 secrets rotation readiness checks passed.\n')
