import { db } from '@/lib/db'

export type PrivacyOpsGateStatus = 'READY' | 'ACTION_NEEDED' | 'MANUAL_REVIEW'

export type PrivacyOpsChecklistItem = {
  area: string
  status: PrivacyOpsGateStatus
  owner: string
  action: string
  evidence: string
}

function readPositiveInt(name: string, fallback: number) {
  const raw = process.env[name]
  const parsed = raw ? Number(raw) : NaN
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback
}

function hasUsefulEnv(name: string) {
  const value = process.env[name]
  return Boolean(value && !/change-this|example|your-|^\s*$/i.test(value))
}

export const privacyOpsMinimumEvidence = [
  'User data export JSON download from /api/dashboard/export/data',
  'DataExport row created after export request',
  'DataDeletionRequest row created from Privacy Center',
  'Admin review screenshot from /admin/privacy-ops',
  'Consent events visible in Compliance Center',
  'Deletion decision note recorded outside production DB or in support ticket before irreversible action'
]

export function getPrivacyOpsChecklist(): PrivacyOpsChecklistItem[] {
  const exportSlaDays = readPositiveInt('PRIVACY_EXPORT_SLA_DAYS', 7)
  const deletionSlaDays = readPositiveInt('PRIVACY_DELETION_SLA_DAYS', 30)
  const hasOwner = hasUsefulEnv('PRIVACY_REVIEW_OWNER')
  const hasEvidenceDir = hasUsefulEnv('PRIVACY_EVIDENCE_DIR')
  const hasCron = hasUsefulEnv('CRON_SECRET')

  return [
    {
      area: 'Data export readiness',
      status: 'READY',
      owner: hasOwner ? process.env.PRIVACY_REVIEW_OWNER || 'Privacy owner' : 'Admin',
      action: `User can download JSON export; review export requests within ${exportSlaDays} day(s).`,
      evidence: 'Export JSON, DataExport count, admin screenshot.'
    },
    {
      area: 'Deletion request workflow',
      status: 'MANUAL_REVIEW',
      owner: hasOwner ? process.env.PRIVACY_REVIEW_OWNER || 'Privacy owner' : 'Admin',
      action: `Review pending deletion requests within ${deletionSlaDays} day(s); verify identity and legal/payment retention needs before deletion.`,
      evidence: 'DataDeletionRequest row, reviewer decision note, user notification proof.'
    },
    {
      area: 'Consent auditability',
      status: 'READY',
      owner: 'Admin',
      action: 'Keep append-only consent events and latest preference view in Privacy Center.',
      evidence: 'PrivacyConsent rows and /admin/compliance screenshot.'
    },
    {
      area: 'Privacy evidence storage',
      status: hasEvidenceDir ? 'READY' : 'ACTION_NEEDED',
      owner: 'Developer/Admin',
      action: 'Save local privacy operations evidence JSON/CSV before launch and after policy changes.',
      evidence: process.env.PRIVACY_EVIDENCE_DIR || './artifacts/privacy-ops'
    },
    {
      area: 'Protected cron monitor',
      status: hasCron ? 'READY' : 'ACTION_NEEDED',
      owner: 'Developer',
      action: 'Call /api/cron/privacy-ops with Authorization: Bearer CRON_SECRET from Vercel Cron or uptime monitor.',
      evidence: 'Cron response JSON and admin privacy-ops screenshot.'
    }
  ]
}

export async function collectPrivacyOperationsReadiness() {
  const now = new Date()
  const since30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const [
    users,
    consentEvents,
    recentExports,
    pendingDeletionRequests,
    inReviewDeletionRequests,
    completedDeletionRequests,
    latestDeletionRequests,
    latestExports
  ] = await Promise.all([
    db.user.count().catch(() => 0),
    db.privacyConsent.count().catch(() => 0),
    db.dataExport.count({ where: { createdAt: { gte: since30 } } }).catch(() => 0),
    db.dataDeletionRequest.count({ where: { status: 'REQUESTED' } }).catch(() => 0),
    db.dataDeletionRequest.count({ where: { status: 'IN_REVIEW' } }).catch(() => 0),
    db.dataDeletionRequest.count({ where: { status: { in: ['COMPLETED', 'DELETED', 'CLOSED'] } } }).catch(() => 0),
    db.dataDeletionRequest.findMany({
      orderBy: { createdAt: 'desc' },
      take: 8,
      include: { user: { select: { email: true, name: true } } }
    }).catch(() => []),
    db.dataExport.findMany({
      orderBy: { createdAt: 'desc' },
      take: 8,
      include: { user: { select: { email: true, name: true } } }
    }).catch(() => [])
  ])

  const checklist = getPrivacyOpsChecklist()
  const actionNeeded = checklist.filter((item) => item.status === 'ACTION_NEEDED').length

  return {
    ok: actionNeeded === 0,
    generatedAt: now.toISOString(),
    sla: {
      exportDays: readPositiveInt('PRIVACY_EXPORT_SLA_DAYS', 7),
      deletionDays: readPositiveInt('PRIVACY_DELETION_SLA_DAYS', 30)
    },
    counts: {
      users,
      consentEvents,
      recentExports,
      pendingDeletionRequests,
      inReviewDeletionRequests,
      completedDeletionRequests
    },
    checklist,
    minimumEvidence: privacyOpsMinimumEvidence,
    latestDeletionRequests: latestDeletionRequests.map((item) => ({
      id: item.id,
      status: item.status,
      reason: item.reason,
      user: item.user.name || item.user.email,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString()
    })),
    latestExports: latestExports.map((item) => ({
      id: item.id,
      type: item.type,
      status: item.status,
      fileName: item.fileName,
      user: item.user.name || item.user.email,
      createdAt: item.createdAt.toISOString()
    })),
    nextSteps: actionNeeded > 0
      ? ['Set privacy env values, run npm run privacy:readiness, then review /admin/privacy-ops.']
      : ['Run live export and deletion-request tests from a real user account before public launch.']
  }
}
