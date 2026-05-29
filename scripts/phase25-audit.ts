import fs from 'node:fs'

const required = [
  'app/language-hub/page.tsx',
  'app/language-hub/[code]/page.tsx',
  'app/tools/language-draft-translator/page.tsx',
  'app/tools/mobile-readiness/page.tsx',
  'app/dashboard/mobile-command/page.tsx',
  'app/admin/mobile-ux/page.tsx',
  'app/admin/language-coverage/page.tsx',
  'app/api/tools/language-draft-translator/route.ts',
  'app/api/tools/mobile-readiness/route.ts',
  'components/forms/language-draft-translator-form.tsx',
  'components/forms/mobile-readiness-checker-form.tsx',
  'lib/tools/phase25-language-tools.ts',
  'lib/validators/phase25.ts'
]

const missing = required.filter((file) => !fs.existsSync(file))
console.log('Phase 25 audit: mobile + language expansion')
if (missing.length) {
  console.error('Missing files:')
  for (const file of missing) console.error(`- ${file}`)
  process.exit(1)
}
console.log(`✅ ${required.length} required files found`)
console.log('✅ Phase 25 audit passed')
