import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const issues = []
const exists = (file) => existsSync(join(root, file))
const read = (file) => readFileSync(join(root, file), 'utf8')
const pkg = JSON.parse(read('package.json'))
const env = read('.env.example')
const dbCheck = read('app/api/setup/db-check/route.ts')
const contactApi = read('app/api/contact/route.ts')
const guards = read('lib/auth/guards.ts')
const languageInstructions = read('lib/ai/language-instructions.ts')
const finalMatrix = read('lib/launch/final-qa-matrix.ts')
const sw = read('public/sw.js')
const health = read('app/api/health/route.ts')
const ready = read('app/api/ready/route.ts')

function pass(name, condition) {
  if (!condition) issues.push(name)
}

pass('version is v3.0.100 or newer full-project scan release', (/^3\.0\.([1-9]\d{2,})(?:-|$)/.test(pkg.version)))
pass('scan:full uses node-only full project scanner', pkg.scripts['scan:full'] === 'node scripts/full-project-code-scan.mjs')
pass('phase130 audit script is registered', pkg.scripts['phase130:audit'] === 'node scripts/phase130-full-project-scan-audit.mjs')
pass('quality release includes phase130', pkg.scripts['quality:release'].includes('phase130:audit'))
pass('full project scanner exists and checks imports links API env setup and contact persistence', exists('scripts/full-project-code-scan.mjs') && read('scripts/full-project-code-scan.mjs').includes('checkImports') && read('scripts/full-project-code-scan.mjs').includes('checkLinks') && read('scripts/full-project-code-scan.mjs').includes('checkApiFetches') && read('scripts/full-project-code-scan.mjs').includes('checkEnvExample') && read('scripts/full-project-code-scan.mjs').includes('checkSensitiveSetupRoutes') && read('scripts/full-project-code-scan.mjs').includes('checkContactApiPersistence'))
pass('missing auth guards compatibility module fixed', guards.includes('requireAdmin') && guards.includes('@/lib/auth/session'))
pass('setup db-check is restricted and does not return databaseUrl', dbCheck.includes('SETUP_DB_CHECK_SECRET') && dbCheck.includes('getCurrentUser') && !dbCheck.includes('databaseUrl') && dbCheck.includes('Setup database check is restricted'))
pass('contact API saves contact/support ticket transactionally', contactApi.includes('db.$transaction') && contactApi.includes('tx.contactMessage.create') && contactApi.includes('tx.supportTicket.create'))
pass('contact API returns failure when persistence fails', contactApi.includes('Support request could not be saved') && contactApi.includes("status: 503") && !/catch \([^)]*\) \{\s*console\.error\([^)]*\)\s*\}\s*return NextResponse\.json\(\{\s*ok: true/s.test(contactApi))
pass('public legal env keys documented', env.includes('NEXT_PUBLIC_GRIEVANCE_OFFICER_NAME') && env.includes('NEXT_PUBLIC_GRIEVANCE_OFFICER_EMAIL') && env.includes('NEXT_PUBLIC_GRIEVANCE_OFFICER_ADDRESS') && env.includes('NEXT_PUBLIC_LEGAL_JURISDICTION'))
pass('setup db check secret documented', env.includes('SETUP_DB_CHECK_SECRET'))
pass('AI language instruction helper is server-only', languageInstructions.includes("import 'server-only'"))
pass('launch readiness matrix includes full project scan evidence', finalMatrix.includes('full-project-code-scan') && finalMatrix.includes('npm run scan:full'))
pass('env, health, ready and service worker are current', env.includes('NEXT_PUBLIC_APP_VERSION="3.0.') && health.includes('3.0.') && ready.includes('3.0.') && sw.includes('haqsathi-ai-v3-0-'))
pass('phase notes exist', exists('PHASE_130_FULL_PROJECT_SCAN_FIXPACK.md'))

console.log('\nPhase 130 full project scan fixpack audit')
console.log('Checks: 15')
console.log(`Issues found: ${issues.length}`)
if (issues.length) {
  for (const issue of issues) console.error('❌ ' + issue)
  process.exit(1)
}
console.log('✅ Phase 130 audit passed: full-project scanner, missing auth guard fix, setup route hardening, support persistence and env coverage are in place.\n')
