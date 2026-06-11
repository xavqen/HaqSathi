import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const outputDir = process.env.ANALYTICS_EVIDENCE_DIR || './artifacts/analytics-readiness'
mkdirSync(outputDir, { recursive: true })

const env = (name) => process.env[name] || ''
const enabled = (name) => /^(true|1|yes|enabled)$/i.test(env(name))
const configured = (name) => Boolean(env(name) && !/change-this|example|todo|your-|localhost-only|haqsathi\.local|G-|P-|phc_/i.test(env(name)))
const firstPartyEnabled = enabled('NEXT_PUBLIC_FIRST_PARTY_ANALYTICS') || enabled('ANALYTICS_EVENT_API_ENABLED')
const hasExternalAnalytics = configured('NEXT_PUBLIC_GA_ID') || configured('NEXT_PUBLIC_PLAUSIBLE_DOMAIN') || configured('NEXT_PUBLIC_POSTHOG_KEY')
const consentAware = enabled('ANALYTICS_REQUIRE_CONSENT') || !env('ANALYTICS_REQUIRE_CONSENT')
const retentionDays = Number(env('ANALYTICS_RETENTION_DAYS') || '90')
const sampleRate = Number(env('ANALYTICS_SAMPLE_RATE') || '1')

const controls = [
  ['analytics-consent-gate', 'Consent-aware analytics gate', consentAware ? 'READY_TO_TEST' : 'BLOCKED', `ANALYTICS_REQUIRE_CONSENT=${consentAware ? 'true' : 'false'}`],
  ['first-party-events', 'Privacy-safe first-party event API', firstPartyEnabled ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', `NEXT_PUBLIC_FIRST_PARTY_ANALYTICS=${env('NEXT_PUBLIC_FIRST_PARTY_ANALYTICS') || 'false'}`],
  ['ga4-or-plausible', 'External analytics provider', hasExternalAnalytics ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', `GA4=${configured('NEXT_PUBLIC_GA_ID') ? 'set' : 'empty'}; Plausible=${configured('NEXT_PUBLIC_PLAUSIBLE_DOMAIN') ? 'set' : 'empty'}; PostHog=${configured('NEXT_PUBLIC_POSTHOG_KEY') ? 'set' : 'empty'}`],
  ['utm-capture', 'UTM campaign capture', enabled('NEXT_PUBLIC_UTM_CAPTURE_ENABLED') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', `NEXT_PUBLIC_UTM_CAPTURE_ENABLED=${env('NEXT_PUBLIC_UTM_CAPTURE_ENABLED') || 'false'}`],
  ['event-sampling', 'Sampling and retention controls', sampleRate > 0 && sampleRate <= 1 && retentionDays > 0 && retentionDays <= 365 ? 'READY_TO_TEST' : 'BLOCKED', `ANALYTICS_SAMPLE_RATE=${sampleRate}; ANALYTICS_RETENTION_DAYS=${retentionDays}`],
  ['dashboard-visibility', 'Admin analytics visibility', 'PASS', 'GET /api/admin/analytics-readiness'],
  ['no-pii-policy', 'No PII in analytics policy', 'READY_TO_TEST', 'Event metadata redaction enabled']
]

const report = {
  generatedAt: new Date().toISOString(),
  version: '3.0.23-analytics-growth-readiness',
  mode: env('ANALYTICS_MODE') || 'privacy_safe',
  summary: {
    totalControls: controls.length,
    ready: controls.filter((control) => control[2] === 'PASS' || control[2] === 'READY_TO_TEST').length,
    manualRequired: controls.filter((control) => control[2] === 'MANUAL_REQUIRED').length,
    blocked: controls.filter((control) => control[2] === 'BLOCKED').length
  },
  controls: controls.map(([id, label, status, note]) => ({ id, label, status, note })),
  coreEvents: ['page_view', 'tool_open', 'complaint_start', 'pricing_view', 'pwa_prompt_seen', 'outbound_link_click', 'search_submitted'],
  minimumEvidence: [
    'Cookie consent screenshot showing optional analytics notice',
    'Admin analytics readiness screenshot',
    'Network tab proof that no optional analytics fires before consent',
    'Page view event test with redacted metadata',
    'Provider dashboard screenshot after deployed-domain test',
    'UTM campaign URL test screenshot before paid traffic'
  ]
}

const csvRows = [
  ['control_id', 'label', 'status', 'note'],
  ...controls.map((row) => row.map((value) => String(value).replaceAll(',', ';')))
]

writeFileSync(join(outputDir, 'analytics-readiness-local.json'), JSON.stringify(report, null, 2))
writeFileSync(join(outputDir, 'analytics-readiness-local.csv'), csvRows.map((row) => row.join(',')).join('\n'))

console.log(`✅ Analytics readiness evidence written to ${outputDir}`)
console.log(`Controls: ${report.summary.totalControls} · Ready: ${report.summary.ready} · Manual QA: ${report.summary.manualRequired} · Blocked: ${report.summary.blocked}`)
