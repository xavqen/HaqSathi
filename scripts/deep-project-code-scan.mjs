import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { join, relative, sep } from 'node:path'

const root = process.cwd()
const outputDir = join(root, 'artifacts', 'code-scan')
const issues = []
const warnings = []
const scanned = { files: 0, sourceFiles: 0, nodeSyntaxFiles: 0, userFacingFiles: 0, bytes: 0 }
const ignoredDirs = new Set(['node_modules', '.next', '.git', 'dist', 'build', '.turbo', 'coverage', 'artifacts'])
const sourceExtensions = ['.ts', '.tsx', '.js', '.jsx', '.mjs']
const userFacingPrefixes = ['app/', 'components/', 'public/']

function walk(dir, out = []) {
  if (!existsSync(dir)) return out
  for (const name of readdirSync(dir)) {
    if (ignoredDirs.has(name)) continue
    const full = join(dir, name)
    const stat = statSync(full)
    if (stat.isDirectory()) walk(full, out)
    else out.push(full)
  }
  return out
}

function rel(file) {
  return relative(root, file).split(sep).join('/')
}

function read(file) {
  return readFileSync(join(root, file), 'utf8')
}

function issue(type, file, detail) {
  issues.push({ type, file, detail })
}

function warning(type, file, detail) {
  warnings.push({ type, file, detail })
}

function isSource(file) {
  return sourceExtensions.some((ext) => file.endsWith(ext))
}

function isUserFacing(file) {
  const path = rel(file)
  return userFacingPrefixes.some((prefix) => path.startsWith(prefix))
}

function checkNodeSyntax(files) {
  for (const file of files.filter((item) => item.endsWith('.mjs') || item.endsWith('.js'))) {
    const path = rel(file)
    if (!path.startsWith('scripts/') && !path.startsWith('public/')) continue
    scanned.nodeSyntaxFiles += 1
    try {
      execFileSync('node', ['--check', file], { stdio: 'pipe' })
    } catch (error) {
      issue('node-syntax-error', path, String(error.stderr || error.message).slice(0, 400))
    }
  }
}

function checkPasswordResetSafety() {
  const route = 'app/api/auth/forgot-password/route.ts'
  const page = 'app/forgot-password/page.tsx'
  const form = 'components/forms/forgot-password-form.tsx'
  const env = '.env.example'
  for (const file of [route, page, form, env]) if (!existsSync(join(root, file))) issue('missing-password-reset-file', file, 'required for reset safety checks')
  if (!existsSync(join(root, route))) return
  const routeText = read(route)
  if (!routeText.includes("process.env.NODE_ENV !== 'production'")) issue('password-reset-dev-link-production-risk', route, 'dev reset links must be impossible in production')
  if (!routeText.includes("process.env.PASSWORD_RESET_DEV_LINKS === 'true'")) issue('password-reset-dev-link-not-opt-in', route, 'dev reset link should require explicit PASSWORD_RESET_DEV_LINKS=true')
  if (routeText.includes("PASSWORD_RESET_DEV_LINKS !== 'false'")) issue('password-reset-dev-link-default-on', route, 'dev reset link must not default on')
  const pageText = existsSync(join(root, page)) ? read(page) : ''
  if (pageText.includes('the reset link appears on screen')) issue('public-reset-dev-copy-leak', page, 'public copy should not tell production users reset links appear on-screen')
  const envText = existsSync(join(root, env)) ? read(env) : ''
  if (!envText.includes('PASSWORD_RESET_DEV_LINKS="false"')) issue('unsafe-env-dev-reset-default', env, 'dev reset links must default to false')
}

