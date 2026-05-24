import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireUser } from '@/lib/auth/session'
import { createComplaintPdf, type ComplaintDraftJson } from '@/lib/export/complaint'

export const runtime = 'nodejs'

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser()
  const { id } = await params
  const complaint = await db.complaint.findFirst({ where: { id, userId: user.id } })
  if (!complaint) return NextResponse.json({ ok: false, error: 'Complaint not found' }, { status: 404 })

  const pdf = await createComplaintPdf({
    title: `${complaint.type} - ${complaint.companyName}`,
    subtitle: `Generated on ${complaint.createdAt.toDateString()} · Status: ${complaint.status}`,
    draft: complaint.generatedDraft as ComplaintDraftJson
  })

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="haqsathi-${complaint.id}.pdf"`,
      'Cache-Control': 'private, no-store'
    }
  })
}
