'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AlertCircle, Bot, CheckCircle2, Copy, Loader2, RefreshCcw, Send, Square, UserRound, Wand2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { CopyButton } from '@/components/ui/copy-button'

type Reply = {
  reply: string
  actionSteps: string[]
  draftMessage: string
  checklist: string[]
  disclaimer: string
}

type ChatItem = {
  id: string
  role: 'user' | 'assistant'
  text: string
  data?: Reply
  status?: 'idle' | 'streaming' | 'complete' | 'error'
}

type StreamEvent =
  | { type: 'meta'; startedAt: number }
  | { type: 'chunk'; text: string }
  | { type: 'done'; result: Reply; sessionId?: string }
  | { type: 'error'; error: string }

const quickPrompts = [
  'Mera UPI paisa debit ho gaya par receiver ko nahi mila.',
  'Online order ka refund pending hai, complaint draft chahiye.',
  'Scholarship form ke documents aur steps batao.',
  'Bank account me wrong debit hua hai, kya karu?'
]

const MAX_RENDERED_MESSAGES = 36
const CHAT_TIMEOUT_MS = 26_000
const AUTOSCROLL_THRESHOLD_PX = 140
const SECRET_NUMBER_PATTERN = /\b(?:otp|upi\s*pin|pin|cvv|password|passcode)\s*(?:number|code)?\s*[:=\-]?\s*\d{3,8}\b/i

function makeId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function isStreamResponse(response: Response) {
  return response.body && response.headers.get('content-type')?.includes('application/x-ndjson')
}

function assistantFallbackMessage(error?: string) {
  return error || 'Assistant busy hai. Retry karo, ya message thoda short karke bhejo.'
}

function isLikelySecretMessage(input: string) {
  return SECRET_NUMBER_PATTERN.test(input.replace(/\s+/g, ' '))
}

function parseStreamEvent(line: string): StreamEvent | null {
  try {
    const parsed = JSON.parse(line) as Partial<StreamEvent>
    if (parsed && typeof parsed.type === 'string') return parsed as StreamEvent
  } catch {
    return null
  }
  return null
}

