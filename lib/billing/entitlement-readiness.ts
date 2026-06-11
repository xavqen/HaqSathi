export type EntitlementStatus = 'PASS' | 'READY_TO_TEST' | 'MANUAL_REQUIRED' | 'BLOCKED'
export type EntitlementPriority = 'P0' | 'P1' | 'P2'

export type EntitlementControl = {
  id: string
  priority: EntitlementPriority
  label: string
  status: EntitlementStatus
  envValue: string
  passCondition: string
  evidenceRequired: string
  riskIfSkipped: string
}

export type EntitlementLane = {
  id: string
  priority: EntitlementPriority
  plan: 'FREE' | 'PRO' | 'FAMILY' | 'AGENT' | 'ADMIN'
  capability: string
  expectedBehavior: string
  downgradeBehavior: string
  safetyRule: string
}

const truthy = (value?: string) => /^(true|1|yes|enabled|pass|reviewed)$/i.test(value || '')
const env = (key: string, fallback = '') => process.env[key] || fallback
const configured = (key: string) => {
  const value = env(key)
  return Boolean(value && !/change-this|your-domain|localhost|127\.0\.0\.1|example|owner@example|YOUR_|none|empty|placeholder/i.test(value))
}

const allowedModes = ['dry_run', 'manual_review', 'enforce', 'disabled']

export const entitlementLanes: EntitlementLane[] = [
  {
    id: 'free-ai-draft-limit',
    priority: 'P0',
    plan: 'FREE',
    capability: 'Limited monthly AI complaint/tool drafts',
    expectedBehavior: 'Free users get a clear remaining-count message before reaching the limit and a helpful upgrade CTA after the limit.',
    downgradeBehavior: 'If payment fails or subscription ends, user keeps access to free quota only; existing saved cases remain readable.',
    safetyRule: 'Never block access to safety notices, official links, privacy pages or emergency/cyber fraud guidance behind a paywall.'
  },
  {
    id: 'premium-unlimited-tools',
    priority: 'P0',
    plan: 'PRO',
    capability: 'Premium/Paid AI tool usage',
    expectedBehavior: 'Paid users can use premium lanes according to plan while abuse/rate limits still apply.',
    downgradeBehavior: 'On cancellation or failed payment, premium-only generation stops after grace rules; read-only history remains available.',
    safetyRule: 'Paid status must come from verified server-side subscription/webhook state, not from client-side flags.'
  },
  {
    id: 'family-shared-access',
    priority: 'P1',
    plan: 'FAMILY',
    capability: 'Family/shared account limits',
    expectedBehavior: 'Family plan supports shared use without exposing private cases or documents across members by default.',
    downgradeBehavior: 'If family plan ends, members fall back to their own safe free access and private data stays private.',
    safetyRule: 'Do not share complaint drafts, documents, phone/email data or cases between family members unless explicit sharing exists.'
  },
  {
    id: 'agent-business-access',
    priority: 'P1',
    plan: 'AGENT',
    capability: 'Agent/business workflow limits',
    expectedBehavior: 'Agent plan can access higher-volume workflows with audit trail, support readiness and abuse controls.',
    downgradeBehavior: 'On downgrade, agent workflows become read-only or unavailable while export and billing records remain accessible.',
    safetyRule: 'Agent actions need auditability, user consent and clear guidance-only disclaimers.'
  },
  {
    id: 'admin-bypass-policy',
    priority: 'P0',
    plan: 'ADMIN',
    capability: 'Admin/test account bypass rules',
    expectedBehavior: 'Admin/test bypass works only in staging or explicitly approved dry-run contexts.',
    downgradeBehavior: 'Production admin bypass can be disabled quickly through feature flags and incident playbooks.',
    safetyRule: 'Never allow admin bypass to skip payment, privacy, vault safety, abuse or audit gates for real user traffic.'
  }
]

