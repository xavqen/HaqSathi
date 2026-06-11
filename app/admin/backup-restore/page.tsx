import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CopyButton } from '@/components/ui/copy-button'
import { Badge } from '@/components/ui/badge'

const backupChecklist = `1. Enable/check Supabase database backups.
2. Keep documents bucket private and verify storage policy.
3. Set ADMIN_BACKUP_SECRET, CRON_SECRET, BACKUP_RETENTION_DAYS and BACKUP_RESTORE_TEST_OWNER.
4. Run npm run backups:readiness and save JSON/CSV evidence.
5. Download /api/admin/export/full?secret=ADMIN_BACKUP_SECRET from admin account.
6. Save Vercel env list securely in password manager.
7. Schedule /api/cron/backup-readiness through Vercel Cron or uptime monitor.`

const restoreChecklist = `1. Create staging or temporary Supabase project.
2. Restore database backup or import app-level JSON where needed.
3. Update DATABASE_URL and DIRECT_URL for the restore environment.
4. Run npm run db:generate, npm run prisma:validate, npm run db:push.
5. Recreate private storage bucket: documents.
6. Upload/restore sample files and confirm owner-only access.
7. Open restored site and verify login, dashboard, complaints, document vault, admin backups.
8. Save screenshots, terminal output and readiness JSON under artifacts/backup-readiness.`

const monthlyDrill = `Monthly Restore drill evidence:
- Date and reviewer name
- Backup source used
- Restore environment URL/project name
- Database restore result
- Storage restore result
- Login/dashboard check result
- Complaint/document-vault sample check result
- Final PASS/FAIL notes`

export default function Page() {
  return (
    <div className="grid gap-6">
      <div>
        <Badge>Recovery runbook</Badge>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950">Backup & Restore Runbook</h1>
        <p className="mt-2 max-w-3xl text-slate-600">Production data loss avoid karne ke liye backup sirf download nahi, restore test bhi zaroori hai. A backup is trusted only after restore is tested.</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Backup checklist</CardTitle></CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap rounded-2xl bg-slate-50 p-4 text-sm leading-7 text-slate-700">{backupChecklist}</pre>
            <div className="mt-4"><CopyButton text={backupChecklist} label="Copy backup checklist" /></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Restore checklist</CardTitle></CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap rounded-2xl bg-slate-50 p-4 text-sm leading-7 text-slate-700">{restoreChecklist}</pre>
            <div className="mt-4"><CopyButton text={restoreChecklist} label="Copy restore checklist" /></div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Monthly Restore drill</CardTitle></CardHeader>
        <CardContent>
          <pre className="whitespace-pre-wrap rounded-2xl bg-slate-950 p-4 text-sm leading-7 text-white">{monthlyDrill}</pre>
          <div className="mt-4"><CopyButton text={monthlyDrill} label="Copy restore drill template" /></div>
        </CardContent>
      </Card>
    </div>
  )
}
