export type FeedbackReadinessStatus = 'PASS' | 'READY_TO_TEST' | 'MANUAL_REQUIRED' | 'BLOCKED'
export type FeedbackReadinessPriority = 'P0' | 'P1' | 'P2'

export type FeedbackReadinessControl = {
  id: string
  label: string
  status: FeedbackReadinessStatus
  priority: FeedbackReadinessPriority
  envValue: string
  passCondition: string
  evidenceRequired: string
  riskIfSkipped: string
}

export type FeedbackModerationLane = {
  id: string
  label: string
  priority: FeedbackReadinessPriority
  owner: string
  intakeSource: string
  moderationRule: string
  publishRule: string
}

function env(name: string, fallback = '') {
  return process.env[name] || fallback
}

function enabled(name: string) {
  return /^(true|1|yes|enabled|pass|reviewed)$/i.test(env(name))
}

function configured(name: string) {
  const value = env(name)
  return Boolean(value && !/change-this|your-domain|localhost|127\.0\.0\.1|haqsathi\.local|example|owner@example|YOUR_|none|empty|placeholder/i.test(value))
}

function safeMode(name: string, fallback = 'manual_review') {
  return ['manual_review', 'dry_run', 'moderated', 'approved_only', 'disabled'].includes(env(name, fallback))
}

function control(
  id: string,
  label: string,
  status: FeedbackReadinessStatus,
  priority: FeedbackReadinessPriority,
  envValue: string,
  passCondition: string,
  evidenceRequired: string,
  riskIfSkipped: string
): FeedbackReadinessControl {
  return { id, label, status, priority, envValue, passCondition, evidenceRequired, riskIfSkipped }
}

const moderationLanes: FeedbackModerationLane[] = [
  {
    id: 'raw-feedback-intake',
    label: 'Raw feedback intake',
    priority: 'P0',
    owner: 'Support/Admin',
    intakeSource: '/api/feedback + /admin/feedback',
    moderationRule: 'Collect ratings/comments but mask emails and never publish raw feedback without review.',
    publishRule: 'Raw support feedback stays private unless the user has clearly consented to testimonial use.'
  },
  {
    id: 'testimonial-consent',
    label: 'Testimonial consent',
    priority: 'P0',
    owner: 'Growth/Legal',
    intakeSource: 'success stories, reviews and public quotes',
    moderationRule: 'Require explicit consent before showing name, location, quote, screenshot or case outcome publicly.',
    publishRule: 'Only approved quotes with consent evidence can be published on landing pages or success stories.'
  },
  {
    id: 'pii-redaction',
    label: 'PII and secret redaction',
    priority: 'P0',
    owner: 'Privacy/Security',
    intakeSource: 'feedback comments, screenshots, support notes',
    moderationRule: 'Remove OTP, password, UPI PIN, CVV, full bank/card numbers, phone/email, IDs and private document text.',
    publishRule: 'Published testimonials must be privacy-safe and cannot expose complaint IDs, documents or personal details.'
  },
  {
    id: 'defamation-unsafe-claims',
    label: 'Defamation and unsafe claims review',
    priority: 'P0',
    owner: 'Legal/Founder',
    intakeSource: 'negative reviews, scam claims, named companies/people',
    moderationRule: 'Do not publish unverified allegations, threats, hate, harassment or legal claims as platform endorsements.',
    publishRule: 'Public reviews must be factual, non-harmful and not framed as official/legal proof.'
  },
  {
    id: 'spam-fraud-review',
    label: 'Spam and reward fraud review',
    priority: 'P1',
    owner: 'Growth/Ops',
    intakeSource: 'review forms, referral-linked reviews, campaign traffic',
    moderationRule: 'Flag repeated text, same-device bursts, incentivized reviews and suspicious referral/reward patterns.',
    publishRule: 'Only human-reviewed and non-incentivized testimonials should be highlighted publicly.'
  },
  {
    id: 'rating-quality-insights',
    label: 'Rating quality insights',
    priority: 'P2',
    owner: 'Product',
    intakeSource: '/admin/feedback rating trends',
    moderationRule: 'Use aggregate rating trends for product QA without exposing user identity or raw sensitive comments.',
    publishRule: 'Show only aggregate metrics after sample size and consent/disclosure review.'
  }
]

