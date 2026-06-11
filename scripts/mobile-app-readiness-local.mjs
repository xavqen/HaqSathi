import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const outputDir = process.env.MOBILE_APP_EVIDENCE_DIR || './artifacts/mobile-app-readiness'
mkdirSync(outputDir, { recursive: true })

function env(name, fallback = '') {
  return process.env[name] || fallback
}

function enabled(name) {
  return /^(true|1|yes|enabled)$/i.test(env(name))
}

function configured(name) {
  const value = env(name)
  return Boolean(value && !/change-this|your-domain|localhost|127\.0\.0\.1|haqsathi\.local|example|PROJECT_REF|YOUR-PASSWORD|com\.example|org\.example/i.test(value))
}

const strategy = env('NATIVE_APP_STRATEGY', 'pwa_first')
const routes = env('MOBILE_APP_ROUTE_TARGETS', '/,/complaint,/upi-help,/documents,/tools,/dashboard').split(',').map((route) => route.trim()).filter(Boolean)

const controls = [
  ['strategy-selected', 'Native app strategy selected', ['pwa_first', 'twa', 'capacitor'].includes(strategy) ? 'READY_TO_TEST' : 'BLOCKED', `NATIVE_APP_STRATEGY=${strategy}`],
  ['production-url', 'Production HTTPS URL configured', configured('NEXT_PUBLIC_APP_URL') ? 'READY_TO_TEST' : 'BLOCKED', `NEXT_PUBLIC_APP_URL=${env('NEXT_PUBLIC_APP_URL') || 'empty'}`],
  ['app-name', 'Native app name configured', configured('NATIVE_APP_NAME') || configured('NEXT_PUBLIC_SITE_NAME') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', `NATIVE_APP_NAME=${env('NATIVE_APP_NAME') || env('NEXT_PUBLIC_SITE_NAME') || 'empty'}`],
  ['android-package', 'Android package name configured', configured('ANDROID_PACKAGE_NAME') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', `ANDROID_PACKAGE_NAME=${env('ANDROID_PACKAGE_NAME') || 'empty'}`],
  ['ios-bundle', 'iOS bundle ID configured', configured('IOS_BUNDLE_ID') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', `IOS_BUNDLE_ID=${env('IOS_BUNDLE_ID') || 'empty'}`],
  ['support-url', 'Support URL ready', configured('NATIVE_APP_SUPPORT_URL') || configured('NEXT_PUBLIC_APP_URL') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', `NATIVE_APP_SUPPORT_URL=${env('NATIVE_APP_SUPPORT_URL') || 'fallback:NEXT_PUBLIC_APP_URL'}`],
  ['privacy-url', 'Privacy URL ready', configured('NATIVE_APP_PRIVACY_URL') || configured('NEXT_PUBLIC_APP_URL') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', `NATIVE_APP_PRIVACY_URL=${env('NATIVE_APP_PRIVACY_URL') || 'fallback:NEXT_PUBLIC_APP_URL'}`],
  ['twa-asset-links', 'TWA asset links reviewed', enabled('TWA_ASSET_LINKS_REVIEWED') || strategy !== 'twa' ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', `TWA_ASSET_LINKS_REVIEWED=${env('TWA_ASSET_LINKS_REVIEWED', 'false')}`],
  ['capacitor-sync', 'Capacitor sync reviewed', enabled('CAPACITOR_SYNC_REVIEWED') || strategy !== 'capacitor' ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', `CAPACITOR_SYNC_REVIEWED=${env('CAPACITOR_SYNC_REVIEWED', 'false')}`],
  ['store-assets', 'Store assets reviewed', enabled('MOBILE_APP_STORE_ASSETS_REVIEWED') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', `MOBILE_APP_STORE_ASSETS_REVIEWED=${env('MOBILE_APP_STORE_ASSETS_REVIEWED', 'false')}`],
  ['permission-review', 'Permission prompts reviewed', enabled('MOBILE_APP_PERMISSION_REVIEWED') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', `MOBILE_APP_PERMISSION_REVIEWED=${env('MOBILE_APP_PERMISSION_REVIEWED', 'false')}`],
  ['payment-policy', 'Mobile payment policy reviewed', enabled('MOBILE_APP_PAYMENT_POLICY_REVIEWED') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', `MOBILE_APP_PAYMENT_POLICY_REVIEWED=${env('MOBILE_APP_PAYMENT_POLICY_REVIEWED', 'false')}`],
  ['play-store-review', 'Play Store readiness reviewed', enabled('PLAY_STORE_READINESS_REVIEWED') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', `PLAY_STORE_READINESS_REVIEWED=${env('PLAY_STORE_READINESS_REVIEWED', 'false')}`],
  ['app-store-review', 'App Store readiness reviewed', enabled('APP_STORE_READINESS_REVIEWED') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', `APP_STORE_READINESS_REVIEWED=${env('APP_STORE_READINESS_REVIEWED', 'false')}`]
]

const lanes = [
  ['android-twa-readiness', 'P0', 'Android TWA wrapper readiness', 'Signed build + asset links + installed launch screenshots'],
  ['ios-wrapper-readiness', 'P1', 'iOS web wrapper readiness', 'Safe-area + keyboard + external link screenshots'],
  ['store-listing-assets', 'P0', 'Store listing assets', 'Play Console/App Store Connect drafts'],
  ['mobile-auth-payment-policy', 'P0', 'Auth/payment policy review', 'Auth, pricing and cancellation screenshots'],
  ['device-permission-safety', 'P1', 'Device permission safety', 'Camera/mic/file/notification prompt screenshots'],
  ['crash-analytics-release', 'P1', 'Crash and release monitoring', 'Release version and crash dashboard screenshots']
]

const ready = controls.filter((control) => control[2] === 'READY_TO_TEST').length
const manualRequired = controls.filter((control) => control[2] === 'MANUAL_REQUIRED').length
const blocked = controls.filter((control) => control[2] === 'BLOCKED').length

const report = {
  generatedAt: new Date().toISOString(),
  version: '3.0.39-mobile-app-readiness',
  summary: { totalControls: controls.length, ready, manualRequired, blocked, lanes: lanes.length, routes: routes.length },
  controls: controls.map(([id, label, status, envValue]) => ({ id, label, status, envValue })),
  lanes: lanes.map(([id, priority, label, evidence]) => ({ id, priority, label, evidence })),
  routes,
  nextAction: blocked ? 'Set production HTTPS URL and a valid native app strategy before any native wrapper beta.' : manualRequired ? 'Save Play Console/TestFlight/device evidence before marking mobile app readiness reviewed.' : 'Mobile app readiness controls are ready for beta evidence.'
}

const controlRows = [['id', 'label', 'status', 'env_value'], ...controls].map((row) => row.map((value) => String(value).replaceAll(',', ';')))
const laneRows = [['id', 'priority', 'label', 'evidence'], ...lanes].map((row) => row.map((value) => String(value).replaceAll(',', ';')))
const routeRows = [['route'], ...routes.map((route) => [route])]

writeFileSync(join(outputDir, 'mobile-app-readiness.json'), JSON.stringify(report, null, 2))
writeFileSync(join(outputDir, 'mobile-app-controls.csv'), controlRows.map((row) => row.join(',')).join('\n'))
writeFileSync(join(outputDir, 'mobile-app-lanes.csv'), laneRows.map((row) => row.join(',')).join('\n'))
writeFileSync(join(outputDir, 'mobile-app-routes.csv'), routeRows.map((row) => row.join(',')).join('\n'))

console.log(`✅ Mobile app readiness evidence written to ${outputDir}`)
console.log(`Ready: ${ready} · Manual: ${manualRequired} · Blocked: ${blocked} · Routes: ${routes.length}`)
