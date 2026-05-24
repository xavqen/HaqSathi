import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireUser } from '@/lib/auth/session'
import { slaTrackSchema } from '@/lib/validators/phase14'

function deriveStatus(targetDate: Date) {
  const diffDays = Math.ceil((targetDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  if (diffDays < 0) return 'MISSED' as const
  if (diffDays <= 2) return 'AT_RISK' as const
  return 'ON_TRACK' as const
}

export async function POST(req: Request) {
  try {
    const user = await requireUser()
    const json = await req.json()
    const parsed = slaTrackSchema.safeParse(json)
    if (!parsed.success) return NextResponse.json({ ok: false, error: parsed.error.issues[0]?.message || 'Invalid input' }, { status: 400 })

    const targetDate = new Date(parsed.data.targetDate)
    if (Number.isNaN(targetDate.getTime())) return NextResponse.json({ ok: false, error: 'Valid target date required' }, { status: 400 })

    const track = await db.caseSlaTrack.create({
      data: {
        userId: user.id,
        complaintId: parsed.data.complaintId || null,
        title: parsed.data.title,
        stage: parsed.data.stage,
        targetDate,
        status: deriveStatus(targetDate),
        nextAction: parsed.data.nextAction,
        riskNote: parsed.data.riskNote || null
      }
    })
    return NextResponse.json({ ok: true, track })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ ok: false, error: 'SLA tracker save failed' }, { status: 500 })
  }
}