export function getEntitlementReadinessReport() {
  const mode = env('ENTITLEMENT_ENFORCEMENT_MODE', 'dry_run')
  const modeSafe = allowedModes.includes(mode)
  const ownerReady = configured('ENTITLEMENT_OWNER')
  const quotaReviewed = truthy(env('ENTITLEMENT_QUOTA_RULES_REVIEWED'))
  const downgradeReviewed = truthy(env('ENTITLEMENT_DOWNGRADE_FLOW_REVIEWED'))
  const webhookReviewed = truthy(env('ENTITLEMENT_WEBHOOK_SYNC_REVIEWED'))
  const paywallReviewed = truthy(env('ENTITLEMENT_PAYWALL_COPY_REVIEWED'))
  const adminBypassReviewed = truthy(env('ENTITLEMENT_ADMIN_BYPASS_REVIEWED'))
  const evidenceReviewed = truthy(env('ENTITLEMENT_EVIDENCE_REVIEWED'))

  const controls: EntitlementControl[] = [
    {
      id: 'owner-assigned',
      priority: 'P0',
      label: 'Entitlement owner assigned',
      status: ownerReady ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      envValue: `ENTITLEMENT_OWNER=${env('ENTITLEMENT_OWNER') || 'empty'}`,
      passCondition: 'A product/finance owner is responsible for quota, plan access, downgrade and payment-state review.',
      evidenceRequired: 'Owner name/team recorded in env or release notes and visible in /admin/entitlement-readiness.',
      riskIfSkipped: 'Paid users may get blocked, free users may exceed limits, or support may not know who owns billing access bugs.'
    },
    {
      id: 'mode-safe',
      priority: 'P0',
      label: 'Entitlement mode is safe',
      status: modeSafe ? 'READY_TO_TEST' : 'BLOCKED',
      envValue: `ENTITLEMENT_ENFORCEMENT_MODE=${mode}`,
      passCondition: 'Mode is dry_run, manual_review, enforce or disabled. Keep dry_run/manual_review until real payment QA is complete.',
      evidenceRequired: 'Screenshot or env dump with selected mode and release signoff.',
      riskIfSkipped: 'A typo or unsafe mode can accidentally hard-block users or allow unpaid access.'
    },
    {
      id: 'quota-rules-reviewed',
      priority: 'P0',
      label: 'Plan quota rules reviewed',
      status: quotaReviewed ? 'PASS' : 'MANUAL_REQUIRED',
      envValue: `ENTITLEMENT_QUOTA_RULES_REVIEWED=${env('ENTITLEMENT_QUOTA_RULES_REVIEWED', 'false')}`,
      passCondition: 'Free/Premium/Family/Agent limits are documented and tested with real account states.',
      evidenceRequired: 'Screenshots of free limit, paid allowed state and rate-limit fallback.',
      riskIfSkipped: 'Users can see wrong upgrade prompts or get unlimited free generation unexpectedly.'
    },
    {
      id: 'downgrade-flow-reviewed',
      priority: 'P0',
      label: 'Downgrade/cancel/failure flow reviewed',
      status: downgradeReviewed ? 'PASS' : 'MANUAL_REQUIRED',
      envValue: `ENTITLEMENT_DOWNGRADE_FLOW_REVIEWED=${env('ENTITLEMENT_DOWNGRADE_FLOW_REVIEWED', 'false')}`,
      passCondition: 'Cancel, failed renewal, refund and grace-period behavior are tested without deleting user data.',
      evidenceRequired: 'Billing lifecycle screenshots plus read-only history proof after downgrade.',
      riskIfSkipped: 'Failed payments can leave users stuck, overcharged, or blocked from their own saved content.'
    },
    {
      id: 'webhook-sync-reviewed',
      priority: 'P0',
      label: 'Payment webhook/subscription sync reviewed',
      status: webhookReviewed ? 'PASS' : 'MANUAL_REQUIRED',
      envValue: `ENTITLEMENT_WEBHOOK_SYNC_REVIEWED=${env('ENTITLEMENT_WEBHOOK_SYNC_REVIEWED', 'false')}`,
      passCondition: 'Server-side entitlement state updates only after verified payment/webhook events.',
      evidenceRequired: 'Razorpay webhook event IDs, masked user IDs and resulting plan-state screenshots.',
      riskIfSkipped: 'Client-side or stale payment state can grant wrong access or block paid customers.'
    },
    {
      id: 'paywall-copy-reviewed',
      priority: 'P1',
      label: 'Paywall and limit copy reviewed',
      status: paywallReviewed ? 'PASS' : 'MANUAL_REQUIRED',
      envValue: `ENTITLEMENT_PAYWALL_COPY_REVIEWED=${env('ENTITLEMENT_PAYWALL_COPY_REVIEWED', 'false')}`,
      passCondition: 'Upgrade prompts clearly explain limits, price, refund/cancel basics and guidance-only nature.',
      evidenceRequired: 'Mobile and desktop screenshots of limit reached, pricing, and billing pages.',
      riskIfSkipped: 'Users may feel tricked or confused, hurting trust and payment conversion.'
    },
    {
      id: 'admin-bypass-reviewed',
      priority: 'P1',
      label: 'Admin/test bypass reviewed',
      status: adminBypassReviewed ? 'PASS' : 'MANUAL_REQUIRED',
      envValue: `ENTITLEMENT_ADMIN_BYPASS_REVIEWED=${env('ENTITLEMENT_ADMIN_BYPASS_REVIEWED', 'false')}`,
      passCondition: 'Test/admin bypass is disabled or tightly controlled for production traffic.',
      evidenceRequired: 'Feature flag or env evidence showing production-safe bypass rules.',
      riskIfSkipped: 'Internal shortcuts can leak into production and bypass payment or safety checks.'
    },
    {
      id: 'evidence-reviewed',
      priority: 'P2',
      label: 'Entitlement evidence pack reviewed',
      status: evidenceReviewed ? 'PASS' : 'MANUAL_REQUIRED',
      envValue: `ENTITLEMENT_EVIDENCE_REVIEWED=${env('ENTITLEMENT_EVIDENCE_REVIEWED', 'false')}`,
      passCondition: 'Evidence files from npm run entitlement:readiness are saved with release QA artifacts.',
      evidenceRequired: 'JSON/CSV/MD artifacts plus /admin/entitlement-readiness screenshot.',
      riskIfSkipped: 'Launch team cannot prove billing access rules were reviewed before public launch.'
    }
  ]

  const ready = controls.filter((control) => control.status === 'PASS' || control.status === 'READY_TO_TEST').length
  const manualRequired = controls.filter((control) => control.status === 'MANUAL_REQUIRED').length
  const blocked = controls.filter((control) => control.status === 'BLOCKED').length

  return {
    version: '3.0.55-entitlement-readiness',
    generatedAt: new Date().toISOString(),
    mode,
    summary: {
      totalControls: controls.length,
      ready,
      manualRequired,
      blocked,
      entitlementLanes: entitlementLanes.length
    },
    controls,
    entitlementLanes,
    launchPolicy: [
      'Keep ENTITLEMENT_ENFORCEMENT_MODE=dry_run or manual_review until Razorpay test payment and webhook evidence exists.',
      'Emergency, privacy, official source, disclaimer and support pages must remain accessible on every plan.',
      'Use server-side plan/subscription state for paid access. Never trust client-only plan flags.',
      'Downgrades must preserve read-only access to user history, invoices and privacy export/delete routes.'
    ],
    nextAction: blocked
      ? 'Fix blocked entitlement mode before release.'
      : manualRequired
        ? 'Complete P0 quota, downgrade and webhook review before enforcing paid entitlements.'
        : 'Entitlement gates are ready for controlled production testing.'
  }
}