function checkEmailVerificationSafety() {
  const routes = ['app/api/auth/register/route.ts', 'app/api/auth/email-verification/request/route.ts']
  const env = '.env.example'
  for (const route of routes) {
    if (!existsSync(join(root, route))) {
      issue('missing-email-verification-file', route, 'required for email verification safety checks')
      continue
    }
    const text = read(route)
    if (!text.includes("process.env.NODE_ENV !== 'production'")) issue('email-verify-dev-link-production-risk', route, 'dev verification links must be impossible in production')
    if (!text.includes("process.env.EMAIL_VERIFICATION_DEV_LINKS === 'true'")) issue('email-verify-dev-link-not-opt-in', route, 'dev verification link should require explicit EMAIL_VERIFICATION_DEV_LINKS=true')
    if (text.includes("EMAIL_VERIFICATION_DEV_LINKS !== 'false'")) issue('email-verify-dev-link-default-on', route, 'dev verification link must not default on')
  }
  const envText = existsSync(join(root, env)) ? read(env) : ''
  if (!envText.includes('EMAIL_VERIFICATION_DEV_LINKS="false"')) issue('unsafe-env-dev-email-verify-default', env, 'dev verification links must default to false')
}

function checkProductionDebugCopy(files) {
  const risky = [
    /empty keys create a dry-run order/i,
    /reset link appears on screen/i,
    /dev reset url/i,
    /debug mode/i,
    /local development checkout/i,
    /dry-run order/i
  ]
  for (const file of files.filter(isUserFacing)) {
    const path = rel(file)
    const text = readFileSync(file, 'utf8')
    for (const pattern of risky) {
      if (!pattern.test(text)) continue
      const allowed = text.includes("process.env.NODE_ENV !== 'production'") || text.includes("process.env.NODE_ENV === 'development'")
      if (!allowed) issue('ungated-production-debug-copy', path, `matches ${pattern}`)
    }
    if (path.startsWith('app/') && text.includes('Local development') && !text.includes("process.env.NODE_ENV !== 'production'")) {
      issue('ungated-local-development-copy', path, 'local development copy must be hidden from production users')
    }
  }
}

