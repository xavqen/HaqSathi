import Link from 'next/link'
import { db } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const dynamic = 'force-dynamic'
export default async function Page() {
  const schemes = await db.scheme.findMany({ orderBy: { updatedAt: 'desc' }, take: 100 })
  return <div><div className="flex items-center justify-between gap-4"><div><h1 className="text-3xl font-black">Schemes</h1><p className="mt-2 text-slate-600">Verified scheme database for future official links.</p></div><Link href="/admin/schemes/new" className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground">Add scheme</Link></div><Card className="mt-6"><CardHeader><CardTitle>Scheme database</CardTitle></CardHeader><CardContent className="space-y-3">{schemes.length ? schemes.map(s => <div key={s.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4"><div><b>{s.title}</b><p className="text-sm text-slate-600">{s.state} · {s.purpose} · /scheme/{s.state.toLowerCase().replaceAll(' ', '-')}/{s.slug}</p></div><Link href={`/admin/schemes/${s.id}/edit`} className="text-sm font-semibold text-emerald-700">Edit</Link></div>) : <p className="text-slate-500">No schemes yet.</p>}</CardContent></Card></div>
}
