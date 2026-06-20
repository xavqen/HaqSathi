export type IncidentRollbackItem = {
  id: string
  title: string
  owner: string
  severity: 'launch-blocker' | 'high' | 'medium'
  command: string
  evidence: string
  action: string
}

export const incidentRollbackChecklist: IncidentRollbackItem[] = [
  {
    id: 'rollback-drill',
    title: 'Rollback drill evidence',
    owner: 'Launch owner',
    severity: 'launch-blocker',
    command: 'npm run launch:rollback-drill',
    evidence: 'artifacts/live-launch-qa/rollback-drill.json and CSV with rollback owner, incident owner, backup confirmation and last-good deployment URL.',
    action: 'Do this before public launch so a bad deploy can be reverted without panic.'
  },
  {
    id: 'last-good-deploy',
    title: 'Last known-good deployment recorded',
    owner: 'Deployment owner',
    severity: 'launch-blocker',
    command: 'Set LAUNCH_LAST_GOOD_DEPLOYMENT_URL="https://...vercel.app"',
    evidence: 'Previous stable Vercel deployment URL is saved and does not expose tokens or preview-only secrets.',
    action: 'Use this target if final production deployment shows severe auth/payment/AI/storage failures.'
  },
  {
    id: 'backup-restore-point',
    title: 'Database backup confirmed',
    owner: 'Backend owner',
    severity: 'launch-blocker',
    command: 'Set LAUNCH_BACKUP_CONFIRMED=true only after backup proof exists',
    evidence: 'Masked Supabase/Postgres backup screenshot or restore-point note saved with launch artifacts.',
    action: 'Do not run marketing launch before a fresh restore point exists.'
  },
  {
    id: 'maintenance-comms',
    title: 'Maintenance communication ready',
    owner: 'Support owner',
    severity: 'high',
    command: 'Set LAUNCH_MAINTENANCE_NOTICE_READY=true after message is prepared',
    evidence: 'Short user-facing notice is prepared for status page, WhatsApp/social post, support replies and footer banner if needed.',
    action: 'Use it if checkout, login, AI or document vault is degraded.'
  }
]

export function getIncidentRollbackChecklist() {
  return incidentRollbackChecklist
}
