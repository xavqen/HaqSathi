import { NextRequest } from 'next/server'
import { buildGoogleAuthRedirect } from '@/lib/auth/google'

export async function GET(req: NextRequest) {
  return buildGoogleAuthRedirect(req)
}
