import fs from 'fs'
import path from 'path'

const root = process.cwd()
const required = [
  'app/tools/smart-complaint-wizard/page.tsx',
  'app/dashboard/smart-wizard/page.tsx',
  'app/admin/smart-wizard-insights/page.tsx',
  'app/api/tools/smart-complaint-wizard/route.ts',
  'components/forms/smart-complaint-wizard-form.tsx',
  'lib/tools/phase27-smart-wizard.ts',
  'lib/validators/phase27.ts'
]

const missing = required.filter((file) => !fs.existsSync(path.join(root, file)))
if (missing.length) {
  console.error('Phase 27 missing files:')
  for (const file of missing) console.error(`- ${file}`)
  process.exit(1)
}
const schema = fs.readFileSync(path.join(root, 'prisma/schema.prisma'), 'utf8')
if (!schema.includes('model SmartComplaintPlan')) {
  console.error('Missing Prisma model SmartComplaintPlan')
  process.exit(1)
}
console.log('✅ Phase 27 audit passed: smart complaint wizard, dashboard history, admin insights and DB model are present.')
