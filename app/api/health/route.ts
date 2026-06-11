import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json(
    {
      ok: true,
      service: 'haqsathi-ai',
      version: process.env.NEXT_PUBLIC_APP_VERSION || '3.0.84-final-stabilization',
      environment: process.env.VERCEL_ENV || process.env.NODE_ENV || 'local',
      time: new Date().toISOString()
    },
    { headers: { 'Cache-Control': 'no-store' } }
  )
}
