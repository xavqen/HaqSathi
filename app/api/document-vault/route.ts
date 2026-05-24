import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireUser } from '@/lib/auth/session'
import { documentVaultSchema } from '@/lib/validators/profile'

export async function POST(req: NextRequest) {
  const user = await requireUser()
  const json = await req.json().catch(() => null)
  const parsed = documentVaultSchema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ ok: false, error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })
  const item = await db.documentVaultItem.create({
    data: {
      userId: user.id,
      title: parsed.data.title,
      docType: parsed.data.docType,
      expiryDate: parsed.data.expiryDate ? new Date(parsed.data.expiryDate) : null,
      notes: parsed.data.notes || null,
      storagePath: null
    }
  })
  return NextResponse.json({ ok: true, item })
}
