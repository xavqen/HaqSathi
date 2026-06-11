import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const outputDir = process.env.DATA_RETENTION_EVIDENCE_DIR || './artifacts/data-retention'
mkdirSync(outputDir, { recursive: true })

function env(name, fallback = '') {
  return process.env[name] || fallback
}

function enabled(name) {
  return /^(true|1|yes|enabled|pass|reviewed)$/i.test(env(name))
}

function configured(name) {
  const value = env(name)
  return Boolean(value && !/change-this|your-domain|localhost|127\.0\.0\.1|haqsathi\.local|example|PROJECT_REF|YOUR-PASSWORD/i.test(value))
}

function positiveInteger(name, fallback) {
  const value = Number.parseInt(env(name, fallback), 10)
  return Number.isFinite(value) && value > 0
}

const datasets = [
  ['account-profile', 'P0', 'Account/profile records', `${env('RETENTION_ACCOUNT_PROFILE_DAYS', '3650')} days or until verified deletion request is approved`, 'Delete/anonymize after verified deletion unless legal/payment/abuse hold applies'],
  ['complaints-ai-drafts', 'P0', 'Complaint drafts, AI chats and generated text', `${env('RETENTION_COMPLAINT_DRAFT_DAYS', '365')} days by default`, 'Delete user-owned draft/chat data after export window closes'],
  ['document-vault', 'P0', 'Document vault files and metadata', `${env('RETENTION_DOCUMENT_VAULT_DAYS', '365')} days or until user deletes file`, 'Delete object and metadata together; retain only non-sensitive audit evidence if needed'],
  ['payments-invoices', 'P0', 'Payment, invoices and subscription records', `${env('RETENTION_PAYMENT_RECORD_DAYS', '2920')} days or legal/tax requirement`, 'Keep legal/tax/refund records; mask user-facing output'],
  ['support-tickets', 'P1', 'Support tickets and escalation notes', `${env('RETENTION_SUPPORT_TICKET_DAYS', '730')} days`, 'Delete/anonymize closed tickets unless linked to billing/safety/legal hold'],
  ['analytics-events', 'P1', 'Analytics, UTM and growth events', `${env('ANALYTICS_RETENTION_DAYS', '90')} days`, 'Purge or aggregate old consent-aware redacted events'],
  ['audit-security-logs', 'P1', 'Admin audit, security, abuse and error logs', `${env('RETENTION_AUDIT_LOG_DAYS', '730')} days`, 'Keep security/audit logs until retention expiry or hold is cleared'],
  ['newsletter-referrals', 'P2', 'Newsletter, referral and campaign records', `${env('RETENTION_MARKETING_RECORD_DAYS', '365')} days or until unsubscribe/deletion request`, 'Honor unsubscribe/deletion unless fraud/reward review hold applies']
]

const retentionKeys = ['RETENTION_ACCOUNT_PROFILE_DAYS', 'RETENTION_COMPLAINT_DRAFT_DAYS', 'RETENTION_DOCUMENT_VAULT_DAYS', 'RETENTION_PAYMENT_RECORD_DAYS', 'RETENTION_SUPPORT_TICKET_DAYS', 'RETENTION_AUDIT_LOG_DAYS', 'RETENTION_MARKETING_RECORD_DAYS']
const retentionConfigured = retentionKeys.every((key) => positiveInteger(key, '365'))

