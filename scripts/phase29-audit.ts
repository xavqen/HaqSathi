import fs from 'fs'
import path from 'path'

const root = process.cwd()
const required = [
  'app/tools/scam-radar/page.tsx',
  'app/tools/rights-explainer/page.tsx',
  'app/tools/refund-negotiation/page.tsx',
  'app/tools/authority-router-pro/page.tsx',
  'app/issue-trends/page.tsx',
  'app/api/tools/scam-radar/route.ts',
  'app/api/tools/rights-explainer/route.ts',
  'app/api/tools/refund-negotiation/route.ts',
  'app/api/tools/authority-router-pro/route.ts',
  'app/api/issue-trends/route.ts',
  'components/forms/scam-radar-form.tsx',
  'components/forms/rights-explainer-form.tsx',
  'components/forms/refund-negotiation-form.tsx',
  'components/forms/authority-router-pro-form.tsx',
  'components/forms/issue-trend-form.tsx',
  'lib/tools/phase29-unique-generators.ts',
  'lib/validators/phase29.ts'
]

const missing = required.filter((file) => !fs.existsSync(path.join(root, file)))
if (missing.length) {
  console.error('Phase 29 audit failed. Missing files:')
  for (const file of missing) console.error(' - ' + file)
  process.exit(1)
}
const schema = fs.readFileSync(path.join(root, 'prisma/schema.prisma'), 'utf8')
for (const model of ['ScamRadarReport', 'RightsExplainerResult', 'RefundNegotiationPlan', 'IssueTrendSignal', 'AuthorityRouterPlan']) {
  if (!schema.includes(`model ${model}`)) {
    console.error(`Missing Prisma model: ${model}`)
    process.exit(1)
  }
}
console.log('✅ Phase 29 audit passed: unique safety, rights, negotiation, trend and authority tools are installed.')
