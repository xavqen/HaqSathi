import Link from 'next/link'
import { db } from '@/lib/db'
export const dynamic = 'force-dynamic'
export default async function Page(){ const items=await db.playbookArticle.findMany({orderBy:{createdAt:'desc'},take:100}).catch(()=>[]); return <div><h1 className="text-3xl font-black">Playbooks</h1><div className="mt-6 grid gap-3">{items.map(p=><Link key={p.id} href={`/knowledge-base/${p.slug}`} className="rounded-2xl border bg-white p-4"><b>{p.title}</b><p className="text-sm text-slate-600">{p.category} · {p.status}</p><p className="mt-2 text-sm">{p.summary}</p></Link>)}</div></div> }
