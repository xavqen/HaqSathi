import fs from 'node:fs'

const required = [
  'app/tools/submission-pack/page.tsx',
  'app/api/tools/submission-pack/route.ts',
  'app/dashboard/submission-packs/page.tsx',
  'app/admin/submission-packs/page.tsx',
  'components/forms/submission-pack-form.tsx',
  'lib/tools/phase28-submission-pack.ts',
  'lib/validators/phase28.ts'
]

const missing = required.filter((file) => !fs.existsSync(file))
const schema = fs.readFileSync('prisma/schema.prisma', 'utf8')
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))

console.log('Phase 28 audit: Multi-channel submission pack')
console.log(`Version: ${packageJson.version}`)
console.log(`Required files: ${required.length - missing.length}/${required.length}`)
console.log(`SubmissionPack model: ${schema.includes('model SubmissionPack') ? 'OK' : 'MISSING'}`)

if (missing.length || !schema.includes('model SubmissionPack')) {
  console.error('Missing:', missing)
  process.exit(1)
}

console.log('✅ Phase 28 audit passed')
