import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CopyButton } from '@/components/ui/copy-button'

const backupChecklist = `1. Supabase dashboard se database backup enable/check karo
2. Storage bucket documents private rakho
3. Vercel env vars export/screenshot secure location me save karo
4. npm run db:doctor run karke connection verify karo
5. Dashboard Export aur Admin Backups page se JSON exports download karo`

const restoreChecklist = `1. New Supabase project create karo
2. DATABASE_URL/DIRECT_URL update karo
3. npm run db:generate
4. npm run db:push
5. npm run db:seed
6. Storage bucket recreate karo: documents
7. Vercel env vars update karke redeploy karo`

export default function Page() {
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-3xl font-black">Backup & Restore Runbook</h1>
        <p className="mt-2 text-slate-600">Production data loss avoid karne ke liye simple recovery steps.</p>
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <Card><CardHeader><CardTitle>Backup checklist</CardTitle></CardHeader><CardContent><pre className="whitespace-pre-wrap rounded-2xl bg-slate-50 p-4 text-sm">{backupChecklist}</pre><div className="mt-4"><CopyButton text={backupChecklist} label="Copy backup checklist" /></div></CardContent></Card>
        <Card><CardHeader><CardTitle>Restore checklist</CardTitle></CardHeader><CardContent><pre className="whitespace-pre-wrap rounded-2xl bg-slate-50 p-4 text-sm">{restoreChecklist}</pre><div className="mt-4"><CopyButton text={restoreChecklist} label="Copy restore checklist" /></div></CardContent></Card>
      </div>
    </div>
  )
}
