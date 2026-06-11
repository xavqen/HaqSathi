import { db } from '@/lib/db'

export type BackupReadinessStatus = 'READY' | 'ACTION_NEEDED' | 'MANUAL_REQUIRED'

export type BackupReadinessItem = {
  area: string
  status: BackupReadinessStatus
  check: string
  result: string
  nextAction: string
}

function hasConfiguredEnv(name: string) {
  const value = process.env[name]
  return Boolean(value && !/change-this|PROJECT_REF|YOUR-PASSWORD|haqsathi\.local|example/i.test(value))
}

function envStatus(name: string, nextAction: string): BackupReadinessItem {
  const ready = hasConfiguredEnv(name)
  return {
    area: 'Environment',
    status: ready ? 'READY' : 'ACTION_NEEDED',
    check: `${name} configured`,
    result: ready ? 'Configured' : 'Missing or placeholder value',
    nextAction: ready ? 'Keep this value stored securely in your password manager.' : nextAction
  }
}

async function safeCount(label: string, read: () => Promise<number>) {
  try {
    return { label, count: await read(), ok: true }
  } catch (error) {
    return { label, count: 0, ok: false, error: error instanceof Error ? error.message : 'Unknown database error' }
  }
}

export async function collectBackupReadiness() {
  const generatedAt = new Date().toISOString()
  const retentionDays = Number(process.env.BACKUP_RETENTION_DAYS || 30)
  const checks: BackupReadinessItem[] = [
    envStatus('DATABASE_URL', 'Set Supabase pooled DATABASE_URL before production launch.'),
    envStatus('DIRECT_URL', 'Set Supabase direct DIRECT_URL for migrations and restore drills.'),
    envStatus('ADMIN_BACKUP_SECRET', 'Set a strong ADMIN_BACKUP_SECRET for backup export protection.'),
    envStatus('CRON_SECRET', 'Set CRON_SECRET so Vercel Cron can safely run backup readiness checks.'),
    envStatus('SUPABASE_SERVICE_ROLE_KEY', 'Set service role key only on server-side env for private storage restore checks.'),
    envStatus('SUPABASE_STORAGE_BUCKET', 'Create and configure a private Supabase storage bucket.'),
    {
      area: 'Policy',
      status: retentionDays >= 30 ? 'READY' : 'ACTION_NEEDED',
      check: 'Backup retention window',
      result: `${retentionDays} days`,
      nextAction: retentionDays >= 30 ? 'Keep at least monthly restore evidence.' : 'Set BACKUP_RETENTION_DAYS to 30 or more.'
    },
    {
      area: 'Restore drill',
      status: hasConfiguredEnv('BACKUP_RESTORE_TEST_OWNER') ? 'READY' : 'MANUAL_REQUIRED',
      check: 'Restore test owner assigned',
      result: hasConfiguredEnv('BACKUP_RESTORE_TEST_OWNER') ? process.env.BACKUP_RESTORE_TEST_OWNER as string : 'Not assigned',
      nextAction: hasConfiguredEnv('BACKUP_RESTORE_TEST_OWNER') ? 'Run a monthly restore drill and save evidence.' : 'Assign one person responsible for monthly restore testing.'
    }
  ]

  const counts = await Promise.all([
    safeCount('users', () => db.user.count()),
    safeCount('complaints', () => db.complaint.count()),
    safeCount('schemes', () => db.scheme.count()),
    safeCount('officialResources', () => db.officialResource.count()),
    safeCount('documentVaultItems', () => db.documentVaultItem.count()),
    safeCount('supportTickets', () => db.supportTicket.count()),
    safeCount('paymentOrders', () => db.paymentOrder.count()),
    safeCount('emailLogs', () => db.emailLog.count()),
    safeCount('activityEvents', () => db.userActivity.count()),
    safeCount('incidents', () => db.incidentReport.count())
  ])

  const databaseOk = counts.every((item) => item.ok)
  checks.push({
    area: 'Database',
    status: databaseOk ? 'READY' : 'ACTION_NEEDED',
    check: 'Core model count query',
    result: databaseOk ? 'All core tables responded' : 'One or more core tables failed to respond',
    nextAction: databaseOk ? 'Save this JSON as backup readiness evidence.' : 'Run npm run db:generate, npm run prisma:validate and npm run db:push, then retry.'
  })

  const ready = checks.filter((item) => item.status === 'READY').length
  const actionNeeded = checks.filter((item) => item.status === 'ACTION_NEEDED').length
  const manualRequired = checks.filter((item) => item.status === 'MANUAL_REQUIRED').length

  return {
    ok: actionNeeded === 0,
    generatedAt,
    version: process.env.NEXT_PUBLIC_APP_VERSION || 'local',
    retentionDays,
    summary: {
      totalChecks: checks.length,
      ready,
      actionNeeded,
      manualRequired,
      databaseOk
    },
    counts,
    checks,
    backupExportEndpoint: '/api/admin/export/full?secret=ADMIN_BACKUP_SECRET',
    cronEndpoint: '/api/cron/backup-readiness',
    restoreDrillMinimumEvidence: [
      'Fresh backup JSON downloaded successfully.',
      'Supabase database restore or staging import completed.',
      'Storage bucket and private access tested.',
      'Login, complaint list, document vault and admin dashboard opened on restored/staging environment.',
      'Evidence screenshot/JSON saved under artifacts/backup-readiness.'
    ]
  }
}
