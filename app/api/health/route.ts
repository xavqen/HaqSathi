import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: 'haqsathi-ai',
    version: process.env.NEXT_PUBLIC_APP_VERSION || '3.0.4',
    time: new Date().toISOString()
  })
}
