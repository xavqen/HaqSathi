export type AuditTrailStatus = 'PASS' | 'READY_TO_TEST' | 'MANUAL_REQUIRED' | 'BLOCKED'
export type AuditTrailPriority = 'P0' | 'P1' | 'P2'

export type AuditTrailControl = {
  id: string
  label: string
  status: AuditTrailStatus
  priority: AuditTrailPriority
  envValue: string
  passCondition: string
  evidenceRequired: string
  riskIfSkipped: string
}

export type AuditTrailEventGroup = {
  id: string
  label: string
  priority: AuditTrailPriority
  events: string[]
  requiredFields: string[]
  redactionRules: string[]
}

export type AuditTrailRunbookStep = {
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
  return Boolean(value && !/change-this|your-domain|localhost|127\.0\.0\.1|haqsathi\.local|example|PROJECT_REF|YOUR-PASSWORD/i.test(value))
}

function positiveInteger(name: string, fallback: string) {
  const value = Number.parseInt(env(name, fallback), 10)
  return Number.isFinite(value) && value > 0
}

function control(
  id: string,
  label: string,
  status: AuditTrailStatus,
  priority: AuditTrailPriority,
  envValue: string,
  passCondition: string,
  evidenceRequired: string,
  riskIfSkipped: string
): AuditTrailControl {
  return { id, label, status, priority, envValue, passCondition, evidenceRequired, riskIfSkipped }
}

const eventGroups: AuditTrailEventGroup[] = [
  {
    id: 'admin-auth-rbac',
    label: 'Admin login, session and RBAC decisions',
    priority: 'P0',
    events: ['admin.login.success', 'admin.login.failed', 'admin.rbac.denied', 'admin.session.reviewed'],
    requiredFields: ['actorId', 'actorRole', 'action', 'resource', 'result', 'createdAt', 'requestId'],
    redactionRules: ['Never log password, OTP, backup code, passkey credential body or raw session token.']
  },
  {
    id: 'content-official-data',
    label: 'Official data, content, SEO and translation changes',
    priority: 'P0',
    events: ['content.update', 'official_link.verify', 'scheme.update', 'translation.review'],
    requiredFields: ['actorId', 'entityType', 'entityId', 'beforeHash', 'afterHash', 'reviewer', 'result'],
    redactionRules: ['Log hashes/summaries for long text; avoid copying full sensitive user complaints into audit notes.']
  },
  {
    id: 'payment-subscription',
    label: 'Payment, subscription, invoice and refund actions',
    priority: 'P0',
    events: ['payment.verify', 'subscription.change', 'refund.request', 'invoice.send'],
    requiredFields: ['actorId', 'paymentId', 'orderId', 'amount', 'status', 'signatureResult', 'createdAt'],
    redactionRules: ['Never store raw card, CVV, bank login, full UPI PIN, webhook secret or full billing address in audit logs.']
  },
  {
    id: 'privacy-retention',
    label: 'Privacy export, deletion, retention and legal hold actions',
    priority: 'P0',
    events: ['privacy.export', 'privacy.delete.request', 'privacy.delete.decision', 'retention.hold.apply'],
    requiredFields: ['actorId', 'targetUserId', 'decision', 'holdReason', 'evidenceId', 'createdAt'],
    redactionRules: ['Log deletion decisions and evidence IDs, not exported document contents or raw identity proof files.']
  },
  {
    id: 'document-vault-security',
    label: 'Document vault upload, download, delete and safety decisions',
    priority: 'P1',
    events: ['vault.upload.scan', 'vault.download.signed_url', 'vault.delete', 'vault.blocked_file'],
    requiredFields: ['actorId', 'fileId', 'mimeType', 'sizeBytes', 'scanResult', 'bucket', 'createdAt'],
    redactionRules: ['Do not log document text, OCR full output, signed URL token or full file path.']
  },
  {
    id: 'support-incidents-abuse',
    label: 'Support, incident, abuse and error-monitoring actions',
    priority: 'P1',
    events: ['support.ticket.assign', 'incident.create', 'abuse.flag', 'error.fingerprint'],
    requiredFields: ['actorId', 'resourceId', 'severity', 'status', 'fingerprint', 'createdAt'],
    redactionRules: ['Redact email, phone, account number, UPI ID and complaint text before exporting logs.']
  }
]

