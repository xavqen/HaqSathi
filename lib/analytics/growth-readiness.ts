export type AnalyticsReadinessStatus = 'PASS' | 'READY_TO_TEST' | 'MANUAL_REQUIRED' | 'BLOCKED'

export type AnalyticsReadinessControl = {
  id: string
  label: string
  status: AnalyticsReadinessStatus
  userValue: string
  adminValue: string
  launchNote: string
}

export type AnalyticsReadinessReport = {
  generatedAt: string
  version: string
  mode: string
  summary: {
    totalControls: number
    ready: number
    manualRequired: number
    blocked: number
  }
  controls: AnalyticsReadinessControl[]
  privacyRules: string[]
  coreEvents: string[]
  funnelSteps: string[]
  minimumEvidence: string[]
}

const packageVersion = '3.0.23-analytics-growth-readiness'

function env(name: string) {
  return process.env[name] || ''
}

function enabled(name: string) {
  return /^(true|1|yes|enabled)$/i.test(env(name))
}

function configured(name: string) {
  const value = env(name)
  return Boolean(value && !/change-this|example|todo|your-|localhost-only|haqsathi\.local|G-|P-|phc_/i.test(value))
}

function status(ready: boolean, fallback: AnalyticsReadinessStatus = 'MANUAL_REQUIRED'): AnalyticsReadinessStatus {
  return ready ? 'READY_TO_TEST' : fallback
}

export const analyticsEventAllowlist = [
  'page_view',
  'tool_open',
  'complaint_start',
  'pricing_view',
  'pwa_prompt_seen',
  'outbound_link_click',
  'search_submitted'
] as const

export type AnalyticsEventName = typeof analyticsEventAllowlist[number]

export function isAllowedAnalyticsEvent(name: string): name is AnalyticsEventName {
  return analyticsEventAllowlist.includes(name as AnalyticsEventName)
}

export function redactAnalyticsValue(value: unknown): unknown {
  if (typeof value === 'string') {
    return value
      .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[redacted-email]')
      .replace(/\b(?:\+?91[-\s]?)?[6-9]\d{9}\b/g, '[redacted-phone]')
      .replace(/\b\d{12}\b/g, '[redacted-id]')
      .slice(0, 300)
  }
  if (Array.isArray(value)) return value.slice(0, 20).map(redactAnalyticsValue)
  if (value && typeof value === 'object') {
    const output: Record<string, unknown> = {}
    for (const [key, nested] of Object.entries(value as Record<string, unknown>).slice(0, 24)) {
      if (/password|token|secret|otp|aadhaar|pan|account|ifsc|upi|phone|email/i.test(key)) output[key] = '[redacted]'
      else output[key] = redactAnalyticsValue(nested)
    }
    return output
  }
  return value
}

