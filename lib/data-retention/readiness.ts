export type DataRetentionStatus = 'PASS' | 'READY_TO_TEST' | 'MANUAL_REQUIRED' | 'BLOCKED'
export type DataRetentionPriority = 'P0' | 'P1' | 'P2'

export type DataRetentionControl = {
  id: string
  label: string
  status: DataRetentionStatus
  priority: DataRetentionPriority
  envValue: string
  passCondition: string
  evidenceRequired: string
  riskIfSkipped: string
}

export type DataRetentionDataset = {
  id: string
  label: string
  priority: DataRetentionPriority
  defaultRetention: string
  reviewPolicy: string
  deletePolicy: string
  evidenceRequired: string[]
}

export type DataRetentionRunbookStep = {
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
  const raw = env(name, fallback)
  const value = Number.parseInt(raw, 10)
  return Number.isFinite(value) && value > 0
}

function control(
  id: string,
  label: string,
  status: DataRetentionStatus,
  priority: DataRetentionPriority,
  envValue: string,
  passCondition: string,
  evidenceRequired: string,
  riskIfSkipped: string
): DataRetentionControl {
  return { id, label, status, priority, envValue, passCondition, evidenceRequired, riskIfSkipped }
}

const datasets: DataRetentionDataset[] = [
  {
    id: 'account-profile',
    label: 'Account/profile records',
    priority: 'P0',
    defaultRetention: env('RETENTION_ACCOUNT_PROFILE_DAYS', '3650') + ' days or until verified deletion request is approved',
    reviewPolicy: 'Keep only the minimum profile fields needed for account, billing, support and safety operations.',
    deletePolicy: 'Delete/anonymize after verified deletion request unless legal, payment or abuse hold applies.',
    evidenceRequired: ['Privacy-center export proof', 'Deletion approval note', 'DB row anonymization/deletion sample']
  },
  {
    id: 'complaints-ai-drafts',
    label: 'Complaint drafts, AI chats and generated text',
    priority: 'P0',
    defaultRetention: env('RETENTION_COMPLAINT_DRAFT_DAYS', '365') + ' days by default',
    reviewPolicy: 'Do not retain OTP, password, UPI PIN, CVV or secret bank-login details in drafts/logs.',
    deletePolicy: 'Delete user-owned draft/chat data during deletion workflow after export window closes.',
    evidenceRequired: ['Redaction proof', 'Export JSON proof', 'Deletion request sample']
  },
  {
    id: 'document-vault',
    label: 'Document vault files and metadata',
    priority: 'P0',
    defaultRetention: env('RETENTION_DOCUMENT_VAULT_DAYS', '365') + ' days or until user deletes file',
    reviewPolicy: 'Private bucket only, short signed URLs, no public caching and no unnecessary metadata fields.',
    deletePolicy: 'Delete object + metadata together and keep only non-sensitive audit evidence where legally needed.',
    evidenceRequired: ['Safe upload proof', 'Delete file proof', 'Private bucket screenshot']
  },
  {
    id: 'payments-invoices',
    label: 'Payment, invoices and subscription records',
    priority: 'P0',
    defaultRetention: env('RETENTION_PAYMENT_RECORD_DAYS', '2920') + ' days or legal/tax requirement',
    reviewPolicy: 'Keep payment IDs/status/amounts; never store raw card/bank credentials.',
    deletePolicy: 'Do not delete records needed for tax, refund, chargeback, fraud or accounting obligations; mask user-facing output.',
    evidenceRequired: ['Razorpay payment row proof', 'Invoice/receipt evidence', 'Masked admin screenshot']
  },
  {
    id: 'support-tickets',
    label: 'Support tickets and escalation notes',
    priority: 'P1',
    defaultRetention: env('RETENTION_SUPPORT_TICKET_DAYS', '730') + ' days',
    reviewPolicy: 'Support agents should remove secrets and avoid asking for OTP/password/full bank details.',
    deletePolicy: 'Delete or anonymize closed tickets unless linked to billing, safety, abuse or legal hold.',
    evidenceRequired: ['Support ticket sample', 'Secret-redaction proof', 'Closure/anonymization note']
  },
  {
    id: 'analytics-events',
    label: 'Analytics, UTM and growth events',
    priority: 'P1',
    defaultRetention: env('ANALYTICS_RETENTION_DAYS', '90') + ' days',
    reviewPolicy: 'Only allowlisted, consent-aware, PII-redacted events should be retained.',
    deletePolicy: 'Purge or aggregate old events according to analytics retention days.',
    evidenceRequired: ['Consent/network proof', 'Masked event sample', 'Purge/aggregation evidence']
  },
  {
    id: 'audit-security-logs',
    label: 'Admin audit, security, abuse and error logs',
    priority: 'P1',
    defaultRetention: env('RETENTION_AUDIT_LOG_DAYS', '730') + ' days',
    reviewPolicy: 'Keep actor/action/time/result/fingerprint, but redact complaint text, document content and secrets.',
    deletePolicy: 'Keep security/audit logs until retention expiry or legal/security hold is cleared.',
    evidenceRequired: ['Admin audit screenshot', 'Redacted log sample', 'Retention purge dry-run output']
  },
  {
    id: 'newsletter-referrals',
    label: 'Newsletter, referral and campaign records',
    priority: 'P2',
    defaultRetention: env('RETENTION_MARKETING_RECORD_DAYS', '365') + ' days or until unsubscribe/deletion request',
    reviewPolicy: 'Keep consent, source and masked email; avoid storing sensitive complaint/document details in campaigns.',
    deletePolicy: 'Honor unsubscribe and deletion requests unless a fraud/reward review hold applies.',
    evidenceRequired: ['Subscribe/unsubscribe proof', 'Masked referral proof', 'Campaign consent note']
  }
]