const controls = [
  ['owner-assigned', 'P0', 'Data retention owner assigned', configured('DATA_RETENTION_OWNER') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', `DATA_RETENTION_OWNER=${env('DATA_RETENTION_OWNER') || 'empty'}`],
  ['policy-reviewed', 'P0', 'Retention policy reviewed against Privacy/Terms', enabled('DATA_RETENTION_POLICY_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `DATA_RETENTION_POLICY_REVIEWED=${env('DATA_RETENTION_POLICY_REVIEWED', 'false')}`],
  ['retention-days-configured', 'P0', 'Retention windows configured with positive day counts', retentionConfigured ? 'READY_TO_TEST' : 'BLOCKED', 'RETENTION_*_DAYS=positive integers'],
  ['deletion-holds-reviewed', 'P0', 'Deletion exception and legal-hold rules reviewed', enabled('DATA_RETENTION_HOLDS_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `DATA_RETENTION_HOLDS_REVIEWED=${env('DATA_RETENTION_HOLDS_REVIEWED', 'false')}`],
  ['purge-mode-safe', 'P0', 'Purge automation mode is safe for launch', ['dry_run', 'manual_review', 'disabled'].includes(env('DATA_RETENTION_PURGE_MODE', 'dry_run')) ? 'READY_TO_TEST' : 'BLOCKED', `DATA_RETENTION_PURGE_MODE=${env('DATA_RETENTION_PURGE_MODE', 'dry_run')}`],
  ['audit-log-redaction-reviewed', 'P1', 'Audit/security log redaction reviewed', enabled('DATA_RETENTION_AUDIT_REDACTION_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `DATA_RETENTION_AUDIT_REDACTION_REVIEWED=${env('DATA_RETENTION_AUDIT_REDACTION_REVIEWED', 'false')}`],
  ['export-delete-workflow-tested', 'P1', 'Export/delete workflow tested end-to-end', enabled('DATA_RETENTION_EXPORT_DELETE_TESTED') ? 'PASS' : 'MANUAL_REQUIRED', `DATA_RETENTION_EXPORT_DELETE_TESTED=${env('DATA_RETENTION_EXPORT_DELETE_TESTED', 'false')}`],
  ['backup-restore-aligned', 'P1', 'Backups and restore policy aligned with deletion workflow', enabled('DATA_RETENTION_BACKUP_ALIGNMENT_REVIEWED') || configured('BACKUP_RESTORE_TEST_OWNER') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', `DATA_RETENTION_BACKUP_ALIGNMENT_REVIEWED=${env('DATA_RETENTION_BACKUP_ALIGNMENT_REVIEWED', 'false')}`],
  ['evidence-dir', 'P2', 'Data retention evidence directory configured', 'READY_TO_TEST', `DATA_RETENTION_EVIDENCE_DIR=${outputDir}`]
]

const runbook = [
  ['Run npm run retention:readiness and open /admin/data-retention', 'Developer/Admin', 'JSON/CSV output and admin dashboard screenshot'],
  ['Review Privacy/Terms wording against the dataset retention matrix', 'Privacy/Legal reviewer', 'Reviewer note and screenshots'],
  ['Test user export and deletion request without destructive purge automation', 'QA/Admin', 'Export JSON and deletion decision proof'],
  ['Review legal/payment/abuse/support holds before deletion/anonymization', 'Ops/Finance/Safety', 'Hold decision checklist'],
  ['Confirm backup restore policy aligns with deletion/anonymization expectations', 'Developer/Admin', 'Restore-drill note']
]

const ready = controls.filter((control) => control[3] === 'PASS' || control[3] === 'READY_TO_TEST').length
const manualRequired = controls.filter((control) => control[3] === 'MANUAL_REQUIRED').length
const blocked = controls.filter((control) => control[3] === 'BLOCKED').length

const report = {
  generatedAt: new Date().toISOString(),
  version: '3.0.44-data-retention-readiness',
  summary: {
    totalControls: controls.length,
    ready,
    manualRequired,
    blocked,
    datasets: datasets.length,
    p0Datasets: datasets.filter((row) => row[1] === 'P0').length
  },
  controls: controls.map(([id, priority, label, status, envValue]) => ({ id, priority, label, status, envValue })),
  datasets: datasets.map(([id, priority, label, defaultRetention, deletePolicy]) => ({ id, priority, label, defaultRetention, deletePolicy })),
  runbook: runbook.map(([step, owner, evidence]) => ({ step, owner, evidence })),
  nextAction: blocked ? 'Fix blocked data-retention configuration before launch review.' : manualRequired ? 'Complete retention policy, deletion holds, redaction and export/delete workflow review before public launch.' : 'Data retention readiness gates are complete for launch review.'
}

const csv = (rows) => rows.map((row) => row.map((value) => String(value).replaceAll(',', ';')).join(',')).join('\n')
writeFileSync(join(outputDir, 'data-retention-readiness.json'), JSON.stringify(report, null, 2))
writeFileSync(join(outputDir, 'data-retention-controls.csv'), csv([['id', 'priority', 'label', 'status', 'env_value'], ...controls]))
writeFileSync(join(outputDir, 'data-retention-datasets.csv'), csv([['id', 'priority', 'label', 'default_retention', 'delete_policy'], ...datasets]))
writeFileSync(join(outputDir, 'data-retention-runbook.csv'), csv([['step', 'owner', 'evidence_required'], ...runbook]))

console.log(`✅ Data retention readiness evidence written to ${outputDir}`)
console.log(`Ready: ${ready} · Manual: ${manualRequired} · Blocked: ${blocked} · Datasets: ${datasets.length}`)
