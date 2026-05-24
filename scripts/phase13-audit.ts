import { existsSync, readFileSync } from 'fs'

const required = [
  'app/tools/call-script-generator/page.tsx',
  'app/api/tools/call-script-generator/route.ts',
  'app/dashboard/communications/page.tsx',
  'app/dashboard/outcomes/page.tsx',
  'app/authority-directory/page.tsx',
  'app/admin/authority-directory/page.tsx',
  'app/admin/seo-keywords/page.tsx',
  'app/admin/revenue-insights/page.tsx',
  'app/api/communications/route.ts',
  'app/api/case-outcomes/route.ts',
  'app/api/authority-bookmarks/route.ts',
  'lib/tools/call-script-generator.ts',
  'lib/validators/phase13.ts',
  'lib/authority/seed-authorities.ts',
  'lib/seo/keyword-opportunities.ts',
  'prisma/schema.prisma'
]
const missing = required.filter((file) => !existsSync(file))
if (missing.length) {
  console.error('Phase 13 audit failed. Missing files:')
  for (const file of missing) console.error(`- ${file}`)
  process.exit(1)
}
const schema = readFileSync('prisma/schema.prisma', 'utf8')
for (const model of ['CommunicationLog', 'CaseOutcome', 'AuthorityDirectoryEntry', 'AuthorityBookmark', 'SeoKeywordOpportunity']) {
  if (!schema.includes(`model ${model}`)) {
    console.error(`Phase 13 audit failed. Missing Prisma model: ${model}`)
    process.exit(1)
  }
}
console.log('Phase 13 audit passed: communications, outcomes, authority directory, SEO backlog, revenue insights and call-script tool are present.')
