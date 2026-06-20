import { NextRequest, NextResponse } from 'next/server'
import { consumeEmailVerificationToken } from '@/lib/auth/email-verification'
import { absoluteUrl } from '@/lib/utils'

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const token = url.searchParams.get('token') || ''
  if (!token || token.length < 32) return NextResponse.redirect(absoluteUrl('/verify-email?status=invalid'))
  const user = await consumeEmailVerificationToken(token)
  if (!user) return NextResponse.redirect(absoluteUrl('/verify-email?status=invalid'))
  return NextResponse.redirect(absoluteUrl('/verify-email?status=verified'))
}
