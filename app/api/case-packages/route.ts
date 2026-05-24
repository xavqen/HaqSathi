import { NextResponse } from 'next/server'
import { z } from 'zod'
import { randomBytes } from 'crypto'
import { requireUser } from '@/lib/auth/session'
import { db } from '@/lib/db'

const schema = z.object({ complaintId: z.string().min(1) })

export async function POST(req: Request){
  try {
    const user = await requireUser()
    const parsed = schema.safeParse(await req.json())
    if (!parsed.success) return NextResponse.json({ ok:false, error:'Invalid complaint selected.' }, { status:400 })
    const complaint = await db.complaint.findFirst({ where: { id: parsed.data.complaintId, userId: user.id } })
    if (!complaint) return NextResponse.json({ ok:false, error:'Complaint not found.' }, { status:404 })
    const sections = {
      summary: { type: complaint.type, companyName: complaint.companyName, status: complaint.status },
      evidenceIndex: ['Payment proof', 'Order/transaction ID', 'Support messages', 'Screenshots', 'Previous complaint reference'],
      timeline: [{ date: complaint.issueDate || complaint.createdAt, event: complaint.description }],
      drafts: complaint.generatedDraft,
      nextSteps: ['Send written complaint', 'Save acknowledgement', 'Follow up after expected response time', 'Escalate only with proper evidence']
    }
    const saved = await db.casePackage.create({ data: { userId: user.id, complaintId: complaint.id, title: `${complaint.type} · ${complaint.companyName}`, sections, downloadToken: randomBytes(16).toString('hex') } })
    return NextResponse.json({ ok:true, id: saved.id })
  } catch (error) {
    return NextResponse.json({ ok:false, error:'Case package create nahi hua.' }, { status:500 })
  }
}
