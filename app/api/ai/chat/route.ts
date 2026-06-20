import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth/session'
import { generateChatReply } from '@/lib/ai/helpers'
import { getLanguageLabel } from '@/lib/i18n/languages'
import { buildLanguageInstruction } from '@/lib/ai/language-instructions'
import { chatInputSchema } from '@/lib/validators/chat'
import { getClientIp, rateLimitAsync } from '@/lib/rate-limit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const maxDuration = 30

type ChatResult = ReturnType<typeof generateChatReply>
type ChatUser = Awaited<ReturnType<typeof getCurrentUser>>

type Preference = {
  primaryLanguage: string
  assistantTone: string
  readingLevel: string
} | null

const encoder = new TextEncoder()
const CHAT_TIMEOUT_MS = Math.min(Math.max(Number(process.env.AI_CHAT_TIMEOUT_MS || 18_000), 5_000), 45_000)
const STREAM_DELAY_MS = Math.min(Math.max(Number(process.env.AI_CHAT_STREAM_DELAY_MS || 34), 0), 140)
const SENSITIVE_NUMBER_PATTERN = /\b(?:otp|upi\s*pin|pin|cvv|password|passcode)\s*(?:number|code)?\s*[:=\-]?\s*\d{3,8}\b/i

function noStoreHeaders(extra?: HeadersInit) {
  return {
    'Cache-Control': 'private, no-store, max-age=0, must-revalidate',
    ...extra
  }
}

function containsSensitiveSecret(message: string) {
  return SENSITIVE_NUMBER_PATTERN.test(message.replace(/\s+/g, ' '))
}

function jsonError(error: string, status = 500, details?: unknown) {
  return NextResponse.json(
    { ok: false, error, details },
    { status, headers: noStoreHeaders() }
  )
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function withTimeout<T>(work: Promise<T>, ms: number, label: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label} timed out`)), ms)
  })
  try {
    return await Promise.race([work, timeout])
  } finally {
    if (timer) clearTimeout(timer)
  }
}

async function getPreference(user: ChatUser): Promise<Preference> {
  if (!user) return null
  return db.userLanguagePreference.findUnique({
    where: { userId: user.id },
    select: { primaryLanguage: true, assistantTone: true, readingLevel: true }
  }).catch(() => null)
}

function attachLanguageNote(result: ChatResult, preference: Preference) {
  const languageCode = preference?.primaryLanguage || 'ENGLISH'
  const languageNote = buildLanguageInstruction(languageCode)
  return {
    ...result,
    reply: `${result.reply}\n\nLanguage mode: ${getLanguageLabel(languageCode)}. ${languageNote} Tone: ${preference?.assistantTone || 'SIMPLE'}. Detail: ${preference?.readingLevel || 'EASY'}.`
  }
}

async function persistChat(input: { sessionId?: string; message: string; result: ChatResult; user: ChatUser }) {
  let sessionId = input.sessionId?.trim() || undefined

  try {
    if (!sessionId) {
      const session = await db.chatSession.create({
        data: { userId: input.user?.id, title: input.message.slice(0, 60) || 'New help chat' },
        select: { id: true }
      })
      sessionId = session.id
    }

    await db.chatMessage.createMany({
      data: [
        { sessionId, role: 'user', content: input.message },
        { sessionId, role: 'assistant', content: input.result.reply, metadata: input.result }
      ]
    })
  } catch (error) {
    console.error('Chat save failed', error)
  }

  return sessionId
}

function makeChunks(text: string) {
  const clean = text.replace(/\s+/g, ' ').trim()
  const sentences = clean.match(/[^.!?।]+[.!?।]?/g) || [clean]
  const chunks: string[] = []

  for (const sentence of sentences) {
    const trimmed = sentence.trim()
    if (!trimmed) continue
    if (trimmed.length <= 120) chunks.push(trimmed + ' ')
    else {
      for (let index = 0; index < trimmed.length; index += 110) {
        chunks.push(trimmed.slice(index, index + 110).trim() + ' ')
      }
    }
  }

  return chunks.length ? chunks.slice(0, 18) : ['I am preparing your answer. ']
}

function streamLine(payload: unknown) {
  return encoder.encode(`${JSON.stringify(payload)}\n`)
}

async function buildResult(message: string) {
  const user = await withTimeout(getCurrentUser(), 4_500, 'auth')
  const preference = await withTimeout(getPreference(user), 3_500, 'language preference')
  const result = attachLanguageNote(generateChatReply(message), preference)
  return { user, result }
}

async function handleJson(message: string, sessionId?: string) {
  const { user, result } = await withTimeout(buildResult(message), CHAT_TIMEOUT_MS, 'chat response')
  const savedSessionId = await withTimeout(
    persistChat({ sessionId, message, result, user }),
    5_500,
    'chat persistence'
  )

  return NextResponse.json(
    { ok: true, result, sessionId: savedSessionId },
    { headers: noStoreHeaders() }
  )
}

function handleStream(message: string, sessionId?: string) {
  const stream = new ReadableStream({
    async start(controller) {
      try {
        controller.enqueue(streamLine({ type: 'meta', startedAt: Date.now() }))
        const { user, result } = await withTimeout(buildResult(message), CHAT_TIMEOUT_MS, 'chat response')

        for (const chunk of makeChunks(result.reply)) {
          controller.enqueue(streamLine({ type: 'chunk', text: chunk }))
          if (STREAM_DELAY_MS > 0) await sleep(STREAM_DELAY_MS)
        }

        const savedSessionId = await withTimeout(
          persistChat({ sessionId, message, result, user }),
          5_500,
          'chat persistence'
        )

        controller.enqueue(streamLine({ type: 'done', result, sessionId: savedSessionId }))
      } catch (error) {
        console.error('Chat stream failed', error)
        controller.enqueue(streamLine({
          type: 'error',
          error: 'Assistant timed out. Please retry or use a shorter message.'
        }))
      } finally {
        controller.close()
      }
    }
  })

  return new Response(stream, {
    status: 200,
    headers: noStoreHeaders({
      'Content-Type': 'application/x-ndjson; charset=utf-8',
      'X-Accel-Buffering': 'no'
    })
  })
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers)
  const limit = await rateLimitAsync(`chat:${ip}`, 15, 60_000)

  if (!limit.ok) {
    return jsonError('Too many messages. 1 minute baad try karo.', 429, {
      resetAt: limit.resetAt,
      source: limit.source
    })
  }

  const json = await req.json().catch(() => null)
  const parsed = chatInputSchema.safeParse(json)
  if (!parsed.success) {
    return jsonError('Invalid input', 400, parsed.error.flatten())
  }

  if (containsSensitiveSecret(parsed.data.message)) {
    return jsonError('OTP, UPI PIN, CVV ya password numbers chat me mat bhejo. Sensitive number hata kar issue likho.', 400)
  }

  try {
    if (req.nextUrl.searchParams.get('stream') === '1') {
      return handleStream(parsed.data.message, parsed.data.sessionId || undefined)
    }

    return await handleJson(parsed.data.message, parsed.data.sessionId || undefined)
  } catch (error) {
    console.error('Chat API failed', error)
    return jsonError('Assistant is busy. Please retry in a few seconds.', 503)
  }
}
