import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const issues = []
const read = (file) => readFileSync(join(root, file), 'utf8')
const exists = (file) => existsSync(join(root, file))
const pkg = JSON.parse(read('package.json'))
const lock = JSON.parse(read('package-lock.json'))
const gitignore = read('.gitignore')
const env = read('.env.example')
const sw = read('public/sw.js')
const health = read('app/api/health/route.ts')
const ready = read('app/api/ready/route.ts')
const finalReady = read('scripts/final-deploy-ready-check.mjs')
const phase132 = read('scripts/phase132-final-deploy-package-audit.mjs')

function pass(name, condition) {
  if (!condition) issues.push(name)
}

function hasIgnore(entry) {
  return new RegExp(`(^|\\n)${entry.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(\\n|$)`).test(gitignore)
}

pass('version bumped to v3.0.105 auth billing nav fix', pkg.version === '3.0.105-motion-hydration-stability')
pass('package lock version matches package version', lock.version === pkg.version && lock.packages?.['']?.version === pkg.version)
pass('env health ready and service worker current', env.includes('NEXT_PUBLIC_APP_VERSION="3.0.105"') && health.includes(pkg.version) && ready.includes(pkg.version) && sw.includes('haqsathi-ai-v3-0-105-motion-hydration-stability'))
pass('package hygiene scanner exists and is registered', exists('scripts/package-hygiene-scan.mjs') && pkg.scripts['scan:package-hygiene'] === 'node scripts/package-hygiene-scan.mjs')
pass('complete scan includes package hygiene', String(pkg.scripts['scan:complete'] || '').includes('scan:full') && String(pkg.scripts['scan:complete'] || '').includes('scan:deep') && String(pkg.scripts['scan:complete'] || '').includes('scan:package-hygiene'))
pass('quality release includes phase133', pkg.scripts['phase133:audit'] === 'node scripts/phase133-complete-code-scan-clean-package-audit.mjs' && String(pkg.scripts['quality:release'] || '').includes('phase133:audit'))
pass('generated tsbuild info removed from package', !exists('tsconfig.tsbuildinfo'))
pass('generated/cache outputs ignored', ['tsconfig.tsbuildinfo', 'artifacts', '.turbo', 'playwright-report', 'test-results', 'dist', 'build'].every(hasIgnore))
pass('final ready check validates package hygiene', finalReady.includes('scripts/package-hygiene-scan.mjs') && finalReady.includes('scan:package-hygiene') && finalReady.includes('phase133:audit'))
pass('phase132 accepts newer releases', phase132.includes('semverGte(pkg.version, \'3.0.102\')'))
pass('package hygiene scanner checks node script syntax', read('scripts/package-hygiene-scan.mjs').includes('nodeScriptsChecked') && read('scripts/package-hygiene-scan.mjs').includes('--check'))
pass('package hygiene scanner checks lock and internal registry', read('scripts/package-hygiene-scan.mjs').includes('internal-registry-url') && read('scripts/package-hygiene-scan.mjs').includes('lock-version-mismatch'))

console.log('\nPhase 133 complete code scan clean package audit')
console.log('Checks: 12')
console.log(`Issues found: ${issues.length}`)
if (issues.length) {
  for (const issue of issues) console.error('❌ ' + issue)
  process.exit(1)
}
console.log('✅ Phase 133 audit passed: complete scan now enforces clean deploy packaging, script syntax and generated artifact hygiene.\n')
