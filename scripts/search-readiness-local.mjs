import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const outputDir = process.env.SEARCH_INDEX_EVIDENCE_DIR || './artifacts/search-readiness'
mkdirSync(outputDir, { recursive: true })

const env = (name, fallback = '') => process.env[name] || fallback
const enabled = (name) => /^(true|1|yes|enabled)$/i.test(env(name))
const configured = (name) => Boolean(env(name) && !/change-this|example|todo|your-|localhost|haqsathi\.local/i.test(env(name)))
const provider = env('SEARCH_PROVIDER', 'local').toLowerCase()
const providerReady = provider === 'algolia'
  ? configured('ALGOLIA_APP_ID') && configured('ALGOLIA_ADMIN_API_KEY') && configured('ALGOLIA_SEARCH_INDEX')
  : provider === 'meilisearch'
    ? configured('MEILISEARCH_HOST') && configured('MEILISEARCH_API_KEY') && configured('MEILISEARCH_INDEX')
    : true

const controls = [
  ['provider-mode', 'Search provider mode', providerReady ? 'READY_TO_TEST' : 'BLOCKED', `SEARCH_PROVIDER=${provider}; ALGOLIA_SEARCH_INDEX=${env('ALGOLIA_SEARCH_INDEX')}; MEILISEARCH_INDEX=${env('MEILISEARCH_INDEX')}`],
  ['pii-guard', 'PII-safe indexing guard', enabled('SEARCH_PII_GUARD_ENABLED') || !env('SEARCH_PII_GUARD_ENABLED') ? 'READY_TO_TEST' : 'BLOCKED', `SEARCH_PII_GUARD_ENABLED=${env('SEARCH_PII_GUARD_ENABLED', 'true')}`],
  ['dry-run', 'Safe reindex dry-run mode', enabled('SEARCH_INDEX_DRY_RUN') || !env('SEARCH_INDEX_DRY_RUN') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', `SEARCH_INDEX_DRY_RUN=${env('SEARCH_INDEX_DRY_RUN', 'true')}`],
  ['synonyms', 'Indian complaint keyword synonyms', enabled('SEARCH_SYNONYMS_ENABLED') || !env('SEARCH_SYNONYMS_ENABLED') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', `SEARCH_SYNONYMS_ENABLED=${env('SEARCH_SYNONYMS_ENABLED', 'true')}`],
  ['typo-tolerance', 'Typo tolerance readiness', enabled('SEARCH_TYPO_TOLERANCE_ENABLED') || !env('SEARCH_TYPO_TOLERANCE_ENABLED') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', `SEARCH_TYPO_TOLERANCE_ENABLED=${env('SEARCH_TYPO_TOLERANCE_ENABLED', 'true')}`],
  ['reindex-automation', 'Reindex automation path', enabled('SEARCH_REINDEX_CRON_ENABLED') || configured('CRON_SECRET') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', `SEARCH_REINDEX_CRON_ENABLED=${env('SEARCH_REINDEX_CRON_ENABLED') || 'false'}; CRON_SECRET=${configured('CRON_SECRET') ? 'configured' : 'empty'}`],
  ['review-owner', 'Search relevance owner assigned', configured('SEARCH_REVIEW_OWNER') || configured('OFFICIAL_LINK_REVIEWER') || configured('SUPPORT_AGENT_OWNER') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', `SEARCH_REVIEW_OWNER=${env('SEARCH_REVIEW_OWNER') || 'empty'}`]
]

const report = {
  generatedAt: new Date().toISOString(),
  version: '3.0.27-advanced-search-readiness',
  provider,
  summary: {
    totalControls: controls.length,
    ready: controls.filter((control) => control[2] === 'PASS' || control[2] === 'READY_TO_TEST').length,
    manualRequired: controls.filter((control) => control[2] === 'MANUAL_REQUIRED').length,
    blocked: controls.filter((control) => control[2] === 'BLOCKED').length
  },
  controls: controls.map(([id, label, status, note]) => ({ id, label, status, note })),
  publicIndexTypes: ['SEO guides', 'Blog posts', 'Templates', 'Official resources', 'Government schemes', 'State guides', 'Filing guides', 'Public tool catalog'],
  neverIndex: ['Complaint descriptions', 'Document vault files or OCR raw text', 'Support ticket bodies', 'Phone/email/UPI/bank/card/OTP/password data', 'Private user profile, payment and admin audit details'],
  launchEvidence: ['Search query screenshots', 'Local readiness JSON/CSV', 'Admin readiness screenshot', 'Proof no private user data is indexed']
}

const csvRows = [
  ['control_id', 'label', 'status', 'note'],
  ...controls.map((row) => row.map((value) => String(value).replaceAll(',', ';')))
]

writeFileSync(join(outputDir, 'search-readiness.json'), JSON.stringify(report, null, 2))
writeFileSync(join(outputDir, 'search-readiness.csv'), csvRows.map((row) => row.join(',')).join('\n'))

console.log(`✅ Search readiness evidence written to ${outputDir}`)
console.log(`Provider: ${provider} · Controls: ${report.summary.totalControls} · Ready: ${report.summary.ready} · Manual QA: ${report.summary.manualRequired} · Blocked: ${report.summary.blocked}`)
