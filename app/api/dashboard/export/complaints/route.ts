import { db } from '@/lib/db'
import { requireUser } from '@/lib/auth/session'
import { csvResponse, toCsv } from '@/lib/export/csv'

export async function GET() {
  const user = await requireUser()
  const complaints = await db.complaint.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' } })
  const csv = toCsv(['createdAt', 'type', 'companyName', 'transactionId', 'amount', 'status'], complaints.map((c) => [
    c.createdAt.toISOString(), c.type, c.companyName, c.transactionId || '', c.amount?.toString() || '', c.status
  ]))
  return csvResponse('haqsathi-my-complaints.csv', csv)
}
