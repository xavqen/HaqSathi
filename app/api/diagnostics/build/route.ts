import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

function mask(value?: string) {
  if (!value) return null
  if (value.length <= 8) return '***'
  return `${value.slice(0, 4)}***${value.slice(-4)}`
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    app: 'HaqSathi AI',
    version: process.env.NEXT_PUBLIC_APP_VERSION || '3.0.4',
    nodeEnv: process.env.NODE_ENV || 'development',
    checks: {
      appUrl: Boolean(process.env.NEXT_PUBLIC_APP_URL),
      databaseUrl: Boolean(process.env.DATABASE_URL),
      directUrl: Boolean(process.env.DIRECT_URL),
      authSecret: Boolean(process.env.AUTH_SECRET),
      supabaseUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
      supabaseServiceRole: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
      resend: Boolean(process.env.RESEND_API_KEY),
      razorpayKey: Boolean(process.env.RAZORPAY_KEY_ID),
      razorpaySecret: Boolean(process.env.RAZORPAY_KEY_SECRET)
    },
    safeEnvPreview: {
      appUrl: process.env.NEXT_PUBLIC_APP_URL || null,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || null,
      razorpayKey: mask(process.env.RAZORPAY_KEY_ID) || null
    }
  })
}
