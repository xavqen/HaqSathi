export type SearchReadinessStatus = 'PASS' | 'READY_TO_TEST' | 'MANUAL_REQUIRED' | 'BLOCKED'

export type SearchReadinessControl = {
  id: string
  label: string
  status: SearchReadinessStatus
  userValue: string
  adminValue: string
  launchNote: string
}

function env(name: string, fallback = '') {
  return process.env[name] || fallback
}

function enabled(name: string) {
  return /^(true|1|yes|enabled)$/i.test(process.env[name] || '')
}

function configured(name: string) {
  const current = process.env[name]
  return Boolean(current && !/change-this|example|todo|your-|localhost|haqsathi\.local/i.test(current))
}

function providerConfigured() {
  const provider = env('SEARCH_PROVIDER', 'local').toLowerCase()
  if (provider === 'algolia') return configured('ALGOLIA_APP_ID') && configured('ALGOLIA_ADMIN_API_KEY') && configured('ALGOLIA_SEARCH_INDEX')
  if (provider === 'meilisearch') return configured('MEILISEARCH_HOST') && configured('MEILISEARCH_API_KEY') && configured('MEILISEARCH_INDEX')
  return true
}

export function getSearchReadinessControls(): SearchReadinessControl[] {
  const provider = env('SEARCH_PROVIDER', 'local').toLowerCase()
  const dryRun = enabled('SEARCH_INDEX_DRY_RUN') || !process.env.SEARCH_INDEX_DRY_RUN
  const piiGuard = enabled('SEARCH_PII_GUARD_ENABLED') || !process.env.SEARCH_PII_GUARD_ENABLED
  const synonyms = enabled('SEARCH_SYNONYMS_ENABLED') || !process.env.SEARCH_SYNONYMS_ENABLED
  const typoTolerance = enabled('SEARCH_TYPO_TOLERANCE_ENABLED') || !process.env.SEARCH_TYPO_TOLERANCE_ENABLED
  const cronReady = enabled('SEARCH_REINDEX_CRON_ENABLED') || configured('CRON_SECRET')
  const ownerReady = configured('SEARCH_REVIEW_OWNER') || configured('OFFICIAL_LINK_REVIEWER') || configured('SUPPORT_AGENT_OWNER')

  return [
    {
      id: 'provider-mode',
      label: 'Search provider mode',
      status: providerConfigured() ? 'READY_TO_TEST' : 'BLOCKED',
      userValue: provider === 'local' ? 'Local fallback search is active and keeps the app working without paid search infrastructure.' : `${provider} search mode is selected for advanced indexing.`,
      adminValue: `SEARCH_PROVIDER=${env('SEARCH_PROVIDER', 'local')}; ALGOLIA_SEARCH_INDEX=${env('ALGOLIA_SEARCH_INDEX', '')}; MEILISEARCH_INDEX=${env('MEILISEARCH_INDEX', '')}`,
      launchNote: 'Keep SEARCH_PROVIDER=local for MVP unless Algolia or Meilisearch credentials and index settings are verified on the deployed domain.'
    },
    {
      id: 'pii-guard',
      label: 'PII-safe indexing guard',
      status: piiGuard ? 'READY_TO_TEST' : 'BLOCKED',
      userValue: 'Search index should include only public content such as pages, guides, schemes, templates and official resources.',
      adminValue: `SEARCH_PII_GUARD_ENABLED=${env('SEARCH_PII_GUARD_ENABLED', 'true')}`,
      launchNote: 'Never index complaint descriptions, document vault files, support messages, phone numbers, UPI IDs, addresses, OTPs, bank details or private user data.'
    },
    {
      id: 'dry-run',
      label: 'Safe reindex dry-run mode',
      status: dryRun ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      userValue: 'Indexing can be tested safely before any external search provider receives production data.',
      adminValue: `SEARCH_INDEX_DRY_RUN=${env('SEARCH_INDEX_DRY_RUN', 'true')}`,
      launchNote: 'Switch dry-run off only after reviewing the generated JSON/CSV evidence and confirming the index contains public-only content.'
    },
    {
      id: 'synonyms',
      label: 'Indian complaint keyword synonyms',
      status: synonyms ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      userValue: 'Users can search practical terms like refund, paisa wapas, UPI fraud, wrong transfer, document and scholarship.',
      adminValue: `SEARCH_SYNONYMS_ENABLED=${env('SEARCH_SYNONYMS_ENABLED', 'true')}`,
      launchNote: 'Review Hindi/Hinglish synonyms manually so search does not route users to wrong legal/financial guidance.'
    },
    {
      id: 'typo-tolerance',
      label: 'Typo tolerance readiness',
      status: typoTolerance ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      userValue: 'Common typos such as refand/refund, upi/UPI and complaint/complan should still lead to useful results.',
      adminValue: `SEARCH_TYPO_TOLERANCE_ENABLED=${env('SEARCH_TYPO_TOLERANCE_ENABLED', 'true')}`,
      launchNote: 'External provider typo tolerance must be tested with Indian user spellings before SEO traffic goes live.'
    },
    {
      id: 'reindex-automation',
      label: 'Reindex automation path',
      status: cronReady ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      userValue: 'Search should refresh when new public pages, schemes, templates, guides and resources are added.',
      adminValue: `SEARCH_REINDEX_CRON_ENABLED=${env('SEARCH_REINDEX_CRON_ENABLED', '')}; CRON_SECRET=${configured('CRON_SECRET') ? 'configured' : 'empty'}`,
      launchNote: 'Add a Vercel Cron route later if switching to a hosted search index. For MVP, run the local readiness command after content updates.'
    },
    {
      id: 'review-owner',
      label: 'Search relevance owner assigned',
      status: ownerReady ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      userValue: 'A human owner reviews bad results, missing queries and sensitive-result risk before launch.',
      adminValue: `SEARCH_REVIEW_OWNER=${env('SEARCH_REVIEW_OWNER', '')}`,
      launchNote: 'Assign one owner to review top queries weekly and improve synonyms, official links and template titles.'
    }
  ]
}

