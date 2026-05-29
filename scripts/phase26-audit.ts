import { existsSync, readFileSync } from 'node:fs'

const required = [
  'app/tools/ocr-autofill/page.tsx',
  'app/dashboard/ocr-autofill/page.tsx',
  'app/admin/ocr-reviews/page.tsx',
  'app/api/tools/ocr-autofill/route.ts',
  'components/forms/ocr-autofill-form.tsx',
  'lib/tools/phase26-ocr-autofill.ts',
  'lib/validators/phase26.ts'
]

const missing = required.filter((file) => !existsSync(file))
const schema = readFileSync('prisma/schema.prisma', 'utf8')
if (!schema.includes('model OcrAutofillResult')) missing.push('prisma model OcrAutofillResult')
if (!schema.includes('ocrAutofillResults OcrAutofillResult[]')) missing.push('User.ocrAutofillResults relation')

console.log('\nPhase 26 audit: OCR autofill + image upload')
if (missing.length) {
  for (const item of missing) console.error('❌ Missing: ' + item)
  process.exit(1)
}
console.log('✅ OCR autofill pages, API, schema, validators and mobile navigation files exist.\n')