export function getAnalyticsReadinessControls(): AnalyticsReadinessControl[] {
  const firstPartyEnabled = enabled('NEXT_PUBLIC_FIRST_PARTY_ANALYTICS') || enabled('ANALYTICS_EVENT_API_ENABLED')
  const hasExternalAnalytics = configured('NEXT_PUBLIC_GA_ID') || configured('NEXT_PUBLIC_PLAUSIBLE_DOMAIN') || configured('NEXT_PUBLIC_POSTHOG_KEY')
  const consentAware = enabled('ANALYTICS_REQUIRE_CONSENT') || !env('ANALYTICS_REQUIRE_CONSENT')
  const retentionDays = Number(env('ANALYTICS_RETENTION_DAYS') || '90')
  const sampleRate = Number(env('ANALYTICS_SAMPLE_RATE') || '1')

  return [
    {
      id: 'analytics-consent-gate',
      label: 'Consent-aware analytics gate',
      status: consentAware ? 'READY_TO_TEST' : 'BLOCKED',
      userValue: consentAware ? 'Analytics waits for accepted consent before optional tracking.' : 'Consent gate disabled.',
      adminValue: `ANALYTICS_REQUIRE_CONSENT=${consentAware ? 'true' : 'false'}`,
      launchNote: 'Keep consent required for GA/PostHog/Plausible and any non-essential tracking.'
    },
    {
      id: 'first-party-events',
      label: 'Privacy-safe first-party event API',
      status: status(firstPartyEnabled, 'MANUAL_REQUIRED'),
      userValue: firstPartyEnabled ? 'First-party page/event measurement can be tested.' : 'First-party event API is in readiness mode only.',
      adminValue: `NEXT_PUBLIC_FIRST_PARTY_ANALYTICS=${env('NEXT_PUBLIC_FIRST_PARTY_ANALYTICS') || 'false'}, ANALYTICS_EVENT_API_ENABLED=${env('ANALYTICS_EVENT_API_ENABLED') || 'false'}`,
      launchNote: 'Only allowlisted event names are accepted and metadata is redacted before logging.'
    },
    {
      id: 'ga4-or-plausible',
      label: 'External analytics provider',
      status: status(hasExternalAnalytics, 'MANUAL_REQUIRED'),
      userValue: hasExternalAnalytics ? 'At least one analytics provider is configured.' : 'No external analytics provider configured yet.',
      adminValue: `GA4=${configured('NEXT_PUBLIC_GA_ID') ? 'set' : 'empty'}, Plausible=${configured('NEXT_PUBLIC_PLAUSIBLE_DOMAIN') ? 'set' : 'empty'}, PostHog=${configured('NEXT_PUBLIC_POSTHOG_KEY') ? 'set' : 'empty'}`,
      launchNote: 'Use one primary provider first. Multiple providers can slow the site and duplicate data.'
    },
    {
      id: 'utm-capture',
      label: 'UTM campaign capture',
      status: enabled('NEXT_PUBLIC_UTM_CAPTURE_ENABLED') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      userValue: enabled('NEXT_PUBLIC_UTM_CAPTURE_ENABLED') ? 'UTM campaign capture is ready for testing.' : 'UTM capture disabled for now.',
      adminValue: `NEXT_PUBLIC_UTM_CAPTURE_ENABLED=${env('NEXT_PUBLIC_UTM_CAPTURE_ENABLED') || 'false'}`,
      launchNote: 'Needed before ads/SEO campaigns so traffic source and conversion paths are visible.'
    },
    {
      id: 'event-sampling',
      label: 'Sampling and retention controls',
      status: sampleRate > 0 && sampleRate <= 1 && retentionDays > 0 && retentionDays <= 365 ? 'READY_TO_TEST' : 'BLOCKED',
      userValue: `Sample rate ${sampleRate}; retention ${retentionDays} days.`,
      adminValue: `ANALYTICS_SAMPLE_RATE=${sampleRate}, ANALYTICS_RETENTION_DAYS=${retentionDays}`,
      launchNote: 'Keep retention limited and avoid storing full URLs containing private query strings.'
    },
    {
      id: 'dashboard-visibility',
      label: 'Admin analytics visibility',
      status: 'PASS',
      userValue: 'Analytics readiness dashboard and protected API are installed.',
      adminValue: 'GET /api/admin/analytics-readiness',
      launchNote: 'Use admin dashboard to confirm provider, consent, event API and launch evidence status.'
    },
    {
      id: 'no-pii-policy',
      label: 'No PII in analytics policy',
      status: 'READY_TO_TEST',
      userValue: 'Event route redacts email, phone, OTP/token/secret-style fields before writing logs.',
      adminValue: 'redactAnalyticsValue() enabled',
      launchNote: 'Never send complaint text, documents, phone, UPI IDs, account data, full search text or personal IDs to analytics.'
    }
  ]
}

export function getAnalyticsReadinessReport(): AnalyticsReadinessReport {
  const controls = getAnalyticsReadinessControls()
  return {
    generatedAt: new Date().toISOString(),
    version: packageVersion,
    mode: env('ANALYTICS_MODE') || 'privacy_safe',
    summary: {
      totalControls: controls.length,
      ready: controls.filter((control) => control.status === 'PASS' || control.status === 'READY_TO_TEST').length,
      manualRequired: controls.filter((control) => control.status === 'MANUAL_REQUIRED').length,
      blocked: controls.filter((control) => control.status === 'BLOCKED').length
    },
    controls,
    privacyRules: [
      'Track page paths and coarse funnel events only; never track complaint text or uploaded document content.',
      'Do not send email, phone, UPI ID, bank details, OTP, Aadhaar, PAN or tokens to analytics providers.',
      'Respect cookie consent and keep optional analytics disabled until consent is accepted.',
      'Use aggregated counts for public decisions; do not profile users by sensitive issue category.',
      'Limit retention and keep export evidence under admin-only access.'
    ],
    coreEvents: Array.from(analyticsEventAllowlist),
    funnelSteps: [
      'Homepage visit',
      'Tool/category opened',
      'Complaint or helper form started',
      'Draft/result generated',
      'PDF/download/share action',
      'Signup/login',
      'Pricing viewed',
      'Subscription checkout started',
      'Support ticket created'
    ],
    minimumEvidence: [
      'Cookie consent screenshot showing optional analytics notice',
      'Admin analytics readiness screenshot',
      'Network tab proof that no optional analytics fires before consent',
      'Page view event test with redacted metadata',
      'Provider dashboard screenshot after deployed-domain test',
      'UTM campaign URL test screenshot before paid traffic'
    ]
  }
}
