import { randomBytes } from 'crypto'

export type ReferralGrowthStatus = 'PASS' | 'READY_TO_TEST' | 'MANUAL_REQUIRED' | 'BLOCKED'

export type ReferralGrowthControl = {
  id: string
  label: string
  status: ReferralGrowthStatus
  userValue: string
  adminValue: string
  launchNote: string
}

export type ReferralGrowthReport = {
  generatedAt: string
  version: string
  mode: string
  summary: {
    totalControls: number
    ready: number
    manualRequired: number
    blocked: number
  }
  controls: ReferralGrowthControl[]
  rewardRules: string[]
  fraudGuards: string[]
  launchEvidence: string[]
}

const packageVersion = '3.0.24-referral-growth-readiness'

function env(name: string) {
  return process.env[name] || ''
}

function enabled(name: string) {
  return /^(true|1|yes|enabled)$/i.test(env(name))
}

function configured(name: string) {
  const value = env(name)
  return Boolean(value && !/change-this|example|todo|your-|localhost|haqsathi\.local/i.test(value))
}

function ready(condition: boolean, fallback: ReferralGrowthStatus = 'MANUAL_REQUIRED'): ReferralGrowthStatus {
  return condition ? 'READY_TO_TEST' : fallback
}

export function createReferralCode(prefix = 'HAQ') {
  const safePrefix = prefix.replace(/[^A-Z0-9]/gi, '').slice(0, 8).toUpperCase() || 'HAQ'
  return `${safePrefix}-${randomBytes(4).toString('hex').toUpperCase()}`
}

export function referralRewardText(plan: string) {
  if (plan === 'AGENT') return '1 extra client case export after successful referral'
  if (plan === 'FAMILY') return '7 days extra Family access after successful referral'
  if (plan === 'PRO') return '7 days extra Pro access after successful referral'
  return '1 bonus complaint draft after successful referral'
}

export function normalizeReferralTargetEmail(email?: string | null) {
  const value = String(email || '').trim().toLowerCase()
  if (!value) return null
  return value.slice(0, 180)
}

export function maskReferralEmail(email?: string | null) {
  const value = normalizeReferralTargetEmail(email)
  if (!value) return 'Open share link'
  const [name, domain] = value.split('@')
  if (!domain) return 'Private invite'
  const visibleName = name.length <= 2 ? `${name[0] || '*'}*` : `${name.slice(0, 2)}***`
  const [domainName, ...rest] = domain.split('.')
  const visibleDomain = domainName.length <= 2 ? `${domainName[0] || '*'}*` : `${domainName.slice(0, 2)}***`
  return `${visibleName}@${visibleDomain}.${rest.join('.') || '***'}`
}