const controls: AuditTrailControl[] = [
  control(
    'owner-assigned',
    'Audit trail owner assigned',
    configured('AUDIT_TRAIL_OWNER') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
    'P0',
    `AUDIT_TRAIL_OWNER=${env('AUDIT_TRAIL_OWNER') || 'empty'}`,
    'A named owner reviews admin audit events, alerting, retention and export behavior before launch.',
    'Owner name in env/evidence notes and /admin/audit-trail-readiness screenshot.',
    'Security, payment, privacy and content changes can happen without clear accountability.'
  ),
  control(
    'mode-safe',
    'Audit trail mode is safe for MVP launch',
    ['dry_run', 'log_only', 'enforced'].includes(env('AUDIT_TRAIL_MODE', 'log_only')) ? 'READY_TO_TEST' : 'BLOCKED',
    'P0',
    `AUDIT_TRAIL_MODE=${env('AUDIT_TRAIL_MODE', 'log_only')}`,
    'Launch uses dry_run/log_only/enforced mode intentionally, with no silent bypass for admin and billing actions.',
    'Readiness JSON and admin screenshot showing mode.',
    'Critical actions may not be recorded, or strict mode may break admin workflows unexpectedly.'
  ),
  control(
    'p0-events-reviewed',
    'P0 admin and payment event coverage reviewed',
    enabled('AUDIT_TRAIL_P0_EVENTS_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED',
    'P0',
    `AUDIT_TRAIL_P0_EVENTS_REVIEWED=${env('AUDIT_TRAIL_P0_EVENTS_REVIEWED', 'false')}`,
    'Admin auth/RBAC, content official-data edits, payments and privacy deletion actions have event names and required fields.',
    'Event matrix CSV, reviewer note and sample audit rows for P0 actions.',
    'A major launch incident can be impossible to investigate after the fact.'
  ),
  control(
    'write-path-instrumented',
    'Write-path audit instrumentation reviewed',
    enabled('AUDIT_TRAIL_WRITE_PATH_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED',
    'P0',
    `AUDIT_TRAIL_WRITE_PATH_REVIEWED=${env('AUDIT_TRAIL_WRITE_PATH_REVIEWED', 'false')}`,
    'Create/update/delete actions in admin, payment, privacy, support and document vault flows create an audit event or explicit skip reason.',
    'Route/API checklist showing which writes emit audit events.',
    'Admins may change important data without traceability or rollback context.'
  ),
  control(
    'redaction-reviewed',
    'Audit-log redaction rules reviewed',
    enabled('AUDIT_TRAIL_REDACTION_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED',
    'P0',
    `AUDIT_TRAIL_REDACTION_REVIEWED=${env('AUDIT_TRAIL_REDACTION_REVIEWED', 'false')}`,
    'Audit events avoid OTP, password, UPI PIN, CVV, tokens, signed URLs, document text and full personal identifiers.',
    'Redaction test screenshot and sample masked audit export.',
    'Long-lived audit logs can leak highly sensitive user data.'
  ),
  control(
    'retention-configured',
    'Audit retention window configured',
    positiveInteger('AUDIT_TRAIL_RETENTION_DAYS', '730') ? 'READY_TO_TEST' : 'BLOCKED',
    'P1',
    `AUDIT_TRAIL_RETENTION_DAYS=${env('AUDIT_TRAIL_RETENTION_DAYS', '730')}`,
    'Audit logs have a positive retention window aligned with data-retention, legal-hold and backup policies.',
    'Readiness report showing audit retention days and alignment note.',
    'Logs may either be lost too early or kept forever without privacy review.'
  ),
  control(
    'tamper-review',
    'Tamper-evidence and append-only behavior reviewed',
    enabled('AUDIT_TRAIL_TAMPER_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED',
    'P1',
    `AUDIT_TRAIL_TAMPER_REVIEWED=${env('AUDIT_TRAIL_TAMPER_REVIEWED', 'false')}`,
    'Audit rows are append-only or changes are separately audited, with request IDs/fingerprints for investigation.',
    'DB policy note, sample request ID/fingerprint and reviewer screenshot.',
    'An attacker or mistaken admin can erase or rewrite the trail that would prove what happened.'
  ),
  control(
    'alerting-ready',
    'Suspicious audit alerting ready',
    configured('AUDIT_TRAIL_ALERT_WEBHOOK_URL') || configured('ERROR_ALERT_WEBHOOK_URL') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
    'P1',
    `AUDIT_TRAIL_ALERT_WEBHOOK_URL=${configured('AUDIT_TRAIL_ALERT_WEBHOOK_URL') ? 'set' : 'empty'}`,
    'High-risk events such as RBAC denial spikes, failed webhook verification, mass export/delete or unsafe upload blocks can alert an owner.',
    'Webhook test evidence or documented manual monitoring owner.',
    'High-risk abuse or internal mistakes can go unnoticed until users complain.'
  ),
  control(
    'export-reviewed',
    'Audit export and admin visibility reviewed',
    enabled('AUDIT_TRAIL_EXPORT_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED',
    'P2',
    `AUDIT_TRAIL_EXPORT_REVIEWED=${env('AUDIT_TRAIL_EXPORT_REVIEWED', 'false')}`,
    'Admins can review filtered audit evidence safely without exposing secrets or raw documents.',
    'Admin audit screenshot and masked CSV/JSON export sample.',
    'Support, finance and security reviewers may over-share or under-review incident evidence.'
  )
]

const runbook: AuditTrailRunbookStep[] = [
  { step: 'Run npm run audit-trail:readiness and save JSON/CSV evidence.', owner: 'Developer/Admin', evidence: 'artifacts/audit-trail-readiness files' },
  { step: 'Review every P0 write path: RBAC, content, official data, payment, privacy deletion and vault actions.', owner: 'Developer/Ops', evidence: 'Route/API checklist with event name or skip reason' },
  { step: 'Trigger safe sample audit events on staging and verify redaction.', owner: 'QA/Admin', evidence: 'Masked audit row screenshots' },
  { step: 'Confirm retention and backup alignment with data-retention policy.', owner: 'Privacy/Ops', evidence: 'Retention note and backup restore alignment proof' },
  { step: 'Test alert path for suspicious events or document manual watch owner.', owner: 'Security/Ops', evidence: 'Webhook alert screenshot or manual monitoring note' }
]

export function getAuditTrailReadinessReport() {
  const ready = controls.filter((item) => item.status === 'PASS' || item.status === 'READY_TO_TEST').length
  const manualRequired = controls.filter((item) => item.status === 'MANUAL_REQUIRED').length
  const blocked = controls.filter((item) => item.status === 'BLOCKED').length
  const p0Groups = eventGroups.filter((item) => item.priority === 'P0').length

  return {
    generatedAt: new Date().toISOString(),
    version: '3.0.45-audit-trail-readiness',
    summary: {
      totalControls: controls.length,
      ready,
      manualRequired,
      blocked,
      eventGroups: eventGroups.length,
      p0Groups
    },
    controls,
    eventGroups,
    runbook,
    nextAction: blocked
      ? 'Fix blocked audit-trail configuration before launch review.'
      : manualRequired
        ? 'Complete P0 event coverage, write-path review, redaction review and alert/export evidence before public launch.'
        : 'Audit trail readiness gates are complete for launch review.'
  }
}
