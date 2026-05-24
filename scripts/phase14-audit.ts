import { existsSync } from 'fs'

const required = [
  'app/state-guides/page.tsx',
  'app/state-guides/[slug]/page.tsx',
  'app/success-stories/page.tsx',
  'app/tools/sla-planner/page.tsx',
  'app/dashboard/sla-tracker/page.tsx',
  'app/dashboard/case-health/page.tsx',
  'app/dashboard/agent-invoices/page.tsx',
  'app/admin/data-quality/page.tsx',
  'app/admin/link-checks/page.tsx',
  'app/admin/prompt-lab/page.tsx',
  'app/admin/state-guides/page.tsx',
  'app/admin/success-stories/page.tsx',
  'app/admin/invoices/page.tsx',
  'components/forms/sla-track-form.tsx',
  'components/forms/agent-invoice-form.tsx',
  'components/forms/prompt-test-run-form.tsx',
  'lib/state/seed-state-guides.ts',
  'lib/stories/seed-success-stories.ts',
  'lib/link-checks/seed-link-checks.ts'
]

let failed = false
for (const file of required) {
  if (!existsSync(file)) {
    console.error(`Missing: ${file}`)
    failed = true
  }
}
if (failed) process.exit(1)
console.log(`Phase 14 audit OK: ${required.length} files checked.`)