export function getSearchReadinessReport() {
  const controls = getSearchReadinessControls()
  const provider = env('SEARCH_PROVIDER', 'local').toLowerCase()
  return {
    generatedAt: new Date().toISOString(),
    version: '3.0.27-advanced-search-readiness',
    provider,
    summary: {
      totalControls: controls.length,
      ready: controls.filter((control) => control.status === 'PASS' || control.status === 'READY_TO_TEST').length,
      manualRequired: controls.filter((control) => control.status === 'MANUAL_REQUIRED').length,
      blocked: controls.filter((control) => control.status === 'BLOCKED').length
    },
    controls,
    publicIndexTypes: [
      'SEO guides',
      'Blog posts',
      'Templates',
      'Official resources',
      'Government schemes',
      'State guides',
      'Filing guides',
      'Public tool catalog'
    ],
    neverIndex: [
      'Complaint descriptions and generated private drafts',
      'Document vault files or OCR raw text',
      'Support ticket bodies and user conversations',
      'Phone numbers, email addresses, UPI IDs, bank/card details, OTPs or passwords',
      'Private user profile data, payment metadata and admin audit details'
    ],
    recommendedSynonyms: [
      ['refund', 'paisa wapas', 'money back', 'return payment'],
      ['UPI fraud', 'wrong transfer', 'galat transfer', 'scam payment'],
      ['complaint', 'grievance', 'shikayat', 'application'],
      ['documents', 'certificate', 'form upload', 'proof'],
      ['scheme', 'yojana', 'scholarship', 'benefit']
    ],
    launchEvidence: [
      'Search page screenshot for refund query',
      'Search page screenshot for UPI wrong transfer query',
      'Search page screenshot for document/scheme query',
      'Local readiness JSON/CSV evidence',
      'Admin readiness page screenshot',
      'Proof that no private complaint/document/support data is indexed'
    ]
  }
}
