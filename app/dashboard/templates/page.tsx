import Link from 'next/link'
import { db } from '@/lib/db'
import { requireUser } from '@/lib/auth/session'
import { CopyButton } from '@/components/ui/copy-button'

export const dynamic = 'force-dynamic'
export default async function Page() {
  const user = await requireUser()
  const uses = await db.templateUse.findMany({ where: { userId: user.id }, include: { template: { select: { title: true, slug: true, category: true } } }, orderBy: { createdAt: 'desc' }, take: 50 }).catch(() => [])
  return <div><div className="flex flex-wrap items-start justify-between gap-3"><div><h1 className="text-3xl font-black">Template History</h1><p className="mt-2 text-slate-600">Aapke generated ready messages.</p></div><Link href="/templates" className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Use Template</Link></div><div className="mt-6 space-y-4">{uses.length === 0 ? <div className="rounded-2xl border bg-white p-6 text-slate-500">No template history yet.</div> : uses.map((use) => <div key={use.id} className="rounded-2xl border bg-white p-5 shadow-soft"><div className="flex flex-wrap items-start justify-between gap-3"><div><b>{use.template?.title || 'Deleted template'}</b><p className="text-sm text-slate-500">{use.template?.category || 'Template'} · {use.createdAt.toDateString()}</p></div><CopyButton text={use.output} /></div><pre className="mt-4 whitespace-pre-wrap rounded-xl bg-slate-50 p-4 text-sm text-slate-700">{use.output}</pre></div>)}</div></div>
}
