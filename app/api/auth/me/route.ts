import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/session'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  const user = await getCurrentUser()
  return NextResponse.json(
    {
      user: user
        ? {
            name: user.name,
            email: user.email,
            plan: user.plan,
            entitlementSource: 'entitlementSource' in user ? user.entitlementSource : 'user',
            avatarUrl: user.avatarUrl,
            authProvider: user.authProvider
          }
        : null
    },
    {
      headers: {
        'Cache-Control': 'private, no-store, max-age=0, must-revalidate'
      }
    }
  )
}
