export type NewsletterStatus = 'PASS' | 'READY_TO_TEST' | 'MANUAL_REQUIRED' | 'BLOCKED'

export type NewsletterControl = {
  id: string
  label: string
  status: NewsletterStatus
  userValue: string
  adminValue: string
  launchNote: string
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

function clampNumber(value: string, fallback: number, min: number, max: number) {
  const parsed = Number(value || fallback)
  if (!Number.isFinite(parsed)) return fallback
  return Math.min(Math.max(parsed, min), max)
}

export function maskNewsletterEmail(email: string) {
  const [name = '', domain = ''] = email.split('@')
  if (!domain) return 'hidden'
  const visible = name.slice(0, 2)
  return `${visible}${'*'.repeat(Math.max(name.length - 2, 3))}@${domain}`
}

export function normalizeNewsletterSource(source?: string | null) {
  const clean = String(source || 'website').toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 40)
  return clean || 'website'
}

export function getNewsletterControls(): NewsletterControl[] {
  const provider = env('NEWSLETTER_PROVIDER', 'resend')
  const mode = env('NEWSLETTER_MODE', 'readiness')
  const dryRun = enabled('NEWSLETTER_DRY_RUN') || !env('NEWSLETTER_DRY_RUN')
  const requireConsent = enabled('NEWSLETTER_REQUIRE_DOUBLE_OPT_IN') || !env('NEWSLETTER_REQUIRE_DOUBLE_OPT_IN')
  const maxDaily = clampNumber(env('NEWSLETTER_MAX_SENDS_PER_DAY'), 500, 1, 100000)
  const segmentReview = enabled('NEWSLETTER_SEGMENT_REVIEW_REQUIRED') || !env('NEWSLETTER_SEGMENT_REVIEW_REQUIRED')
  const unsubscribeReady = configured('NEXT_PUBLIC_UNSUBSCRIBE_URL') || configured('NEXT_PUBLIC_APP_URL')
  const hasSender = configured('RESEND_API_KEY') && configured('RESEND_FROM_EMAIL')
  const hasOwner = configured('NEWSLETTER_REVIEW_OWNER') || configured('SUPPORT_AGENT_OWNER')

  return [
    {
      id: 'provider-config',
      label: 'Email provider configuration',
      status: hasSender ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      userValue: hasSender ? 'Provider keys are present for delivery testing.' : 'Provider keys are not complete yet.',
      adminValue: `NEWSLETTER_PROVIDER=${provider}; RESEND_FROM_EMAIL=${env('RESEND_FROM_EMAIL') || 'empty'}`,
      launchNote: 'Use verified sending domain before any real campaign.'
    },
    {
      id: 'dry-run',
      label: 'Campaign dry-run guard',
      status: dryRun ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      userValue: dryRun ? 'Campaign sends stay in dry-run until final launch evidence is saved.' : 'Dry-run is off; manual review is required before sending.',
      adminValue: `NEWSLETTER_DRY_RUN=${env('NEWSLETTER_DRY_RUN') || 'true'}; NEWSLETTER_MODE=${mode}`,
      launchNote: 'Keep dry-run true while copy, consent, sender reputation and unsubscribe are tested.'
    },
    {
      id: 'double-opt-in',
      label: 'Consent and double opt-in',
      status: requireConsent ? 'READY_TO_TEST' : 'BLOCKED',
      userValue: requireConsent ? 'Explicit consent and confirmation workflow are required.' : 'Double opt-in is disabled.',
      adminValue: `NEWSLETTER_REQUIRE_DOUBLE_OPT_IN=${env('NEWSLETTER_REQUIRE_DOUBLE_OPT_IN') || 'true'}`,
      launchNote: 'Never add users to marketing without clear opt-in and audit trail.'
    },
    {
      id: 'unsubscribe',
      label: 'Unsubscribe path',
      status: unsubscribeReady ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      userValue: unsubscribeReady ? 'A public unsubscribe/help URL is available.' : 'Unsubscribe URL needs final domain.',
      adminValue: `NEXT_PUBLIC_UNSUBSCRIBE_URL=${env('NEXT_PUBLIC_UNSUBSCRIBE_URL') || 'empty'}`,
      launchNote: 'Every campaign email must include a working unsubscribe or preference link.'
    },
    {
      id: 'send-limit',
      label: 'Daily send safety cap',
      status: maxDaily <= 5000 ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      userValue: `Daily cap is ${maxDaily} messages.`,
      adminValue: `NEWSLETTER_MAX_SENDS_PER_DAY=${maxDaily}`,
      launchNote: 'Start with low-volume cohorts to protect domain reputation and avoid spam complaints.'
    },
    {
      id: 'segment-review',
      label: 'Audience segment review',
      status: segmentReview ? 'READY_TO_TEST' : 'BLOCKED',
      userValue: segmentReview ? 'Manual review is required before a segment is sent.' : 'Segment review is disabled.',
      adminValue: `NEWSLETTER_SEGMENT_REVIEW_REQUIRED=${env('NEWSLETTER_SEGMENT_REVIEW_REQUIRED') || 'true'}`,
      launchNote: 'Segment only by product intent and consent; never by sensitive complaint text or document contents.'
    },
    {
      id: 'owner-assigned',
      label: 'Campaign review owner',
      status: hasOwner ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      userValue: hasOwner ? 'A responsible owner is configured.' : 'Assign a campaign reviewer before launch.',
      adminValue: `NEWSLETTER_REVIEW_OWNER=${env('NEWSLETTER_REVIEW_OWNER') || 'empty'}`,
      launchNote: 'Owner must approve subject, body, audience, suppression list and send evidence.'
    },
    {
      id: 'evidence-output',
      label: 'Readiness evidence output',
      status: 'PASS',
      userValue: 'Local JSON and CSV evidence can be generated.',
      adminValue: `NEWSLETTER_EVIDENCE_DIR=${env('NEWSLETTER_EVIDENCE_DIR', './artifacts/newsletter-readiness')}`,
      launchNote: 'Save generated files with launch QA screenshots.'
    }
  ]
}

