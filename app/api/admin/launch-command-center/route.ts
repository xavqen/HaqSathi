import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/session'
import { getLaunchCommandCenterReport } from '@/lib/launch/command-center'

export async function GET() {
  await requireAdmin()
  return NextResponse.json(getLaunchCommandCenterReport())
}
