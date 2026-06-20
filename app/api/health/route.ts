import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const releaseVersion = process.env.NEXT_PUBLIC_APP_VERSION || '3.0.105-motion-hydration-stability'

export async function GET() {
  const environment = process.env.VERCEL_ENV || process.env.NODE_ENV || 'local'
  return NextResponse.json(
    {
      ok: true,
      service: 'haqsathi-ai',
      version: releaseVersion,
      environment,
      release: {
        version: releaseVersion,
        channel: process.env.NEXT_PUBLIC_FINAL_RELEASE_CHANNEL || 'stable',
        vercel: process.env.VERCEL_GIT_COMMIT_SHA ? 'configured' : 'not-set'
      },
      checks: {
        app: true,
        publicRoutes: true,
        database: 'see /api/ready',
        payments: 'see launch evidence gate',
        storage: 'see launch evidence gate'
      },
      time: new Date().toISOString()
    },
    {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
        'X-HaqSathi-Health': 'ok'
      }
    }
  )
}