export function getNewsletterCampaignReport() {
  const controls = getNewsletterControls()
  const campaignTypes = [
    'Weekly rights tips digest for opted-in users',
    'Refund/UPI safety education campaign',
    'Product update campaign for feature changes',
    'Launch announcement for verified subscribers',
    'Reactivation campaign only for consented inactive users'
  ]
  const contentSafetyRules = [
    'No fear-based or misleading claims in subject lines.',
    'No legal guarantee, refund guarantee or official-government wording.',
    'Never include complaint text, uploaded document data, UPI ID, bank details or IDs in campaign payloads.',
    'Every campaign must include unsubscribe/preference instructions.',
    'Use small seed-list test before full send.'
  ]
  const audienceSegments = [
    { id: 'all_opted_in', label: 'All opted-in users', risk: 'medium', note: 'Use only after deliverability warm-up.' },
    { id: 'new_users', label: 'New users', risk: 'low', note: 'Onboarding tips and safe-use education.' },
    { id: 'inactive_users', label: 'Inactive users', risk: 'medium', note: 'Use low frequency and clear unsubscribe.' },
    { id: 'document_vault_users', label: 'Document vault users', risk: 'high', note: 'Do not reference document content; only general safety tips.' },
    { id: 'agent_users', label: 'Agent/cyber cafe users', risk: 'medium', note: 'Send operational updates and plan limits only.' }
  ]
  return {
    generatedAt: new Date().toISOString(),
    version: '3.0.25-newsletter-campaign-readiness',
    mode: env('NEWSLETTER_MODE', 'readiness'),
    summary: {
      totalControls: controls.length,
      ready: controls.filter((control) => control.status === 'PASS' || control.status === 'READY_TO_TEST').length,
      manualRequired: controls.filter((control) => control.status === 'MANUAL_REQUIRED').length,
      blocked: controls.filter((control) => control.status === 'BLOCKED').length
    },
    controls,
    campaignTypes,
    contentSafetyRules,
    audienceSegments,
    launchEvidence: [
      'Run npm run newsletter:readiness and save JSON/CSV evidence',
      'Subscribe from /newsletter using a real test inbox',
      'Confirm opt-in/dry-run entry is visible in EmailLog or provider dashboard',
      'Send one seed-list test campaign only after subject/body/segment review',
      'Verify unsubscribe/preference link on deployed domain before public sends'
    ]
  }
}
