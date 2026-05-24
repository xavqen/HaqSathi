import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: 'haqsathi-ai',
    version: process.env.NEXT_PUBLIC_APP_VERSION || '1.8.0',
    time: new Date().toISOString()
  })
}
