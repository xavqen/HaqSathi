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
const sw = read('public/sw.js')
const register = read('components/layout/pwa-register.tsx')
const install = read('components/layout/install-pwa.tsx')
const chatPage = read('app/chat/page.tsx')
const env = read('.env.example')
const health = read('app/api/health/route.ts')
const phase = read('PHASE_119_PWA_INSTALL_STABILITY.md')

console.log('\nPhase 119 PWA install + cache stability audit')
pass('version is v3.0.89 or newer', (/^3\.0\.(8[9]|9[0-9])/.test(pkg.version) || /^3\.0\.(?:[1-9]\d{2,})/.test(pkg.version)))
pass('phase119 audit script is registered', pkg.scripts['phase119:audit'] === 'node scripts/phase119-pwa-install-stability-audit.mjs')
pass('quality release includes phase119', pkg.scripts['quality:release']?.includes('phase119:audit'))
pass('service worker cache is current release', sw.includes('haqsathi-ai-v3-0-98-incident-rollback-runbook') || /haqsathi-ai-v3-0-(9[1-9]|[1-9][0-9]{2,})/.test(sw))
pass('service worker no longer runtime-caches generic document destinations', sw.includes("const CACHEABLE_DESTINATIONS = new Set(['style', 'script', 'image', 'font'])") && !sw.includes("'document'"))
pass('service worker bypasses private/auth routes', ["'/api/'", "'/admin'", "'/dashboard'", "'/document-vault'", "'/login'", "'/register'", "'/reset-password'", "'/verify-email'"].every((token) => sw.includes(token)))
pass('service worker blocks token/code cache URLs', sw.includes("url.searchParams.has('token')") && sw.includes("url.searchParams.has('code')"))
pass('safe navigation helper controls offline page caching', sw.includes('function isSafeNavigationToCache') && sw.includes('networkFirstNavigation(event, url)'))
pass('pwa register defaults on in production but can be disabled', register.includes("NEXT_PUBLIC_ENABLE_PWA === 'false'") && register.includes("process.env.NODE_ENV !== 'production'") && register.includes("navigator.serviceWorker.register('/sw.js', { scope: '/' })"))
pass('pwa update event is surfaced to UI', register.includes("haqsathi:pwa-updated") && install.includes("window.addEventListener('haqsathi:pwa-updated'"))
pass('install card handles standalone installed mode', install.includes('isStandaloneMode') && install.includes("display-mode: standalone") && install.includes('navigatorWithStandalone.standalone'))
pass('install card has compact mode for chat shell', install.includes('type InstallPwaCardProps') && install.includes('compact = false'))
pass('chat page shows install prompt before assistant', chatPage.includes("import { InstallPwaCard }") && chatPage.includes('<InstallPwaCard compact />'))
pass('env and health version are current', env.includes('NEXT_PUBLIC_APP_VERSION="3.0.') && health.includes('3.0.'))
pass('phase report documents install and cache safety risk', phase.includes('private route cache') && phase.includes('chat page') && phase.includes('v3.0.89'))

if (process.exitCode) {
  console.error('\nPhase 119 failed: fix the PWA install/cache stability guard above.')
} else {
  console.log('\n✅ Phase 119 passed: PWA install prompt, update refresh and safe offline cache behavior are hardened.')
}
