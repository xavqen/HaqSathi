import { authorityDirectorySeeds } from '@/lib/authority/seed-authorities'
import { officialSourceSeeds } from '@/lib/official-sources/seed-official-sources'
import { officialResourceSeeds } from '@/lib/resources/seed-resources'
import { officialLinkCheckSeeds } from '@/lib/link-checks/seed-link-checks'

export type OfficialDataRefreshStatus = 'READY_TO_TEST' | 'MANUAL_REQUIRED' | 'BLOCKED'

export type OfficialDataRefreshControl = {
  id: string
  label: string
  status: OfficialDataRefreshStatus
  adminValue: string
  userValue: string
  launchNote: string
}

export type OfficialDataDataset = {
  id: string
  label: string
  sourceCount: number
  freshnessSlaDays: number
  owner: string
  refreshMode: 'manual_review' | 'cron_dry_run' | 'api_ready'
  publicRisk: 'low' | 'medium' | 'high'
  requiredEvidence: string[]
}

export type OfficialDataRefreshReport = {
  generatedAt: string
  version: string
  summary: {
    totalControls: number
    ready: number
    manualRequired: number
    blocked: number
    datasets: number
    seededSources: number
  }
  controls: OfficialDataRefreshControl[]
  datasets: OfficialDataDataset[]
  ingestionRules: string[]
  launchEvidence: string[]
}

function env(name: string, fallback = '') {
  return process.env[name] || fallback
}

function enabled(name: string) {
  return /^(true|1|yes|enabled)$/i.test(env(name))
}

function configured(name: string) {
  const value = env(name)
  return Boolean(value && !/change-this|example|todo|your-|localhost|haqsathi\.local/i.test(value))
}

function httpsOrEmpty(name: string) {
  const value = env(name)
  return !value || /^https:\/\//i.test(value)
}

const defaultAllowedSources = [
  'gov.in',
  'nic.in',
  'rbi.org.in',
  'npci.org.in',
  'uidai.gov.in',
  'digilocker.gov.in'
]

export const officialDataRefreshDatasets: OfficialDataDataset[] = [
  {
    id: 'official-sources',
    label: 'Official source directory',
    sourceCount: officialSourceSeeds.length,
    freshnessSlaDays: 30,
    owner: env('OFFICIAL_DATA_REVIEW_OWNER', 'Content/QA'),
    refreshMode: enabled('OFFICIAL_DATA_SYNC_CRON_ENABLED') ? 'cron_dry_run' : 'manual_review',
    publicRisk: 'medium',
    requiredEvidence: ['Source URL screenshot', 'Last reviewed date', 'Reviewer name', 'Changed copy diff when updated']
  },
  {
    id: 'authority-directory',
    label: 'Authority directory',
    sourceCount: authorityDirectorySeeds.length,
    freshnessSlaDays: 45,
    owner: env('OFFICIAL_DATA_REVIEW_OWNER', 'Content/QA'),
    refreshMode: 'manual_review',
    publicRisk: 'high',
    requiredEvidence: ['Phone/website verification proof', 'Escalation level check', 'Jurisdiction/state review']
  },
  {
    id: 'public-resources',
    label: 'Public resources and guides',
    sourceCount: officialResourceSeeds.length,
    freshnessSlaDays: 60,
    owner: env('OFFICIAL_DATA_CONTENT_OWNER', 'Content'),
    refreshMode: 'manual_review',
    publicRisk: 'medium',
    requiredEvidence: ['Reference link check', 'Content owner review', 'User-facing copy review']
  },
  {
    id: 'official-link-checks',
    label: 'Official link monitoring seed set',
    sourceCount: officialLinkCheckSeeds.length,
    freshnessSlaDays: 14,
    owner: env('OFFICIAL_LINK_REVIEWER') || env('OFFICIAL_DATA_REVIEW_OWNER', 'Ops/QA'),
    refreshMode: enabled('OFFICIAL_DATA_SYNC_CRON_ENABLED') ? 'cron_dry_run' : 'manual_review',
    publicRisk: 'low',
    requiredEvidence: ['Automated reachability result', 'Manual review for deadline/eligibility claims', 'Broken-link replacement note']
  }
]

