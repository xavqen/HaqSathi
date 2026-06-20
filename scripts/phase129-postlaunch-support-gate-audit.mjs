import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const issues = []
const exists = (file) => existsSync(join(root, file))
const read = (file) => readFileSync(join(root, file), 'utf8')
const pkg = JSON.parse(read('package.json'))
const env = read('.env.example')
const health = read('app/api/health/route.ts')
const ready = read('app/api/ready/route.ts')
const sw = read('public/sw.js')
const contactApi = read('app/api/contact/route.ts')
const contactForm = read('components/forms/contact-form.tsx')
const contactPage = read('app/contact/page.tsx')
const postLaunchLib = read('lib/launch/post-launch-support.ts')
const postLaunchScript = read('scripts/launch-postlaunch-support-check.mjs')
const evidenceGate = read('scripts/launch-evidence-gate.mjs')
const artifactManifest = read('scripts/launch-artifact-manifest.mjs')
const finalMatrix = read('lib/launch/final-qa-matrix.ts')
const productionOps = read('lib/launch/production-ops.ts')
const launchPage = read('app/launch-readiness/page.tsx')
const adminPage = read('app/admin/post-launch-support/page.tsx')
const adminShell = read('components/admin/admin-shell.tsx')

function pass(name, condition) {
  if (!condition) issues.push(name)
}

pass('version is v3.0.99 or newer postlaunch release', (/^3\.0\.(99|[1-9]\d{2,})(?:-|$)/.test(pkg.version)))
pass('phase129 audit script is registered', pkg.scripts['phase129:audit'] === 'node scripts/phase129-postlaunch-support-gate-audit.mjs')
pass('quality release includes phase129', pkg.scripts['quality:release'].includes('phase129:audit'))
pass('postlaunch support command is registered', pkg.scripts['launch:postlaunch-support'] === 'node scripts/launch-postlaunch-support-check.mjs')
pass('production gate includes postlaunch support before evidence gate', pkg.scripts['launch:production-gate'].includes('launch:rollback-drill && npm run launch:postlaunch-support && npm run launch:evidence-gate'))
pass('contact form exposes category priority and no-secret warning', contactForm.includes('FRAUD_ABUSE') && contactForm.includes('URGENT') && contactForm.includes('Never share OTP') && contactForm.includes('1930') && contactForm.includes('cybercrime.gov.in'))
pass('contact page exposes support email and support copy', contactPage.includes('NEXT_PUBLIC_SUPPORT_EMAIL') && contactPage.includes('support@haqsathi.site') && contactPage.includes('fraud/abuse reports'))
pass('contact API redacts secrets and creates urgent support tickets', contactApi.includes('redactSecrets') && contactApi.includes('supportTicket.create') && contactApi.includes('FRAUD_ABUSE') && contactApi.includes('1930') && contactApi.includes('rateLimitAsync') && contactApi.includes('csrfGuard'))
pass('postlaunch support library exposes checklist', postLaunchLib.includes('postLaunchSupportChecklist') && postLaunchLib.includes('fraud, payment, login') && postLaunchLib.includes('getPostLaunchSupportChecklist'))
pass('postlaunch support script writes JSON and CSV artifacts', postLaunchScript.includes('postlaunch-support-check.json') && postLaunchScript.includes('postlaunch-support-check.csv'))
pass('postlaunch support script checks owners, macros, contact, abuse and first 24h', postLaunchScript.includes('LAUNCH_SUPPORT_OWNER') && postLaunchScript.includes('LAUNCH_ABUSE_REVIEW_OWNER') && postLaunchScript.includes('LAUNCH_CONTACT_FORM_TESTED') && postLaunchScript.includes('LAUNCH_ABUSE_REPORT_FLOW_TESTED') && postLaunchScript.includes('LAUNCH_SUPPORT_MACROS_REVIEWED') && postLaunchScript.includes('LAUNCH_FIRST_24H_REVIEW_CONFIRMED'))
pass('postlaunch support script scans contact page and redacts secrets', postLaunchScript.includes('/contact') && postLaunchScript.includes('secretPattern') && postLaunchScript.includes('[redacted secret-like evidence]'))
pass('evidence gate requires postlaunch support artifact', evidenceGate.includes('postlaunch-support-check.json') && evidenceGate.includes('postlaunch-support-artifact') && evidenceGate.includes('POSTLAUNCH_SUPPORT_READY'))
pass('artifact manifest includes postlaunch support proof', artifactManifest.includes("id: 'postlaunch-support'") && artifactManifest.includes('postlaunch-support-check.json'))
pass('final QA matrix exposes postlaunch support gate', finalMatrix.includes('postlaunch-support-gate') && finalMatrix.includes('launch:postlaunch-support'))
pass('production ops checklist references postlaunch support artifact', productionOps.includes('postlaunch-support-artifact') && productionOps.includes('postlaunch-support-check.json'))
pass('launch readiness page renders postlaunch support checklist', launchPage.includes('getPostLaunchSupportChecklist') && launchPage.includes('Post-launch support gate'))
pass('admin postlaunch support page exists and is linked', exists('app/admin/post-launch-support/page.tsx') && adminPage.includes('Phase 129') && adminPage.includes('POSTLAUNCH_SUPPORT_BASE_URL') && adminShell.includes('/admin/post-launch-support'))
pass('env exposes postlaunch support controls', env.includes('POSTLAUNCH_SUPPORT_BASE_URL') && env.includes('STRICT_POSTLAUNCH_SUPPORT') && env.includes('LAUNCH_SUPPORT_OWNER') && env.includes('LAUNCH_ABUSE_REVIEW_OWNER') && env.includes('LAUNCH_CONTACT_FORM_TESTED') && env.includes('LAUNCH_ABUSE_REPORT_FLOW_TESTED') && env.includes('LAUNCH_SUPPORT_MACROS_REVIEWED') && env.includes('LAUNCH_FIRST_24H_REVIEW_CONFIRMED') && env.includes('LAUNCH_SUPPORT_SLA_HOURS'))
pass('env, health, ready and service worker are current', env.includes('NEXT_PUBLIC_APP_VERSION="3.0.') && health.includes('3.0.') && ready.includes('3.0.') && sw.includes('haqsathi-ai-v3-0-'))
pass('phase notes exist', exists('PHASE_129_POSTLAUNCH_SUPPORT_GATE.md'))

console.log('\nPhase 129 post-launch support gate audit')
console.log('Checks: 21')
console.log(`Issues found: ${issues.length}`)
if (issues.length) {
  for (const issue of issues) console.error('❌ ' + issue)
  process.exit(1)
}
console.log('✅ Phase 129 audit passed: post-launch support, urgent escalation, evidence gate and artifact manifest wiring are in place.\n')
