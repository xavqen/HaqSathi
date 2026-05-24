import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireUser } from '@/lib/auth/session'
import { createSignedVaultUrl } from '@/lib/storage/supabase-storage'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser()
    const itemId = new URL(req.url).searchParams.get('itemId')
    if (!itemId) return NextResponse.json({ ok: false, error: 'itemId required' }, { status: 400 })

    const item = await db.documentVaultItem.findFirst({ where: { id: itemId, userId: user.id } })
    if (!item || !item.storagePath) return NextResponse.json({ ok: false, error: 'File not found' }, { status: 404 })

    const url = await createSignedVaultUrl(item.storagePath)
    return NextResponse.json({ ok: true, url, expiresInSeconds: 300 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Download link failed'
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