export function getOfficialDataRefreshReadinessReport(): OfficialDataRefreshReport {
  const allowedDomains = env('OFFICIAL_DATA_ALLOWED_DOMAINS', defaultAllowedSources.join(','))
  const syncMode = env('OFFICIAL_DATA_SYNC_MODE', 'readiness')
  const dryRun = env('OFFICIAL_DATA_SYNC_DRY_RUN', 'true')
  const cronReady = enabled('OFFICIAL_DATA_SYNC_CRON_ENABLED') || configured('CRON_SECRET')
  const webhookSafe = httpsOrEmpty('OFFICIAL_DATA_CHANGE_WEBHOOK_URL')
  const reviewerReady = configured('OFFICIAL_DATA_REVIEW_OWNER') || configured('OFFICIAL_LINK_REVIEWER')
  const contentOwnerReady = configured('OFFICIAL_DATA_CONTENT_OWNER') || reviewerReady
  const staleThreshold = Number(env('OFFICIAL_DATA_STALE_AFTER_DAYS', '30'))
  const blockedByMode = syncMode === 'auto_publish' && dryRun !== 'true'
  const seededSources = officialDataRefreshDatasets.reduce((sum, dataset) => sum + dataset.sourceCount, 0)

  const controls: OfficialDataRefreshControl[] = [
    {
      id: 'sync-mode',
      label: 'Safe data sync mode',
      status: blockedByMode ? 'BLOCKED' : 'READY_TO_TEST',
      adminValue: `OFFICIAL_DATA_SYNC_MODE=${syncMode}; OFFICIAL_DATA_SYNC_DRY_RUN=${dryRun}`,
      userValue: 'New/changed government data should enter review queue first. Do not auto-publish deadline, eligibility or authority changes without human review.',
      launchNote: 'Keep readiness/manual_review mode for MVP. Auto-publish is blocked because official data can change, expire or be jurisdiction-specific.'
    },
    {
      id: 'allowed-domains',
      label: 'Trusted official domain allowlist',
      status: allowedDomains.trim() ? 'READY_TO_TEST' : 'BLOCKED',
      adminValue: allowedDomains,
      userValue: 'Only government, regulator or verified authority domains should be used as official source inputs.',
      launchNote: 'Review domain list monthly and before adding any state-specific portal.'
    },
    {
      id: 'review-owner',
      label: 'Official data review owner',
      status: reviewerReady ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      adminValue: env('OFFICIAL_DATA_REVIEW_OWNER') || env('OFFICIAL_LINK_REVIEWER') || 'empty',
      userValue: 'Someone must own manual verification of schemes, authority contacts and source changes.',
      launchNote: 'Assign an owner before public launch so stale/broken official data does not stay unresolved.'
    },
    {
      id: 'content-owner',
      label: 'Content publishing owner',
      status: contentOwnerReady ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      adminValue: env('OFFICIAL_DATA_CONTENT_OWNER') || 'empty',
      userValue: 'Official data changes need safe user-facing copy review before users act on them.',
      launchNote: 'Content owner should verify translated copy, disclaimers and state-specific conditions.'
    },
    {
      id: 'freshness-sla',
      label: 'Freshness SLA',
      status: staleThreshold > 0 && staleThreshold <= 90 ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      adminValue: `OFFICIAL_DATA_STALE_AFTER_DAYS=${staleThreshold}`,
      userValue: 'Sources older than the SLA should be flagged for manual recheck before being shown as verified.',
      launchNote: 'Use 14-30 days for high-risk routes like complaints, cyber, banking and scheme deadlines.'
    },
    {
      id: 'cron-readiness',
      label: 'Refresh cron readiness',
      status: cronReady ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      adminValue: `OFFICIAL_DATA_SYNC_CRON_ENABLED=${env('OFFICIAL_DATA_SYNC_CRON_ENABLED', 'false')}; CRON_SECRET=${configured('CRON_SECRET') ? 'configured' : 'empty'}`,
      userValue: 'Cron can create review evidence and stale queues, but should not auto-change public claims without review.',
      launchNote: 'Use /api/cron/official-data-refresh with CRON_SECRET after deploy.'
    },
    {
      id: 'change-webhook',
      label: 'External change alert webhook safety',
      status: webhookSafe ? 'READY_TO_TEST' : 'BLOCKED',
      adminValue: configured('OFFICIAL_DATA_CHANGE_WEBHOOK_URL') ? 'configured' : 'empty',
      userValue: 'Alerts should go to secure HTTPS webhook only, never plain HTTP.',
      launchNote: 'Optional. Use for Slack/Discord/internal alerts after privacy review.'
    }
  ]

  return {
    generatedAt: new Date().toISOString(),
    version: '3.0.29-official-data-refresh-readiness',
    summary: {
      totalControls: controls.length,
      ready: controls.filter((control) => control.status === 'READY_TO_TEST').length,
      manualRequired: controls.filter((control) => control.status === 'MANUAL_REQUIRED').length,
      blocked: controls.filter((control) => control.status === 'BLOCKED').length,
      datasets: officialDataRefreshDatasets.length,
      seededSources
    },
    controls,
    datasets: officialDataRefreshDatasets,
    ingestionRules: [
      'Only ingest official/regulator/authority sources from the allowlist or a manually approved URL.',
      'Store source URL, reviewed date, owner and evidence before marking data verified.',
      'Never auto-publish deadlines, eligibility, payment/refund guarantees or legal-style instructions from scraped text.',
      'Flag changed source copy for human review before updating user-facing pages.',
      'Keep public copy conservative: guidance only, verify on official portal before final submission.'
    ],
    launchEvidence: [
      'Run npm run official-data:readiness and save JSON/CSV outputs.',
      'Open /admin/official-data-refresh and save screenshot.',
      'Run /api/cron/official-data-refresh in dry-run mode on deployed domain.',
      'Manually verify at least one source from complaints, cyber, banking, documents and schemes.',
      'Save reviewer name/date and changed-copy notes for every source promoted to verified.'
    ]
  }
}