export function ChatAssistant() {
  const [message, setMessage] = useState('')
  const [sessionId, setSessionId] = useState<string | undefined>()
  const [lastUserMessage, setLastUserMessage] = useState<string | null>(null)
  const [items, setItems] = useState<ChatItem[]>([
    {
      id: 'welcome',
      role: 'assistant',
      status: 'complete',
      text: 'Namaste! Apna refund, UPI, bank, scheme ya document issue simple language me batao. OTP, PIN, password ya full card number mat bhejna.'
    }
  ])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const rafRef = useRef<number | null>(null)
  const stickToBottomRef = useRef(true)
  const prefersReducedMotionRef = useRef(false)

  const visibleItems = useMemo(() => items.slice(-MAX_RENDERED_MESSAGES), [items])
  const hiddenCount = Math.max(items.length - visibleItems.length, 0)
  const canSend = message.trim().length >= 4 && !loading

  const scheduleAutoScroll = useCallback((force = false) => {
    const element = scrollRef.current
    if (!element) return

    const distanceFromBottom = element.scrollHeight - element.scrollTop - element.clientHeight
    const shouldStick = force || stickToBottomRef.current || distanceFromBottom < AUTOSCROLL_THRESHOLD_PX
    if (!shouldStick) return

    if (rafRef.current) window.cancelAnimationFrame(rafRef.current)
    rafRef.current = window.requestAnimationFrame(() => {
      element.scrollTo({
        top: element.scrollHeight,
        behavior: prefersReducedMotionRef.current ? 'auto' : 'smooth'
      })
      rafRef.current = null
    })
  }, [])

  useEffect(() => {
    prefersReducedMotionRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])

  useEffect(() => {
    scheduleAutoScroll(true)
  }, [visibleItems.length, loading, scheduleAutoScroll])

  useEffect(() => () => {
    abortRef.current?.abort()
    if (rafRef.current) window.cancelAnimationFrame(rafRef.current)
  }, [])

  function updateAssistant(id: string, updater: (item: ChatItem) => ChatItem) {
    setItems((current) => current.map((item) => (item.id === id ? updater(item) : item)))
  }

  async function readJsonPayload(response: Response) {
    const data = await response.json().catch(() => null)
    if (!response.ok || !data?.ok) throw new Error(data?.error || 'Chat failed')
    return data as { ok: true; result: Reply; sessionId?: string }
  }

  async function fetchJsonFallback(text: string, activeSessionId?: string, retry = true) {
    const response = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ message: text, sessionId: activeSessionId }),
      credentials: 'same-origin',
      cache: 'no-store'
    })

    try {
      return await readJsonPayload(response)
    } catch (caught) {
      if (retry && response.status >= 500) {
        await new Promise((resolve) => setTimeout(resolve, 850))
        return fetchJsonFallback(text, activeSessionId, false)
      }
      throw caught
    }
  }

  async function readStream(response: Response, assistantId: string): Promise<{ result: Reply; sessionId?: string }> {
    if (!response.body) throw new Error('Streaming is not available in this browser')

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    let finalData: { result: Reply; sessionId?: string } | null = null

    function processLine(line: string) {
      if (!line.trim()) return
      const event = parseStreamEvent(line)
      if (!event) return

      if (event.type === 'chunk') {
        updateAssistant(assistantId, (item) => ({ ...item, text: `${item.text}${event.text}` }))
        scheduleAutoScroll()
      }

      if (event.type === 'done') {
        finalData = { result: event.result, sessionId: event.sessionId }
        updateAssistant(assistantId, () => ({
          id: assistantId,
          role: 'assistant',
          status: 'complete',
          text: event.result.reply,
          data: event.result
        }))
        scheduleAutoScroll()
      }

      if (event.type === 'error') {
        throw new Error(event.error)
      }
    }

    while (true) {
      const { done, value } = await reader.read()
      if (done) {
        buffer += decoder.decode()
        break
      }

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''
      for (const line of lines) processLine(line)
    }

    if (buffer.trim()) processLine(buffer)
    if (!finalData) throw new Error('Assistant response was incomplete')
    return finalData as { result: Reply; sessionId?: string }
  }

  async function send(customMessage?: string) {
    const text = (customMessage || message).trim()
    if (text.length < 4 || loading) return

    if (isLikelySecretMessage(text)) {
      setError('OTP, UPI PIN, CVV ya password numbers chat me mat bhejo. Sensitive number hata kar issue likho.')
      return
    }

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    const timeout = setTimeout(() => controller.abort(), CHAT_TIMEOUT_MS)
    const userId = makeId()
    const assistantId = makeId()

    setLastUserMessage(text)
    setItems((old) => [
      ...old,
      { id: userId, role: 'user', text, status: 'complete' },
      { id: assistantId, role: 'assistant', text: '', status: 'streaming' }
    ])
    setMessage('')
    setLoading(true)
    setError(null)
    stickToBottomRef.current = true
    scheduleAutoScroll(true)

    try {
      const response = await fetch('/api/ai/chat?stream=1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/x-ndjson, application/json' },
        body: JSON.stringify({ message: text, sessionId }),
        credentials: 'same-origin',
        cache: 'no-store',
        signal: controller.signal
      })

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.error || 'Chat failed')
      }

      if (isStreamResponse(response)) {
        const streamed = await readStream(response, assistantId)
        setSessionId(streamed.sessionId)
      } else {
        const fallback = await readJsonPayload(response)
        setSessionId(fallback.sessionId)
        updateAssistant(assistantId, () => ({
          id: assistantId,
          role: 'assistant',
          text: fallback.result.reply,
          data: fallback.result,
          status: 'complete'
        }))
        scheduleAutoScroll()
      }
    } catch (caught) {
      const aborted = caught instanceof DOMException && caught.name === 'AbortError'
      const messageText = aborted ? 'Request stopped. You can retry anytime.' : assistantFallbackMessage(caught instanceof Error ? caught.message : undefined)
      setError(messageText)
      updateAssistant(assistantId, (item) => ({
        ...item,
        text: item.text || messageText,
        status: 'error'
      }))
    } finally {
      clearTimeout(timeout)
      setLoading(false)
      abortRef.current = null
    }
  }

  function stop() {
    abortRef.current?.abort()
    abortRef.current = null
    setLoading(false)
  }

  function handleScroll() {
    const element = scrollRef.current
    if (!element) return
    const distanceFromBottom = element.scrollHeight - element.scrollTop - element.clientHeight
    stickToBottomRef.current = distanceFromBottom < AUTOSCROLL_THRESHOLD_PX
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-5">
      <div className="grid gap-3 rounded-[2rem] border border-emerald-100 bg-white p-3 shadow-soft sm:p-5 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="min-w-0">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-3xl bg-slate-50 px-4 py-3">
            <div className="flex min-w-0 items-center gap-2">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white"><Bot className="h-4 w-4" /></span>
              <div className="min-w-0">
                <p className="truncate text-sm font-black text-slate-950">Fast AI workflow</p>
                <p className="text-xs font-semibold text-slate-500">Streaming answer + retry-safe fallback</p>
              </div>
            </div>
            {loading ? (
              <Button type="button" variant="outline" size="sm" onClick={stop} className="shrink-0" aria-label="Stop current chat request">
                <Square className="h-3.5 w-3.5" /> Stop
              </Button>
            ) : lastUserMessage ? (
              <Button type="button" variant="outline" size="sm" onClick={() => void send(lastUserMessage)} className="shrink-0" aria-label="Retry last chat message">
                <RefreshCcw className="h-3.5 w-3.5" /> Retry
              </Button>
            ) : null}
          </div>

          <div ref={scrollRef} onScroll={handleScroll} className="chat-scroll max-h-[62vh] min-h-[22rem] space-y-4 overflow-y-auto overscroll-contain rounded-[1.6rem] border border-slate-100 bg-slate-50/70 p-3 sm:max-h-[36rem] sm:p-4" aria-live="polite">
            {hiddenCount > 0 ? (
              <div className="mx-auto w-fit rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-bold text-slate-500 shadow-sm">
                {hiddenCount} older messages hidden for speed
              </div>
            ) : null}

            {visibleItems.map((item) => (
              <ChatBubble key={item.id} item={item} />
            ))}
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
            <Textarea
              value={message}
              onChange={(event) => setMessage(event.target.value.slice(0, 1500))}
              placeholder="Example: Mera Flipkart refund nahi aaya, order ID hai, kya karu?"
              className="min-h-[6.5rem] resize-none text-[16px]"
              disabled={loading}
              aria-label="Describe your issue for HaqSathi AI"
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault()
                  void send()
                }
              }}
            />
            <Button type="button" onClick={() => void send()} disabled={!canSend} className="min-h-12 sm:min-w-28" aria-label="Send chat message">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Send
            </Button>
          </div>

          <div className="mt-2 flex items-center justify-between gap-2 text-xs font-semibold text-slate-500">
            <span>{message.length}/1500</span>
            <span>Enter sends • Shift+Enter new line</span>
          </div>

          {error ? (
            <div className="mt-3 flex items-start gap-2 rounded-2xl border border-red-100 bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>{error}</p>
            </div>
          ) : null}
        </div>

        <aside className="min-w-0 rounded-[1.6rem] border border-slate-100 bg-slate-50 p-4 lg:sticky lg:top-24 lg:self-start">
          <div className="flex items-center gap-2 text-sm font-black text-slate-950">
            <Wand2 className="h-4 w-4 text-emerald-700" /> One-tap starts
          </div>
          <div className="mt-3 grid gap-2">
            {quickPrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => void send(prompt)}
                disabled={loading}
                className="rounded-2xl border border-slate-200 bg-white px-3 py-3 text-left text-xs font-bold leading-5 text-slate-700 shadow-sm transition-[transform,border-color,background-color] duration-200 hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {prompt}
              </button>
            ))}
          </div>
          <div className="mt-4 rounded-2xl border border-amber-100 bg-amber-50 p-3 text-xs font-semibold leading-5 text-amber-900">
            Never share OTP, UPI PIN, CVV, passwords, full Aadhaar/PAN/passport numbers or private document QR codes.
          </div>
        </aside>
      </div>
    </div>
  )
}

