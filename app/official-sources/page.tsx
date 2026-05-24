import { db } from '@/lib/db'
import { officialSourceSeeds } from '@/lib/official-sources/seed-official-sources'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Verified Official Sources | HaqSathi AI', description: 'HaqSathi AI ke official source registry me consumer, cyber, banking aur government service portals.' }

export default async function OfficialSourcesPage(){
  const sources = await db.officialSource.findMany({ orderBy: [{ status: 'asc' }, { category: 'asc' }] }).catch(() => officialSourceSeeds as any[])
  return <main className="bg-slate-50"><section className="mx-auto max-w-7xl px-4 py-12"><p className="text-sm font-bold uppercase tracking-wider text-primary">Trust registry</p><h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950">Verified official sources</h1><p className="mt-3 max-w-2xl text-slate-600">Yahan links ko status ke saath track kiya jata hai. Final filing se pehle official portal par information verify zaroor karein.</p><div className="mt-8 grid gap-5 md:grid-cols-2">{sources.map((s:any)=><Card key={s.slug}><CardHeader><div className="flex flex-wrap items-center justify-between gap-2"><CardTitle>{s.title}</CardTitle><Badge>{s.status}</Badge></div></CardHeader><CardContent><p className="text-sm text-slate-600">{s.category} · {s.state} · {s.department || 'Official source'}</p><p className="mt-2 text-sm text-slate-700">{s.verificationNotes || 'Verification note pending.'}</p><a className="mt-4 inline-flex rounded-xl border px-4 py-2 text-sm font-semibold hover:bg-slate-100" href={s.url} target="_blank" rel="noreferrer">Open official source →</a></CardContent></Card>)}</div></section></main>
}
