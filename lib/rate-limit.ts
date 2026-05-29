type Entry = { count: number; resetAt: number }
type RateLimitResult = { ok: boolean; remaining: number; resetAt?: number; source?: 'memory' | 'upstash' | 'fallback' }

const store = new Map<string, Entry>()

export function rateLimit(key: string, limit = 8, windowMs = 60_000): RateLimitResult {
  const now = Date.now()
  const current = store.get(key)

  if (!current || current.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return { ok: true, remaining: limit - 1, resetAt: now + windowMs, source: 'memory' }
  }

  if (current.count >= limit) {
    return { ok: false, remaining: 0, resetAt: current.resetAt, source: 'memory' }
  }

  current.count += 1
  store.set(key, current)
  return { ok: true, remaining: limit - current.count, resetAt: current.resetAt, source: 'memory' }
}

function redisConfig() {
  const url = process.env.UPSTASH_REDIS_REST_URL?.replace(/\/$/, '')
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  return url && token ? { url, token } : null
}

async function upstashCommand<T = unknown>(command: unknown[]) {
  const cfg = redisConfig()
  if (!cfg) return null
  const response = await fetch(`${cfg.url}/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${cfg.token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify([command])
  })
  if (!response.ok) throw new Error(`Upstash rate-limit failed with ${response.status}`)
  const payload = (await response.json()) as Array<{ result?: T; error?: string }>
  if (payload[0]?.error) throw new Error(payload[0].error)
  return payload[0]?.result as T
}

export async function rateLimitAsync(key: string, limit = 8, windowMs = 60_000): Promise<RateLimitResult> {
  const cfg = redisConfig()
  if (!cfg) return rateLimit(key, limit, windowMs)

  const redisKey = `haqsathi:rl:${key}`
  try {
    const count = Number(await upstashCommand<number>(['INCR', redisKey]))
    if (count === 1) await upstashCommand(['PEXPIRE', redisKey, windowMs])
    const ttl = Number(await upstashCommand<number>(['PTTL', redisKey]))
    const resetAt = Date.now() + Math.max(ttl, 0)
    if (count > limit) return { ok: false, remaining: 0, resetAt, source: 'upstash' }
    return { ok: true, remaining: Math.max(limit - count, 0), resetAt, source: 'upstash' }
  } catch {
    const fallback = rateLimit(key, limit, windowMs)
    return { ...fallback, source: 'fallback' }
  }
}

export function getClientIp(headers: Headers) {
  return headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || headers.get('x-real-ip')?.trim()
    || 'local'
}
