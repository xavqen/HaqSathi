import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireUser } from '@/lib/auth/session'
import { uploadVaultFile } from '@/lib/storage/supabase-storage'
import { scanVaultFileSafety } from '@/lib/security/document-vault-safety'
import { csrfGuard } from '@/lib/security/csrf'
import { getClientIp, rateLimitAsync } from '@/lib/rate-limit'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const csrf = csrfGuard(req)
    if (csrf) return csrf
    const ip = getClientIp(req.headers)
    if (!(await rateLimitAsync(`vault-upload:${ip}`, 12, 60_000)).ok) return NextResponse.json({ ok: false, error: 'Too many uploads. Try again after 1 minute.' }, { status: 429 })
    const user = await requireUser()
    const form = await req.formData()
    const file = form.get('file')
    if (!(file instanceof File)) return NextResponse.json({ ok: false, error: 'Document file required.' }, { status: 400 })

    const title = String(form.get('title') || '').trim()
    const docType = String(form.get('docType') || '').trim()
    const expiryDate = String(form.get('expiryDate') || '').trim()
    const notes = String(form.get('notes') || '').trim()
    if (title.length < 2 || docType.length < 2) return NextResponse.json({ ok: false, error: 'Title aur document type required.' }, { status: 400 })

    const safetyScan = await scanVaultFileSafety(file)
    if (!safetyScan.allowed) {
      return NextResponse.json({ ok: false, error: 'File safety scan failed. Upload only clean PDF/JPG/PNG/WEBP files.', safetyScan }, { status: 400 })
    }

    const storagePath = await uploadVaultFile({ userId: user.id, file })
    const item = await db.documentVaultItem.create({
      data: {
        userId: user.id,
        title,
        docType,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        notes: notes || null,
        storagePath
      }
    })

    return NextResponse.json({ ok: true, item })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Upload failed'
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
