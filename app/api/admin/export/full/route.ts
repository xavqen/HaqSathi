import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { logActivity } from '@/lib/activity'

export async function GET(req: NextRequest) {
  const admin = await requireAdmin()
  const secret = req.nextUrl.searchParams.get('secret')
  if (process.env.ADMIN_BACKUP_SECRET && secret !== process.env.ADMIN_BACKUP_SECRET) {
    return NextResponse.json({ ok: false, error: 'Backup secret required' }, { status: 403 })
  }
  const [users, complaints, schemes, seoPages, blogPosts, tickets, emails, payments] = await Promise.all([
    db.user.findMany({ select: { id: true, name: true, email: true, role: true, plan: true, createdAt: true } }),
    db.complaint.findMany({ orderBy: { createdAt: 'desc' }, take: 5000 }),
    db.scheme.findMany({ orderBy: { updatedAt: 'desc' } }),
    db.seoPage.findMany({ orderBy: { updatedAt: 'desc' } }),
    db.blogPost.findMany({ orderBy: { updatedAt: 'desc' } }),
    db.supportTicket.findMany({ orderBy: { createdAt: 'desc' }, take: 5000 }),
    db.emailLog.findMany({ orderBy: { createdAt: 'desc' }, take: 5000 }),
    db.paymentOrder.findMany({ orderBy: { createdAt: 'desc' }, take: 5000 })
  ])
  await logActivity({ userId: admin.id, action: 'EXPORT', entity: 'AdminBackup' })
  const fileName = `haqsathi-admin-backup-${new Date().toISOString().slice(0, 10)}.json`
  return NextResponse.json({ exportedAt: new Date().toISOString(), users, complaints, schemes, seoPages, blogPosts, tickets, emails, payments }, { headers: { 'Content-Disposition': `attachment; filename="${fileName}"` } })
}
