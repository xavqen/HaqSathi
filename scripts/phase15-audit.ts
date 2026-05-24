import fs from 'fs'
const required = [
  'app/official-sources/page.tsx',
  'app/tools/grievance-route-finder/page.tsx',
  'app/tools/fee-refund-calculator/page.tsx',
  'app/tools/appeal-draft/page.tsx',
  'app/dashboard/case-package/page.tsx',
  'app/admin/source-verification/page.tsx',
  'app/admin/production-qa/page.tsx',
  'app/admin/feature-flags/page.tsx',
  'app/admin/incidents/page.tsx',
  'app/admin/support-macros/page.tsx',
  'app/admin/metrics-snapshots/page.tsx',
  'lib/official-sources/seed-official-sources.ts'
]
let ok = true
for (const file of required) {
  if (!fs.existsSync(file)) { console.error('Missing', file); ok = false } else { console.log('OK', file) }
}
const schema = fs.readFileSync('prisma/schema.prisma','utf8')
for (const model of ['OfficialSource','ProductionQaRun','FeatureFlag','IncidentReport','LaunchMetricSnapshot','SupportMacro','CasePackage','TranslationSnippet']) {
  if (!schema.includes(`model ${model}`)) { console.error('Missing model', model); ok = false } else { console.log('OK model', model) }
}
if (!ok) process.exit(1)
console.log('Phase 15 audit passed.')
