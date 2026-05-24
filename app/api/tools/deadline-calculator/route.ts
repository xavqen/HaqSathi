import { NextRequest, NextResponse } from 'next/server'
import { calculateDeadline } from '@/lib/case-intelligence'
import { deadlineCalculatorSchema } from '@/lib/validators/tools'

export async function POST(req: NextRequest) {
  const json = await req.json().catch(() => null)
  const parsed = deadlineCalculatorSchema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ ok: false, error: 'Invalid input' }, { status: 400 })
  return NextResponse.json({ ok: true, timeline: calculateDeadline(parsed.data.issueDate, parsed.data.category) })
}
