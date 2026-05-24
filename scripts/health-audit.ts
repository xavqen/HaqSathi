import { existsSync, readFileSync } from 'fs'

const required = [
  'app/page.tsx',
  'app/complaint/page.tsx',
  'app/upi-help/page.tsx',
  'app/scheme-finder/page.tsx',
  'app/documents/page.tsx',
  'app/templates/page.tsx',
  'app/resources/page.tsx',
  'app/blog/[slug]/page.tsx',
  'app/dashboard/export/page.tsx',
  'app/dashboard/settings/page.tsx',
  'app/admin/backups/page.tsx',
  'app/admin/templates/page.tsx',
  'prisma/schema.prisma',
  '.env.example'
]

const missing = required.filter(file => !existsSync(file))
if (missing.length) {
  console.error('Missing required files:', missing.join(', '))
  process.exit(1)
}
const schema = readFileSync('prisma/schema.prisma', 'utf8')
for (const model of ['NotificationPreference', 'Template', 'TemplateUse', 'OfficialResource', 'Feedback']) {
  if (!schema.includes(`model ${model}`)) {
    console.error('Missing Prisma model:', model)
    process.exit(1)
  }
}
console.log('Health audit passed:', required.length, 'key files and Phase 6 models found.')
