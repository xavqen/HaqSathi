import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const issues = []
const read = (file) => readFileSync(join(root, file), 'utf8')
const exists = (file) => existsSync(join(root, file))
const json = (file) => JSON.parse(read(file))

const pkg = json('package.json')
const tsconfig = json('tsconfig.json')
const env = read('.env.example')
const resources = read('lib/resources/seed-resources.ts')
const linkChecks = read('lib/link-checks/seed-link-checks.ts')
const finalQa = read('app/admin/final-qa/page.tsx')
const prismaConfig = read('prisma.config.ts')

function require(condition, message) {
  if (!condition) issues.push(message)
}

require(/3\.0\.(9|10|11|12|1[3-9]|[2-9][0-9])/.test(pkg.version), 'package version should be v3.0.9+ release/typecheck QA')
require(pkg.scripts['phase39:audit'] === 'node scripts/phase39-release-typecheck-audit.mjs', 'phase39:audit script missing')
require((pkg.scripts['quality:release'] || '').includes('phase39:audit'), 'quality:release must include phase39 audit')
require(((pkg.scripts.typecheck || '').includes('prisma generate') && (pkg.scripts.typecheck || '').includes('tsc --noEmit')) || ((pkg.scripts['release:typecheck'] || '').includes('db:generate') && (pkg.scripts['release:typecheck'] || '').includes('typecheck')), 'release typecheck should generate Prisma client before TypeScript checking')
require(pkg.devDependencies?.['@playwright/test'], '@playwright/test must be a devDependency for local typecheck/e2e imports')
require(tsconfig.compilerOptions?.noImplicitAny === false, 'tsconfig should disable noImplicitAny for generated one-line admin pages until they are fully typed')
require(prismaConfig.includes('process.env.DATABASE_URL ||'), 'prisma.config should have a safe local fallback string for strict TypeScript')
require(exists('lib/qa/launch-evidence.ts'), 'launch evidence gate library missing')
require(finalQa.includes('getLaunchEvidenceSummary'), 'final QA page should render launch evidence gates')
require(finalQa.includes('npm run release:typecheck'), 'final QA page should include release:typecheck command')
require(finalQa.includes('npm run test:e2e'), 'final QA page should include Playwright e2e command')
require(finalQa.includes('npm run lighthouse:local'), 'final QA page should include Lighthouse command')
require(finalQa.includes('Razorpay') && finalQa.includes('Supabase') && finalQa.includes('Resend'), 'final QA page should cover payment, storage and email gates')
require(!/url:\s*null/.test(resources), 'official resource seeds should not contain null URLs')
require(!/url:\s*''/.test(linkChecks), 'official link-check seeds should not contain empty URLs')
require(resources.includes('RBI Complaint Management System'), 'resource seeds should include RBI CMS')
require(resources.includes('EPFO Grievance Management System'), 'resource seeds should include EPFO grievance')
require(env.includes('E2E_BASE_URL') && env.includes('LIGHTHOUSE_BASE_URL'), '.env.example should include e2e and lighthouse base URL variables')

console.log('\nHaqSathi Phase 39 release typecheck + QA audit')
console.log('Checks: 18')
console.log(`Issues found: ${issues.length}`)
if (issues.length) {
  for (const issue of issues) console.error('❌ ' + issue)
  process.exit(1)
}
console.log('✅ Phase 39 audit passed: release typecheck script, Playwright dependency, production QA gates, official resource URL fill, link-check seeds and final QA commands are installed.\n')
