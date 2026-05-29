import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { buildServiceCenterLocator } from '@/lib/tools/phase31-advanced-generators'
import { serviceCenterLocatorSchema } from '@/lib/validators/phase31'

export async function POST(req: NextRequest) {
  const json = await req.json().catch(() => null)
  const parsed = serviceCenterLocatorSchema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ ok: false, error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })
  const user = await getCurrentUser()
  const result = buildServiceCenterLocator(parsed.data)
  if (user) await db.serviceCenterLocatorPlan.create({ data: { userId: user.id, issueType: parsed.data.issueType, state: parsed.data.state, city: parsed.data.city, urgency: parsed.data.urgency, result } }).catch(() => undefined)
  return NextResponse.json({ ok: true, result })
}
