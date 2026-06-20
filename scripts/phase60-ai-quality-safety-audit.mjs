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

const helper = exists('lib/ai-quality-safety-readiness.ts') ? read('lib/ai-quality-safety-readiness.ts') : ''
const adminPage = exists('app/admin/ai-safety-readiness/page.tsx') ? read('app/admin/ai-safety-readiness/page.tsx') : ''
const adminApi = exists('app/api/admin/ai-safety-readiness/route.ts') ? read('app/api/admin/ai-safety-readiness/route.ts') : ''
const adminShell = exists('components/admin/admin-shell.tsx') ? read('components/admin/admin-shell.tsx') : ''
const env = read('.env.example')
const evidence = read('lib/qa/launch-evidence.ts')

require((/3\.0\.(30|[3-9][0-9])/.test(pkg.version) || /^3\.0\.(?:[1-9]\d{2,})/.test(pkg.version)), 'package version must be v3.0.30+')
require(pkg.scripts['ai-safety:readiness'] === 'node scripts/ai-safety-readiness-local.mjs', 'ai-safety:readiness script missing')
require(pkg.scripts['phase60:audit'] === 'node scripts/phase60-ai-quality-safety-audit.mjs', 'phase60:audit script missing')
require((pkg.scripts['quality:release'] || '').includes('phase60:audit'), 'quality:release must include phase60 audit')
require(exists('lib/ai-quality-safety-readiness.ts'), 'AI safety readiness helper missing')
for (const token of ['getAiQualitySafetyReadinessReport', 'aiSafetyReviewLanes', 'AI_GUARDRAILS_MODE', 'AI_REVIEW_QUEUE_ENABLED', 'AI_PII_REDACTION_ENABLED', 'AI_HALLUCINATION_REVIEW_REQUIRED', 'critical']) {
  require(helper.includes(token), `AI safety helper missing ${token}`)
}
require(exists('app/admin/ai-safety-readiness/page.tsx'), 'admin AI safety readiness page missing')
require(adminPage.includes('AI quality & safety readiness') && adminPage.includes('npm run ai-safety:readiness') && adminPage.includes('/api/admin/ai-safety-readiness'), 'admin page must show title, command and API')
require(exists('app/api/admin/ai-safety-readiness/route.ts'), 'AI safety admin API missing')
require(adminApi.includes('requireAdmin') && adminApi.includes('getAiQualitySafetyReadinessReport'), 'admin API must require admin and return report')
require(exists('scripts/ai-safety-readiness-local.mjs'), 'AI safety local evidence script missing')
require(adminShell.includes('/admin/ai-safety-readiness'), 'admin shell must link AI safety page')
for (const key of ['AI_GUARDRAILS_MODE', 'AI_REVIEW_QUEUE_ENABLED', 'AI_PII_REDACTION_ENABLED', 'AI_HALLUCINATION_REVIEW_REQUIRED', 'AI_LOW_CONFIDENCE_THRESHOLD', 'AI_OUTPUT_LOG_RETENTION_DAYS', 'AI_SAFETY_REVIEW_OWNER', 'AI_SAFETY_ESCALATION_WEBHOOK_URL', 'AI_SAFETY_EVIDENCE_DIR']) {
  require(env.includes(`${key}=`), `.env.example missing ${key}`)
}
require(evidence.includes('AI Quality Safety Readiness'), 'launch evidence gate missing AI quality safety readiness')
require(exists('PHASE_60_AI_QUALITY_SAFETY.md'), 'Phase 60 notes missing')

console.log('\nHaqSathi Phase 60 AI quality & safety audit')
console.log('Checks: 15')
console.log(`Issues found: ${issues.length}`)
if (issues.length) {
  for (const issue of issues) console.error('❌ ' + issue)
  process.exit(1)
}
console.log('✅ Phase 60 audit passed: AI quality/safety readiness helper, admin page, API, evidence script, envs and launch gate are installed.\n')
