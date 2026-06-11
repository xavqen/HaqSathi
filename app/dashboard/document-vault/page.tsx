import { db } from '@/lib/db'
import { requireUser } from '@/lib/auth/session'
import { DocumentDownloadButton, DocumentVaultForm } from '@/components/forms/document-vault-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ShieldCheck } from 'lucide-react'

export const dynamic = 'force-dynamic'
export default async function Page() {
  const user = await requireUser()
  const items = await db.documentVaultItem.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' } })
  return (
    <div>
      <h1 className="text-3xl font-black">Document Vault</h1>
      <p className="mt-2 text-slate-600">Private Supabase Storage upload + 5 minute signed download links.</p>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">Keep the production bucket private. Never expose SUPABASE_SERVICE_ROLE_KEY in the browser.</div>
        <div className="flex gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
          <span>Upload safety scan checks extension, MIME, file signature and risky script/PDF markers before storage.</span>
        </div>
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[380px_minmax(0,1fr)]">
        <Card><CardHeader><CardTitle>Upload Document</CardTitle></CardHeader><CardContent><DocumentVaultForm /></CardContent></Card>
        <Card>
          <CardHeader><CardTitle>Saved Documents</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {items.length ? items.map(i => <div key={i.id} className="rounded-xl border p-4"><b>{i.title}</b><p className="text-sm text-slate-600">{i.docType}{i.expiryDate ? ` · renew by ${i.expiryDate.toDateString()}` : ''}</p>{i.notes && <p className="mt-2 text-sm">{i.notes}</p>}{i.storagePath ? <DocumentDownloadButton itemId={i.id} /> : <p className="mt-2 text-xs text-slate-500">Metadata only — no file uploaded.</p>}</div>) : <p className="text-slate-500">No documents saved yet.</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
