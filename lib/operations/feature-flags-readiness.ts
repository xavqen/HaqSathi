export type FeatureFlagStatus = 'PASS' | 'READY_TO_TEST' | 'MANUAL_REQUIRED' | 'BLOCKED'
export type FeatureFlagPriority = 'P0' | 'P1' | 'P2'

export type FeatureFlagControl = {
  id: string
  label: string
  status: FeatureFlagStatus
  priority: FeatureFlagPriority
  envValue: string
  passCondition: string
  evidenceRequired: string
  riskIfSkipped: string
}

export type FeatureFlagLane = {
  id: string
  label: string
  priority: FeatureFlagPriority
  flags: string[]
  defaultState: string
  owner: string
  rollbackAction: string
  verification: string
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

function modeIsSafe(name: string, fallback = 'manual_review') {
  return ['manual_review', 'staged', 'production_guarded', 'frozen'].includes(env(name, fallback))
}

function killSwitchReady(name: string) {
  const value = env(name, 'false')
  return /^(true|false|0|1|enabled|disabled)$/i.test(value)
}

function control(
  id: string,
  label: string,
  status: FeatureFlagStatus,
  priority: FeatureFlagPriority,
  envValue: string,
  passCondition: string,
  evidenceRequired: string,
  riskIfSkipped: string
): FeatureFlagControl {
  return { id, label, status, priority, envValue, passCondition, evidenceRequired, riskIfSkipped }
}

const featureFlagLanes: FeatureFlagLane[] = [
  {
    id: 'ai-tools-kill-switch',
    label: 'AI tools kill switch',
    priority: 'P0',
    flags: ['FEATURE_AI_TOOLS_ENABLED', 'FEATURE_AI_CHAT_ENABLED', 'FEATURE_AI_DRAFTS_ENABLED'],
    defaultState: 'Enabled only after AI safety, redaction and source-review gates pass.',
    owner: 'AI Safety/Admin',
    rollbackAction: 'Disable AI tools, keep static templates and official links available, then show guidance-only fallback copy.',
    verification: 'Toggle off on staging and prove complaint/templates/dashboard still render without AI calls.'
  },
  {
    id: 'payment-kill-switch',
    label: 'Payment and subscription kill switch',
    priority: 'P0',
    flags: ['FEATURE_PAYMENTS_ENABLED', 'FEATURE_SUBSCRIPTIONS_ENABLED', 'PAYMENT_LIFECYCLE_MODE'],
    defaultState: 'Manual/test mode until Razorpay webhook, receipt and refund evidence is complete.',
    owner: 'Founder/Finance',
    rollbackAction: 'Disable checkout buttons and keep existing users on current plan while payment incident is reviewed.',
    verification: 'Payment CTA hidden/disabled when flag is off and webhook still rejects invalid signatures.'
  },
  {
    id: 'vault-upload-kill-switch',
    label: 'Document vault upload kill switch',
    priority: 'P0',
    flags: ['FEATURE_DOCUMENT_VAULT_UPLOADS_ENABLED', 'DOCUMENT_VAULT_SAFETY_MODE'],
    defaultState: 'Off or guarded until bucket policy, file safety and upload/download evidence pass.',
    owner: 'Security/Ops',
    rollbackAction: 'Disable new uploads while preserving existing document metadata and download access according to policy.',
    verification: 'Upload UI and API return safe disabled state when flag is off; no private files are cached by service worker.'
  },
  {
    id: 'notification-kill-switch',
    label: 'Notification channel kill switch',
    priority: 'P1',
    flags: ['FEATURE_PUSH_NOTIFICATIONS_ENABLED', 'FEATURE_EMAIL_REMINDERS_ENABLED', 'FEATURE_WHATSAPP_SMS_ENABLED', 'NOTIFICATION_DRY_RUN'],
    defaultState: 'Dry-run until sender domain, permission UX and provider quotas are verified.',
    owner: 'Growth/Ops',
    rollbackAction: 'Turn channels to dry-run, keep in-app reminders visible and stop provider sends.',
    verification: 'Dry-run proof for email, push and WhatsApp/SMS without sending sensitive complaint data.'
  },
  {
    id: 'growth-feature-kill-switch',
    label: 'Growth/referral/newsletter kill switch',
    priority: 'P1',
    flags: ['FEATURE_REFERRALS_ENABLED', 'FEATURE_NEWSLETTER_ENABLED', 'FEATURE_ANALYTICS_EVENTS_ENABLED'],
    defaultState: 'Guarded until consent, fraud, unsubscribe and analytics-redaction gates pass.',
    owner: 'Growth/Admin',
    rollbackAction: 'Pause referral/newsletter/analytics events without blocking core complaint tools.',
    verification: 'Signup and complaint generator work when growth features are disabled.'
  },
  {
    id: 'cron-background-kill-switch',
    label: 'Cron/background job kill switch',
    priority: 'P0',
    flags: ['FEATURE_CRON_LINK_CHECKS_ENABLED', 'FEATURE_CRON_PRIVACY_OPS_ENABLED', 'FEATURE_CRON_BACKUPS_ENABLED', 'CRON_SECRET'],
    defaultState: 'Disabled without valid CRON_SECRET and dry-run until cron evidence passes.',
    owner: 'Ops/Admin',
    rollbackAction: 'Disable affected cron job, preserve last good evidence, run manual admin command if needed.',
    verification: 'Cron endpoint fails closed without secret and can be paused independently.'
  },
  {
    id: 'admin-write-kill-switch',
    label: 'Admin write-path kill switch',
    priority: 'P0',
    flags: ['FEATURE_ADMIN_WRITES_ENABLED', 'FEATURE_CONTENT_EDITS_ENABLED', 'FEATURE_PAYMENT_ADMIN_WRITES_ENABLED'],
    defaultState: 'Guarded until RBAC, audit trail and incident response gates pass.',
    owner: 'Super Admin',
    rollbackAction: 'Freeze writes, allow read-only admin dashboards and preserve audit evidence.',
    verification: 'Admin read-only mode blocks risky write actions but dashboards still load.'
  },
  {
    id: 'mobile-pwa-kill-switch',
    label: 'Mobile/PWA experimental feature kill switch',
    priority: 'P2',
    flags: ['FEATURE_PWA_INSTALL_PROMPT_ENABLED', 'FEATURE_OFFLINE_MODE_ENABLED', 'FEATURE_VOICE_INPUT_ENABLED'],
    defaultState: 'Progressively enabled after real-device QA evidence.',
    owner: 'Product/QA',
    rollbackAction: 'Disable experimental mobile prompts/features while keeping responsive web core available.',
    verification: 'Core mobile pages continue to work when offline/voice/install prompts are disabled.'
  }
]

const controls: FeatureFlagControl[] = [
  control(
    'flag-owner-assigned',
    'Feature flag owner assigned',
    configured('FEATURE_FLAG_OWNER') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
    'P0',
    `FEATURE_FLAG_OWNER=${env('FEATURE_FLAG_OWNER') || 'empty'}`,
    'A named owner can approve, pause and roll back high-risk features during launch.',
    'Owner name and /admin/feature-flags-readiness screenshot.',
    'Nobody can safely decide which feature to disable during payment, AI, upload or notification incidents.'
  ),
  control(
    'flag-mode-safe',
    'Feature flag mode is safe',
    modeIsSafe('FEATURE_FLAG_MODE') ? 'READY_TO_TEST' : 'BLOCKED',
    'P0',
    `FEATURE_FLAG_MODE=${env('FEATURE_FLAG_MODE', 'manual_review')}`,
    'Mode is manual_review, staged, production_guarded or frozen.',
    'Readiness report showing launch-stage mode and owner signoff.',
    'Unknown mode can enable risky launch features accidentally or prevent emergency rollback.'
  ),
  control(
    'p0-default-off-reviewed',
    'P0 default-off review completed',
    enabled('FEATURE_FLAG_P0_DEFAULT_OFF_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED',
    'P0',
    `FEATURE_FLAG_P0_DEFAULT_OFF_REVIEWED=${env('FEATURE_FLAG_P0_DEFAULT_OFF_REVIEWED', 'false')}`,
    'Payments, uploads, cron, admin writes and AI experimental behaviors have safe default states.',
    'Saved P0 flag matrix and staging screenshot for disabled states.',
    'High-risk systems may go live before their real provider, audit or safety evidence passes.'
  ),
  control(
    'rollback-drill-reviewed',
    'Feature rollback drill reviewed',
    enabled('FEATURE_FLAG_ROLLBACK_DRILL_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED',
    'P0',
    `FEATURE_FLAG_ROLLBACK_DRILL_REVIEWED=${env('FEATURE_FLAG_ROLLBACK_DRILL_REVIEWED', 'false')}`,
    'At least one high-risk feature is toggled off on staging and the fallback UX is captured.',
    'Rollback drill screenshot and notes with route, flag, owner and result.',
    'During a real incident, disabling a feature may break navigation, auth, pricing or dashboards.'
  ),
  control(
    'flag-audit-reviewed',
    'Feature flag audit trail reviewed',
    enabled('FEATURE_FLAG_AUDIT_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED',
    'P0',
    `FEATURE_FLAG_AUDIT_REVIEWED=${env('FEATURE_FLAG_AUDIT_REVIEWED', 'false')}`,
    'Feature flag changes include owner, reason, timestamp, old/new state and incident link if any.',
    'Masked sample audit row or admin screenshot showing flag change history plan.',
    'Feature changes become invisible, making rollback, debugging and abuse investigations harder.'
  ),
  control(
    'payment-kill-switch-ready',
    'Payment kill switch ready',
    killSwitchReady('FEATURE_PAYMENTS_ENABLED') && enabled('FEATURE_FLAG_PAYMENT_KILL_SWITCH_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED',
    'P0',
    `FEATURE_PAYMENTS_ENABLED=${env('FEATURE_PAYMENTS_ENABLED', 'false')}; FEATURE_FLAG_PAYMENT_KILL_SWITCH_REVIEWED=${env('FEATURE_FLAG_PAYMENT_KILL_SWITCH_REVIEWED', 'false')}`,
    'Checkout/subscription surfaces can be disabled without breaking free tools or user login.',
    'Payment CTA disabled screenshot and failed-safe webhook proof.',
    'A Razorpay or invoice incident can continue accepting money while broken.'
  ),
  control(
    'ai-kill-switch-ready',
    'AI tool kill switch ready',
    killSwitchReady('FEATURE_AI_TOOLS_ENABLED') && enabled('FEATURE_FLAG_AI_KILL_SWITCH_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED',
    'P0',
    `FEATURE_AI_TOOLS_ENABLED=${env('FEATURE_AI_TOOLS_ENABLED', 'true')}; FEATURE_FLAG_AI_KILL_SWITCH_REVIEWED=${env('FEATURE_FLAG_AI_KILL_SWITCH_REVIEWED', 'false')}`,
    'AI tools can be paused while static templates, official links and safety guidance continue working.',
    'Staging screenshot with AI disabled and fallback copy visible.',
    'Unsafe or low-quality AI output may keep generating during safety incidents.'
  ),
  control(
    'vault-kill-switch-ready',
    'Document vault upload kill switch ready',
    killSwitchReady('FEATURE_DOCUMENT_VAULT_UPLOADS_ENABLED') && enabled('FEATURE_FLAG_VAULT_KILL_SWITCH_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED',
    'P0',
    `FEATURE_DOCUMENT_VAULT_UPLOADS_ENABLED=${env('FEATURE_DOCUMENT_VAULT_UPLOADS_ENABLED', 'false')}; FEATURE_FLAG_VAULT_KILL_SWITCH_REVIEWED=${env('FEATURE_FLAG_VAULT_KILL_SWITCH_REVIEWED', 'false')}`,
    'New uploads can be paused without exposing private storage objects or breaking dashboard navigation.',
    'Upload-disabled UI/API proof and storage policy review screenshot.',
    'Unsafe uploads or storage policy mistakes may keep receiving sensitive documents.'
  ),
  control(
    'notification-dry-run-ready',
    'Notification dry-run fallback ready',
    killSwitchReady('NOTIFICATION_DRY_RUN') && enabled('FEATURE_FLAG_NOTIFICATION_KILL_SWITCH_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED',
    'P1',
    `NOTIFICATION_DRY_RUN=${env('NOTIFICATION_DRY_RUN', 'true')}; FEATURE_FLAG_NOTIFICATION_KILL_SWITCH_REVIEWED=${env('FEATURE_FLAG_NOTIFICATION_KILL_SWITCH_REVIEWED', 'false')}`,
    'Email/push/WhatsApp/SMS sends can be changed to dry-run without breaking in-app reminders.',
    'Provider dry-run evidence and in-app fallback screenshot.',
    'Bad templates, provider errors or quota issues can continue sending messages.'
  ),
  control(
    'admin-freeze-ready',
    'Admin write freeze ready',
    killSwitchReady('FEATURE_ADMIN_WRITES_ENABLED') && enabled('FEATURE_FLAG_ADMIN_FREEZE_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED',
    'P0',
    `FEATURE_ADMIN_WRITES_ENABLED=${env('FEATURE_ADMIN_WRITES_ENABLED', 'false')}; FEATURE_FLAG_ADMIN_FREEZE_REVIEWED=${env('FEATURE_FLAG_ADMIN_FREEZE_REVIEWED', 'false')}`,
    'Risky admin writes can be frozen while read-only dashboards remain available.',
    'Read-only admin screenshot and audit trail sample plan.',
    'A compromised or mistaken admin action can continue modifying content, payments or data.'
  )
]

export function getFeatureFlagsReadinessReport() {
  const ready = controls.filter((item) => item.status === 'PASS' || item.status === 'READY_TO_TEST').length
  const manualRequired = controls.filter((item) => item.status === 'MANUAL_REQUIRED').length
  const blocked = controls.filter((item) => item.status === 'BLOCKED').length
  return {
    generatedAt: new Date().toISOString(),
    version: '3.0.51-feature-flags-readiness',
    summary: {
      totalControls: controls.length,
      ready,
      manualRequired,
      blocked,
      lanes: featureFlagLanes.length
    },
    controls,
    featureFlagLanes,
    nextAction: blocked
      ? 'Fix blocked feature flag mode before deployment QA.'
      : manualRequired
        ? 'Complete P0 default-off, rollback, audit and kill-switch evidence before public traffic.'
        : 'Feature flags and kill switches are ready for guarded production rollout.',
    rolloutPrinciples: [
      'Keep P0 features default-off or guarded until their evidence gate passes.',
      'Every kill switch needs an owner, fallback UX and rollback proof.',
      'Never make core complaint guidance dependent on payments, growth experiments, analytics, voice or notifications.',
      'Flag changes should be logged with owner, reason, timestamp and old/new state.',
      'During SEV0/SEV1 incidents, freeze risky writes and pause marketing/growth channels first.'
    ],
    emergencyPlaybook: [
      'Identify failing lane: AI, payment, vault, notification, cron, admin writes, growth or PWA.',
      'Turn the lane to disabled/dry-run/frozen mode using environment or admin configuration.',
      'Verify fallback UX on mobile and desktop routes affected by the flag.',
      'Save masked evidence, notify support/admin owner and link to the incident record.',
      'Re-enable gradually only after root cause, monitoring and rollback evidence are complete.'
    ]
  }
}
