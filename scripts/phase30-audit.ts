import fs from 'fs'
import path from 'path'

const root = process.cwd()
const required = [
  'app/tools/privacy-redactor/page.tsx',
  'app/tools/evidence-timeline-builder/page.tsx',
  'app/tools/public-post-safety/page.tsx',
  'app/tools/agent-revenue-simulator/page.tsx',
  'app/api/tools/privacy-redactor/route.ts',
  'app/api/tools/evidence-timeline-builder/route.ts',
  'app/api/tools/public-post-safety/route.ts',
  'app/api/tools/agent-revenue-simulator/route.ts',
  'app/dashboard/privacy-redactions/page.tsx',
  'app/dashboard/evidence-timelines/page.tsx',
  'app/dashboard/public-post-checks/page.tsx',
  'app/dashboard/agent-revenue/page.tsx',
  'app/admin/privacy-redactions/page.tsx',
  'app/admin/evidence-timelines/page.tsx',
  'app/admin/public-post-safety/page.tsx',
  'app/admin/agent-revenue/page.tsx',
  'components/forms/privacy-redactor-form.tsx',
  'components/forms/evidence-timeline-builder-form.tsx',
  'components/forms/public-post-safety-form.tsx',
  'components/forms/agent-revenue-simulator-form.tsx',
  'lib/tools/phase30-trust-growth-generators.ts',
  'lib/validators/phase30.ts'
]

const missing = required.filter((file) => !fs.existsSync(path.join(root, file)))
if (missing.length) {
  console.error('Phase 30 audit failed. Missing files:')
  for (const file of missing) console.error(' - ' + file)
  process.exit(1)
}
const schema = fs.readFileSync(path.join(root, 'prisma/schema.prisma'), 'utf8')
for (const model of ['PrivacyRedactionResult', 'EvidenceTimelineBuild', 'PublicPostSafetyCheck', 'AgentRevenueSimulation']) {
  if (!schema.includes(`model ${model}`)) {
    console.error(`Missing Prisma model: ${model}`)
    process.exit(1)
  }
}
console.log('✅ Phase 30 audit passed: privacy redaction, evidence timeline, public post safety and agent revenue tools are installed.')