export function getReferralGrowthControls(): ReferralGrowthControl[] {
  const referralEnabled = enabled('REFERRAL_PROGRAM_ENABLED') || !env('REFERRAL_PROGRAM_ENABLED')
  const payoutMode = env('REFERRAL_PAYOUT_MODE') || 'bonus_usage'
  const fraudReview = enabled('REFERRAL_FRAUD_REVIEW_REQUIRED') || !env('REFERRAL_FRAUD_REVIEW_REQUIRED')
  const maxInvites = Number(env('REFERRAL_MAX_INVITES_PER_DAY') || '10')
  const minConversionAgeDays = Number(env('REFERRAL_MIN_CONVERSION_AGE_DAYS') || '0')
  const hasOwner = configured('REFERRAL_REVIEW_OWNER') || configured('SUPPORT_AGENT_OWNER')
  const termsUrl = configured('NEXT_PUBLIC_REFERRAL_TERMS_URL') || configured('NEXT_PUBLIC_APP_URL')
  const evidenceDir = configured('REFERRAL_EVIDENCE_DIR')

  return [
    {
      id: 'referral-program-switch',
      label: 'Referral program launch switch',
      status: referralEnabled ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      userValue: referralEnabled ? 'Referral link creation is enabled for logged-in users.' : 'Referral program is disabled until launch review.',
      adminValue: `REFERRAL_PROGRAM_ENABLED=${env('REFERRAL_PROGRAM_ENABLED') || 'true'}`,
      launchNote: 'Keep the program limited to bonus usage until fraud, tax and abuse checks are reviewed.'
    },
    {
      id: 'reward-mode',
      label: 'Reward mode is non-cash by default',
      status: payoutMode === 'bonus_usage' ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      userValue: payoutMode === 'bonus_usage' ? 'Rewards are bonus usage/access, not cash payout.' : `Reward mode is ${payoutMode}.`,
      adminValue: `REFERRAL_PAYOUT_MODE=${payoutMode}`,
      launchNote: 'Cash payouts need extra KYC, tax, refund-abuse and policy review. Bonus usage is safer for MVP launch.'
    },
    {
      id: 'fraud-review',
      label: 'Fraud/manual review guard',
      status: fraudReview ? 'READY_TO_TEST' : 'BLOCKED',
      userValue: fraudReview ? 'Converted referrals stay reviewable before high-value rewards.' : 'Manual fraud review is disabled.',
      adminValue: `REFERRAL_FRAUD_REVIEW_REQUIRED=${env('REFERRAL_FRAUD_REVIEW_REQUIRED') || 'true'}`,
      launchNote: 'Watch duplicate device, self-referral, same email/domain abuse and refund-after-reward patterns.'
    },
    {
      id: 'invite-rate-limit',
      label: 'Invite creation rate limit',
      status: maxInvites > 0 && maxInvites <= 50 ? 'READY_TO_TEST' : 'BLOCKED',
      userValue: `${maxInvites} referral invites allowed per user/day in readiness settings.`,
      adminValue: `REFERRAL_MAX_INVITES_PER_DAY=${maxInvites}`,
      launchNote: 'A low invite limit reduces spam complaints and protects sender reputation.'
    },
    {
      id: 'conversion-aging',
      label: 'Conversion aging window',
      status: minConversionAgeDays >= 0 && minConversionAgeDays <= 30 ? 'READY_TO_TEST' : 'BLOCKED',
      userValue: `Reward can require ${minConversionAgeDays} day(s) before final conversion approval.`,
      adminValue: `REFERRAL_MIN_CONVERSION_AGE_DAYS=${minConversionAgeDays}`,
      launchNote: 'For paid plans, wait through payment settlement/refund risk before issuing high-value rewards.'
    },
    {
      id: 'owner-assigned',
      label: 'Referral review owner',
      status: ready(hasOwner),
      userValue: hasOwner ? 'A referral review owner is configured.' : 'No referral review owner configured yet.',
      adminValue: `REFERRAL_REVIEW_OWNER=${env('REFERRAL_REVIEW_OWNER') || 'empty'}`,
      launchNote: 'Assign one person to approve suspicious conversions and check weekly growth numbers.'
    },
    {
      id: 'terms-and-disclosure',
      label: 'Referral terms/disclosure',
      status: ready(termsUrl),
      userValue: termsUrl ? 'Referral terms URL/app URL is configured for disclosure.' : 'Referral terms URL missing.',
      adminValue: `NEXT_PUBLIC_REFERRAL_TERMS_URL=${env('NEXT_PUBLIC_REFERRAL_TERMS_URL') || 'empty'}`,
      launchNote: 'Show that rewards are conditional, can be changed and may be rejected for abuse.'
    },
    {
      id: 'evidence-output',
      label: 'Referral evidence output',
      status: evidenceDir ? 'READY_TO_TEST' : 'PASS',
      userValue: 'Local JSON/CSV evidence generator is installed.',
      adminValue: `REFERRAL_EVIDENCE_DIR=${env('REFERRAL_EVIDENCE_DIR') || './artifacts/referral-growth'}`,
      launchNote: 'Save evidence before starting influencer, agent or paid referral campaigns.'
    }
  ]
}

export function getReferralGrowthReport(): ReferralGrowthReport {
  const controls = getReferralGrowthControls()
  return {
    generatedAt: new Date().toISOString(),
    version: packageVersion,
    mode: env('REFERRAL_PROGRAM_MODE') || 'readiness',
    summary: {
      totalControls: controls.length,
      ready: controls.filter((control) => control.status === 'PASS' || control.status === 'READY_TO_TEST').length,
      manualRequired: controls.filter((control) => control.status === 'MANUAL_REQUIRED').length,
      blocked: controls.filter((control) => control.status === 'BLOCKED').length
    },
    controls,
    rewardRules: [
      'Free users receive bonus complaint draft usage after a successful referral.',
      'Pro users receive extra Pro access days after a successful referral.',
      'Family users receive extra Family access days after a successful referral.',
      'Agent users receive extra client case export usage after a successful referral.',
      'Cash payout mode should stay disabled until KYC, tax and fraud review are ready.'
    ],
    fraudGuards: [
      'Block self-referrals and duplicate account loops before reward approval.',
      'Review many signups from the same device/IP/email pattern.',
      'Do not issue final paid-plan rewards before payment webhook settlement is verified.',
      'Mask invitee email addresses in admin/user-facing surfaces where full email is not required.',
      'Keep referral event analytics privacy-safe and do not store sensitive complaint details in referral metadata.'
    ],
    launchEvidence: [
      'Create referral link from a real logged-in account.',
      'Open referral link on another browser/device and confirm ref code is preserved through signup.',
      'Trigger conversion manually or through a test paid/signup flow and verify status changes.',
      'Review /admin/referral-readiness screenshot and referral counts.',
      'Save artifacts/referral-growth JSON/CSV evidence.',
      'Confirm terms/reward disclosure text is visible before public promotion.'
    ]
  }
}
