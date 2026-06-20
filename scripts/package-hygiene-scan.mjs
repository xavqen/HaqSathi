import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { spawnSync } from 'node:child_process'

const root = process.cwd()
const outputDir = join(root, 'artifacts', 'package-hygiene')
const issues = []
const warnings = []
const text = (file) => readFileSync(join(root, file), 'utf8')
const exists = (file) => existsSync(join(root, file))

function issue(id, file, detail) { issues.push({ id, file, detail }) }
function warning(id, file, detail) { warnings.push({ id, file, detail }) }

const forbiddenGenerated = [
  'tsconfig.tsbuildinfo',
  '.next',
  '.turbo',
  'node_modules',
  'coverage',
  'playwright-report',
  'test-results',
  'dist',
  'build',
]

const requiredGitignore = [
  'node_modules',
  '.next',
  '.turbo',
  '.env',
  '.env.local',
  '*.log',
  'coverage',
  '.vercel',
  'artifacts',
  'playwright-report',
  'test-results',
  'tsconfig.tsbuildinfo',
]

function checkForbiddenGenerated() {
  for (const entry of forbiddenGenerated) {
    if (exists(entry)) issue('generated-artifact-in-package', entry, 'Generated/cache artifact must not be shipped in deploy ZIP.')
  }
  for (const file of readdirSync(root)) {
    if (/\.log$/i.test(file)) issue('log-file-in-package', file, 'Log files must not be shipped in deploy ZIP.')
  }
}

function checkGitignore() {
  const gitignore = exists('.gitignore') ? text('.gitignore') : ''
  for (const entry of requiredGitignore) {
    const pattern = new RegExp(`(^|\\n)${entry.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(\\n|$)`)
    if (!pattern.test(gitignore)) issue('gitignore-missing-entry', '.gitignore', `${entry} should be ignored.`)
  }
}

function listScriptFiles(dir) {
  const critical = [
    'scripts/package-hygiene-scan.mjs',
    'scripts/final-deploy-ready-check.mjs',
    'scripts/phase133-complete-code-scan-clean-package-audit.mjs',
  ]
  return critical.map((file) => join(root, file)).filter((file) => existsSync(file))
}

function checkNodeScriptSyntax() {
  // Full script syntax coverage already runs in `scan:deep` before this command.
  // This package-hygiene pass re-checks only the new/critical release-gate scripts to stay fast.
  for (const file of listScriptFiles(join(root, 'scripts'))) {
    const result = spawnSync(process.execPath, ['--check', file], { cwd: root, encoding: 'utf8', timeout: 15_000 })
    if (result.error) issue('node-script-syntax-timeout', relative(root, file), result.error.message)
    if (result.status !== 0) issue('node-script-syntax', relative(root, file), (result.stderr || result.stdout || 'node --check failed').slice(0, 500))
  }
}

function checkLockAndRegistry() {
  const pkg = JSON.parse(text('package.json'))
  const lock = JSON.parse(text('package-lock.json'))
  if (lock.version !== pkg.version || lock.packages?.['']?.version !== pkg.version) issue('lock-version-mismatch', 'package-lock.json', 'package-lock root version must match package.json version.')
  const lockText = JSON.stringify(lock)
  if (/packages\.applied-caas|internal\.api\.openai\.org/i.test(lockText)) issue('internal-registry-url', 'package-lock.json', 'Lockfile must not contain internal registry URLs.')
  if (/"(?:latest|\*)"/.test(JSON.stringify({ dependencies: pkg.dependencies, devDependencies: pkg.devDependencies }))) issue('unpinned-dependency', 'package.json', 'Dependencies must stay pinned for deterministic deploys.')
}

function checkEnvTemplateSafety() {
  const env = text('.env.example')
  const requiredFalse = ['PASSWORD_RESET_DEV_LINKS="false"', 'EMAIL_VERIFICATION_DEV_LINKS="false"']
  for (const flag of requiredFalse) {
    if (!env.includes(flag)) issue('dev-link-flag-not-false', '.env.example', `${flag} must be present before launch.`)
  }
  if (!env.includes('NEXT_PUBLIC_APP_VERSION="3.0.105"')) warning('env-version', '.env.example', 'NEXT_PUBLIC_APP_VERSION should match this release.')
}

checkForbiddenGenerated()
checkGitignore()
checkNodeScriptSyntax()
checkLockAndRegistry()
checkEnvTemplateSafety()

mkdirSync(outputDir, { recursive: true })
const report = {
  version: '3.0.105-motion-hydration-stability',
  generatedAt: new Date().toISOString(),
  checks: {
    forbiddenGenerated: forbiddenGenerated.length,
    requiredGitignore: requiredGitignore.length,
    nodeScriptsChecked: listScriptFiles(join(root, 'scripts')).length,
  },
  issues,
  warnings,
}
writeFileSync(join(outputDir, 'package-hygiene-scan.json'), JSON.stringify(report, null, 2))
writeFileSync(join(outputDir, 'package-hygiene-scan.csv'), ['type,id,file,detail', ...issues.map((i) => `issue,${i.id},${i.file},"${String(i.detail).replaceAll('"', '""')}"`), ...warnings.map((i) => `warning,${i.id},${i.file},"${String(i.detail).replaceAll('"', '""')}"`)].join('\n'))

console.log('\nHaqSathi AI package hygiene scan')
console.log(`Node scripts checked: ${report.checks.nodeScriptsChecked}`)
console.log(`Issues found: ${issues.length}`)
console.log(`Warnings found: ${warnings.length}`)
if (issues.length) {
  for (const item of issues) console.error(`❌ ${item.id}: ${item.file} — ${item.detail}`)
  process.exit(1)
}
if (warnings.length) for (const item of warnings) console.warn(`⚠️ ${item.id}: ${item.file} — ${item.detail}`)
console.log('✅ Package hygiene scan passed: generated caches, lockfile, script syntax, dev-link flags and deploy ignores are clean.\n')
