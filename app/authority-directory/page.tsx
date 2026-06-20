import { db } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AuthorityBookmarkButton } from '@/components/forms/authority-bookmark-button'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Authority Directory', description: 'Consumer, bank, cyber, scheme aur document related verified authority/resource directory.' }

export default async function Page({ searchParams }: { searchParams?: Promise<{ category?: string; state?: string }> }) {
  const params = await searchParams
  const where = { ...(params?.category ? { category: params.category } : {}), ...(params?.state ? { state: params.state } : {}) }
  const entries = await db.authorityDirectoryEntry.findMany({ where, orderBy: [{ verified: 'desc' }, { category: 'asc' }, { name: 'asc' }], take: 100 }).catch(() => [])
  return <main className="bg-slate-50"><section className="mx-auto max-w-7xl px-4 py-12"><p className="text-sm font-bold uppercase tracking-wider text-primary">Official help map</p><h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950">Authority Directory</h1><p className="mt-3 max-w-2xl text-slate-600">Complaint, bank, cyber aur government work ke liye useful authority/resource entries. Links verify karke hi submit karein.</p><div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{entries.length ? entries.map((item) => <Card key={item.id}><CardHeader><div className="flex flex-wrap gap-2"><Badge>{item.category}</Badge>{item.state && <Badge>{item.state}</Badge>}{item.verified && <Badge>Verified</Badge>}</div><CardTitle>{item.name}</CardTitle></CardHeader><CardContent className="space-y-3 text-sm text-slate-700"><p>{item.description}</p>{item.email && <p><b>Email:</b> {item.email}</p>}{item.phone && <p><b>Phone:</b> {item.phone}</p>}{item.website && <p><b>Website:</b> <a className="text-primary underline" href={item.website} target="_blank">Open official page</a></p>}<AuthorityBookmarkButton authorityId={item.id} /></CardContent></Card>) : <Card><CardContent className="pt-6 text-slate-600">No directory entry found. Run db:seed after phase 13.</CardContent></Card>}</div></section></main>
}
