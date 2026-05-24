import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireUser } from '@/lib/auth/session'
import { safeJson, dbErrorResponse } from '@/lib/api/errors'
import { evidencePackSchema } from '@/lib/validators/advanced-tools'
import { buildEvidencePack } from '@/lib/tools/advanced-generators'

export async function GET() {
  const user = await requireUser()
  try {
    const packs = await db.evidencePack.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' }, take: 50 })
    return NextResponse.json({ ok: true, packs })
  } catch (error) {
    return dbErrorResponse(error)
  }
}

export async function POST(req: NextRequest) {
  const user = await requireUser()
  const body = await safeJson<unknown>(req)
  const parsed = evidencePackSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ ok: false, error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })
  const result = buildEvidencePack(parsed.data)
  try {
    const pack = await db.evidencePack.create({
      data: {
        userId: user.id,
        complaintId: parsed.data.complaintId || null,
        caseTitle: parsed.data.caseTitle,
        category: parsed.data.category,
        coverNote: result.coverNote,
        evidenceIndex: result.evidenceIndex
      }
    })
    return NextResponse.json({ ok: true, pack, result })
  } catch (error) {
    return dbErrorResponse(error)
  }
}
