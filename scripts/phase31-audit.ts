import fs from 'fs'
import path from 'path'

const root = process.cwd()
const required = [
  'app/tools/chargeback-helper/page.tsx',
  'app/tools/proof-quality-scanner/page.tsx',
  'app/tools/service-center-locator/page.tsx',
  'app/tools/family-case-switchboard/page.tsx',
  'app/api/tools/chargeback-helper/route.ts',
  'app/api/tools/proof-quality-scanner/route.ts',
  'app/api/tools/service-center-locator/route.ts',
  'app/api/tools/family-case-switchboard/route.ts',
  'app/dashboard/chargeback-helpers/page.tsx',
  'app/dashboard/proof-quality-scans/page.tsx',
  'app/dashboard/service-center-routes/page.tsx',
  'app/dashboard/family-switchboard/page.tsx',
  'app/admin/chargeback-helpers/page.tsx',
  'app/admin/proof-quality/page.tsx',
  'app/admin/service-center-routes/page.tsx',
  'app/admin/family-switchboard/page.tsx',
  'components/forms/chargeback-helper-form.tsx',
  'components/forms/proof-quality-scanner-form.tsx',
  'components/forms/service-center-locator-form.tsx',
  'components/forms/family-case-switchboard-form.tsx',
  'lib/tools/phase31-advanced-generators.ts',
  'lib/validators/phase31.ts'
]
const missing = required.filter((file) => !fs.existsSync(path.join(root, file)))
if (missing.length) {
  console.error('Phase 31 audit failed. Missing files:')
  for (const file of missing) console.error(' - ' + file)
  process.exit(1)
}
const schema = fs.readFileSync(path.join(root, 'prisma/schema.prisma'), 'utf8')
for (const model of ['ChargebackHelperResult', 'ProofQualityScan', 'ServiceCenterLocatorPlan', 'FamilyCaseSwitchboard']) {
  if (!schema.includes(`model ${model}`)) {
    console.error(`Missing Prisma model: ${model}`)
    process.exit(1)
  }
}
console.log('✅ Phase 31 audit passed: chargeback helper, proof scanner, service center route planner and family switchboard are installed.')
