import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth/session'
import { csvResponse, toCsv } from '@/lib/export/csv'

export async function GET() {
  await requireAdmin()
  const complaints = await db.complaint.findMany({ include: { user: { select: { email: true } } }, orderBy: { createdAt: 'desc' }, take: 5000 })
  const csv = toCsv(['createdAt', 'userEmail', 'type', 'companyName', 'transactionId', 'amount', 'status'], complaints.map((c) => [
    c.createdAt.toISOString(), c.user?.email || 'guest', c.type, c.companyName, c.transactionId || '', c.amount?.toString() || '', c.status
  ]))
  return csvResponse('haqsathi-admin-complaints.csv', csv)
}
