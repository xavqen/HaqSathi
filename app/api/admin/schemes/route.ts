import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth/session'

const schemeSchema = z.object({
  title: z.string().min(3).max(160),
  slug: z.string().min(3).max(120).regex(/^[a-z0-9-]+$/),
  state: z.string().min(2).max(80),
  purpose: z.string().min(2).max(80),
  eligibility: z.string().min(10).max(2000),
  documents: z.array(z.string().min(1)).min(1),
  applySteps: z.array(z.string().min(1)).min(1),
  officialLink: z.string().url().optional().or(z.literal(''))
})

export async function POST(req: NextRequest) {
  await requireAdmin()
  const json = await req.json().catch(() => null)
  const parsed = schemeSchema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ ok: false, error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })
  const scheme = await db.scheme.create({ data: { ...parsed.data, officialLink: parsed.data.officialLink || null } })
  return NextResponse.json({ ok: true, scheme })
}
