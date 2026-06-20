import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createHash, randomBytes } from 'crypto'
import { db } from '@/lib/db'
import { buildLoginPath } from '@/lib/security/redirect'
import { resolveEffectivePlan } from '@/lib/billing/entitlements'

export const SESSION_COOKIE = 'haqsathi_session'
const SESSION_DAYS = 30

function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex')
}

export async function createSession(userId: string) {
  const token = randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000)

  await db.authSession.create({ data: { userId, tokenHash: hashToken(token), expiresAt } })

  const store = await cookies()
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: expiresAt
  })
}

export async function destroySession() {
  const store = await cookies()
  const token = store.get(SESSION_COOKIE)?.value
  if (token) {
    await db.authSession.deleteMany({ where: { tokenHash: hashToken(token) } }).catch(() => undefined)
  }
  store.set(SESSION_COOKIE, '', { httpOnly: true, sameSite: 'lax', path: '/', expires: new Date(0) })
}

export async function getCurrentUser() {
  try {
    const store = await cookies()
    const token = store.get(SESSION_COOKIE)?.value
    if (!token) return null

    const session = await db.authSession.findUnique({
      where: { tokenHash: hashToken(token) },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            plan: true,
            authProvider: true,
            avatarUrl: true,
            emailVerifiedAt: true,
            createdAt: true,
            subscriptions: {
              where: { status: { in: ['ACTIVE', 'active', 'PAID', 'paid'] } },
              orderBy: { updatedAt: 'desc' },
              take: 1,
              select: { plan: true }
            },
            paymentOrders: {
              where: { status: 'PAID' },
              orderBy: { updatedAt: 'desc' },
              take: 1,
              select: { plan: true }
            }
          }
        }
      }
    })

    if (!session || session.expiresAt < new Date()) {
      if (session) await db.authSession.delete({ where: { id: session.id } }).catch(() => undefined)
      return null
    }

    const { subscriptions, paymentOrders, ...user } = session.user
    const entitlement = resolveEffectivePlan({
      userPlan: user.plan,
      activeSubscriptionPlan: subscriptions[0]?.plan,
      latestPaidOrderPlan: paymentOrders[0]?.plan
    })
    return { ...user, plan: entitlement.plan, entitlementSource: entitlement.source }
  } catch {
    return null
  }
}

export async function requireUser() {
  const user = await getCurrentUser()
  if (!user) redirect(buildLoginPath('/dashboard'))
  return user
}

export async function requireAdmin() {
  const user = await getCurrentUser()
  if (!user) redirect(buildLoginPath('/admin'))
  if (user.role !== 'ADMIN') redirect('/dashboard')
  return user
}
