import fs from 'fs'
import path from 'path'

const required = [
  'app/tools/page.tsx',
  'app/tools/deadline-calculator/page.tsx',
  'app/tools/complaint-strength-checker/page.tsx',
  'app/tools/evidence-checklist/page.tsx',
  'app/tools/risk-assessment/page.tsx',
  'app/dashboard/cases/page.tsx',
  'app/dashboard/escalations/page.tsx',
  'app/dashboard/language/page.tsx',
  'app/admin/growth/page.tsx',
  'app/admin/content-ideas/page.tsx',
  'app/admin/case-intelligence/page.tsx',
  'lib/case-intelligence.ts'
]

const missing = required.filter((file) => !fs.existsSync(path.join(process.cwd(), file)))
if (missing.length) {
  console.error('Missing Phase 9 files:')
  for (const file of missing) console.error(`- ${file}`)
  process.exit(1)
}
console.log(`Phase 9 audit passed. ${required.length} core files found.`)
