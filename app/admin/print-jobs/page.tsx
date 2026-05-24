import { db } from '@/lib/db'
export const dynamic = 'force-dynamic'
export default async function Page(){ const jobs=await db.printJob.findMany({orderBy:{createdAt:'desc'},take:100}).catch(()=>[]); return <div><h1 className="text-3xl font-black">Print jobs</h1><div className="mt-6 grid gap-3">{jobs.map(j=><div key={j.id} className="rounded-2xl border bg-white p-4"><b>{j.title}</b><p className="text-sm text-slate-600">{j.jobType} · {j.copies} copies · {j.status}</p></div>)}</div></div> }
