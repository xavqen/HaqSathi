import { existsSync } from 'fs'

const required = [
  'app/dashboard/referrals/page.tsx',
  'app/dashboard/privacy-center/page.tsx',
  'app/dashboard/digest/page.tsx',
  'app/admin/compliance/page.tsx',
  'app/admin/notifications/page.tsx',
  'app/api/cron/reminders/route.ts',
  'app/api/referrals/route.ts',
  'app/api/privacy/consent/route.ts',
  'app/api/privacy/deletion-request/route.ts',
  'lib/reminders/queue.ts',
  'lib/privacy/consent.ts',
  'vercel.json',
  'prisma/schema.prisma'
]

const missing = required.filter((file) => !existsSync(file))
if (missing.length) {
  console.error('Phase 11 audit failed. Missing files:')
  for (const file of missing) console.error(`- ${file}`)
  process.exit(1)
}
console.log('Phase 11 audit passed: referrals, privacy center, reminder cron, compliance pages are present.')
