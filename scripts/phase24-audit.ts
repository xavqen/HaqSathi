import fs from 'fs'

const required = [
  'app/tools/document-reader/page.tsx',
  'app/tools/case-coach/page.tsx',
  'app/tools/follow-up-automation/page.tsx',
  'app/dashboard/document-reader/page.tsx',
  'app/dashboard/case-coach/page.tsx',
  'app/dashboard/follow-ups/page.tsx',
  'app/admin/automation/page.tsx',
  'app/api/tools/document-reader/route.ts',
  'app/api/tools/case-coach/route.ts',
  'app/api/tools/follow-up-automation/route.ts',
  'components/forms/document-reader-form.tsx',
  'components/forms/case-coach-form.tsx',
  'components/forms/follow-up-automation-form.tsx',
  'components/layout/mobile-bottom-actions.tsx',
  'lib/tools/phase24-generators.ts',
  'lib/validators/phase24.ts'
]

const missing = required.filter((file) => !fs.existsSync(file))
if (missing.length) {
  console.error('Phase 24 audit failed. Missing files:')
  for (const file of missing) console.error(`- ${file}`)
  process.exit(1)
}

const schema = fs.readFileSync('prisma/schema.prisma', 'utf8')
for (const model of ['DocumentParseResult', 'CaseCoachReport', 'FollowUpAutomation']) {
  if (!schema.includes(`model ${model}`)) {
    console.error(`Phase 24 audit failed. Missing Prisma model ${model}`)
    process.exit(1)
  }
}

console.log('✅ Phase 24 audit passed: AI Document Reader, Case Coach, Follow-up Automation and mobile bottom actions are present.')
