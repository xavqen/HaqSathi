import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { rateLimit } from '@/lib/rate-limit'
import { getCurrentUser } from '@/lib/auth/session'
import { generateChatReply } from '@/lib/ai/helpers'
import { chatInputSchema } from '@/lib/validators/chat'

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local'
  if (!rateLimit(`chat:${ip}`, 15, 60_000).ok) return NextResponse.json({ ok: false, error: 'Too many messages. 1 minute baad try karo.' }, { status: 429 })

  const json = await req.json().catch(() => null)
  const parsed = chatInputSchema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ ok: false, error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })

  const user = await getCurrentUser()
  const preference = user ? await db.userLanguagePreference.findUnique({ where: { userId: user.id } }).catch(() => null) : null
  const result = generateChatReply(parsed.data.message)
  if (preference) {
    result.reply = `${result.reply}\n\nPreference applied: ${preference.primaryLanguage}, tone ${preference.assistantTone}, detail ${preference.readingLevel}.`
  }
  let sessionId = parsed.data.sessionId || undefined

  try {
    if (!sessionId) {
      const session = await db.chatSession.create({ data: { userId: user?.id, title: parsed.data.message.slice(0, 60) || 'New help chat' }, select: { id: true } })
      sessionId = session.id
    }
    await db.chatMessage.createMany({ data: [
      { sessionId, role: 'user', content: parsed.data.message },
      { sessionId, role: 'assistant', content: result.reply, metadata: result }
    ] })
  } catch (error) {
    console.error('Chat save failed', error)
  }

  return NextResponse.json({ ok: true, result, sessionId })
}
