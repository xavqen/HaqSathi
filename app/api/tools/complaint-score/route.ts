import { NextRequest, NextResponse } from 'next/server'
import { scoreComplaint } from '@/lib/case-intelligence'
import { complaintScoreSchema } from '@/lib/validators/tools'

export async function POST(req: NextRequest) {
  const json = await req.json().catch(() => null)
  const parsed = complaintScoreSchema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ ok: false, error: 'Invalid input' }, { status: 400 })
  return NextResponse.json({ ok: true, result: scoreComplaint(parsed.data) })
}
