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
const origin = read('lib/security/request-origin.ts')
const proxy = read('proxy.ts')
const csrf = read('lib/security/csrf.ts')
const sw = read('public/sw.js')
const env = read('.env.example')
const health = read('app/api/health/route.ts')
const phase = read('PHASE_121_API_ORIGIN_GUARD.md')

console.log('\nPhase 121 API origin guard audit')
pass('version is a compatible 3.0 release', String(pkg.version || '').startsWith('3.0.'))
pass('phase121 audit script is registered', pkg.scripts['phase121:audit'] === 'node scripts/phase121-api-origin-guard-audit.mjs')
pass('quality release includes phase121', pkg.scripts['quality:release']?.includes('phase121:audit'))
pass('shared origin guard exists', origin.includes('checkMutatingApiRequestOrigin') && origin.includes('getAllowedMutationHosts'))
pass('origin guard covers mutating API methods', origin.includes("'/api/'") && origin.includes("'POST'") && origin.includes("'PATCH'") && origin.includes("'DELETE'"))
pass('origin guard blocks browser cross-site requests', origin.includes("sec-fetch-site") && origin.includes("fetchSite === 'cross-site'") && origin.includes("reason: 'cross-site'"))
pass('origin guard validates explicit Origin hosts', origin.includes("req.headers.get('origin')") && origin.includes('allowedHosts.includes(originHost)') && origin.includes("'origin-mismatch'"))
pass('origin guard keeps webhook/cron bypasses explicit', origin.includes("'/api/billing/webhook'") && origin.includes("'/api/cron/'") && origin.includes('isApiOriginBypassed'))
pass('proxy enforces guard before route handlers', proxy.includes("import { checkMutatingApiRequestOrigin }") && proxy.includes('const originCheck = checkMutatingApiRequestOrigin(req)') && proxy.includes('status: 403'))
pass('route csrf helper reuses shared policy', csrf.includes('checkMutatingApiRequestOrigin(req)') && !csrf.includes('process.env.NEXT_PUBLIC_APP_URL)'))
pass('service worker cache and env/health versions are current', sw.includes('haqsathi-ai-v3-0-') && env.includes('NEXT_PUBLIC_APP_VERSION="3.0.') && health.includes('3.0.'))
pass('phase report documents cross-site mutation risk', phase.includes('cross-site browser') && phase.includes('POST/PATCH/PUT/DELETE') && phase.includes('server-to-server'))

if (process.exitCode) {
  console.error('\nPhase 121 failed: fix the API origin guard checks above.')
} else {
  console.log('\n✅ Phase 121 passed: mutating API requests now have a global same-origin guard.')
}
