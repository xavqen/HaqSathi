import { createHash, randomBytes } from 'crypto'
import { db } from '@/lib/db'

const TOKEN_BYTES = 32
const TOKEN_TTL_HOURS = 24

export function hashEmailVerificationToken(token: string) {
  return createHash('sha256').update(token).digest('hex')
}

export async function createEmailVerificationToken(userId: string) {
  const token = randomBytes(TOKEN_BYTES).toString('hex')
  const tokenHash = hashEmailVerificationToken(token)
  const expiresAt = new Date(Date.now() + TOKEN_TTL_HOURS * 60 * 60 * 1000)
  await db.emailVerificationToken.deleteMany({ where: { userId, usedAt: null } })
  await db.emailVerificationToken.create({ data: { userId, tokenHash, expiresAt } })
  return { token, expiresAt }
}

export async function consumeEmailVerificationToken(token: string) {
  const tokenHash = hashEmailVerificationToken(token)
  const record = await db.emailVerificationToken.findUnique({ where: { tokenHash }, include: { user: { select: { id: true, email: true, emailVerifiedAt: true } } } })
  if (!record || record.usedAt || record.expiresAt < new Date()) return null
  await db.$transaction([
    db.emailVerificationToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
    db.user.update({ where: { id: record.userId }, data: { emailVerifiedAt: record.user.emailVerifiedAt || new Date() } })
  ])
  return record.user
}