function checkSeedSecretLogging() {
  const file = 'prisma/seed.ts'
  if (!existsSync(join(root, file))) return
  const text = read(file)
  if (/console\.log\([^\n]*(adminPassword|Demo@123456)/.test(text)) issue('seed-prints-login-secret', file, 'seed script must not print admin/demo passwords')
  if (text.includes("' + adminPassword")) issue('seed-concatenates-admin-password', file, 'admin password should not be concatenated into logs')
}

function checkClientEnvBoundaries(files) {
  for (const file of files.filter((item) => item.endsWith('.ts') || item.endsWith('.tsx'))) {
    const path = rel(file)
    const text = readFileSync(file, 'utf8')
    const trimmed = text.trimStart()
    if (!trimmed.startsWith("'use client'") && !trimmed.startsWith('"use client"')) continue
    const matches = [...text.matchAll(/process\.env\.([A-Z0-9_]+)/g)].map((match) => match[1])
    const blocked = matches.filter((key) => !key.startsWith('NEXT_PUBLIC_') && key !== 'NODE_ENV')
    if (blocked.length) issue('client-uses-server-env', path, Array.from(new Set(blocked)).join(', '))
  }
}

function checkPackageScriptTargets() {
  const pkg = JSON.parse(read('package.json'))
  for (const [name, command] of Object.entries(pkg.scripts || {})) {
    const regex = /(?:node|tsx)\s+([^\s&|]+)/g
    for (const match of command.matchAll(regex)) {
      const target = match[1]
      if (target.startsWith('scripts/') && !existsSync(join(root, target))) issue('missing-script-target', 'package.json', `${name} -> ${target}`)
    }
  }
  if (!pkg.scripts['scan:deep']) issue('missing-deep-scan-script', 'package.json', 'scan:deep must run scripts/deep-project-code-scan.mjs')
  if (!pkg.scripts['phase131:audit']) issue('missing-phase131-script', 'package.json', 'phase131:audit must be registered')
  if (!String(pkg.scripts['quality:release'] || '').includes('phase131:audit')) issue('quality-release-missing-phase131', 'package.json', 'phase131:audit must be part of release chain')
}

function checkMetadataTitleSuffix(files) {
  for (const file of files.filter((item) => /app\/.*(page|layout)\.(ts|tsx)$/.test(rel(item)))) {
    const path = rel(file)
    const text = readFileSync(file, 'utf8')
    if (/title\s*:\s*['"][^'"]*(\||-)\s*HaqSathi AI['"]/.test(text)) {
      issue('duplicate-title-suffix-risk', path, 'page metadata title should not include app suffix when root template adds it')
    }
  }
}

function checkPublicSecretTokens(files) {
  const secretPattern = /(DATABASE_URL|DIRECT_URL|AUTH_SECRET|SUPABASE_SERVICE_ROLE_KEY|RAZORPAY_KEY_SECRET|RAZORPAY_WEBHOOK_SECRET|UPSTASH_REDIS_REST_TOKEN|OPENAI_API_KEY|GEMINI_API_KEY|RESEND_API_KEY|postgresql:\/\/|sk_live_|sk_test_)/i
  for (const file of files.filter((item) => rel(item).startsWith('public/'))) {
    const text = readFileSync(file, 'utf8')
    if (secretPattern.test(text)) issue('public-asset-secret-token', rel(file), 'public assets must not contain secret names or secret-like values')
  }
}

function checkCurrentVersionConsistency() {
  const pkg = JSON.parse(read('package.json'))
  const version = String(pkg.version || '')
  const short = version.match(/^(\d+\.\d+\.\d+)/)?.[1]
  if (!short) issue('invalid-package-version', 'package.json', version)
  const env = read('.env.example')
  const health = read('app/api/health/route.ts')
  const ready = read('app/api/ready/route.ts')
  const sw = read('public/sw.js')
  if (short && !env.includes(`NEXT_PUBLIC_APP_VERSION="${short}"`)) issue('env-version-mismatch', '.env.example', `expected NEXT_PUBLIC_APP_VERSION="${short}"`)
  if (!health.includes(version)) issue('health-version-mismatch', 'app/api/health/route.ts', version)
  if (!ready.includes(version)) issue('ready-version-mismatch', 'app/api/ready/route.ts', version)
  const swSafe = version.replaceAll('.', '-').replaceAll('_', '-').toLowerCase()
  if (!sw.includes(swSafe)) warning('service-worker-version-format-check', 'public/sw.js', `expected cache name to include ${swSafe}`)
}

const files = walk(root)
scanned.files = files.length
for (const file of files) {
  const stat = statSync(file)
  scanned.bytes += stat.size
  if (isSource(file)) scanned.sourceFiles += 1
  if (isUserFacing(file)) scanned.userFacingFiles += 1
}

checkNodeSyntax(files)
checkPasswordResetSafety()
checkEmailVerificationSafety()
checkProductionDebugCopy(files)
checkSeedSecretLogging()
checkClientEnvBoundaries(files)
checkPackageScriptTargets()
checkMetadataTitleSuffix(files)
checkPublicSecretTokens(files)
checkCurrentVersionConsistency()

const report = {
  ok: issues.length === 0,
  version: '3.0.105-motion-hydration-stability',
  scanned,
  issues,
  warnings,
  generatedAt: new Date().toISOString()
}
mkdirSync(outputDir, { recursive: true })
writeFileSync(join(outputDir, 'deep-project-code-scan.json'), JSON.stringify(report, null, 2))
writeFileSync(join(outputDir, 'deep-project-code-scan.csv'), ['type,file,detail', ...[...issues, ...warnings].map((item) => `${item.type},${item.file},"${String(item.detail).replaceAll('"', '""')}"`)].join('\n'))

console.log('\nHaqSathi AI deep project code scan')
console.log(`Files scanned: ${scanned.files}`)
console.log(`Source files scanned: ${scanned.sourceFiles}`)
console.log(`User-facing files scanned: ${scanned.userFacingFiles}`)
console.log(`Node syntax files checked: ${scanned.nodeSyntaxFiles}`)
console.log(`Issues found: ${issues.length}`)
console.log(`Warnings found: ${warnings.length}`)
for (const item of issues) console.error(`❌ ${item.type}: ${item.file} -> ${item.detail}`)
for (const item of warnings) console.warn(`⚠️ ${item.type}: ${item.file} -> ${item.detail}`)
if (issues.length) process.exit(1)
console.log('✅ Deep project scan passed: production debug copy, reset/email dev links, seed secret logging, client env boundaries, scripts, public secrets and title suffixes look safe.\n')
