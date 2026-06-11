export type SupportTriageStatus = 'PASS' | 'READY_TO_TEST' | 'MANUAL_REQUIRED' | 'BLOCKED'

export type SupportTriageControl = {
  id: string
  label: string
  status: SupportTriageStatus
  userValue: string
  adminValue: string
  launchNote: string
}

function env(name: string) {
  return process.env[name] || ''
}

function enabled(name: string) {
  return /^(true|1|yes|enabled)$/i.test(env(name))
}

function configured(name: string) {
  const value = env(name)
  return Boolean(value && !/change-this|example|todo|your-|localhost-only|haqsathi\.local/i.test(value))
}

function numberEnv(name: string, fallback: number) {
  const parsed = Number(env(name))
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

export function getSupportTriageControls(): SupportTriageControl[] {
  const supportMode = env('SUPPORT_CHAT_MODE') || 'ticket'
  const liveProviderConfigured = configured('LIVE_CHAT_PROVIDER') && configured('LIVE_CHAT_WIDGET_URL')
  const ownerConfigured = configured('SUPPORT_AGENT_OWNER')
  const escalationEmailConfigured = configured('SUPPORT_ESCALATION_EMAIL') || configured('SUPPORT_EMAIL')
  const webhookConfigured = configured('SUPPORT_WEBHOOK_URL')
  const slaHours = numberEnv('SUPPORT_SLA_HOURS', 24)
  const macroReviewEnabled = enabled('SUPPORT_MACRO_REVIEW_REQUIRED') || !env('SUPPORT_MACRO_REVIEW_REQUIRED')
  const privacySafeMode = enabled('SUPPORT_PRIVACY_SAFE_MODE') || !env('SUPPORT_PRIVACY_SAFE_MODE')

  return [
    {
      id: 'ticket-intake-flow',
      label: 'Ticket intake flow',
      status: 'PASS',
      userValue: 'Users can already submit support tickets from the public support form.',
      adminValue: 'SupportTicket records are visible in /admin/support without changing existing ticket logic.',
      launchNote: 'Before launch, submit one guest ticket and one logged-in ticket, then confirm both appear in admin.'
    },
    {
      id: 'support-agent-owner',
      label: 'Human support owner',
      status: ownerConfigured ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      userValue: 'A real person should be responsible for support response ownership.',
      adminValue: ownerConfigured ? `Owner: ${env('SUPPORT_AGENT_OWNER')}` : 'SUPPORT_AGENT_OWNER is empty.',
      launchNote: 'Assign one owner before marketing traffic. Support cannot be treated as fully live until ownership is clear.'
    },
    {
      id: 'support-sla-policy',
      label: 'Support SLA policy',
      status: slaHours <= 24 ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      userValue: `Users should receive first response within ${slaHours} hour${slaHours === 1 ? '' : 's'}.`,
      adminValue: `SUPPORT_SLA_HOURS=${slaHours}`,
      launchNote: 'Keep SLA realistic. For solo founder launch, 24-48 hours is safer than promising instant support.'
    },
    {
      id: 'live-chat-provider',
      label: 'Live chat widget provider',
      status: supportMode === 'live' ? (liveProviderConfigured ? 'READY_TO_TEST' : 'BLOCKED') : 'MANUAL_REQUIRED',
      userValue: supportMode === 'live' ? 'Live chat mode is requested.' : 'Ticket mode is active; live chat can be enabled later.',
      adminValue: liveProviderConfigured ? `Provider: ${env('LIVE_CHAT_PROVIDER')}` : 'LIVE_CHAT_PROVIDER or LIVE_CHAT_WIDGET_URL is missing.',
      launchNote: 'Enable live chat only after privacy review because chat widgets can load third-party scripts and cookies.'
    },
    {
      id: 'support-escalation-route',
      label: 'Escalation email route',
      status: escalationEmailConfigured ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      userValue: 'Critical support issues should have a fallback escalation email.',
      adminValue: escalationEmailConfigured ? `Email: ${env('SUPPORT_ESCALATION_EMAIL') || env('SUPPORT_EMAIL')}` : 'SUPPORT_ESCALATION_EMAIL or SUPPORT_EMAIL is missing.',
      launchNote: 'Use escalation for payment failures, account lockout, private document access and fraud-risk reports.'
    },
    {
      id: 'support-alert-webhook',
      label: 'Support alert webhook',
      status: webhookConfigured ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
      userValue: 'Urgent tickets can alert the operator outside the dashboard.',
      adminValue: webhookConfigured ? 'SUPPORT_WEBHOOK_URL is configured.' : 'SUPPORT_WEBHOOK_URL is empty.',
      launchNote: 'Optional for MVP, but recommended before ads or SEO traffic to avoid missed urgent complaints.'
    },
    {
      id: 'support-macro-review',
      label: 'Macro safety review',
      status: macroReviewEnabled ? 'MANUAL_REQUIRED' : 'READY_TO_TEST',
      userValue: 'Saved support replies should not sound like legal advice or guarantee outcomes.',
      adminValue: `SUPPORT_MACRO_REVIEW_REQUIRED=${macroReviewEnabled ? 'true' : 'false'}`,
      launchNote: 'Review all macros for legal/financial disclaimers before using them with real users.'
    },
    {
      id: 'support-privacy-safe-mode',
      label: 'Privacy-safe support mode',
      status: privacySafeMode ? 'READY_TO_TEST' : 'BLOCKED',
      userValue: 'Support replies should avoid collecting full Aadhaar, passwords, OTPs or bank secrets.',
      adminValue: `SUPPORT_PRIVACY_SAFE_MODE=${privacySafeMode ? 'true' : 'false'}`,
      launchNote: 'Never ask users to paste OTP, passwords, full card numbers or full identity documents in support chat.'
    }
  ]
}

export function getSupportTriageReport() {
  const controls = getSupportTriageControls()
  const supportMode = env('SUPPORT_CHAT_MODE') || 'ticket'

  return {
    generatedAt: new Date().toISOString(),
    version: '3.0.22-support-triage-readiness',
    supportMode,
    slaHours: numberEnv('SUPPORT_SLA_HOURS', 24),
    summary: {
      total: controls.length,
      ready: controls.filter((control) => control.status === 'PASS' || control.status === 'READY_TO_TEST').length,
      manualRequired: controls.filter((control) => control.status === 'MANUAL_REQUIRED').length,
      blocked: controls.filter((control) => control.status === 'BLOCKED').length
    },
    controls,
    priorityRules: [
      'Payment, account lockout and document-vault access issues should be reviewed first.',
      'AI_OUTPUT tickets need human review before a support reply is sent as guidance.',
      'Fraud-risk, UPI wrong transfer and cyber complaints should be routed to official emergency guidance quickly.',
      'Do not ask users for passwords, OTPs, full card numbers, full Aadhaar/PAN or unnecessary private files.',
      'Use ticket mode by default. Turn on third-party live chat only after cookie/privacy review.'
    ],
    minimumEvidence: [
      'One guest support ticket created from /contact or support form',
      'One logged-in support ticket created and visible in /admin/support',
      'Screenshot from /admin/support-triage showing owner, SLA and privacy controls',
      'Support macro safety review screenshot from /admin/support-macros',
      'Escalation email or webhook test proof for urgent support tickets',
      'Privacy review proof if LIVE_CHAT_WIDGET_URL is enabled'
    ],
    recommendedStatuses: ['OPEN', 'IN_REVIEW', 'WAITING_USER', 'RESOLVED', 'CLOSED'],
    safeReplyChecklist: [
      'Confirm issue type and user goal in plain language.',
      'Give next step, required proof and expected timeline.',
      'Add official source or dashboard link when relevant.',
      'Avoid legal guarantee; use guidance-only language.',
      'Remove sensitive details before sharing internally.'
    ]
  }
}
