import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const outputDir = process.env.PRIVACY_EVIDENCE_DIR || './artifacts/privacy-ops'
mkdirSync(outputDir, { recursive: true })

const now = new Date().toISOString()
const checks = [
  {
    area: 'User data export endpoint',
    status: 'READY_TO_TEST',
    command: 'Login as user → open /api/dashboard/export/data',
    passCondition: 'JSON downloads and DataExport row is created.'
  },
  {
    area: 'Deletion request endpoint',
    status: 'READY_TO_TEST',
    command: 'Dashboard → Privacy Center → Submit deletion request',
    passCondition: 'DataDeletionRequest row is created with REQUESTED status.'
  },
  {
    area: 'Admin privacy operations page',
    status: 'READY_TO_TEST',
    command: 'Admin → /admin/privacy-ops',
    passCondition: 'Counts, checklist and latest requests render without error.'
  },
  {
    area: 'Protected privacy cron',
    status: process.env.CRON_SECRET ? 'READY_TO_TEST' : 'ACTION_NEEDED',
    command: 'GET /api/cron/privacy-ops with Authorization: Bearer CRON_SECRET',
    passCondition: 'Endpoint returns readiness JSON and X-HaqSathi-Privacy-Ops header.'
  },
  {
    area: 'Privacy owner + evidence directory',
    status: process.env.PRIVACY_REVIEW_OWNER && process.env.PRIVACY_EVIDENCE_DIR ? 'READY' : 'ACTION_NEEDED',
    command: 'Set PRIVACY_REVIEW_OWNER and PRIVACY_EVIDENCE_DIR in production env.',
    passCondition: 'Owner and evidence path are documented before launch.'
  }
]

const summary = {
  generatedAt: now,
  version: '3.0.17-privacy-operations-readiness',
  outputDir,
  total: checks.length,
  ready: checks.filter((check) => check.status === 'READY').length,
  readyToTest: checks.filter((check) => check.status === 'READY_TO_TEST').length,
  actionNeeded: checks.filter((check) => check.status === 'ACTION_NEEDED').length,
  checks,
  evidenceToAttach: [
    'Downloaded user export JSON screenshot/file hash',
    'Deletion request created screenshot',
    '/admin/privacy-ops screenshot',
    '/api/cron/privacy-ops response JSON',
    'Reviewer name/date and final decision notes'
  ]
}

const rows = [
  ['area', 'status', 'command', 'passCondition'],
  ...checks.map((check) => [check.area, check.status, check.command, check.passCondition])
]
const csv = rows.map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\n')

writeFileSync(join(outputDir, 'privacy-ops-readiness-local.json'), JSON.stringify(summary, null, 2))
writeFileSync(join(outputDir, 'privacy-ops-readiness-local.csv'), csv)

console.log('\nHaqSathi privacy operations readiness evidence')
console.log(`Output: ${outputDir}`)
console.log(`Checks: ${summary.total}`)
console.log(`Action needed: ${summary.actionNeeded}`)
console.log('✅ Privacy operations evidence generated.\n')
