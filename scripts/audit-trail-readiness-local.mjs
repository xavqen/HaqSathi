import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const env = (name, fallback = '') => process.env[name] || fallback
const enabled = (name) => /^(true|1|yes|enabled|pass|reviewed)$/i.test(env(name))
const configured = (name) => {
  const value = env(name)
  return Boolean(value && !/change-this|your-domain|localhost|127\.0\.0\.1|haqsathi\.local|example|PROJECT_REF|YOUR-PASSWORD/i.test(value))
}
const positiveInteger = (name, fallback) => {
  const value = Number.parseInt(env(name, fallback), 10)
  return Number.isFinite(value) && value > 0
}

const outputDir = env('AUDIT_TRAIL_EVIDENCE_DIR', './artifacts/audit-trail-readiness')
mkdirSync(outputDir, { recursive: true })

const eventGroups = [
  ['admin-auth-rbac', 'P0', 'Admin login, session and RBAC decisions', 'admin.login.success|admin.login.failed|admin.rbac.denied|admin.session.reviewed', 'actorId|actorRole|action|resource|result|createdAt|requestId'],
  ['content-official-data', 'P0', 'Official data, content, SEO and translation changes', 'content.update|official_link.verify|scheme.update|translation.review', 'actorId|entityType|entityId|beforeHash|afterHash|reviewer|result'],
  ['payment-subscription', 'P0', 'Payment, subscription, invoice and refund actions', 'payment.verify|subscription.change|refund.request|invoice.send', 'actorId|paymentId|orderId|amount|status|signatureResult|createdAt'],
  ['privacy-retention', 'P0', 'Privacy export, deletion, retention and legal hold actions', 'privacy.export|privacy.delete.request|privacy.delete.decision|retention.hold.apply', 'actorId|targetUserId|decision|holdReason|evidenceId|createdAt'],
  ['document-vault-security', 'P1', 'Document vault upload, download, delete and safety decisions', 'vault.upload.scan|vault.download.signed_url|vault.delete|vault.blocked_file', 'actorId|fileId|mimeType|sizeBytes|scanResult|bucket|createdAt'],
  ['support-incidents-abuse', 'P1', 'Support, incident, abuse and error-monitoring actions', 'support.ticket.assign|incident.create|abuse.flag|error.fingerprint', 'actorId|resourceId|severity|status|fingerprint|createdAt']
]

