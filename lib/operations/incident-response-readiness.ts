export type IncidentReadinessStatus = 'PASS' | 'READY_TO_TEST' | 'MANUAL_REQUIRED' | 'BLOCKED'
export type IncidentReadinessPriority = 'P0' | 'P1' | 'P2'

export type IncidentReadinessControl = {
  id: string
  label: string
  status: IncidentReadinessStatus
  priority: IncidentReadinessPriority
  envValue: string
  passCondition: string
  evidenceRequired: string
  riskIfSkipped: string
}

export type IncidentSeverityLane = {
  id: string
  label: string
  priority: IncidentReadinessPriority
  responseTarget: string
  examples: string[]
  requiredActions: string[]
  launchRisk: string
}

export type IncidentRunbookStep = {
  step: string
  owner: string
  evidence: string
}

function env(name: string, fallback = '') {
  return process.env[name] || fallback
}

function enabled(name: string) {
  return /^(true|1|yes|enabled|pass|reviewed)$/i.test(env(name))
}

function configured(name: string) {
  const value = env(name)
  return Boolean(value && !/change-this|your-domain|localhost|127\.0\.0\.1|haqsathi\.local|example|owner@example|YOUR_/i.test(value))
}

function validMode(name: string, fallback = 'manual_review') {
  return ['dry_run', 'manual_review', 'active', 'enforced'].includes(env(name, fallback))
}

function control(
  id: string,
  label: string,
  status: IncidentReadinessStatus,
  priority: IncidentReadinessPriority,
  envValue: string,
  passCondition: string,
  evidenceRequired: string,
  riskIfSkipped: string
): IncidentReadinessControl {
  return { id, label, status, priority, envValue, passCondition, evidenceRequired, riskIfSkipped }
}

const severityLanes: IncidentSeverityLane[] = [
  {
    id: 'sev0-security-privacy',
    label: 'SEV0 security/privacy incident',
    priority: 'P0',
    responseTarget: 'Acknowledge in 15 minutes, contain in 60 minutes, founder signoff required.',
    examples: ['document vault exposure', 'payment webhook compromise', 'admin account takeover', 'private data leak'],
    requiredActions: ['freeze risky writes', 'rotate affected secrets', 'preserve audit evidence', 'notify founder/legal owner'],
    launchRisk: 'A privacy or security incident can harm users, block launch, and require urgent legal/privacy action.'
  },
  {
    id: 'sev1-money-auth',
    label: 'SEV1 payment/auth outage',
    priority: 'P0',
    responseTarget: 'Acknowledge in 30 minutes, rollback or workaround within 2 hours.',
    examples: ['login broken', 'Razorpay verify failing', 'subscription status wrong', 'forgot password email failing'],
    requiredActions: ['disable marketing traffic', 'post status update', 'start rollback checklist', 'save error and payment evidence'],
    launchRisk: 'Users can lose trust quickly if payments, login or account recovery fail without a response path.'
  },
  {
    id: 'sev2-critical-flow',
    label: 'SEV2 critical user flow issue',
    priority: 'P1',
    responseTarget: 'Triage same day, fix or workaround within 24 hours.',
    examples: ['complaint generator broken', 'UPI helper unsafe output', 'document upload fails', 'mobile nav blocking CTA'],
    requiredActions: ['capture route/device proof', 'assign owner', 'add regression test', 'update admin launch evidence'],
    launchRisk: 'Core utility can fail silently and reduce retention, SEO trust and word-of-mouth.'
  },
  {
    id: 'sev3-content-data',
    label: 'SEV3 content/data freshness issue',
    priority: 'P1',
    responseTarget: 'Triage within 2 business days unless official link is broken on a P0 route.',
    examples: ['official link changed', 'scheme data stale', 'translation wrong', 'help article outdated'],
    requiredActions: ['mark review required', 'verify official source', 'save reviewer note', 'refresh content data'],
    launchRisk: 'Wrong official guidance can create user harm even when the app is technically online.'
  },
  {
    id: 'sev4-polish-observability',
    label: 'SEV4 polish/observability issue',
    priority: 'P2',
    responseTarget: 'Batch into weekly quality review.',
    examples: ['minor layout glitch', 'non-critical copy issue', 'low-volume analytics warning', 'admin UI clarity improvement'],
    requiredActions: ['tag backlog', 'link screenshot', 'include route and viewport', 'close after verification'],
    launchRisk: 'Small issues become expensive if they hide bigger quality patterns or keep repeating.'
  }
]

