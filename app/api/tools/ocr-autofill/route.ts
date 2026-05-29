import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { analyzeOcrAutofill } from '@/lib/tools/phase26-ocr-autofill'
import { csrfGuard } from '@/lib/security/csrf'
import { getClientIp, rateLimitAsync } from '@/lib/rate-limit'

const MAX_FILE_SIZE = 5 * 1024 * 1024
const allowedMime = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'application/pdf', 'text/plain'])

export async function POST(req: NextRequest) {
  const csrf = csrfGuard(req)
  if (csrf) return csrf
  const ip = getClientIp(req.headers)
  if (!(await rateLimitAsync(`ocr:${ip}`, 20, 60_000)).ok) return NextResponse.json({ ok: false, error: 'Too many OCR requests. Try again after 1 minute.' }, { status: 429 })

  const formData = await req.formData().catch(() => null)
  if (!formData) return NextResponse.json({ ok: false, error: 'Invalid form data' }, { status: 400 })

  const fileValue = formData.get('file')
  const file = fileValue instanceof File && fileValue.size > 0 ? fileValue : null
  const rawNotes = String(formData.get('rawNotes') || '').slice(0, 4000)
  const documentType = String(formData.get('documentType') || 'PAYMENT_PROOF').slice(0, 80)
  const language = String(formData.get('language') || 'ENGLISH')

  if (!file && rawNotes.trim().length < 10) {
    return NextResponse.json({ ok: false, error: 'Image/PDF upload karo ya notes me at least 10 characters likho.' }, { status: 400 })
  }

  if (file && file.size > MAX_FILE_SIZE) return NextResponse.json({ ok: false, error: 'File size 5MB se kam rakho.' }, { status: 400 })
  if (file && file.type && !allowedMime.has(file.type)) return NextResponse.json({ ok: false, error: 'Only image, PDF or text file allowed.' }, { status: 400 })

  let dataUrl = ''
  if (file && file.type.startsWith('image/')) {
    const buffer = Buffer.from(await file.arrayBuffer())
    dataUrl = `data:${file.type};base64,${buffer.toString('base64')}`
  }
  if (file && file.type === 'text/plain' && rawNotes.trim().length < 10) {
    const text = await file.text().catch(() => '')
    if (text) formData.set('rawNotes', text.slice(0, 4000))
  }

  const finalNotes = String(formData.get('rawNotes') || rawNotes).slice(0, 4000)
  const { result, provider } = await analyzeOcrAutofill({
    fileName: file?.name,
    mimeType: file?.type,
    fileSize: file?.size,
    dataUrl,
    rawNotes: finalNotes,
    documentType,
    language
  })

  const user = await getCurrentUser()
  if (user) {
    await db.ocrAutofillResult.create({
      data: {
        userId: user.id,
        fileName: file?.name,
        mimeType: file?.type,
        fileSize: file?.size,
        documentType,
        rawNotes: finalNotes || undefined,
        extractedFields: result,
        confidenceScore: result.confidenceScore,
        warnings: result.warnings,
        provider
      }
    }).catch(() => undefined)
  }

  return NextResponse.json({ ok: true, result, provider })
}
