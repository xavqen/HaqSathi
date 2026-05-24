import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireUser } from '@/lib/auth/session'
import { safeJson, dbErrorResponse } from '@/lib/api/errors'
import { verificationRequestSchema } from '@/lib/validators/phase16'

export async function GET() {
  const user = await requireUser()
  try { return NextResponse.json({ ok: true, requests: await db.verificationRequest.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' }, take: 100 }) }) }
  catch (error) { return dbErrorResponse(error) }
}
export async function POST(req: NextRequest) {
  const user = await requireUser()
  const body = await safeJson<unknown>(req)
  const parsed = verificationRequestSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ ok: false, error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })
  try { return NextResponse.json({ ok: true, request: await db.verificationRequest.create({ data: { userId: user.id, ...parsed.data } }) }) }
  catch (error) { return dbErrorResponse(error) }
}
