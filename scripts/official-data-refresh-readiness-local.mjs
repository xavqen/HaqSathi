import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const outputDir = process.env.OFFICIAL_DATA_EVIDENCE_DIR || './artifacts/official-data-refresh'
mkdirSync(outputDir, { recursive: true })

const env = (name, fallback = '') => process.env[name] || fallback
const enabled = (name) => /^(true|1|yes|enabled)$/i.test(env(name))
const configured = (name) => Boolean(env(name) && !/change-this|example|todo|your-|localhost|haqsathi\.local/i.test(env(name)))
const httpsOrEmpty = (name) => !env(name) || /^https:\/\//i.test(env(name))

const seedCounts = {
  officialSources: 12,
  authorityDirectory: 15,
  publicResources: 8,
  officialLinkChecks: 10
}

const syncMode = env('OFFICIAL_DATA_SYNC_MODE', 'readiness')
const dryRun = env('OFFICIAL_DATA_SYNC_DRY_RUN', 'true')
const staleAfterDays = Number(env('OFFICIAL_DATA_STALE_AFTER_DAYS', '30'))
const reviewerReady = configured('OFFICIAL_DATA_REVIEW_OWNER') || configured('OFFICIAL_LINK_REVIEWER')
const contentOwnerReady = configured('OFFICIAL_DATA_CONTENT_OWNER') || reviewerReady
const cronReady = enabled('OFFICIAL_DATA_SYNC_CRON_ENABLED') || configured('CRON_SECRET')
const webhookSafe = httpsOrEmpty('OFFICIAL_DATA_CHANGE_WEBHOOK_URL')
const blockedByMode = syncMode === 'auto_publish' && dryRun !== 'true'
const allowedDomains = env('OFFICIAL_DATA_ALLOWED_DOMAINS', 'gov.in,nic.in,rbi.org.in,npci.org.in,uidai.gov.in,digilocker.gov.in')

const controls = [
  ['sync-mode', 'Safe data sync mode', blockedByMode ? 'BLOCKED' : 'READY_TO_TEST', `OFFICIAL_DATA_SYNC_MODE=${syncMode}; OFFICIAL_DATA_SYNC_DRY_RUN=${dryRun}`],
  ['allowed-domains', 'Trusted official domain allowlist', allowedDomains.trim() ? 'READY_TO_TEST' : 'BLOCKED', allowedDomains],
  ['review-owner', 'Official data review owner', reviewerReady ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', env('OFFICIAL_DATA_REVIEW_OWNER') || env('OFFICIAL_LINK_REVIEWER') || 'empty'],
  ['content-owner', 'Content publishing owner', contentOwnerReady ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', env('OFFICIAL_DATA_CONTENT_OWNER') || 'empty'],
  ['freshness-sla', 'Freshness SLA', staleAfterDays > 0 && staleAfterDays <= 90 ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', `OFFICIAL_DATA_STALE_AFTER_DAYS=${staleAfterDays}`],
  ['cron-readiness', 'Refresh cron readiness', cronReady ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', `OFFICIAL_DATA_SYNC_CRON_ENABLED=${env('OFFICIAL_DATA_SYNC_CRON_ENABLED', 'false')}; CRON_SECRET=${configured('CRON_SECRET') ? 'configured' : 'empty'}`],
  ['change-webhook', 'External change alert webhook safety', webhookSafe ? 'READY_TO_TEST' : 'BLOCKED', configured('OFFICIAL_DATA_CHANGE_WEBHOOK_URL') ? 'configured' : 'empty']
]

const datasets = [
  ['official-sources', 'Official source directory', seedCounts.officialSources, 30, 'medium'],
  ['authority-directory', 'Authority directory', seedCounts.authorityDirectory, 45, 'high'],
  ['public-resources', 'Public resources and guides', seedCounts.publicResources, 60, 'medium'],
  ['official-link-checks', 'Official link monitoring seed set', seedCounts.officialLinkChecks, 14, 'low']
].map(([id, label, sourceCount, freshnessSlaDays, publicRisk]) => ({ id, label, sourceCount, freshnessSlaDays, publicRisk }))

const report = {
  generatedAt: new Date().toISOString(),
  version: '3.0.29-official-data-refresh-readiness',
  summary: {
    totalControls: controls.length,
    ready: controls.filter((control) => control[2] === 'READY_TO_TEST').length,
    manualRequired: controls.filter((control) => control[2] === 'MANUAL_REQUIRED').length,
    blocked: controls.filter((control) => control[2] === 'BLOCKED').length,
    datasets: datasets.length,
    seededSources: Object.values(seedCounts).reduce((sum, count) => sum + count, 0)
  },
  controls: controls.map(([id, label, status, note]) => ({ id, label, status, note })),
  datasets,
  ingestionRules: ['Allowlist official domains', 'Require source evidence', 'Manual review before public copy change', 'No auto-published deadline/eligibility claims'],
  launchEvidence: ['Admin screenshot', 'Cron dry-run JSON', 'Manual source screenshots', 'Reviewer/date proof']
}

const csvRows = [
  ['control_id', 'label', 'status', 'note'],
  ...controls.map((row) => row.map((value) => String(value).replaceAll(',', ';')))
]
const datasetRows = [
  ['dataset_id', 'label', 'source_count', 'freshness_sla_days', 'public_risk'],
  ...datasets.map((row) => [row.id, row.label, row.sourceCount, row.freshnessSlaDays, row.publicRisk])
]

writeFileSync(join(outputDir, 'official-data-refresh-readiness.json'), JSON.stringify(report, null, 2))
writeFileSync(join(outputDir, 'official-data-refresh-controls.csv'), csvRows.map((row) => row.join(',')).join('\n'))
writeFileSync(join(outputDir, 'official-data-refresh-datasets.csv'), datasetRows.map((row) => row.join(',')).join('\n'))

console.log(`✅ Official data refresh readiness evidence written to ${outputDir}`)
console.log(`Datasets: ${report.summary.datasets} · Seeded sources: ${report.summary.seededSources} · Ready: ${report.summary.ready} · Manual QA: ${report.summary.manualRequired} · Blocked: ${report.summary.blocked}`)
