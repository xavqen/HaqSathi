import { db } from '@/lib/db'
export const dynamic = 'force-dynamic'
export default async function Page(){ const leads=await db.partnerLead.findMany({orderBy:{createdAt:'desc'},take:100}).catch(()=>[]); return <div><h1 className="text-3xl font-black">Partner leads</h1><div className="mt-6 grid gap-3">{leads.map(l=><div key={l.id} className="rounded-2xl border bg-white p-4"><b>{l.name}</b><p className="text-sm text-slate-600">{l.phone} · {l.city}, {l.state} · {l.role} · {l.status}</p><p className="mt-2 text-sm">{l.expectedUse}</p></div>)}</div></div> }
