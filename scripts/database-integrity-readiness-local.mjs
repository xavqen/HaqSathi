import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

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

const outputDir = join(process.cwd(), env('DATABASE_EVIDENCE_DIR', './artifacts/database-integrity'))
mkdirSync(outputDir, { recursive: true })

const datasets = [
  ['identity-auth', 'P0', 'Identity, auth, sessions and account security', 'User|AuthSession|PasswordResetToken|EmailVerificationToken|PrivacyConsent', 'unique-email|session-expiry|verification-token-expiry|consent-user-link'],
  ['case-workflows', 'P0', 'Complaints, cases, reminders and evidence workflows', 'Complaint|CaseTimelineEvent|CaseTask|Reminder|EvidencePack|DocumentVaultItem', 'ownership|status-transition|orphan-prevention|signed-url-not-logged'],
  ['payments-subscriptions', 'P0', 'Payments, subscriptions and invoices', 'PaymentOrder|Subscription|AgentInvoice|EmailLog|UserActivity', 'unique-order-id|webhook-idempotency|signature-proof|invoice-email-link'],
  ['official-content', 'P1', 'Official sources, authorities, schemes and SEO content', 'Scheme|OfficialResource|OfficialSource|AuthorityDirectoryEntry|OfficialLinkCheck|SeoPage', 'official-url-allowlist|last-verified|duplicate-check|review-owner'],
  ['safety-operations', 'P1', 'Safety, support, incidents and abuse operations', 'SupportTicket|IncidentReport|ModerationQueueItem|AiOutputReview|RiskAssessment|Audit evidence', 'pii-redaction|sla-fields|incident-owner|ai-review-trace'],
  ['growth-analytics', 'P2', 'Analytics, referrals, newsletter and growth records', 'ReferralInvite|LaunchMetricSnapshot|PartnerLead|Feedback|Newsletter events', 'consent|email-masking|invite-dedupe|pii-safe-analytics']
]

