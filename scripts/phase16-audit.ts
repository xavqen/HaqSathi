import { existsSync } from 'fs'

const required = [
  'app/partners/page.tsx',
  'app/knowledge-base/page.tsx',
  'app/tools/notice-reply-draft/page.tsx',
  'app/tools/status-message-builder/page.tsx',
  'app/tools/document-gap-analyzer/page.tsx',
  'app/dashboard/verification-requests/page.tsx',
  'app/dashboard/print-center/page.tsx',
  'app/dashboard/learning/page.tsx',
  'app/admin/partner-leads/page.tsx',
  'app/admin/moderation/page.tsx',
  'app/admin/experiments/page.tsx',
  'app/admin/playbooks/page.tsx',
  'app/admin/localization/page.tsx',
  'app/api/partner-leads/route.ts',
  'app/api/verification-requests/route.ts',
  'app/api/print-jobs/route.ts',
  'lib/phase16/seed-phase16.ts'
]
const missing = required.filter((file) => !existsSync(file))
if (missing.length) {
  console.error('Phase 16 missing files:', missing)
  process.exit(1)
}
console.log(`Phase 16 audit OK: ${required.length} files present.`)
