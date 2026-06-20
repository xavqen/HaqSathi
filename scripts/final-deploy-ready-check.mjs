import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const outputDir = join(root, 'artifacts', 'final-deploy')
const issues = []
const warnings = []
const read = (file) => readFileSync(join(root, file), 'utf8')
const exists = (file) => existsSync(join(root, file))
const json = (file) => JSON.parse(read(file))

function issue(id, file, detail) {
  issues.push({ id, file, detail })
}

function warning(id, file, detail) {
  warnings.push({ id, file, detail })
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

function checkVersionSync() {
  const pkg = json('package.json')
  const lock = json('package-lock.json')
  const version = pkg.version
  const short = version.match(/^(\d+\.\d+\.\d+)/)?.[1]
  if (version !== '3.0.105-motion-hydration-stability') issue('package-version', 'package.json', `expected 3.0.105-motion-hydration-stability, found ${version}`)
  if (lock.version !== version || lock.packages?.['']?.version !== version) issue('lock-version-sync', 'package-lock.json', 'package-lock root version must match package.json')
  if (!short) issue('version-short', 'package.json', 'package version must start with x.y.z')
  if (short && !read('.env.example').includes(`NEXT_PUBLIC_APP_VERSION="${short}"`)) issue('env-version', '.env.example', `NEXT_PUBLIC_APP_VERSION must be ${short}`)
  if (!read('public/sw.js').includes('haqsathi-ai-v3-0-105-motion-hydration-stability')) issue('sw-version', 'public/sw.js', 'service worker cache must be current')
  if (!read('app/api/health/route.ts').includes(version) || !read('app/api/ready/route.ts').includes(version)) issue('api-version', 'app/api/health|ready', 'health and ready endpoints must report final version')
}

function checkDeterministicDependencies() {
  const pkg = json('package.json')
  const lock = json('package-lock.json')
  const sections = ['dependencies', 'devDependencies']
  for (const section of sections) {
    for (const [name, range] of Object.entries(pkg[section] || {})) {
      if (/latest|\*|workspace:|file:/i.test(range) || /^[~^]/.test(range)) issue('unpinned-dependency', 'package.json', `${section}.${name}=${range}`)
      const locked = lock.packages?.[`node_modules/${name}`]?.version
      if (!locked) issue('missing-lock-entry', 'package-lock.json', `${name} is missing from package-lock`)
      if (locked && range !== locked) issue('dependency-lock-mismatch', 'package.json', `${name} package.json=${range} package-lock=${locked}`)
    }
  }
  if (JSON.stringify(lock).includes('packages.applied-caas') || JSON.stringify(lock).includes('internal.api.openai.org')) issue('internal-registry-url', 'package-lock.json', 'package-lock must use public npm registry URLs for Vercel deploy')
  if (lock.packages?.['node_modules/next/node_modules/postcss']) issue('nested-vulnerable-postcss', 'package-lock.json', 'Next should use the overridden root postcss version, not nested postcss 8.4.x')
  const postcss = lock.packages?.['node_modules/postcss']?.version
  if (!semverGte(postcss, '8.5.10')) issue('postcss-version', 'package-lock.json', `postcss ${postcss || 'missing'} must be >= 8.5.10`)
  const esbuild = lock.packages?.['node_modules/esbuild']?.version
  if (esbuild && !semverGte(esbuild, '0.28.1')) issue('esbuild-version', 'package-lock.json', `esbuild ${esbuild} must be >= 0.28.1`)
}

function checkDevLinkSafety() {
  const register = read('app/api/auth/register/route.ts')
  const verify = read('app/api/auth/email-verification/request/route.ts')
  const forgot = read('app/api/auth/forgot-password/route.ts')
  const env = read('.env.example')
  for (const [file, text] of [
    ['app/api/auth/register/route.ts', register],
    ['app/api/auth/email-verification/request/route.ts', verify]
  ]) {
    if (!text.includes("process.env.NODE_ENV !== 'production'")) issue('email-dev-link-production-risk', file, 'dev verification links must be production-impossible')
    if (!text.includes("process.env.EMAIL_VERIFICATION_DEV_LINKS === 'true'")) issue('email-dev-link-opt-in', file, 'dev verification links must be explicit opt-in')
    if (text.includes("EMAIL_VERIFICATION_DEV_LINKS !== 'false'")) issue('email-dev-link-default-on', file, 'dev verification links must not default on')
  }
  if (!forgot.includes("process.env.NODE_ENV !== 'production'") || !forgot.includes("process.env.PASSWORD_RESET_DEV_LINKS === 'true'")) issue('reset-dev-link-safety', 'app/api/auth/forgot-password/route.ts', 'password reset dev links must be production-impossible and opt-in')
  if (!env.includes('PASSWORD_RESET_DEV_LINKS="false"') || !env.includes('EMAIL_VERIFICATION_DEV_LINKS="false"')) issue('dev-link-env-defaults', '.env.example', 'dev link flags must default false')
}

function checkFinalLaunchFiles() {
  const required = [
    'FINAL_DEPLOY_READY.md',
    'PHASE_132_FINAL_DEPLOY_PACKAGE.md',
    'scripts/final-deploy-ready-check.mjs',
    'scripts/phase132-final-deploy-package-audit.mjs',
    'scripts/full-project-code-scan.mjs',
    'scripts/deep-project-code-scan.mjs',
    'scripts/package-hygiene-scan.mjs',
    'scripts/launch-evidence-gate.mjs',
    'scripts/launch-artifact-manifest.mjs',
    'scripts/launch-ops-snapshot.mjs',
    'scripts/launch-rollback-drill.mjs',
    'scripts/launch-postlaunch-support-check.mjs'
  ]
  for (const file of required) if (!exists(file)) issue('missing-final-file', file, 'required final deploy file missing')
  const pkg = json('package.json')
  if (pkg.scripts['launch:final-ready'] !== 'node scripts/final-deploy-ready-check.mjs') issue('missing-final-ready-script', 'package.json', 'launch:final-ready script must be registered')
  if (!String(pkg.scripts['quality:release'] || '').includes('phase132:audit')) issue('quality-release-missing-phase132', 'package.json', 'quality:release must include phase132:audit')
  if (!String(pkg.scripts['quality:release'] || '').includes('phase133:audit')) issue('quality-release-missing-phase133', 'package.json', 'quality:release must include phase133:audit')
  if (pkg.scripts['scan:package-hygiene'] !== 'node scripts/package-hygiene-scan.mjs') issue('missing-package-hygiene-script', 'package.json', 'scan:package-hygiene script must be registered')
  if (!String(pkg.scripts['scan:complete'] || '').includes('scan:package-hygiene')) issue('scan-complete-missing-hygiene', 'package.json', 'scan:complete must include package hygiene scan')
  if (!String(pkg.scripts['launch:production-gate'] || '').includes('launch:final-ready')) warning('production-gate-missing-final-ready', 'package.json', 'launch:production-gate should include final ready check')
}

checkVersionSync()
checkDeterministicDependencies()
checkDevLinkSafety()
checkFinalLaunchFiles()

const report = {
  ok: issues.length === 0,
  version: '3.0.105-motion-hydration-stability',
  summary: { issues: issues.length, warnings: warnings.length },
  issues,
  warnings,
  generatedAt: new Date().toISOString()
}

mkdirSync(outputDir, { recursive: true })
writeFileSync(join(outputDir, 'final-deploy-ready-check.json'), JSON.stringify(report, null, 2))
writeFileSync(join(outputDir, 'final-deploy-ready-check.csv'), ['type,id,file,detail', ...issues.map((item) => `issue,${item.id},${item.file},"${String(item.detail).replaceAll('"', '""')}"`), ...warnings.map((item) => `warning,${item.id},${item.file},"${String(item.detail).replaceAll('"', '""')}"`)].join('\n'))

console.log('\nHaqSathi AI final deploy ready check')
console.log('Version: 3.0.105-motion-hydration-stability')
console.log(`Issues found: ${issues.length}`)
console.log(`Warnings found: ${warnings.length}`)
for (const item of issues) console.error(`❌ ${item.id}: ${item.file} -> ${item.detail}`)
for (const item of warnings) console.warn(`⚠️ ${item.id}: ${item.file} -> ${item.detail}`)
if (issues.length) process.exit(1)
console.log('✅ Final deploy ready check passed: versions, lockfile, dependency pins, package hygiene, auth dev-link safety and final launch files are ready.\n')
