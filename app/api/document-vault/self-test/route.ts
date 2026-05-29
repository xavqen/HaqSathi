import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/session'
import { checkVaultStorageHealth } from '@/lib/storage/supabase-storage'

export const runtime = 'nodejs'

export async function GET() {
  await requireAdmin()
  const result = await checkVaultStorageHealth()
  return NextResponse.json(result, { status: result.ok ? 200 : 500 })
}
