import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const issues = []
const read = (file) => readFileSync(join(root, file), 'utf8')
const exists = (file) => existsSync(join(root, file))
const pkg = JSON.parse(read('package.json'))
const lock = JSON.parse(read('package-lock.json'))
const env = read('.env.example')
const sw = read('public/sw.js')
const health = read('app/api/health/route.ts')
const ready = read('app/api/ready/route.ts')
const register = read('app/api/auth/register/route.ts')
const verifyRequest = read('app/api/auth/email-verification/request/route.ts')
const finalMatrix = read('lib/launch/final-qa-matrix.ts')
const finalCheck = read('scripts/final-deploy-ready-check.mjs')
const phase131 = read('scripts/phase131-deep-code-scan-hardening-audit.mjs')

function pass(name, condition) {
  if (!condition) issues.push(name)
}

function semverGte(version, minimum) {
  const parse = (value) => String(value || '').split('.').map((part) => Number.parseInt(part.replace(/[^0-9].*$/, ''), 10) || 0)
  const a = parse(version)
  const b = parse(minimum)
  for (let i = 0; i < Math.max(a.length, b.length); i += 1) {
    if ((a[i] || 0) > (b[i] || 0)) return true
    if ((a[i] || 0) < (b[i] || 0)) return false
  }
  return true
}

const depText = JSON.stringify({ dependencies: pkg.dependencies, devDependencies: pkg.devDependencies })
pass('version is v3.0.102 or newer final deploy package', semverGte(pkg.version, '3.0.102'))
pass('package lock version matches package version', lock.version === pkg.version && lock.packages?.['']?.version === pkg.version)
pass('env health ready and service worker current', env.includes('NEXT_PUBLIC_APP_VERSION="3.0.105"') && health.includes(pkg.version) && ready.includes(pkg.version) && sw.includes('haqsathi-ai-v3-0-105-motion-hydration-stability'))
pass('package dependencies are pinned without latest/caret/tilde', !/latest|\*|workspace:|file:|["']\^|["']~/.test(depText))
pass('lock has framer-motion and safe postcss/esbuild resolution', lock.packages?.['node_modules/framer-motion']?.version && lock.packages?.['node_modules/postcss']?.version === '8.5.15' && !lock.packages?.['node_modules/next/node_modules/postcss'] && lock.packages?.['node_modules/esbuild']?.version === '0.28.1')
pass('package lock has no internal registry URLs', !JSON.stringify(lock).includes('packages.applied-caas') && !JSON.stringify(lock).includes('internal.api.openai.org'))
pass('email verification dev links are production-impossible and opt-in', register.includes("process.env.NODE_ENV !== 'production'") && register.includes("process.env.EMAIL_VERIFICATION_DEV_LINKS === 'true'") && verifyRequest.includes("process.env.NODE_ENV !== 'production'") && verifyRequest.includes("process.env.EMAIL_VERIFICATION_DEV_LINKS === 'true'") && !register.includes("EMAIL_VERIFICATION_DEV_LINKS !== 'false'") && !verifyRequest.includes("EMAIL_VERIFICATION_DEV_LINKS !== 'false'"))
pass('dev link flags default false in env example', env.includes('PASSWORD_RESET_DEV_LINKS="false"') && env.includes('EMAIL_VERIFICATION_DEV_LINKS="false"'))
pass('deep scanner checks email verification dev link safety', read('scripts/deep-project-code-scan.mjs').includes('checkEmailVerificationSafety') && read('scripts/deep-project-code-scan.mjs').includes('EMAIL_VERIFICATION_DEV_LINKS="false"'))
pass('final ready check registered and production gate includes it', pkg.scripts['launch:final-ready'] === 'node scripts/final-deploy-ready-check.mjs' && pkg.scripts['launch:production-gate'].includes('launch:final-ready'))
pass('phase132 audit is registered and in quality release', pkg.scripts['phase132:audit'] === 'node scripts/phase132-final-deploy-package-audit.mjs' && pkg.scripts['quality:release'].includes('phase132:audit'))
pass('final QA matrix includes final deploy package evidence', finalMatrix.includes('final-deploy-package') && finalMatrix.includes('npm run launch:final-ready'))
pass('final ready checker validates dependency pins and auth dev links', finalCheck.includes('checkDeterministicDependencies') && finalCheck.includes('checkDevLinkSafety') && finalCheck.includes('checkVersionSync'))
pass('phase131 audit accepts newer releases after v3.0.101', phase131.includes('version is v3.0.101 or newer'))
pass('final deploy guide exists with deploy commands', exists('FINAL_DEPLOY_READY.md') && read('FINAL_DEPLOY_READY.md').includes('npm run launch:production-gate') && read('FINAL_DEPLOY_READY.md').includes('Vercel'))
pass('phase notes exist', exists('PHASE_132_FINAL_DEPLOY_PACKAGE.md'))

console.log('\nPhase 132 final deploy package audit')
console.log('Checks: 16')
console.log(`Issues found: ${issues.length}`)
if (issues.length) {
  for (const issue of issues) console.error('❌ ' + issue)
  process.exit(1)
}
console.log('✅ Phase 132 audit passed: final deploy package, pinned dependencies, dev-link safety and launch gate wiring are ready.\n')
