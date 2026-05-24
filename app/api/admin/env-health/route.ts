import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/session'
import { getEnvHealth, type EnvStage } from '@/lib/launch/env-health'

export async function GET(req: NextRequest) {
  await requireAdmin()
  const stage = (req.nextUrl.searchParams.get('stage') || 'LOCAL') as EnvStage
  return NextResponse.json({ ok: true, ...getEnvHealth(stage) })
}
