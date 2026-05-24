import Link from 'next/link'
import { ArrowRight, Crown, FileText, FolderCheck, Landmark, ShieldAlert, Sparkles, UploadCloud } from 'lucide-react'
import { db } from '@/lib/db'
import { requireUser } from '@/lib/auth/session'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { planDisplayName } from '@/lib/billing/plan-labels'

export const dynamic = 'force-dynamic'
async function getStats(userId: string) {
  try {
    const [complaints, schemes, checklists, reminders, chats, family, clients, vault, templateUses, legalTools, evidencePacks, casePackages] = await Promise.all([
      db.complaint.count({ where: { userId } }),
      db.schemeSearch.count({ where: { userId } }),
      db.documentChecklist.count({ where: { userId } }),
      db.reminder.count({ where: { userId } }),
      db.chatSession.count({ where: { userId } }),
      db.familyProfile.count({ where: { userId } }),
      db.agentClient.count({ where: { userId } }),
      db.documentVaultItem.count({ where: { userId } }),
      db.templateUse.count({ where: { userId } }),
      db.legalToolResult.count({ where: { userId } }),
      db.evidencePack.count({ where: { userId } }),
      db.casePackage.count({ where: { userId } })
    ])
    const recent = await db.complaint.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 5, select: { id: true, type: true, companyName: true, createdAt: true, status: true } })
    return { complaints, schemes, checklists, reminders, chats, family, clients, vault, templateUses, legalTools, evidencePacks, casePackages, recent }
  } catch { return { complaints: 0, schemes: 0, checklists: 0, reminders: 0, chats: 0, family: 0, clients: 0, vault: 0, templateUses: 0, legalTools: 0, evidencePacks: 0, casePackages: 0, recent: [] as { id:string; type:string; companyName:string; createdAt:Date; status:string }[] } }
}

const quickActions = [
  { title: 'New complaint', desc: 'Refund, bank, delivery scam draft banao', href: '/complaint', icon: FileText },
  { title: 'UPI emergency', desc: 'Fraud/wrong transfer urgent steps', href: '/upi-help', icon: ShieldAlert },
  { title: 'Find schemes', desc: 'State-wise scheme suggestions', href: '/scheme-finder', icon: Landmark },
  { title: 'Upload documents', desc: 'Private vault me proof save karo', href: '/dashboard/document-vault', icon: UploadCloud },
  { title: 'Evidence pack', desc: 'Case proofs ko organized package banao', href: '/dashboard/evidence-packs', icon: FolderCheck },
  { title: 'AI assistant', desc: 'Hinglish me quick help lo', href: '/chat', icon: Sparkles }
]

export default async function DashboardPage() {
  const user = await requireUser()
  const stats = await getStats(user.id)
  return (
    <div>
      <div className="overflow-hidden rounded-3xl border bg-gradient-to-r from-slate-950 via-emerald-950 to-slate-900 p-6 text-white shadow-soft">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Badge className="bg-white/10 text-white">{planDisplayName(user.plan)}</Badge>
            <h1 className="mt-3 text-4xl font-black">Welcome {user.name || user.email.split('@')[0]}</h1>
            <p className="mt-2 max-w-2xl text-emerald-50">Aapka all-in-one haq command center: complaints, reminders, evidence, documents, schemes aur follow-up tracking.</p>
          </div>
          <Link href={user.plan === 'FREE' ? '/pricing' : '/dashboard/billing'} className="rounded-2xl bg-white px-5 py-3 text-sm font-bold text-slate-950">
            <Crown className="mr-2 inline h-4 w-4" />{user.plan === 'FREE' ? 'Upgrade to Premium' : 'Manage Plan'}
          </Link>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        {quickActions.map((action) => <Link href={action.href} key={action.href} className="rounded-3xl border bg-white p-4 shadow-soft transition hover:-translate-y-1 hover:shadow-lg"><action.icon className="h-7 w-7 text-emerald-700" /><h2 className="mt-3 font-black text-slate-950">{action.title}</h2><p className="mt-1 text-xs leading-5 text-slate-600">{action.desc}</p><span className="mt-3 inline-flex items-center text-sm font-bold text-emerald-700">Open <ArrowRight className="ml-1 h-4 w-4" /></span></Link>)}
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-4">{[['Complaints', stats.complaints], ['Scheme searches', stats.schemes], ['Checklists', stats.checklists], ['Reminders', stats.reminders], ['Chats', stats.chats], ['Family', stats.family], ['Agent clients', stats.clients], ['Vault docs', stats.vault], ['Templates used', stats.templateUses], ['Legal tools', stats.legalTools], ['Evidence packs', stats.evidencePacks], ['Case packages', stats.casePackages]].map(([k,v]) => <Card key={k} className="rounded-3xl"><CardHeader><CardTitle className="text-base">{k}</CardTitle></CardHeader><CardContent><div className="text-3xl font-black">{v}</div></CardContent></Card>)}</div>
      <Card className="mt-8 rounded-3xl"><CardHeader><CardTitle>Recent complaints</CardTitle><CardDescription>Latest saved complaint cases.</CardDescription></CardHeader><CardContent>{stats.recent.length === 0 ? <p className="text-slate-500">No complaints yet.</p> : <div className="space-y-3">{stats.recent.map(c => <div className="rounded-2xl border p-4" key={c.id}><b>{c.type}</b><p className="text-sm text-slate-600">{c.companyName} · {c.status} · {c.createdAt.toDateString()}</p></div>)}</div>}</CardContent></Card>
    </div>
  )
}
