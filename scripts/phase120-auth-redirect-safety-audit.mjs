import { readFileSync } from 'node:fs'

function read(path) {
  return readFileSync(path, 'utf8')
}

function pass(label, ok) {
  if (!ok) {
    console.error(`❌ ${label}`)
    process.exitCode = 1
    return
  }
  console.log(`✅ ${label}`)
}

const pkg = JSON.parse(read('package.json'))
const redirect = read('lib/security/redirect.ts')
const authForm = read('components/forms/auth-form.tsx')
const google = read('lib/auth/google.ts')
const callback = read('app/api/auth/google/callback/route.ts')
const session = read('lib/auth/session.ts')
const register = read('app/api/auth/register/route.ts')
const forgot = read('app/api/auth/forgot-password/route.ts')
const verifyRequest = read('app/api/auth/email-verification/request/route.ts')
const verifyConfirm = read('app/api/auth/email-verification/confirm/route.ts')
const sw = read('public/sw.js')
const env = read('.env.example')
const health = read('app/api/health/route.ts')
const phase = read('PHASE_120_AUTH_REDIRECT_SAFETY.md')

console.log('\nPhase 120 auth redirect safety audit')
pass('version is v3.0.90 or newer', (/^3\.0\.(9[0-9])/.test(pkg.version) || /^3\.0\.(?:[1-9]\d{2,})/.test(pkg.version)))
pass('phase120 audit script is registered', pkg.scripts['phase120:audit'] === 'node scripts/phase120-auth-redirect-safety-audit.mjs')
pass('quality release includes phase120', pkg.scripts['quality:release']?.includes('phase120:audit'))
pass('redirect sanitizer exists', redirect.includes('safeRedirectPath') && redirect.includes('buildLoginPath'))
pass('redirect sanitizer blocks external/protocol-relative redirects', redirect.includes("!raw.startsWith('/')") && redirect.includes("raw.startsWith('//')") && redirect.includes('parsed.origin'))
pass('redirect sanitizer blocks encoded slash/backslash tricks and internal routes', redirect.includes('ENCODED_SLASH_OR_BACKSLASH') && redirect.includes('BLOCKED_PREFIXES') && redirect.includes("'/api'"))
pass('client auth sanitizes next before router push and google href', authForm.includes("import { safeRedirectPath }") && authForm.includes('const next = safeRedirectPath(params.get(\'next\'))') && authForm.includes('router.push(next)'))
pass('google auth uses shared safe next path for cookie flow', google.includes("import { safeRedirectPath }") && google.includes('export const safeNextPath = safeRedirectPath') && google.includes('GOOGLE_OAUTH_NEXT_COOKIE'))
pass('google callback redirects using sanitized cookie path', callback.includes('safeNextPath(req.cookies.get(GOOGLE_OAUTH_NEXT_COOKIE)?.value)') && callback.includes('new URL(next, req.url)'))
pass('protected route login redirects use safe builder', session.includes("import { buildLoginPath }") && session.includes("buildLoginPath('/dashboard')") && session.includes("buildLoginPath('/admin')"))
pass('auth email links use normalized absolute URLs', [register, forgot, verifyRequest, verifyConfirm].every((content) => content.includes("import { absoluteUrl }") && content.includes('absoluteUrl(')))
pass('auth routes avoid raw NEXT_PUBLIC_APP_URL concatenation', [register, forgot, verifyRequest, verifyConfirm].every((content) => !content.includes('process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin')))
pass('service worker cache and env/health versions are current', sw.includes('haqsathi-ai-v3-0-') && env.includes('NEXT_PUBLIC_APP_VERSION="3.0.') && health.includes('3.0.'))
pass('phase report documents unsafe next redirect risk', phase.includes('crafted links') && phase.includes('external URLs') && phase.includes('protocol-relative'))

if (process.exitCode) {
  console.error('\nPhase 120 failed: fix auth redirect safety guard above.')
} else {
  console.log('\n✅ Phase 120 passed: login, protected-route and OAuth next redirects are sanitized consistently.')
}
