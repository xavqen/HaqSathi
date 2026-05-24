import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { logActivity } from '@/lib/activity'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin()
  const resolved = await params
  const json = await req.json().catch(() => null) as { status?: string } | null
  const status = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].includes(json?.status || '') ? json?.status : 'OPEN'
  await db.supportTicket.update({ where: { id: resolved.id }, data: { status } })
  await logActivity({ userId: admin.id, action: 'UPDATE_STATUS', entity: 'SupportTicket', entityId: resolved.id, metadata: { status } })
  return NextResponse.json({ ok: true })
}
