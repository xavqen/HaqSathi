import { createHash, randomBytes } from 'crypto'
import { db } from '@/lib/db'

const TOKEN_BYTES = 32
const TOKEN_TTL_MINUTES = 60

export function hashResetToken(token: string) {
  return createHash('sha256').update(token).digest('hex')
}

export async function createPasswordResetToken(userId: string) {
  const token = randomBytes(TOKEN_BYTES).toString('hex')
  const tokenHash = hashResetToken(token)
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MINUTES * 60 * 1000)
  await db.passwordResetToken.deleteMany({ where: { userId, usedAt: null } })
  await db.passwordResetToken.create({ data: { userId, tokenHash, expiresAt } })
  return { token, expiresAt }
}

export async function consumePasswordResetToken(token: string) {
  const tokenHash = hashResetToken(token)
  const reset = await db.passwordResetToken.findUnique({ where: { tokenHash }, include: { user: { select: { id: true, email: true } } } })
  if (!reset || reset.usedAt || reset.expiresAt < new Date()) return null
  await db.passwordResetToken.update({ where: { id: reset.id }, data: { usedAt: new Date() } })
  return reset.user
}
