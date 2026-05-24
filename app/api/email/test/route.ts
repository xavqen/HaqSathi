import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/session'
import { sendTransactionalEmail } from '@/lib/email/service'

export async function POST() {
  const admin = await requireAdmin()
  const result = await sendTransactionalEmail({
    to: admin.email,
    subject: 'HaqSathi AI email test',
    template: 'ADMIN_TEST',
    userId: admin.id,
    html: '<p>Email pipeline is configured. If RESEND_API_KEY is empty, this is logged as SKIPPED.</p>',
    text: 'Email pipeline is configured.'
  })
  return NextResponse.json({ ok: result.ok, skipped: 'skipped' in result ? result.skipped : false, error: 'error' in result ? result.error : undefined })
}
