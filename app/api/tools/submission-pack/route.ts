import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { buildSubmissionPack } from '@/lib/tools/phase28-submission-pack'
import { submissionPackSchema } from '@/lib/validators/phase28'

export async function POST(req: NextRequest) {
  const json = await req.json().catch(() => null)
  const parsed = submissionPackSchema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ ok: false, error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })
  const user = await getCurrentUser()
  const result = buildSubmissionPack(parsed.data)
  if (user) {
    await db.submissionPack.create({
      data: {
        userId: user.id,
        issueType: parsed.data.issueType,
        companyName: parsed.data.companyName || null,
        referenceId: parsed.data.referenceId || null,
        language: parsed.data.language || 'ENGLISH',
        recipientType: parsed.data.recipientType,
        tone: parsed.data.tone,
        pack: result
      }
    }).catch(() => undefined)
  }
  return NextResponse.json({ ok: true, result })
}