const controls = [
  ['owner-assigned', 'P0', 'Audit trail owner assigned', configured('AUDIT_TRAIL_OWNER') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', `AUDIT_TRAIL_OWNER=${env('AUDIT_TRAIL_OWNER') || 'empty'}`],
  ['mode-safe', 'P0', 'Audit trail mode is safe for MVP launch', ['dry_run', 'log_only', 'enforced'].includes(env('AUDIT_TRAIL_MODE', 'log_only')) ? 'READY_TO_TEST' : 'BLOCKED', `AUDIT_TRAIL_MODE=${env('AUDIT_TRAIL_MODE', 'log_only')}`],
  ['p0-events-reviewed', 'P0', 'P0 admin and payment event coverage reviewed', enabled('AUDIT_TRAIL_P0_EVENTS_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `AUDIT_TRAIL_P0_EVENTS_REVIEWED=${env('AUDIT_TRAIL_P0_EVENTS_REVIEWED', 'false')}`],
  ['write-path-instrumented', 'P0', 'Write-path audit instrumentation reviewed', enabled('AUDIT_TRAIL_WRITE_PATH_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `AUDIT_TRAIL_WRITE_PATH_REVIEWED=${env('AUDIT_TRAIL_WRITE_PATH_REVIEWED', 'false')}`],
  ['redaction-reviewed', 'P0', 'Audit-log redaction rules reviewed', enabled('AUDIT_TRAIL_REDACTION_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `AUDIT_TRAIL_REDACTION_REVIEWED=${env('AUDIT_TRAIL_REDACTION_REVIEWED', 'false')}`],
  ['retention-configured', 'P1', 'Audit retention window configured', positiveInteger('AUDIT_TRAIL_RETENTION_DAYS', '730') ? 'READY_TO_TEST' : 'BLOCKED', `AUDIT_TRAIL_RETENTION_DAYS=${env('AUDIT_TRAIL_RETENTION_DAYS', '730')}`],
  ['tamper-review', 'P1', 'Tamper-evidence and append-only behavior reviewed', enabled('AUDIT_TRAIL_TAMPER_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `AUDIT_TRAIL_TAMPER_REVIEWED=${env('AUDIT_TRAIL_TAMPER_REVIEWED', 'false')}`],
  ['alerting-ready', 'P1', 'Suspicious audit alerting ready', configured('AUDIT_TRAIL_ALERT_WEBHOOK_URL') || configured('ERROR_ALERT_WEBHOOK_URL') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', `AUDIT_TRAIL_ALERT_WEBHOOK_URL=${configured('AUDIT_TRAIL_ALERT_WEBHOOK_URL') ? 'set' : 'empty'}`],
  ['export-reviewed', 'P2', 'Audit export and admin visibility reviewed', enabled('AUDIT_TRAIL_EXPORT_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `AUDIT_TRAIL_EXPORT_REVIEWED=${env('AUDIT_TRAIL_EXPORT_REVIEWED', 'false')}`]
]

const runbook = [
  ['Run npm run audit-trail:readiness and save JSON/CSV evidence.', 'Developer/Admin', 'artifacts/audit-trail-readiness files'],
  ['Review every P0 write path: RBAC, content, official data, payment, privacy deletion and vault actions.', 'Developer/Ops', 'Route/API checklist with event name or skip reason'],
  ['Trigger safe sample audit events on staging and verify redaction.', 'QA/Admin', 'Masked audit row screenshots'],
  ['Confirm retention and backup alignment with data-retention policy.', 'Privacy/Ops', 'Retention note and backup restore alignment proof'],
  ['Test alert path for suspicious events or document manual watch owner.', 'Security/Ops', 'Webhook alert screenshot or manual monitoring note']
]

const ready = controls.filter((control) => control[3] === 'PASS' || control[3] === 'READY_TO_TEST').length
const manualRequired = controls.filter((control) => control[3] === 'MANUAL_REQUIRED').length
const blocked = controls.filter((control) => control[3] === 'BLOCKED').length

const report = {
  generatedAt: new Date().toISOString(),
  version: '3.0.45-audit-trail-readiness',
  summary: {
    totalControls: controls.length,
    ready,
    manualRequired,
    blocked,
    eventGroups: eventGroups.length,
    p0Groups: eventGroups.filter((row) => row[1] === 'P0').length
  },
  controls: controls.map(([id, priority, label, status, envValue]) => ({ id, priority, label, status, envValue })),
  eventGroups: eventGroups.map(([id, priority, label, events, requiredFields]) => ({ id, priority, label, events, requiredFields })),
  runbook: runbook.map(([step, owner, evidence]) => ({ step, owner, evidence })),
  nextAction: blocked ? 'Fix blocked audit-trail configuration before launch review.' : manualRequired ? 'Complete P0 event coverage, write-path review, redaction review and alert/export evidence before public launch.' : 'Audit trail readiness gates are complete for launch review.'
}

const csv = (rows) => rows.map((row) => row.map((value) => String(value).replaceAll(',', ';')).join(',')).join('\n')
writeFileSync(join(outputDir, 'audit-trail-readiness.json'), JSON.stringify(report, null, 2))
writeFileSync(join(outputDir, 'audit-trail-controls.csv'), csv([['id', 'priority', 'label', 'status', 'env_value'], ...controls]))
writeFileSync(join(outputDir, 'audit-trail-event-groups.csv'), csv([['id', 'priority', 'label', 'events', 'required_fields'], ...eventGroups]))
writeFileSync(join(outputDir, 'audit-trail-runbook.csv'), csv([['step', 'owner', 'evidence_required'], ...runbook]))

console.log(`✅ Audit trail readiness evidence written to ${outputDir}`)
console.log(`Ready: ${ready} · Manual: ${manualRequired} · Blocked: ${blocked} · Event groups: ${eventGroups.length}`)
