import { existsSync, readFileSync } from 'fs'
import { join } from 'path'

export type SecurityCheck = { area: string; item: string; ok: boolean; note: string }
const cwd = process.cwd()
const exists = (rel: string) => existsSync(join(cwd, rel))
const read = (rel: string) => exists(rel) ? readFileSync(join(cwd, rel), 'utf8') : ''

export function getSecurityHardeningChecks(): SecurityCheck[] {
  const proxy = read('proxy.ts')
  const env = read('.env.example')
  const schema = read('prisma/schema.prisma')
  return [
    { area: 'Headers', item: 'X-Frame-Options', ok: proxy.includes('X-Frame-Options'), note: 'Protects against clickjacking.' },
    { area: 'Headers', item: 'Content type nosniff', ok: proxy.includes('X-Content-Type-Options'), note: 'Reduces MIME confusion risk.' },
    { area: 'Headers', item: 'Referrer policy', ok: proxy.includes('Referrer-Policy'), note: 'Controls referrer leakage.' },
    { area: 'Headers', item: 'Permissions policy', ok: proxy.includes('Permissions-Policy'), note: 'Blocks camera/mic/geolocation by default.' },
    { area: 'Auth', item: 'HTTP-only session cookie', ok: read('lib/auth/session.ts').includes('httpOnly: true'), note: 'Session token not readable by browser JS.' },
    { area: 'Auth', item: 'Password reset token model', ok: schema.includes('model PasswordResetToken'), note: 'Reset flow can store one-time tokens.' },
    { area: 'Privacy', item: 'Privacy center route', ok: exists('app/dashboard/privacy-center/page.tsx'), note: 'User consent and deletion request flow exists.' },
    { area: 'Storage', item: 'Service role not public', ok: env.includes('SUPABASE_SERVICE_ROLE_KEY') && !env.includes('NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY'), note: 'Service role key must stay server-only.' },
    { area: 'Abuse', item: 'Rate limit helper exists', ok: exists('lib/rate-limit.ts'), note: 'AI/search endpoints can throttle abuse.' },
    { area: 'Safety', item: 'Global disclaimer banner', ok: exists('components/layout/disclaimer-banner.tsx'), note: 'Non-legal-advice warning is visible.' }
  ]
}
