import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const outputDir = process.env.PWA_EVIDENCE_DIR || './artifacts/pwa-readiness'
mkdirSync(outputDir, { recursive: true })

function env(name, fallback = '') {
  return process.env[name] || fallback
}

function enabled(name) {
  return /^(true|1|yes|enabled)$/i.test(env(name))
}

function configured(name) {
  const value = env(name)
  return Boolean(value && !/change-this|your-domain|localhost|127\.0\.0\.1|haqsathi\.local|example|PROJECT_REF|YOUR-PASSWORD/i.test(value))
}

function hasFile(path) {
  return existsSync(join(process.cwd(), path))
}

function includes(path, token) {
  return hasFile(path) && readFileSync(join(process.cwd(), path), 'utf8').includes(token)
}

const routes = env('PWA_OFFLINE_ROUTE_TARGETS', '/,/complaint,/upi-help,/documents,/tools,/dashboard').split(',').map((route) => route.trim()).filter(Boolean)

const controls = [
  ['pwa-enabled', 'PWA registration enabled', enabled('NEXT_PUBLIC_ENABLE_PWA') ? 'READY_TO_TEST' : 'BLOCKED', `NEXT_PUBLIC_ENABLE_PWA=${env('NEXT_PUBLIC_ENABLE_PWA', 'false')}`],
  ['production-url', 'Production HTTPS URL configured', configured('NEXT_PUBLIC_APP_URL') ? 'READY_TO_TEST' : 'BLOCKED', `NEXT_PUBLIC_APP_URL=${env('NEXT_PUBLIC_APP_URL') || 'empty'}`],
  ['service-worker-file', 'Service worker file exists', hasFile('public/sw.js') ? 'READY_TO_TEST' : 'BLOCKED', 'public/sw.js'],
  ['offline-file', 'Offline fallback exists', hasFile('public/offline.html') ? 'READY_TO_TEST' : 'BLOCKED', 'public/offline.html'],
  ['manifest-file', 'Manifest route exists', hasFile('app/manifest.ts') ? 'READY_TO_TEST' : 'BLOCKED', 'app/manifest.ts'],
  ['network-first-html', 'Network-first navigation strategy present', includes('public/sw.js', 'OFFLINE_URL') && includes('public/sw.js', 'navigate') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', 'sw.js navigation fallback'],
  ['manifest-reviewed', 'Manifest reviewed', enabled('PWA_MANIFEST_REVIEWED') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', `PWA_MANIFEST_REVIEWED=${env('PWA_MANIFEST_REVIEWED', 'false')}`],
  ['icons-reviewed', 'Icons reviewed', enabled('PWA_ICON_REVIEWED') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', `PWA_ICON_REVIEWED=${env('PWA_ICON_REVIEWED', 'false')}`],
  ['offline-reviewed', 'Offline fallback reviewed', enabled('PWA_OFFLINE_FALLBACK_REVIEWED') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', `PWA_OFFLINE_FALLBACK_REVIEWED=${env('PWA_OFFLINE_FALLBACK_REVIEWED', 'false')}`],
  ['install-reviewed', 'Install flow reviewed', enabled('PWA_INSTALL_FLOW_REVIEWED') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', `PWA_INSTALL_FLOW_REVIEWED=${env('PWA_INSTALL_FLOW_REVIEWED', 'false')}`],
  ['update-reviewed', 'Update flow reviewed', enabled('PWA_UPDATE_FLOW_REVIEWED') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', `PWA_UPDATE_FLOW_REVIEWED=${env('PWA_UPDATE_FLOW_REVIEWED', 'false')}`],
  ['push-permission-reviewed', 'Push permission safety reviewed', enabled('PWA_PUSH_PERMISSION_REVIEWED') || !enabled('REMINDER_PUSH_ENABLED') ? 'READY_TO_TEST' : 'MANUAL_REQUIRED', `PWA_PUSH_PERMISSION_REVIEWED=${env('PWA_PUSH_PERMISSION_REVIEWED', 'false')}`]
]

const lanes = [
  ['android-install-flow', 'P0', 'Android Chrome install flow', 'Before prompt + home screen + standalone screenshots'],
  ['desktop-install-flow', 'P1', 'Desktop Chrome/Edge install flow', 'Desktop installed app screenshot'],
  ['offline-navigation', 'P0', 'Offline navigation fallback', 'Offline page + service worker cache screenshot'],
  ['cached-page-recovery', 'P1', 'Cached page recovery', 'Visited route offline revisit screenshot'],
  ['safe-update-flow', 'P1', 'Service worker update flow', 'Old cache removed + new version active screenshot'],
  ['push-permission-safety', 'P2', 'Push permission safety', 'User-action permission proof']
]

const ready = controls.filter((control) => control[2] === 'READY_TO_TEST').length
const manualRequired = controls.filter((control) => control[2] === 'MANUAL_REQUIRED').length
const blocked = controls.filter((control) => control[2] === 'BLOCKED').length

const report = {
  generatedAt: new Date().toISOString(),
  version: '3.0.38-pwa-offline-readiness',
  summary: { totalControls: controls.length, ready, manualRequired, blocked, lanes: lanes.length, routes: routes.length },
  controls: controls.map(([id, label, status, envValue]) => ({ id, label, status, envValue })),
  lanes: lanes.map(([id, priority, label, evidence]) => ({ id, priority, label, evidence })),
  routes,
  nextAction: blocked ? 'Enable PWA and verify production HTTPS URL before final install/offline QA.' : manualRequired ? 'Save real Android, desktop, offline and update screenshots before launch.' : 'PWA readiness controls are ready for final deployed-domain evidence.'
}

const controlRows = [['id', 'label', 'status', 'env_value'], ...controls].map((row) => row.map((value) => String(value).replaceAll(',', ';')))
const laneRows = [['id', 'priority', 'label', 'evidence'], ...lanes].map((row) => row.map((value) => String(value).replaceAll(',', ';')))
const routeRows = [['route'], ...routes.map((route) => [route])]

writeFileSync(join(outputDir, 'pwa-readiness.json'), JSON.stringify(report, null, 2))
writeFileSync(join(outputDir, 'pwa-controls.csv'), controlRows.map((row) => row.join(',')).join('\n'))
writeFileSync(join(outputDir, 'pwa-lanes.csv'), laneRows.map((row) => row.join(',')).join('\n'))
writeFileSync(join(outputDir, 'pwa-routes.csv'), routeRows.map((row) => row.join(',')).join('\n'))

console.log(`✅ PWA readiness evidence written to ${outputDir}`)
console.log(`Ready: ${ready} · Manual: ${manualRequired} · Blocked: ${blocked} · Routes: ${routes.length}`)