const controls: IncidentReadinessControl[] = [
  control(
    'incident-owner-assigned',
    'Incident commander owner assigned',
    configured('INCIDENT_COMMANDER') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
    'P0',
    `INCIDENT_COMMANDER=${env('INCIDENT_COMMANDER') || 'empty'}`,
    'A named person owns triage, user-impact decisions, rollback approval and founder escalation.',
    'Owner name, backup owner and /admin/incident-response screenshot.',
    'During launch issues nobody may make the rollback, support or disclosure decision quickly.'
  ),
  control(
    'incident-mode-safe',
    'Incident mode is safe for launch',
    validMode('INCIDENT_RESPONSE_MODE') ? 'READY_TO_TEST' : 'BLOCKED',
    'P0',
    `INCIDENT_RESPONSE_MODE=${env('INCIDENT_RESPONSE_MODE', 'manual_review')}`,
    'Mode is dry_run/manual_review/active/enforced and matches the launch stage.',
    'Readiness report showing selected incident mode and approval note.',
    'Unknown mode can hide alerts or trigger disruptive actions during a real incident.'
  ),
  control(
    'alert-channel-configured',
    'Primary alert channel configured',
    configured('INCIDENT_ALERT_WEBHOOK_URL') || configured('INCIDENT_ALERT_EMAIL') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
    'P0',
    `INCIDENT_ALERT_WEBHOOK_URL=${configured('INCIDENT_ALERT_WEBHOOK_URL') ? 'configured' : 'empty'}; INCIDENT_ALERT_EMAIL=${configured('INCIDENT_ALERT_EMAIL') ? 'configured' : 'empty'}`,
    'At least one alert channel reaches the incident owner and backup owner during launch.',
    'Test alert screenshot or email inbox proof, plus on-call owner confirmation.',
    'Critical failures may stay unnoticed while users face broken auth, payment, storage or AI flows.'
  ),
  control(
    'status-page-reviewed',
    'User-facing status update path reviewed',
    enabled('INCIDENT_STATUS_PAGE_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED',
    'P1',
    `INCIDENT_STATUS_PAGE_REVIEWED=${env('INCIDENT_STATUS_PAGE_REVIEWED', 'false')}`,
    'Status page, banner, support macro or social update path is ready for user-visible outages.',
    'Status draft screenshot, support macro and owner approval.',
    'Users will repeatedly retry broken flows and contact support without clear guidance.'
  ),
  control(
    'rollback-drill-reviewed',
    'Rollback drill reviewed',
    enabled('INCIDENT_ROLLBACK_DRILL_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED',
    'P0',
    `INCIDENT_ROLLBACK_DRILL_REVIEWED=${env('INCIDENT_ROLLBACK_DRILL_REVIEWED', 'false')}`,
    'Rollback owner can revert Vercel deployment/env change and verify recovery on P0 routes.',
    'Rollback drill evidence, before/after URL screenshots and deployment ID notes.',
    'A bad release can keep breaking users because no tested rollback path exists.'
  ),
  control(
    'postmortem-template-ready',
    'Postmortem template ready',
    enabled('INCIDENT_POSTMORTEM_TEMPLATE_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED',
    'P1',
    `INCIDENT_POSTMORTEM_TEMPLATE_REVIEWED=${env('INCIDENT_POSTMORTEM_TEMPLATE_REVIEWED', 'false')}`,
    'Template captures timeline, impact, root cause, fixes, prevention and owner/date.',
    'Postmortem template screenshot or saved markdown template.',
    'Recurring outages may repeat because lessons and action items are not captured.'
  ),
  control(
    'support-escalation-ready',
    'Support escalation path ready',
    enabled('INCIDENT_SUPPORT_ESCALATION_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED',
    'P1',
    `INCIDENT_SUPPORT_ESCALATION_REVIEWED=${env('INCIDENT_SUPPORT_ESCALATION_REVIEWED', 'false')}`,
    'Support macros, owner handoff and user-safe responses are ready for payment/auth/storage/AI issues.',
    'Support macro list, escalation owner and sample user reply evidence.',
    'Support can give inconsistent advice during payments, fraud, documents or privacy incidents.'
  ),
  control(
    'evidence-preservation-ready',
    'Incident evidence preservation reviewed',
    enabled('INCIDENT_EVIDENCE_PRESERVATION_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED',
    'P0',
    `INCIDENT_EVIDENCE_PRESERVATION_REVIEWED=${env('INCIDENT_EVIDENCE_PRESERVATION_REVIEWED', 'false')}`,
    'Logs, audit rows, screenshots and webhook IDs are preserved without storing OTPs, passwords, UPI PINs, CVV or raw private documents.',
    'Evidence folder sample with masked IDs and redaction proof.',
    'You may lose root-cause evidence or accidentally store sensitive user secrets while debugging.'
  )
]

const runbook: IncidentRunbookStep[] = [
  { step: 'Declare severity using the SEV0-SEV4 map and assign incident commander.', owner: 'Incident commander', evidence: 'Incident ticket with severity, owner and timestamp.' },
  { step: 'Contain user harm: disable risky feature, pause marketing traffic or rollback release if P0/P1.', owner: 'Founder/Ops', evidence: 'Feature flag/env change, Vercel rollback screenshot or traffic pause note.' },
  { step: 'Collect masked evidence from error monitoring, audit logs, support tickets, webhook IDs and screenshots.', owner: 'Developer/Security', evidence: 'Masked evidence folder and timeline.' },
  { step: 'Communicate user-safe status for auth/payment/storage/AI issues without exposing internal details.', owner: 'Support/Founder', evidence: 'Status page/banner/support macro screenshot.' },
  { step: 'Verify fix on mobile, desktop and the exact affected route before closing the incident.', owner: 'QA/Developer', evidence: 'Before/after screenshots, command output and route proof.' },
  { step: 'Write postmortem for SEV0-SEV2 with prevention tasks and owner/date.', owner: 'Incident commander', evidence: 'Postmortem document and linked follow-up tasks.' }
]

const ready = controls.filter((control) => control.status === 'PASS' || control.status === 'READY_TO_TEST').length
const manualRequired = controls.filter((control) => control.status === 'MANUAL_REQUIRED').length
const blocked = controls.filter((control) => control.status === 'BLOCKED').length

export function getIncidentResponseReadinessReport() {
  return {
    generatedAt: new Date().toISOString(),
    version: '3.0.48-incident-response-readiness',
    summary: {
      totalControls: controls.length,
      ready,
      manualRequired,
      blocked,
      severityLanes: severityLanes.length,
      p0Controls: controls.filter((control) => control.priority === 'P0').length,
      p1Controls: controls.filter((control) => control.priority === 'P1').length
    },
    controls,
    severityLanes,
    runbook,
    emergencyStop: {
      recommendedMode: blocked ? 'blocked' : manualRequired ? 'manual_review' : 'active',
      stopTriggers: [
        'payment verification mismatch or webhook signature failure spike',
        'document vault private file exposure suspicion',
        'admin/RBAC bypass or account takeover suspicion',
        'AI output suggesting unsafe financial/legal action without disclaimer',
        'production mobile UI blocks complaint, UPI help, auth or payment flow'
      ],
      firstHourChecklist: [
        'freeze risky deploys and env changes',
        'assign incident commander and severity',
        'collect masked evidence and affected route list',
        'rollback or disable risky feature when user harm continues',
        'prepare user-safe status/support response'
      ]
    },
    nextAction: blocked
      ? 'Fix blocked incident response configuration before production deploy.'
      : manualRequired
        ? 'Complete alert, rollback, status, support, postmortem and evidence-preservation reviews before public traffic.'
        : 'Incident response readiness gates are complete for launch review.'
  }
}