const controls: DataRetentionControl[] = [
  control(
    'owner-assigned',
    'Data retention owner assigned',
    configured('DATA_RETENTION_OWNER') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
    'P0',
    `DATA_RETENTION_OWNER=${env('DATA_RETENTION_OWNER') || 'empty'}`,
    'A named owner is responsible for retention policy, deletion exceptions and audit-log review before launch.',
    'Owner name in env/evidence notes and /admin/data-retention screenshot.',
    'Retention/deletion decisions may be inconsistent or unsafe when real users request export/deletion.'
  ),
  control(
    'policy-reviewed',
    'Retention policy reviewed against Privacy/Terms',
    enabled('DATA_RETENTION_POLICY_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED',
    'P0',
    `DATA_RETENTION_POLICY_REVIEWED=${env('DATA_RETENTION_POLICY_REVIEWED', 'false')}`,
    'Privacy, Terms and admin runbooks describe what data is kept, why, for how long and how deletion exceptions work.',
    'Privacy/Terms screenshots, review note and retention matrix export.',
    'The app may promise deletion/export behavior that production systems cannot safely perform.'
  ),
  control(
    'retention-days-configured',
    'Retention windows configured with positive day counts',
    ['RETENTION_ACCOUNT_PROFILE_DAYS', 'RETENTION_COMPLAINT_DRAFT_DAYS', 'RETENTION_DOCUMENT_VAULT_DAYS', 'RETENTION_PAYMENT_RECORD_DAYS', 'RETENTION_SUPPORT_TICKET_DAYS', 'RETENTION_AUDIT_LOG_DAYS', 'RETENTION_MARKETING_RECORD_DAYS'].every((key) => positiveInteger(key, '365')) ? 'READY_TO_TEST' : 'BLOCKED',
    'P0',
    'RETENTION_*_DAYS=positive integers',
    'Every major dataset has a clear retention window that can be reviewed before deletion automation is enabled.',
    'Generated data-retention-readiness JSON/CSV with all retention windows.',
    'Old sensitive data may stay forever or be deleted too early without legal/payment/safety review.'
  ),
  control(
    'deletion-holds-reviewed',
    'Deletion exception and legal-hold rules reviewed',
    enabled('DATA_RETENTION_HOLDS_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED',
    'P0',
    `DATA_RETENTION_HOLDS_REVIEWED=${env('DATA_RETENTION_HOLDS_REVIEWED', 'false')}`,
    'Payment, refund, chargeback, abuse, legal and support dispute holds are documented before irreversible deletion.',
    'Deletion-hold decision tree and sample deletion approval/reject evidence.',
    'A deletion request can accidentally erase records needed for billing disputes, fraud review or user safety.'
  ),
  control(
    'purge-mode-safe',
    'Purge automation mode is safe for launch',
    ['dry_run', 'manual_review', 'disabled'].includes(env('DATA_RETENTION_PURGE_MODE', 'dry_run')) ? 'READY_TO_TEST' : 'BLOCKED',
    'P0',
    `DATA_RETENTION_PURGE_MODE=${env('DATA_RETENTION_PURGE_MODE', 'dry_run')}`,
    'Launch uses dry_run or manual_review until real deletion/export evidence is approved.',
    'Admin screenshot and local readiness output showing purge mode.',
    'Automated deletion could remove data permanently before restore, audit and legal review are ready.'
  ),
  control(
    'audit-log-redaction-reviewed',
    'Audit/security log redaction reviewed',
    enabled('DATA_RETENTION_AUDIT_REDACTION_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED',
    'P1',
    `DATA_RETENTION_AUDIT_REDACTION_REVIEWED=${env('DATA_RETENTION_AUDIT_REDACTION_REVIEWED', 'false')}`,
    'Audit, error, analytics, support and abuse logs avoid raw complaint text, documents, OTPs, UPI PINs and full identifiers.',
    'Masked admin logs screenshot and redaction test evidence.',
    'Sensitive data may leak into long-lived logs and admin exports.'
  ),
  control(
    'export-delete-workflow-tested',
    'Export/delete workflow tested end-to-end',
    enabled('DATA_RETENTION_EXPORT_DELETE_TESTED') ? 'PASS' : 'MANUAL_REQUIRED',
    'P1',
    `DATA_RETENTION_EXPORT_DELETE_TESTED=${env('DATA_RETENTION_EXPORT_DELETE_TESTED', 'false')}`,
    'User export, deletion request, admin approval, exception review and evidence storage are tested on staging/deployed QA.',
    'Export JSON, deletion request row, admin decision screenshot and post-delete verification.',
    'Public users may request export/deletion but the team may not have a verified operational process.'
  ),
  control(
    'backup-restore-aligned',
    'Backups and restore policy aligned with deletion workflow',
    enabled('DATA_RETENTION_BACKUP_ALIGNMENT_REVIEWED') || configured('BACKUP_RESTORE_TEST_OWNER') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
    'P1',
    `DATA_RETENTION_BACKUP_ALIGNMENT_REVIEWED=${env('DATA_RETENTION_BACKUP_ALIGNMENT_REVIEWED', 'false')}; BACKUP_RESTORE_TEST_OWNER=${env('BACKUP_RESTORE_TEST_OWNER') || 'empty'}`,
    'Backups retain data only as needed and deletion/anonymization expectations are documented for restored data.',
    'Backup readiness evidence and restore-drill note mentioning deletion requests.',
    'Restoring an old backup can reintroduce data that a user expected to be deleted/anonymized.'
  ),
  control(
    'evidence-dir',
    'Data retention evidence directory configured',
    Boolean(env('DATA_RETENTION_EVIDENCE_DIR', './artifacts/data-retention')) ? 'READY_TO_TEST' : 'BLOCKED',
    'P2',
    `DATA_RETENTION_EVIDENCE_DIR=${env('DATA_RETENTION_EVIDENCE_DIR', './artifacts/data-retention')}`,
    'Local evidence generator writes data retention JSON and CSV files.',
    'Generated artifacts/data-retention folder.',
    'Launch reviewers cannot verify retention decisions, dataset matrix or purge mode.'
  )
]

const runbook: DataRetentionRunbookStep[] = [
  {
    step: 'Run npm run retention:readiness and open /admin/data-retention.',
    owner: 'Developer/Admin',
    evidence: 'Save generated JSON/CSV plus admin dashboard screenshot.'
  },
  {
    step: 'Review Privacy, Terms and deletion center wording against the dataset retention matrix.',
    owner: 'Privacy/Legal reviewer',
    evidence: 'Reviewer note, screenshots and copy diff if wording changed.'
  },
  {
    step: 'Test user export and deletion request without enabling destructive purge automation.',
    owner: 'QA/Admin',
    evidence: 'Export JSON proof, deletion request row and admin decision screenshot.'
  },
  {
    step: 'Review legal/payment/abuse/support holds before approving deletion or anonymization.',
    owner: 'Ops/Finance/Safety',
    evidence: 'Deletion approval checklist with hold decision.'
  },
  {
    step: 'Confirm backups, restored environments and long-lived audit logs stay aligned with deletion expectations.',
    owner: 'Developer/Admin',
    evidence: 'Restore drill note and retention backup alignment proof.'
  }
]

export function getDataRetentionReadinessReport() {
  const ready = controls.filter((item) => item.status === 'PASS' || item.status === 'READY_TO_TEST').length
  const manualRequired = controls.filter((item) => item.status === 'MANUAL_REQUIRED').length
  const blocked = controls.filter((item) => item.status === 'BLOCKED').length
  const p0Controls = controls.filter((item) => item.priority === 'P0').length
  const p0Datasets = datasets.filter((item) => item.priority === 'P0').length

  return {
    generatedAt: new Date().toISOString(),
    version: '3.0.44-data-retention-readiness',
    summary: {
      totalControls: controls.length,
      ready,
      manualRequired,
      blocked,
      p0Controls,
      datasets: datasets.length,
      p0Datasets
    },
    controls,
    datasets,
    runbook,
    nextAction: blocked
      ? 'Fix blocked data-retention configuration before launch review.'
      : manualRequired
        ? 'Complete retention policy, deletion holds, redaction and export/delete workflow review before public launch.'
        : 'Data retention readiness gates are complete for launch review.'
  }
}
