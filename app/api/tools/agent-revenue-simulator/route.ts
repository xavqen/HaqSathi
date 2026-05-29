import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { buildAgentRevenueSimulation } from '@/lib/tools/phase30-trust-growth-generators'
import { agentRevenueSimulatorSchema } from '@/lib/validators/phase30'

export async function POST(req: NextRequest) {
  const json = await req.json().catch(() => null)
  const parsed = agentRevenueSimulatorSchema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ ok: false, error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })
  const user = await getCurrentUser()
  const result = buildAgentRevenueSimulation(parsed.data)
  if (user) await db.agentRevenueSimulation.create({ data: { userId: user.id, city: parsed.data.city || null, monthlyClients: parsed.data.monthlyClients, avgServiceFee: parsed.data.avgServiceFee, conversionRate: parsed.data.conversionRate, estimatedNet: result.estimatedNet, result } }).catch(() => undefined)
  return NextResponse.json({ ok: true, result })
}
