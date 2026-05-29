import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { parseDocumentText } from '@/lib/tools/phase24-generators'
import { documentReaderSchema } from '@/lib/validators/phase24'

export async function POST(req: NextRequest) {
  const json = await req.json().catch(() => null)
  const parsed = documentReaderSchema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ ok: false, error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })
  const user = await getCurrentUser()
  const result = parseDocumentText(parsed.data)
  if (user) {
    await db.documentParseResult.create({
      data: {
        userId: user.id,
        sourceType: parsed.data.sourceType,
        documentType: parsed.data.documentType,
        rawText: parsed.data.rawText.slice(0, 12000),
        extractedFields: result.extractedFields,
        confidenceScore: result.confidenceScore,
        warnings: result.warnings
      }
    }).catch(() => undefined)
  }
  return NextResponse.json({ ok: true, result })
}
