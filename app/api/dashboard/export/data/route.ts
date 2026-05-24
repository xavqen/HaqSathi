import { NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { buildUserDataExport } from '@/lib/export/user-data'
import { logActivity } from '@/lib/activity'

export async function GET() {
  const user = await requireUser()
  const data = await buildUserDataExport(user.id)
  const fileName = `haqsathi-export-${new Date().toISOString().slice(0, 10)}.json`
  await db.dataExport.create({ data: { userId: user.id, type: 'FULL_JSON', fileName } }).catch(() => undefined)
  await logActivity({ userId: user.id, action: 'EXPORT', entity: 'UserData', metadata: { fileName } })
  return NextResponse.json(data, { headers: { 'Content-Disposition': `attachment; filename="${fileName}"` } })
}
