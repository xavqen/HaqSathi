import { pbkdf2Sync, randomBytes, timingSafeEqual } from 'crypto'

const ITERATIONS = 120_000
const KEYLEN = 32
const DIGEST = 'sha256'

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex')
  const hash = pbkdf2Sync(password, salt, ITERATIONS, KEYLEN, DIGEST).toString('hex')
  return `pbkdf2$${ITERATIONS}$${salt}$${hash}`
}

export function verifyPassword(password: string, stored?: string | null) {
  if (!stored) return false
  const [algo, iterationsRaw, salt, hash] = stored.split('$')
  if (algo !== 'pbkdf2' || !iterationsRaw || !salt || !hash) return false
  const iterations = Number(iterationsRaw)
  const calculated = pbkdf2Sync(password, salt, iterations, KEYLEN, DIGEST)
  const expected = Buffer.from(hash, 'hex')
  if (expected.length !== calculated.length) return false
  return timingSafeEqual(calculated, expected)
}
