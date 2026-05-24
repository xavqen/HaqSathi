import 'dotenv/config'
import { getEnvHealth } from '../lib/launch/env-health'

const stage = (process.argv[2] || 'PRODUCTION') as 'LOCAL' | 'PREVIEW' | 'PRODUCTION'
const health = getEnvHealth(stage)
console.log(`HaqSathi AI Env Audit (${stage})`)
for (const item of health.items) {
  const required = item.requiredFor.includes(stage)
  const marker = item.ok ? '✅' : required ? '❌' : '⚪'
  console.log(`${marker} ${item.area} / ${item.key}: ${item.current}`)
  if (!item.ok) console.log(`   ${item.advice}`)
}
console.log(`\nProduction required: ${health.totals.productionPassing}/${health.totals.productionRequired}`)
if (stage === 'PRODUCTION' && health.totals.productionPassing < health.totals.productionRequired) process.exit(1)
