import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { getClientIp, rateLimitAsync } from '@/lib/rate-limit'
import { csrfGuard } from '@/lib/security/csrf'

const schema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  category: z.enum(['GENERAL', 'PAYMENT', 'FRAUD_ABUSE', 'ACCOUNT_LOGIN', 'DOCUMENT_VAULT', 'BUG', 'LEGAL_PRIVACY']).default('GENERAL'),
  priority: z.enum(['NORMAL', 'URGENT']).default('NORMAL'),
  source: z.string().max(80).optional(),
  message: z.string().min(10).max(2000)
})

const secretPattern = /\b(?:\d{6}|\d{4})\b|\b(?:otp|upi\s*pin|pin|cvv|password|passcode|card\s*number|full\s*card)\b/gi
const urgentCategoryPattern = /FRAUD_ABUSE|PAYMENT|ACCOUNT_LOGIN|DOCUMENT_VAULT/i
const urgentTextPattern = /fraud|scam|unauthori[sz]ed|upi|payment failed|refund|login|account hacked|document|vault|aadhaar|pan|urgent/i

function redactSecrets(value: string) {
  return value.replace(secretPattern, '[redacted sensitive credential]')
}

function isUrgent(data: z.infer<typeof schema>) {
  return data.priority === 'URGENT' || urgentCategoryPattern.test(data.category) || urgentTextPattern.test(data.message)
}

export async function POST(req: NextRequest) {
  const csrf = csrfGuard(req)
  if (csrf) return csrf

  const ip = getClientIp(req.headers)
  if (!(await rateLimitAsync(`contact:${ip}`, 5, 60_000)).ok) return NextResponse.json({ ok: false, error: 'Too many requests' }, { status: 429 })

  const json = await req.json().catch(() => null)
  const parsed = schema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ ok: false, error: 'Invalid input' }, { status: 400 })

  const safeMessage = redactSecrets(parsed.data.message)
  const urgent = isUrgent(parsed.data)
  const taggedMessage = [
    `Category: ${parsed.data.category}`,
    `Priority: ${urgent ? 'URGENT' : parsed.data.priority}`,
    `Source: ${parsed.data.source || 'contact-page'}`,
    '',
    safeMessage
  ].join('\n')

  try {
    await db.$transaction(async (tx) => {
      await tx.contactMessage.create({
        data: {
          name: parsed.data.name,
          email: parsed.data.email,
          message: taggedMessage
        }
      })

      if (urgent) {
        await tx.supportTicket.create({
          data: {
            subject: `${parsed.data.category.replaceAll('_', ' ')} support request from ${parsed.data.name}`.slice(0, 140),
            category: parsed.data.category,
            message: `Contact: ${parsed.data.email}\n\n${taggedMessage}`
          }
        })
      }
    })
  } catch (error) {
    console.error('Contact support save failed', error)
    return NextResponse.json(
      { ok: false, error: 'Support request could not be saved. Please email support directly.' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } }
    )
  }

  return NextResponse.json({
    ok: true,
    urgent,
    message: urgent
      ? 'Your urgent support request was saved. For UPI fraud, call 1930 and inform your bank/UPI app immediately.'
      : 'Your message was saved.'
  })
}
