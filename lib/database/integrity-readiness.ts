export type DatabaseIntegrityStatus = 'PASS' | 'READY_TO_TEST' | 'MANUAL_REQUIRED' | 'BLOCKED'
export type DatabaseIntegrityPriority = 'P0' | 'P1' | 'P2'

export type DatabaseIntegrityControl = {
  id: string
  label: string
  status: DatabaseIntegrityStatus
  priority: DatabaseIntegrityPriority
  envValue: string
  passCondition: string
  evidenceRequired: string
  riskIfSkipped: string
}

export type DatabaseIntegrityDataset = {
  id: string
  label: string
  priority: DatabaseIntegrityPriority
  models: string[]
  integrityChecks: string[]
  launchRisk: string
}

export type DatabaseIntegrityRunbookStep = {
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

function validMode(name: string, fallback = 'dry_run') {
  return ['dry_run', 'manual_review', 'enforced'].includes(env(name, fallback))
}

function control(
  id: string,
  label: string,
  status: DatabaseIntegrityStatus,
  priority: DatabaseIntegrityPriority,
  envValue: string,
  passCondition: string,
  evidenceRequired: string,
  riskIfSkipped: string
): DatabaseIntegrityControl {
  return { id, label, status, priority, envValue, passCondition, evidenceRequired, riskIfSkipped }
}

const datasets: DatabaseIntegrityDataset[] = [
  {
    id: 'identity-auth',
    label: 'Identity, auth, sessions and account security',
    priority: 'P0',
    models: ['User', 'AuthSession', 'PasswordResetToken', 'EmailVerificationToken', 'PrivacyConsent'],
    integrityChecks: ['Unique email/googleId', 'session expiry reviewed', 'verification token expiry reviewed', 'privacy consent linked to user'],
    launchRisk: 'Broken auth/session data can lock users out, weaken security or corrupt privacy consent history.'
  },
  {
    id: 'case-workflows',
    label: 'Complaints, cases, reminders and evidence workflows',
    priority: 'P0',
    models: ['Complaint', 'CaseTimelineEvent', 'CaseTask', 'Reminder', 'EvidencePack', 'DocumentVaultItem'],
    integrityChecks: ['User ownership checked', 'status enum transitions reviewed', 'orphan evidence prevented', 'signed URL data never stored in logs'],
    launchRisk: 'Users may lose complaint drafts, evidence packs or reminders during real support/consumer dispute workflows.'
  },
  {
    id: 'payments-subscriptions',
    label: 'Payments, subscriptions and invoices',
    priority: 'P0',
    models: ['PaymentOrder', 'Subscription', 'AgentInvoice', 'EmailLog', 'UserActivity'],
    integrityChecks: ['Order IDs unique', 'webhook idempotency reviewed', 'paid status requires signature proof', 'invoice email linked to payment event'],
    launchRisk: 'Wrong plan upgrades, duplicate credits, refund confusion or unverifiable payment disputes can happen.'
  },
  {
    id: 'official-content',
    label: 'Official sources, authorities, schemes and SEO content',
    priority: 'P1',
    models: ['Scheme', 'OfficialResource', 'OfficialSource', 'AuthorityDirectoryEntry', 'OfficialLinkCheck', 'SeoPage'],
    integrityChecks: ['Official URL allowlist reviewed', 'last-verified date tracked', 'duplicate official links avoided', 'content owner/reviewer available'],
    launchRisk: 'Outdated official data can mislead users and hurt trust, SEO, and compliance.'
  },
  {
    id: 'safety-operations',
    label: 'Safety, support, incidents and abuse operations',
    priority: 'P1',
    models: ['SupportTicket', 'IncidentReport', 'ModerationQueueItem', 'AiOutputReview', 'RiskAssessment', 'Audit log evidence'],
    integrityChecks: ['PII redaction reviewed', 'priority/SLA fields reviewed', 'incident owner linked', 'AI review status traceable'],
    launchRisk: 'Support escalations, fraud flags or unsafe AI outputs may not be explainable after launch.'
  },
  {
    id: 'growth-analytics',
    label: 'Analytics, referrals, newsletter and growth records',
    priority: 'P2',
    models: ['ReferralInvite', 'LaunchMetricSnapshot', 'PartnerLead', 'Feedback', 'Newsletter subscription events'],
    integrityChecks: ['Consent checked', 'email masking reviewed', 'invite dedupe reviewed', 'analytics events avoid raw PII'],
    launchRisk: 'Growth features can create duplicate/referral abuse or privacy problems if IDs and consent are not consistent.'
  }
]

const controls: DatabaseIntegrityControl[] = [
  control(
    'owner-assigned',
    'Database integrity owner assigned',
    configured('DATABASE_INTEGRITY_OWNER') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED',
    'P0',
    `DATABASE_INTEGRITY_OWNER=${env('DATABASE_INTEGRITY_OWNER') || 'empty'}`,
    'A named owner reviews schema, migrations, seeds, backup restore evidence and production database access before launch.',
    'Owner name in env/evidence notes and /admin/database-integrity screenshot.',
    'Schema or data bugs can block launch without a clear accountable owner.'
  ),
  control(
    'database-url-configured',
    'Production DATABASE_URL configured safely',
    configured('DATABASE_URL') ? 'READY_TO_TEST' : 'BLOCKED',
    'P0',
    `DATABASE_URL=${configured('DATABASE_URL') ? 'set' : 'missing_or_placeholder'}`,
    'DATABASE_URL points to real Supabase/Postgres pooler and is not a placeholder/localhost URL.',
    'Environment screenshot from Vercel/Supabase with secrets masked.',
    'The app cannot run reliably in production or may accidentally use local/test data.'
  ),
  control(
    'direct-url-configured',
    'DIRECT_URL configured for Prisma migrations',
    configured('DIRECT_URL') ? 'READY_TO_TEST' : 'BLOCKED',
    'P0',
    `DIRECT_URL=${configured('DIRECT_URL') ? 'set' : 'missing_or_placeholder'}`,
    'DIRECT_URL points to the direct database connection used for Prisma db push/migration workflows.',
    'Prisma validate/db push evidence with secret values hidden.',
    'Prisma migrations/generate workflows may fail or target the wrong database.'
  ),
  control(
    'mode-safe',
    'Database integrity mode is safe',
    validMode('DATABASE_INTEGRITY_MODE') ? 'READY_TO_TEST' : 'BLOCKED',
    'P0',
    `DATABASE_INTEGRITY_MODE=${env('DATABASE_INTEGRITY_MODE', 'dry_run')}`,
    'Launch uses dry_run/manual_review/enforced intentionally and does not run destructive repair operations silently.',
    'Readiness report showing mode and reviewer note.',
    'An automated fix could modify production records without review.'
  ),
  control(
    'schema-validated',
    'Prisma schema validation reviewed',
    enabled('DATABASE_SCHEMA_VALIDATE_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED',
    'P0',
    `DATABASE_SCHEMA_VALIDATE_REVIEWED=${env('DATABASE_SCHEMA_VALIDATE_REVIEWED', 'false')}`,
    'npm run prisma:validate and npm run db:generate succeed with the target Prisma version and production env shape.',
    'Terminal evidence for prisma validate/generate and package-lock Prisma version.',
    'Typecheck/build can break after deploy due to Prisma client/schema mismatch.'
  ),
  control(
    'migration-reviewed',
    'Migration/db push path reviewed',
    enabled('DATABASE_MIGRATION_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED',
    'P0',
    `DATABASE_MIGRATION_REVIEWED=${env('DATABASE_MIGRATION_REVIEWED', 'false')}`,
    'Database schema update command is reviewed on staging before production and has rollback/backup evidence.',
    'Staging db push/migration screenshot and backup timestamp before production change.',
    'A schema change can delete, rename or corrupt live production data.'
  ),
  control(
    'seed-idempotency-reviewed',
    'Seed idempotency reviewed',
    enabled('DATABASE_SEED_IDEMPOTENCY_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED',
    'P1',
    `DATABASE_SEED_IDEMPOTENCY_REVIEWED=${env('DATABASE_SEED_IDEMPOTENCY_REVIEWED', 'false')}`,
    'npm run db:seed can be re-run without duplicate schemes, official resources, templates, admin data or feature flags.',
    'Seed re-run evidence on local/staging and duplicate-count check.',
    'Duplicate official resources, templates or flags can make admin pages noisy and user search unreliable.'
  ),
  control(
    'index-review',
    'Index and slow-query review completed',
    enabled('DATABASE_INDEX_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED',
    'P1',
    `DATABASE_INDEX_REVIEWED=${env('DATABASE_INDEX_REVIEWED', 'false')}`,
    'High-traffic routes such as search, dashboard, complaints, payments, link checks and admin lists have query/index review evidence.',
    'Query list, EXPLAIN/analyze or Supabase performance screenshot.',
    'Production pages can become slow on mobile and Vercel functions can time out as data grows.'
  ),
  control(
    'backup-restore-reviewed',
    'Backup restore and data-loss drill reviewed',
    enabled('DATABASE_BACKUP_RESTORE_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED',
    'P0',
    `DATABASE_BACKUP_RESTORE_REVIEWED=${env('DATABASE_BACKUP_RESTORE_REVIEWED', 'false')}`,
    'A restore drill proves that critical auth, complaints, payments, vault metadata and audit evidence can be recovered.',
    'Restore drill notes, backup timestamp and sample recovered row checklist.',
    'A production database incident can permanently lose user complaints, payments or privacy/audit evidence.'
  ),
  control(
    'pooling-review',
    'Connection pooling reviewed for Vercel/serverless',
    enabled('DATABASE_POOLING_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED',
    'P1',
    `DATABASE_POOLING_REVIEWED=${env('DATABASE_POOLING_REVIEWED', 'false')}`,
    'DATABASE_URL uses pooler/serverless-safe connection settings and Prisma client creation avoids connection storms.',
    'Vercel env screenshot, Supabase pooler setting and load/smoke evidence.',
    'Serverless traffic can exhaust Postgres connections and cause random 500 errors.'
  ),
  control(
    'rls-policy-review',
    'Supabase RLS/storage policy review completed',
    enabled('DATABASE_RLS_POLICY_REVIEWED') ? 'PASS' : 'MANUAL_REQUIRED',
    'P1',
    `DATABASE_RLS_POLICY_REVIEWED=${env('DATABASE_RLS_POLICY_REVIEWED', 'false')}`,
    'Database/storage policies are reviewed for user-owned documents, private files and admin-only tables.',
    'RLS/storage policy screenshots and signed upload/download tests.',
    'Users or attackers may access files/records that should be private.'
  )
]

const runbook: DatabaseIntegrityRunbookStep[] = [
  { step: 'Run npm run database:integrity-readiness and save JSON/CSV evidence.', owner: 'Developer/Admin', evidence: 'artifacts/database-integrity files' },
  { step: 'Run prisma validate/generate locally and in Vercel build logs with real env variables.', owner: 'Developer', evidence: 'Terminal/build log screenshots' },
  { step: 'Test db push/migration and seed re-run on staging before production.', owner: 'Developer/Ops', evidence: 'Staging migration + duplicate-count proof' },
  { step: 'Review index/query behavior for dashboard, search, complaints, payments and admin lists.', owner: 'Developer/Ops', evidence: 'Query/index checklist or Supabase performance screenshot' },
  { step: 'Run backup restore drill and verify critical tables are recoverable.', owner: 'Ops/Admin', evidence: 'Restore drill notes and sample recovered row IDs' },
  { step: 'Review RLS/storage policies for vault/private user data before public traffic.', owner: 'Security/Ops', evidence: 'Policy screenshot and upload/download proof' }
]

export function getDatabaseIntegrityReadinessReport() {
  const ready = controls.filter((control) => control.status === 'PASS' || control.status === 'READY_TO_TEST').length
  const manualRequired = controls.filter((control) => control.status === 'MANUAL_REQUIRED').length
  const blocked = controls.filter((control) => control.status === 'BLOCKED').length
  const p0Controls = controls.filter((control) => control.priority === 'P0')

  return {
    generatedAt: new Date().toISOString(),
    version: '3.0.46-database-integrity-readiness',
    summary: {
      totalControls: controls.length,
      ready,
      manualRequired,
      blocked,
      p0Controls: p0Controls.length,
      datasets: datasets.length,
      p0Datasets: datasets.filter((dataset) => dataset.priority === 'P0').length
    },
    controls,
    datasets,
    runbook,
    nextAction: blocked
      ? 'Fix DATABASE_URL/DIRECT_URL or blocked database configuration before deploy review.'
      : manualRequired
        ? 'Complete schema, migration, seed, backup, pooling and RLS review evidence before public launch.'
        : 'Database integrity readiness gates are complete for launch review.'
  }
}
