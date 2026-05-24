import { db } from '@/lib/db'
import { requireUser } from '@/lib/auth/session'
import { VerificationRequestForm } from '@/components/forms/verification-request-form'
export const dynamic = 'force-dynamic'
export default async function Page(){ const user=await requireUser(); const items=await db.verificationRequest.findMany({where:{userId:user.id},orderBy:{createdAt:'desc'},take:50}).catch(()=>[]); return <div><h1 className="text-3xl font-black">Verification requests</h1><p className="mt-2 text-slate-600">Important AI drafts ko review queue me save karo.</p><div className="mt-6"><VerificationRequestForm /></div><div className="mt-6 grid gap-3">{items.map(i=><div key={i.id} className="rounded-2xl border bg-white p-4"><b>{i.title}</b><p className="text-sm text-slate-600">{i.category} · {i.status}</p><p className="mt-2 text-sm">{i.userQuestion}</p></div>)}</div></div> }