const controls: FeedbackReadinessControl[] = [
  control(
    'feedback-owner-assigned',
    'Feedback owner assigned',
    configured('FEEDBACK_OWNER') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
    'P0',
    `FEEDBACK_OWNER=${env('FEEDBACK_OWNER') || 'empty'}`,
    'A named owner reviews raw feedback, testimonials, takedown requests and abuse reports.',
    'Owner name in env/evidence pack and /admin/feedback-readiness screenshot.',
    'Unsafe or private reviews can be published without accountability.'
  ),
  control(
    'feedback-mode-safe',
    'Feedback mode is safe',
    safeMode('FEEDBACK_MODERATION_MODE') ? 'READY_TO_TEST' : 'BLOCKED',
    'P0',
    `FEEDBACK_MODERATION_MODE=${env('FEEDBACK_MODERATION_MODE', 'manual_review')}`,
    'Mode is manual_review, dry_run, moderated, approved_only or disabled.',
    'Readiness report showing safe feedback moderation mode.',
    'Unknown mode can accidentally publish raw or unmoderated testimonials.'
  ),
  control(
    'testimonial-consent-reviewed',
    'Testimonial consent reviewed',
    enabled('FEEDBACK_TESTIMONIAL_CONSENT_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED',
    'P0',
    `FEEDBACK_TESTIMONIAL_CONSENT_REVIEWED=${env('FEEDBACK_TESTIMONIAL_CONSENT_REVIEWED', 'false')}`,
    'No public quote, name, location, screenshot or case story is published without explicit consent evidence.',
    'Consent checklist, sample approved testimonial and public page screenshot.',
    'User trust and privacy can be damaged by publishing private feedback without permission.'
  ),
  control(
    'pii-redaction-reviewed',
    'PII redaction reviewed',
    enabled('FEEDBACK_PII_REDACTION_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED',
    'P0',
    `FEEDBACK_PII_REDACTION_REVIEWED=${env('FEEDBACK_PII_REDACTION_REVIEWED', 'false')}`,
    'OTP/password/UPI PIN/CVV/bank/card/contact IDs and private document text are removed from published reviews.',
    'Before/after redaction sample and moderation checklist screenshot.',
    'Public reviews could leak sensitive financial, identity or complaint data.'
  ),
  control(
    'defamation-review-reviewed',
    'Defamation and unsafe claim review',
    enabled('FEEDBACK_DEFAMATION_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED',
    'P0',
    `FEEDBACK_DEFAMATION_REVIEWED=${env('FEEDBACK_DEFAMATION_REVIEWED', 'false')}`,
    'Named people/companies, scam allegations, threats and legal claims are reviewed before publication.',
    'Legal/safety review checklist and rejected-review evidence sample.',
    'The site can publish harmful or legally risky user-generated claims.'
  ),
  control(
    'spam-fraud-reviewed',
    'Spam/fraud review ready',
    enabled('FEEDBACK_SPAM_FRAUD_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED',
    'P1',
    `FEEDBACK_SPAM_FRAUD_REVIEWED=${env('FEEDBACK_SPAM_FRAUD_REVIEWED', 'false')}`,
    'Repeated submissions, incentivized reviews, referral abuse and campaign bursts are reviewed before highlighting testimonials.',
    'Spam/fraud review checklist, rate-limit proof and admin moderation screenshot.',
    'Fake or reward-abused reviews can mislead users and damage launch trust.'
  ),
  control(
    'takedown-process-reviewed',
    'Takedown process reviewed',
    enabled('FEEDBACK_TAKEDOWN_PROCESS_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED',
    'P1',
    `FEEDBACK_TAKEDOWN_PROCESS_REVIEWED=${env('FEEDBACK_TAKEDOWN_PROCESS_REVIEWED', 'false')}`,
    'Users can request correction/removal of public testimonials or accidental personal data exposure.',
    'Takedown owner, support macro and removal response-time evidence.',
    'A user may be unable to remove private or incorrect public content quickly.'
  )
]

export function getFeedbackReadinessReport() {
  const ready = controls.filter((item) => item.status === 'PASS' || item.status === 'READY_TO_TEST').length
  const manualRequired = controls.filter((item) => item.status === 'MANUAL_REQUIRED').length
  const blocked = controls.filter((item) => item.status === 'BLOCKED').length

  return {
    generatedAt: new Date().toISOString(),
    version: '3.0.53-feedback-reviews-readiness',
    summary: {
      totalControls: controls.length,
      ready,
      manualRequired,
      blocked,
      moderationLanes: moderationLanes.length
    },
    controls,
    moderationLanes,
    nextAction: blocked
      ? 'Fix blocked feedback moderation mode before accepting or publishing testimonials.'
      : manualRequired
        ? 'Complete P0 consent, PII redaction and unsafe-claim review before public reviews are used in marketing.'
        : 'Feedback and testimonial moderation is ready for guarded production use.',
    moderationChecklist: [
      'Never publish raw feedback directly from /api/feedback without human review.',
      'Confirm explicit testimonial consent before showing names, locations, screenshots or quotes.',
      'Mask OTPs, passwords, UPI PINs, CVV, bank/card data, complaint IDs, phone/email and document text.',
      'Reject defamatory, hateful, threatening, unverified scam allegations or legal claims.',
      'Check repeated/reward-linked review patterns before highlighting testimonials.',
      'Keep a takedown owner and support macro ready before public launch.'
    ],
    publishRules: [
      'Published reviews must be approved-only, privacy-safe and non-incentivized unless clearly disclosed.',
      'Aggregate ratings should only be displayed after sample-size and source-disclosure review.',
      'Success stories should describe guidance outcomes without claiming official/legal success guarantees.',
      'Marketing screenshots must not expose names, phone numbers, email addresses, documents or IDs.'
    ]
  }
}
