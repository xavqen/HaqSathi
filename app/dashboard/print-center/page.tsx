import { db } from '@/lib/db'
import { requireUser } from '@/lib/auth/session'
import { PrintJobForm } from '@/components/forms/print-job-form'
export const dynamic = 'force-dynamic'
export default async function Page(){ const user=await requireUser(); const jobs=await db.printJob.findMany({where:{userId:user.id},orderBy:{createdAt:'desc'},take:50}).catch(()=>[]); return <div><h1 className="text-3xl font-black">Print center</h1><p className="mt-2 text-slate-600">Complaint, checklist, evidence aur case packets print queue.</p><div className="mt-6"><PrintJobForm /></div><div className="mt-6 grid gap-3">{jobs.map(j=><div key={j.id} className="rounded-2xl border bg-white p-4"><b>{j.title}</b><p className="text-sm text-slate-600">{j.jobType} · {j.copies} copies · {j.status}</p></div>)}</div></div> }
