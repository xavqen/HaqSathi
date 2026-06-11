import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/session'
import { getNotificationReadinessReport } from '@/lib/notifications/readiness'

export async function GET() {
  await requireAdmin()
  return NextResponse.json(getNotificationReadinessReport())
}
