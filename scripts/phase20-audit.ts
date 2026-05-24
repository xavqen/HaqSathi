import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const exists = (p: string) => existsSync(join(root, p))
const read = (p: string) => readFileSync(join(root, p), 'utf8')
const required = [
  'app/release-final/page.tsx',
  'app/admin/system-doctor/page.tsx',
  'docs/BUILD_ERROR_PLAYBOOK.md',
  'docs/PRODUCTION_HANDOFF.md',
  'scripts/final-fixpack.ts'
]
let failed = false
for (const file of required) {
  if (exists(file)) console.log(`✅ ${file}`)
  else { console.log(`❌ Missing ${file}`); failed = true }
}
const pkg = JSON.parse(read('package.json'))
if (pkg.version === '2.0.0-rc.2') console.log('✅ version 2.0.0-rc.2')
else { console.log(`❌ version expected 2.0.0-rc.2, got ${pkg.version}`); failed = true }
if (exists('middleware.ts')) { console.log('❌ middleware.ts still exists'); failed = true }
else console.log('✅ no middleware.ts conflict')
if (!read('package.json').includes('release:final-check')) { console.log('❌ release:final-check missing'); failed = true }
else console.log('✅ release:final-check script ready')
if (failed) process.exit(1)
console.log('\nPhase 20 audit passed.')
