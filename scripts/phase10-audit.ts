import fs from 'fs'
import path from 'path'

const root = process.cwd()
const required = [
  'app/api/document-vault/upload/route.ts',
  'app/api/document-vault/download/route.ts',
  'app/api/auth/reset-password/route.ts',
  'app/reset-password/page.tsx',
  'app/api/billing/verify/route.ts',
  'lib/storage/supabase-storage.ts',
  'lib/auth/password-reset.ts',
  'PHASE_10_LAUNCH_FEATURES.md'
]

let ok = true
console.log('HaqSathi AI Phase 10 audit')
for (const file of required) {
  const exists = fs.existsSync(path.join(root, file))
  console.log(`${exists ? '✅' : '❌'} ${file}`)
  if (!exists) ok = false
}

if (fs.existsSync(path.join(root, 'middleware.ts')) && fs.existsSync(path.join(root, 'proxy.ts'))) {
  console.log('❌ Both middleware.ts and proxy.ts exist. Run npm run clean:next-conflict')
  ok = false
}

if (!ok) process.exit(1)
console.log('✅ Phase 10 launch features are present')
