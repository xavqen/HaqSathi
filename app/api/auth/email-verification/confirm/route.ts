import { NextRequest, NextResponse } from 'next/server'
import { consumeEmailVerificationToken } from '@/lib/auth/email-verification'

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const token = url.searchParams.get('token') || ''
  const base = process.env.NEXT_PUBLIC_APP_URL || url.origin
  if (!token || token.length < 32) return NextResponse.redirect(`${base}/verify-email?status=invalid`)
  const user = await consumeEmailVerificationToken(token)
  if (!user) return NextResponse.redirect(`${base}/verify-email?status=invalid`)
  return NextResponse.redirect(`${base}/verify-email?status=verified`)
}