const controls = [
  ['owner-assigned', 'P0', 'Database integrity owner assigned', configured('DATABASE_INTEGRITY_OWNER') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', `DATABASE_INTEGRITY_OWNER=${env('DATABASE_INTEGRITY_OWNER') || 'empty'}`],
  ['database-url-configured', 'P0', 'Production DATABASE_URL configured safely', configured('DATABASE_URL') ? 'READY_TO_TEST' : 'BLOCKED', `DATABASE_URL=${configured('DATABASE_URL') ? 'set' : 'missing_or_placeholder'}`],
  ['direct-url-configured', 'P0', 'DIRECT_URL configured for Prisma migrations', configured('DIRECT_URL') ? 'READY_TO_TEST' : 'BLOCKED', `DIRECT_URL=${configured('DIRECT_URL') ? 'set' : 'missing_or_placeholder'}`],
  ['mode-safe', 'P0', 'Database integrity mode is safe', ['dry_run', 'manual_review', 'enforced'].includes(env('DATABASE_INTEGRITY_MODE', 'dry_run')) ? 'READY_TO_TEST' : 'BLOCKED', `DATABASE_INTEGRITY_MODE=${env('DATABASE_INTEGRITY_MODE', 'dry_run')}`],
  ['schema-validated', 'P0', 'Prisma schema validation reviewed', enabled('DATABASE_SCHEMA_VALIDATE_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `DATABASE_SCHEMA_VALIDATE_REVIEWED=${env('DATABASE_SCHEMA_VALIDATE_REVIEWED', 'false')}`],
  ['migration-reviewed', 'P0', 'Migration/db push path reviewed', enabled('DATABASE_MIGRATION_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `DATABASE_MIGRATION_REVIEWED=${env('DATABASE_MIGRATION_REVIEWED', 'false')}`],
  ['seed-idempotency-reviewed', 'P1', 'Seed idempotency reviewed', enabled('DATABASE_SEED_IDEMPOTENCY_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `DATABASE_SEED_IDEMPOTENCY_REVIEWED=${env('DATABASE_SEED_IDEMPOTENCY_REVIEWED', 'false')}`],
  ['index-review', 'P1', 'Index and slow-query review completed', enabled('DATABASE_INDEX_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `DATABASE_INDEX_REVIEWED=${env('DATABASE_INDEX_REVIEWED', 'false')}`],
  ['backup-restore-reviewed', 'P0', 'Backup restore and data-loss drill reviewed', enabled('DATABASE_BACKUP_RESTORE_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `DATABASE_BACKUP_RESTORE_REVIEWED=${env('DATABASE_BACKUP_RESTORE_REVIEWED', 'false')}`],
  ['pooling-review', 'P1', 'Connection pooling reviewed for Vercel/serverless', enabled('DATABASE_POOLING_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `DATABASE_POOLING_REVIEWED=${env('DATABASE_POOLING_REVIEWED', 'false')}`],
  ['rls-policy-review', 'P1', 'Supabase RLS/storage policy review completed', enabled('DATABASE_RLS_POLICY_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED', `DATABASE_RLS_POLICY_REVIEWED=${env('DATABASE_RLS_POLICY_REVIEWED', 'false')}`]
]

const runbook = [
  ['Run npm run database:integrity-readiness and save JSON/CSV evidence.', 'Developer/Admin', 'artifacts/database-integrity files'],
  ['Run prisma validate/generate locally and in Vercel build logs with real env variables.', 'Developer', 'Terminal/build log screenshots'],
  ['Test db push/migration and seed re-run on staging before production.', 'Developer/Ops', 'Staging migration + duplicate-count proof'],
  ['Review index/query behavior for dashboard, search, complaints, payments and admin lists.', 'Developer/Ops', 'Query/index checklist or Supabase performance screenshot'],
  ['Run backup restore drill and verify critical tables are recoverable.', 'Ops/Admin', 'Restore drill notes and sample recovered row IDs'],
  ['Review RLS/storage policies for vault/private user data before public traffic.', 'Security/Ops', 'Policy screenshot and upload/download proof']
]

const ready = controls.filter((control) => control[3] === 'PASS' || control[3] === 'READY_TO_TEST').length
const manualRequired = controls.filter((control) => control[3] === 'MANUAL_REQUIRED').length
const blocked = controls.filter((control) => control[3] === 'BLOCKED').length

const report = {
  generatedAt: new Date().toISOString(),
  version: '3.0.46-database-integrity-readiness',
  summary: {
    totalControls: controls.length,
    ready,
    manualRequired,
    blocked,
    datasets: datasets.length,
    p0Datasets: datasets.filter((row) => row[1] === 'P0').length
  },
  controls: controls.map(([id, priority, label, status, envValue]) => ({ id, priority, label, status, envValue })),
  datasets: datasets.map(([id, priority, label, models, checks]) => ({ id, priority, label, models, checks })),
  runbook: runbook.map(([step, owner, evidence]) => ({ step, owner, evidence })),
  nextAction: blocked ? 'Fix blocked database configuration before deploy review.' : manualRequired ? 'Complete schema, migration, seed, backup, pooling and RLS review evidence before public launch.' : 'Database integrity readiness gates are complete for launch review.'
}

const csv = (rows) => rows.map((row) => row.map((value) => String(value).replaceAll(',', ';')).join(',')).join('\n')
writeFileSync(join(outputDir, 'database-integrity-readiness.json'), JSON.stringify(report, null, 2))
writeFileSync(join(outputDir, 'database-integrity-controls.csv'), csv([['id', 'priority', 'label', 'status', 'env_value'], ...controls]))
writeFileSync(join(outputDir, 'database-integrity-datasets.csv'), csv([['id', 'priority', 'label', 'models', 'checks'], ...datasets]))
writeFileSync(join(outputDir, 'database-integrity-runbook.csv'), csv([['step', 'owner', 'evidence_required'], ...runbook]))

console.log(`✅ Database integrity readiness evidence written to ${outputDir}`)
console.log(`Ready: ${ready} · Manual: ${manualRequired} · Blocked: ${blocked} · Datasets: ${datasets.length}`)