function ChatBubble({ item }: { item: ChatItem }) {
  const isUser = item.role === 'user'

  return (
    <div className={`flex gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser ? <Avatar type="assistant" /> : null}
      <div className={`min-w-0 max-w-[92%] rounded-[1.35rem] px-4 py-3 shadow-sm sm:max-w-[84%] ${isUser ? 'bg-primary text-primary-foreground' : 'border border-slate-100 bg-white text-slate-900'}`}>
        {item.status === 'streaming' && !item.text ? (
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
            <span className="inline-flex gap-1">
              <span className="h-2 w-2 animate-bounce rounded-full bg-emerald-500 [animation-delay:-0.2s]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-emerald-500 [animation-delay:-0.1s]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-emerald-500" />
            </span>
            Preparing answer...
          </div>
        ) : (
          <p className="whitespace-pre-wrap break-words text-sm leading-6">{item.text}</p>
        )}

        {item.status === 'error' ? (
          <div className="mt-3 flex items-center gap-2 rounded-2xl bg-red-50 px-3 py-2 text-xs font-bold text-red-700">
            <AlertCircle className="h-4 w-4" /> Retry available above
          </div>
        ) : null}

        {item.data ? <AssistantCard data={item.data} /> : null}
      </div>
      {isUser ? <Avatar type="user" /> : null}
    </div>
  )
}

function Avatar({ type }: { type: 'assistant' | 'user' }) {
  return (
    <span className={`mt-1 hidden h-9 w-9 shrink-0 items-center justify-center rounded-2xl sm:flex ${type === 'assistant' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'}`}>
      {type === 'assistant' ? <Bot className="h-4 w-4" /> : <UserRound className="h-4 w-4" />}
    </span>
  )
}

function AssistantCard({ data }: { data: Reply }) {
  return (
    <div className="mt-4 grid gap-3 rounded-2xl border border-slate-200 bg-white p-3 text-slate-900 sm:p-4">
      <Section title="Action steps" items={data.actionSteps} />
      <div className="rounded-2xl bg-slate-50 p-3">
        <div className="flex items-center justify-between gap-2">
          <b className="text-sm">Draft message</b>
          <CopyButton text={data.draftMessage} />
        </div>
        <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6">{data.draftMessage}</p>
      </div>
      <Section title="Checklist" items={data.checklist} />
      <p className="rounded-2xl bg-amber-50 p-3 text-sm leading-6 text-amber-900">{data.disclaimer}</p>
      <button
        type="button"
        onClick={() => navigator.clipboard?.writeText(`${data.actionSteps.join('\n')}\n\n${data.draftMessage}`).catch(() => undefined)}
        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 text-xs font-black text-slate-700 transition hover:bg-slate-50 active:scale-[0.98]"
      >
        <Copy className="h-3.5 w-3.5" /> Copy plan
      </button>
    </div>
  )
}

function Section({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <b className="text-sm">{title}</b>
      <ul className="mt-2 grid gap-2 text-sm leading-6">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-700" />
            <span className="break-words">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
