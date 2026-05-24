import { existsSync } from 'fs'

const required = [
  'app/page.tsx',
  'app/complaint/page.tsx',
  'app/upi-help/page.tsx',
  'app/scheme-finder/page.tsx',
  'app/documents/page.tsx',
  'app/chat/page.tsx',
  'app/tools/legal-notice-draft/page.tsx',
  'app/tools/rti-helper/page.tsx',
  'app/tools/consumer-forum-pack/page.tsx',
  'app/tools/bank-escalation/page.tsx',
  'app/dashboard/evidence-packs/page.tsx',
  'app/dashboard/calendar/page.tsx',
  'app/dashboard/saved-links/page.tsx',
  'app/admin/ops/page.tsx',
  'app/api/tools/legal-notice/route.ts',
  'app/api/tools/rti-helper/route.ts',
  'app/api/tools/consumer-forum-pack/route.ts',
  'app/api/tools/bank-escalation/route.ts',
  'app/api/evidence-packs/route.ts',
  'app/api/reminders/calendar/route.ts',
  'prisma/schema.prisma',
  'prisma/seed.ts'
]

const missing = required.filter((file) => !existsSync(file))
if (missing.length) {
  console.error('Missing files:')
  for (const file of missing) console.error('-', file)
  process.exit(1)
}

console.log(`Complete audit passed. Checked ${required.length} launch-critical files.`)
