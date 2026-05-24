import { existsSync, readFileSync } from 'fs'

const required = [
  'app/emergency/page.tsx',
  'app/filing-guides/page.tsx',
  'app/filing-guides/[slug]/page.tsx',
  'app/tools/ombudsman-planner/page.tsx',
  'app/api/tools/ombudsman-planner/route.ts',
  'app/dashboard/action-plan/page.tsx',
  'app/dashboard/case-notes/page.tsx',
  'app/admin/filing-guides/page.tsx',
  'app/admin/ai-reviews/page.tsx',
  'app/api/case-tasks/route.ts',
  'app/api/case-notes/route.ts',
  'app/api/ai/reviews/route.ts',
  'lib/filing/seed-guides.ts',
  'lib/validators/case-workspace.ts',
  'prisma/schema.prisma'
]

const missing = required.filter((file) => !existsSync(file))
if (missing.length) {
  console.error('Phase 12 audit failed. Missing files:')
  for (const file of missing) console.error(`- ${file}`)
  process.exit(1)
}

const schema = readFileSync('prisma/schema.prisma', 'utf8')
for (const model of ['CaseNote', 'CaseTask', 'AiOutputReview', 'OfficialFilingGuide']) {
  if (!schema.includes(`model ${model}`)) {
    console.error(`Phase 12 audit failed. Missing Prisma model: ${model}`)
    process.exit(1)
  }
}
console.log('Phase 12 audit passed: emergency center, filing guides, ombudsman planner, case tasks/notes, AI reviews are present.')
