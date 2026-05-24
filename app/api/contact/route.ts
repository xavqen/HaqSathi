import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { rateLimit } from '@/lib/rate-limit'

const schema = z.object({ name: z.string().min(2).max(80), email: z.string().email(), message: z.string().min(10).max(2000) })

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local'
  if (!rateLimit(`contact:${ip}`, 5, 60_000).ok) return NextResponse.json({ ok: false, error: 'Too many requests' }, { status: 429 })
  const json = await req.json().catch(() => null)
  const parsed = schema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ ok: false, error: 'Invalid input' }, { status: 400 })
  try { await db.contactMessage.create({ data: parsed.data }) } catch (e) { console.error(e) }
  return NextResponse.json({ ok: true })
}
