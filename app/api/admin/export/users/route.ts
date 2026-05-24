import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth/session'
import { csvResponse, toCsv } from '@/lib/export/csv'

export async function GET() {
  await requireAdmin()
  const users = await db.user.findMany({ orderBy: { createdAt: 'desc' }, take: 5000, select: { email: true, name: true, role: true, plan: true, createdAt: true } })
  const csv = toCsv(['createdAt', 'name', 'email', 'role', 'plan'], users.map((u) => [u.createdAt.toISOString(), u.name || '', u.email, u.role, u.plan]))
  return csvResponse('haqsathi-admin-users.csv', csv)
}
